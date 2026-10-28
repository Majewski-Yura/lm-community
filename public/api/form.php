<?php
// Приём форм сайта (диагностика, анкета, запись на события) и отправка ответов в Telegram и на вебхук.
// PHP-версия server/form-handler.mjs для обычного хостинга. Токен бота и чат задаются в админке → «Настройки».
// Адрес для сайта — /api/form (см. .htaccess в корне).

declare(strict_types=1);

require __DIR__ . '/_lib.php';

const FORM_MAX_FIELDS = 80;
const FORM_MAX_VALUE = 3000;
const FORM_MAX_LABEL = 300;
const FORM_TELEGRAM_LIMIT = 4000;

/** Какие формы принимаем и какие поля в них допустимы. */
const FORMS = [
    'diagnostic' => [
        'title' => 'Диагностическая карта участника',
        'field' => '/^(status|tg_id|block[1-6]_(owner|doctor|manager|ceo)_question[1-3]|open_manager_question[1-3])$/',
    ],
    'anketa' => [
        'title' => 'Анкета «Итоги месяца»',
        'field' => '/^(role|name|recomendation|benefit|recommendation|resources)$/',
    ],
    'event' => [
        'title' => 'Запись на событие',
        'field' => '/^(event|name|messenger-type|messenger-id)$/',
    ],
];

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    lm_error('Только POST', 405);
}

$settings = lm_settings();
$hasTelegram = $settings['telegramBotToken'] !== '' && $settings['telegramChatId'] !== '';
if (!$hasTelegram && $settings['webhookUrl'] === '') {
    lm_error('Приём форм не настроен на сервере', 503);
}

$data = lm_request_json(512 * 1024);

// website — скрытое поле-ловушка для ботов: человек его не видит и не заполняет
if (!empty($data['website'])) {
    lm_json(['ok' => true]);
}

$formId = is_string($data['form'] ?? null) ? $data['form'] : '';
$form = FORMS[$formId] ?? null;
$rawFields = $data['fields'] ?? null;
if ($form === null || !is_array($rawFields) || count($rawFields) === 0 || count($rawFields) > FORM_MAX_FIELDS) {
    lm_error('Неизвестная форма');
}

function form_clean($value, int $max): string
{
    $text = trim(str_replace(["\r\n", "\r"], "\n", (string) $value));
    return function_exists('mb_substr') ? mb_substr($text, 0, $max) : substr($text, 0, $max);
}

$fields = [];
foreach ($rawFields as $raw) {
    $name = form_clean($raw['name'] ?? '', 64);
    if (!preg_match($form['field'], $name)) {
        lm_error('Недопустимое поле: ' . $name);
    }
    $value = form_clean($raw['value'] ?? '', FORM_MAX_VALUE);
    if ($value !== '') {
        $label = form_clean($raw['label'] ?? '', FORM_MAX_LABEL);
        $fields[] = ['name' => $name, 'label' => $label !== '' ? $label : $name, 'value' => $value];
    }
}
if (count($fields) === 0) {
    lm_error('Форма пустая');
}

$lines = ['📝 ' . $form['title'], ''];
foreach ($fields as $f) {
    $lines[] = $f['label'] . "\n— " . $f['value'];
}
$text = implode("\n", $lines);

/** Режет длинный текст на сообщения, которые пролезают в лимит Telegram. @return string[] */
function form_chunks(string $text): array
{
    $parts = [];
    $current = '';
    foreach (explode("\n", $text) as $line) {
        if ($current !== '' && strlen($current) + strlen($line) + 1 > FORM_TELEGRAM_LIMIT) {
            $parts[] = $current;
            $current = '';
        }
        $current = $current !== '' ? $current . "\n" . $line : substr($line, 0, FORM_TELEGRAM_LIMIT);
    }
    if ($current !== '') {
        $parts[] = $current;
    }
    return $parts;
}

function form_post(string $url, string $body, string $contentType): int
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => ['Content-Type: ' . $contentType],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);
        curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $status;
    }
    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => 'Content-Type: ' . $contentType,
        'content' => $body,
        'timeout' => 15,
        'ignore_errors' => true,
    ]]);
    @file_get_contents($url, false, $context);
    $status = 0;
    foreach ($http_response_header ?? [] as $header) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#', $header, $m)) {
            $status = (int) $m[1];
        }
    }
    return $status;
}

$failed = false;
if ($hasTelegram) {
    foreach (form_chunks($text) as $part) {
        // Без parse_mode: ответы посетителей уходят простым текстом и не могут сломать разметку
        $status = form_post(
            'https://api.telegram.org/bot' . $settings['telegramBotToken'] . '/sendMessage',
            (string) json_encode(['chat_id' => $settings['telegramChatId'], 'text' => $part, 'disable_web_page_preview' => true], JSON_UNESCAPED_UNICODE),
            'application/json'
        );
        if ($status < 200 || $status >= 300) {
            error_log('[lm-form] Telegram ответил ' . $status);
            $failed = true;
            break;
        }
    }
}
if ($settings['webhookUrl'] !== '') {
    $params = ['formname' => $form['title'], 'formid' => $formId];
    $body = http_build_query($params);
    foreach ($fields as $f) {
        $body .= '&' . rawurlencode($f['name']) . '=' . rawurlencode($f['value']);
    }
    $status = form_post($settings['webhookUrl'], $body, 'application/x-www-form-urlencoded');
    if ($status < 200 || $status >= 300) {
        error_log('[lm-form] Вебхук ответил ' . $status);
        $failed = true;
    }
}

if ($failed) {
    lm_error('Не удалось отправить ответ, попробуйте ещё раз', 502);
}
lm_json(['ok' => true]);
