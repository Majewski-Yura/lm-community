<?php
// API админки: вход, черновик содержимого, резервные копии, загрузка фото, публикация страниц, настройки.
// Запросы: /api/admin.php?action=<действие>. Все изменения — POST с заголовком X-CSRF-Token.

declare(strict_types=1);

require __DIR__ . '/_lib.php';

const LM_MAX_UPLOAD = 10 * 1024 * 1024;
const LM_MAX_BACKUPS = 60;
const LM_LOGIN_LIMIT = 5;
const LM_LOGIN_LOCK = 15 * 60;

$action = (string) ($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

lm_session_start();

try {
    switch ($action) {
        case 'state':
            lm_json([
                'ok' => true,
                'needsSetup' => !is_file(lm_private_path('auth.json')),
                'authed' => lm_is_authed(),
                'csrf' => $_SESSION['csrf'],
            ]);
            break;

        case 'setup':
            require_post($method);
            if (is_file(lm_private_path('auth.json'))) {
                lm_error('Пароль уже задан', 409);
            }
            $data = lm_request_json();
            $password = (string) ($data['password'] ?? '');
            check_password_strength($password);
            lm_write_json(lm_private_path('auth.json'), ['hash' => password_hash($password, PASSWORD_DEFAULT)]);
            start_admin_session();
            lm_json(['ok' => true, 'csrf' => $_SESSION['csrf']]);
            break;

        case 'login':
            require_post($method);
            $data = lm_request_json();
            login((string) ($data['password'] ?? ''));
            break;

        case 'logout':
            require_post($method);
            lm_require_csrf();
            $_SESSION = [];
            session_destroy();
            lm_json(['ok' => true]);
            break;

        case 'password':
            require_post($method);
            lm_require_auth();
            lm_require_csrf();
            $data = lm_request_json();
            $auth = lm_read_json(lm_private_path('auth.json'), []);
            if (!password_verify((string) ($data['current'] ?? ''), (string) ($auth['hash'] ?? ''))) {
                lm_error('Текущий пароль неверный', 403);
            }
            $new = (string) ($data['password'] ?? '');
            check_password_strength($new);
            lm_write_json(lm_private_path('auth.json'), ['hash' => password_hash($new, PASSWORD_DEFAULT)]);
            lm_json(['ok' => true]);
            break;

        case 'content':
            lm_require_auth();
            lm_json(['ok' => true, 'content' => lm_read_json(lm_private_path('content.json'), new stdClass())]);
            break;

        case 'save':
            require_post($method);
            lm_require_auth();
            lm_require_csrf();
            $data = lm_request_json();
            save_content($data['content'] ?? null);
            lm_json(['ok' => true, 'savedAt' => date('c')]);
            break;

        case 'backups':
            lm_require_auth();
            lm_json(['ok' => true, 'backups' => list_backups()]);
            break;

        case 'restore':
            require_post($method);
            lm_require_auth();
            lm_require_csrf();
            $data = lm_request_json();
            $name = (string) ($data['name'] ?? '');
            if (!preg_match('/^content-[0-9]{8}-[0-9]{6}(-[a-f0-9]{4})?\.json$/', $name) || !is_file(lm_private_path('backups/' . $name))) {
                lm_error('Копия не найдена', 404);
            }
            $content = lm_read_json(lm_private_path('backups/' . $name));
            save_content($content);
            lm_json(['ok' => true, 'content' => $content]);
            break;

        case 'upload':
            require_post($method);
            lm_require_auth();
            lm_require_csrf();
            lm_json(['ok' => true, 'path' => save_upload()]);
            break;

        case 'template':
            lm_require_auth();
            $template = lm_private_path('template.html');
            if (!is_file($template)) {
                lm_error('Нет шаблона страницы: загрузите сайт заново из архива', 500);
            }
            lm_json(['ok' => true, 'template' => file_get_contents($template)]);
            break;

        case 'publish':
            require_post($method);
            lm_require_auth();
            lm_require_csrf();
            $data = lm_request_json(16 * 1024 * 1024);
            publish($data);
            lm_json(['ok' => true, 'publishedAt' => date('c')]);
            break;

        case 'settings':
            lm_require_auth();
            $settings = lm_settings();
            lm_json([
                'ok' => true,
                'telegramChatId' => $settings['telegramChatId'],
                'webhookUrl' => $settings['webhookUrl'],
                // Сам токен в браузер не отдаём
                'hasBotToken' => $settings['telegramBotToken'] !== '',
            ]);
            break;

        case 'settings-save':
            require_post($method);
            lm_require_auth();
            lm_require_csrf();
            $data = lm_request_json();
            $settings = lm_settings();
            $token = trim((string) ($data['telegramBotToken'] ?? ''));
            if ($token !== '') {
                if (!preg_match('/^[0-9]{5,}:[A-Za-z0-9_-]{20,}$/', $token)) {
                    lm_error('Токен бота выглядит неверно: он вида 123456789:AA…');
                }
                $settings['telegramBotToken'] = $token;
            }
            if (!empty($data['clearBotToken'])) {
                $settings['telegramBotToken'] = '';
            }
            $settings['telegramChatId'] = trim((string) ($data['telegramChatId'] ?? ''));
            $webhook = trim((string) ($data['webhookUrl'] ?? ''));
            if ($webhook !== '' && !preg_match('#^https://#i', $webhook)) {
                lm_error('Адрес вебхука должен начинаться с https://');
            }
            $settings['webhookUrl'] = $webhook;
            lm_write_json(lm_private_path('settings.json'), $settings);
            lm_json(['ok' => true]);
            break;

        default:
            lm_error('Неизвестное действие', 404);
    }
} catch (Throwable $e) {
    error_log('[lm-admin] ' . $e->getMessage());
    lm_error('Ошибка на сервере: ' . $e->getMessage(), 500);
}

function require_post(string $method): void
{
    if ($method !== 'POST') {
        lm_error('Только POST', 405);
    }
}

function check_password_strength(string $password): void
{
    $length = function_exists('mb_strlen') ? mb_strlen($password) : strlen($password);
    if ($length < 8) {
        lm_error('Пароль должен быть не короче 8 символов');
    }
}

function start_admin_session(): void
{
    session_regenerate_id(true);
    $_SESSION['authed'] = true;
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    lm_touch_session();
}

/** Вход с защитой от подбора: после 5 неудачных попыток с одного адреса — пауза 15 минут. */
function login(string $password): void
{
    $file = lm_private_path('login-attempts.json');
    $attempts = lm_read_json($file, []);
    $ip = hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    $now = time();
    foreach ($attempts as $key => $row) {
        if (($row['until'] ?? 0) < $now && ($row['last'] ?? 0) < $now - LM_LOGIN_LOCK) {
            unset($attempts[$key]);
        }
    }
    $row = $attempts[$ip] ?? ['count' => 0, 'until' => 0, 'last' => 0];
    if ($row['until'] > $now) {
        lm_error('Слишком много попыток. Попробуйте через ' . (int) ceil(($row['until'] - $now) / 60) . ' мин.', 429);
    }

    $auth = lm_read_json(lm_private_path('auth.json'), []);
    if (!password_verify($password, (string) ($auth['hash'] ?? ''))) {
        $row['count']++;
        $row['last'] = $now;
        if ($row['count'] >= LM_LOGIN_LIMIT) {
            $row = ['count' => 0, 'until' => $now + LM_LOGIN_LOCK, 'last' => $now];
        }
        $attempts[$ip] = $row;
        lm_write_json($file, $attempts);
        usleep(400000);
        lm_error('Неверный пароль', 403);
    }

    unset($attempts[$ip]);
    lm_write_json($file, $attempts);
    start_admin_session();
    lm_json(['ok' => true, 'csrf' => $_SESSION['csrf']]);
}

/** Сохраняет черновик; прежняя версия уходит в резервные копии (последние 60). */
function save_content($content): void
{
    if (!is_array($content) || !isset($content['hero'], $content['calendar'])) {
        lm_error('Содержимое повреждено — сохранение отменено');
    }
    $json = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false || strlen($json) > 3 * 1024 * 1024) {
        lm_error('Содержимое слишком большое');
    }
    $current = lm_private_path('content.json');
    if (is_file($current)) {
        $name = 'content-' . date('Ymd-His') . '-' . bin2hex(random_bytes(2)) . '.json';
        lm_write_atomic(lm_private_path('backups/' . $name), (string) file_get_contents($current));
        $backups = list_backups();
        foreach (array_slice($backups, LM_MAX_BACKUPS) as $old) {
            @unlink(lm_private_path('backups/' . $old['name']));
        }
    }
    lm_write_atomic($current, $json . "\n");
}

/** @return array<int, array{name: string, savedAt: string, size: int}> */
function list_backups(): array
{
    $files = glob(lm_private_path('backups/content-*.json')) ?: [];
    rsort($files);
    return array_map(static function (string $file): array {
        return ['name' => basename($file), 'savedAt' => date('c', (int) filemtime($file)), 'size' => (int) filesize($file)];
    }, $files);
}

/** Фото сжимает браузер админки; сервер проверяет, что это действительно картинка, и кладёт в uploads/ГГГГ/ММ/. */
function save_upload(): string
{
    $file = $_FILES['file'] ?? null;
    if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        lm_error('Файл не загрузился');
    }
    if ($file['size'] > LM_MAX_UPLOAD) {
        lm_error('Файл больше 10 МБ');
    }
    $types = ['image/webp' => 'webp', 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/svg+xml' => null];
    $mime = '';
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = (string) finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
    }
    $info = @getimagesize($file['tmp_name']);
    if ($info === false) {
        lm_error('Это не картинка');
    }
    $mime = $mime ?: (string) $info['mime'];
    if (empty($types[$mime])) {
        lm_error('Подходят только JPG, PNG и WebP');
    }
    $dir = 'uploads/' . date('Y') . '/' . date('m');
    if (!is_dir(LM_ROOT . '/' . $dir) && !mkdir(LM_ROOT . '/' . $dir, 0755, true)) {
        lm_error('Не удалось создать папку для фото', 500);
    }
    $name = substr(sha1_file($file['tmp_name']) ?: bin2hex(random_bytes(10)), 0, 16) . '.' . $types[$mime];
    $target = LM_ROOT . '/' . $dir . '/' . $name;
    if (!is_file($target) && !move_uploaded_file($file['tmp_name'], $target)) {
        lm_error('Не удалось сохранить фото', 500);
    }
    @chmod($target, 0644);
    return '/' . $dir . '/' . $name;
}

/**
 * Публикация: готовые страницы, снятые админкой (index.html, oferta.html…), и файлы для поисковиков.
 * Пишем только разрешённые имена в корень сайта.
 */
function publish(array $data): void
{
    $files = $data['files'] ?? null;
    if (!is_array($files) || !isset($files['index.html'])) {
        lm_error('Нет страниц для публикации');
    }
    $fixed = ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt'];
    foreach ($files as $name => $body) {
        $name = (string) $name;
        $isPage = (bool) preg_match('#^(blog/)?[a-z0-9-]{1,60}\.html$#', $name);
        if (!$isPage && !in_array($name, $fixed, true)) {
            lm_error('Недопустимое имя файла: ' . $name);
        }
        if (!is_string($body) || $body === '') {
            lm_error('Пустой файл: ' . $name);
        }
        if ($isPage && (strpos($body, '<div id="root">') === false || strpos($body, '</html>') === false)) {
            lm_error('Страница ' . $name . ' собрана не полностью — публикация отменена');
        }
    }
    foreach ($files as $name => $body) {
        lm_write_atomic(LM_ROOT . '/' . $name, $body);
    }
    if (isset($data['content']) && is_array($data['content'])) {
        lm_write_json(lm_private_path('published.json'), $data['content']);
    }
}
