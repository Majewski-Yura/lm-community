<?php
// Страница с черновиком из админки — её открывает админка, чтобы снять готовый HTML для публикации
// (и показать предпросмотр). Доступна только после входа.

declare(strict_types=1);

require __DIR__ . '/_lib.php';

if (!lm_is_authed()) {
    http_response_code(401);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Нужно войти в админку';
    exit;
}
lm_touch_session();

$page = (string) ($_GET['page'] ?? '');
if ($page !== '' && !preg_match('#^(blog/)?[a-z0-9-]{1,60}$#', $page)) {
    http_response_code(400);
    exit;
}

$template = @file_get_contents(lm_private_path('template.html'));
$content = lm_read_json(lm_private_path('content.json'));
if ($template === false || $content === null) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Нет шаблона или содержимого сайта';
    exit;
}

$flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP;
$script = '<script>window.__LM_PRERENDER__=true;window.__LM_PAGE__=' . json_encode($page === '' ? null : $page, $flags)
    . ';window.__LM_CONTENT__=' . json_encode($content, $flags) . ';</script>';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
echo str_replace('</head>', $script . "\n  </head>", $template);
