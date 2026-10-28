<?php
// Общие функции серверной части сайта: файлы, JSON-ответы, сессия админки, защита от подделки запросов.
// Работает на любом хостинге с PHP 7.4+ без базы данных: всё хранится в файлах папки private/.

declare(strict_types=1);

define('LM_ROOT', dirname(__DIR__));
define('LM_PRIVATE', LM_ROOT . '/private');

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

function lm_private_path(string $name): string
{
    return LM_PRIVATE . '/' . $name;
}

/** JSON-ответ и завершение скрипта. */
function lm_json($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function lm_error(string $message, int $status = 400): void
{
    lm_json(['ok' => false, 'error' => $message], $status);
}

/** @return mixed */
function lm_read_json(string $path, $default = null)
{
    if (!is_file($path)) {
        return $default;
    }
    $data = json_decode((string) file_get_contents($path), true);
    return $data === null ? $default : $data;
}

/** Запись через временный файл: при сбое старый файл остаётся целым. */
function lm_write_atomic(string $path, string $data): void
{
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Не удалось создать папку ' . $dir);
    }
    $tmp = $path . '.tmp-' . bin2hex(random_bytes(4));
    if (file_put_contents($tmp, $data, LOCK_EX) === false) {
        throw new RuntimeException('Не удалось записать ' . basename($path));
    }
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        throw new RuntimeException('Не удалось сохранить ' . basename($path));
    }
}

function lm_write_json(string $path, $data): void
{
    lm_write_atomic($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n");
}

/** Тело запроса в JSON. @return array<string, mixed> */
function lm_request_json(int $maxBytes = 4194304): array
{
    $raw = (string) file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if (strlen($raw) > $maxBytes) {
        lm_error('Слишком большой запрос', 413);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        lm_error('Неверный формат запроса');
    }
    return $data;
}

function lm_is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function lm_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('lm_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => lm_is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

function lm_is_authed(): bool
{
    lm_session_start();
    return !empty($_SESSION['authed']) && ($_SESSION['expires'] ?? 0) > time();
}

/** Сеанс админки длится 12 часов с последнего действия. */
function lm_touch_session(): void
{
    $_SESSION['expires'] = time() + 12 * 3600;
}

function lm_require_auth(): void
{
    if (!lm_is_authed()) {
        lm_error('Нужно войти в админку', 401);
    }
    lm_touch_session();
}

/** Каждое изменение из админки приходит с токеном сессии — чужой сайт не сможет отправить запрос от имени админа. */
function lm_require_csrf(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || $token === '' || !hash_equals((string) ($_SESSION['csrf'] ?? ''), $token)) {
        lm_error('Сессия устарела, обновите страницу админки', 403);
    }
}

/** Настройки сервера: токен Telegram-бота, чат для ответов форм, вебхук. @return array<string, string> */
function lm_settings(): array
{
    $settings = lm_read_json(lm_private_path('settings.json'), []);
    return [
        'telegramBotToken' => (string) ($settings['telegramBotToken'] ?? ''),
        'telegramChatId' => (string) ($settings['telegramChatId'] ?? ''),
        'webhookUrl' => (string) ($settings['webhookUrl'] ?? ''),
    ];
}
