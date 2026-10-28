// Копия API админки (public/api/admin.php и preview.php) для локальной разработки: `vite` без PHP.
// Данные лежат в .dev-admin/ (черновик, пароль, копии, фото, «опубликованные» файлы) и в git не попадают.
// На хостинге работает только PHP-версия — поведение у них одно и то же.
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

const MAX_UPLOAD = 10 * 1024 * 1024;

export function adminDevApi({ root }) {
  const dir = resolve(root, '.dev-admin');
  const file = (name) => resolve(dir, name);
  const readJson = (name, fallback) => (existsSync(file(name)) ? JSON.parse(readFileSync(file(name), 'utf8')) : fallback);
  const writeJson = (name, data) => {
    mkdirSync(dirname(file(name)), { recursive: true });
    writeFileSync(file(name), JSON.stringify(data, null, 2) + '\n');
  };
  if (!existsSync(file('content.json'))) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file('content.json'), readFileSync(resolve(root, 'src/content/content.json')));
  }

  // Одна «сессия» на процесс разработки
  const session = { authed: false, csrf: randomBytes(32).toString('hex') };
  const hash = (password, salt = randomBytes(16).toString('hex')) => `${salt}:${scryptSync(password, salt, 32).toString('hex')}`;
  const verify = (password, stored) => {
    const [salt, key] = String(stored || '').split(':');
    if (!salt || !key) return false;
    return timingSafeEqual(Buffer.from(key, 'hex'), scryptSync(password, salt, 32));
  };

  const send = (res, status, body) => {
    res.statusCode = status;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
  };
  const fail = (res, error, status = 400) => send(res, status, { ok: false, error });
  const readBody = async (req) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    return Buffer.concat(chunks);
  };

  const api = async (req, res, server) => {
    const url = new URL(req.url, 'http://localhost');
    const action = url.searchParams.get('action') || '';
    const isPost = req.method === 'POST';
    const needAuth = () => (session.authed ? false : (fail(res, 'Нужно войти в админку', 401), true));
    const needCsrf = () => (req.headers['x-csrf-token'] === session.csrf ? false : (fail(res, 'Сессия устарела, обновите страницу админки', 403), true));
    const json = async () => JSON.parse((await readBody(req)).toString('utf8') || '{}');

    switch (action) {
      case 'state':
        return send(res, 200, { ok: true, needsSetup: !existsSync(file('auth.json')), authed: session.authed, csrf: session.csrf });
      case 'setup': {
        if (existsSync(file('auth.json'))) return fail(res, 'Пароль уже задан', 409);
        const { password = '' } = await json();
        if (password.length < 8) return fail(res, 'Пароль должен быть не короче 8 символов');
        writeJson('auth.json', { hash: hash(password) });
        session.authed = true;
        return send(res, 200, { ok: true, csrf: session.csrf });
      }
      case 'login': {
        const { password = '' } = await json();
        if (!verify(password, readJson('auth.json', {}).hash)) return fail(res, 'Неверный пароль', 403);
        session.authed = true;
        return send(res, 200, { ok: true, csrf: session.csrf });
      }
      case 'logout':
        if (needCsrf()) return;
        session.authed = false;
        return send(res, 200, { ok: true });
      case 'password': {
        if (needAuth() || needCsrf()) return;
        const { current = '', password = '' } = await json();
        if (!verify(current, readJson('auth.json', {}).hash)) return fail(res, 'Текущий пароль неверный', 403);
        if (password.length < 8) return fail(res, 'Пароль должен быть не короче 8 символов');
        writeJson('auth.json', { hash: hash(password) });
        return send(res, 200, { ok: true });
      }
      case 'content':
        if (needAuth()) return;
        return send(res, 200, { ok: true, content: readJson('content.json', {}) });
      case 'save': {
        if (!isPost || needAuth() || needCsrf()) return;
        const { content } = await json();
        if (!content || !content.hero || !content.calendar) return fail(res, 'Содержимое повреждено — сохранение отменено');
        if (existsSync(file('content.json'))) {
          const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
          mkdirSync(file('backups'), { recursive: true });
          writeFileSync(file(`backups/content-${stamp}-${randomBytes(2).toString('hex')}.json`), readFileSync(file('content.json')));
        }
        writeJson('content.json', content);
        return send(res, 200, { ok: true, savedAt: new Date().toISOString() });
      }
      case 'backups': {
        if (needAuth()) return;
        const names = existsSync(file('backups')) ? readdirSync(file('backups')).filter((n) => n.startsWith('content-')).sort().reverse() : [];
        const backups = names.map((name) => ({ name, savedAt: statSync(file(`backups/${name}`)).mtime.toISOString(), size: statSync(file(`backups/${name}`)).size }));
        return send(res, 200, { ok: true, backups });
      }
      case 'restore': {
        if (!isPost || needAuth() || needCsrf()) return;
        const { name = '' } = await json();
        if (!/^content-[0-9]{8}-[0-9]{6}(-[a-f0-9]{4})?\.json$/.test(name) || !existsSync(file(`backups/${name}`))) return fail(res, 'Копия не найдена', 404);
        const content = JSON.parse(readFileSync(file(`backups/${name}`), 'utf8'));
        writeJson('content.json', content);
        return send(res, 200, { ok: true, content });
      }
      case 'upload': {
        if (!isPost || needAuth() || needCsrf()) return;
        const request = new Request('http://localhost/', { method: 'POST', headers: { 'content-type': req.headers['content-type'] }, body: await readBody(req) });
        const form = await request.formData();
        const upload = form.get('file');
        if (!upload || typeof upload === 'string') return fail(res, 'Файл не загрузился');
        if (upload.size > MAX_UPLOAD) return fail(res, 'Файл больше 10 МБ');
        const ext = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }[upload.type];
        if (!ext) return fail(res, 'Подходят только JPG, PNG и WebP');
        const data = Buffer.from(await upload.arrayBuffer());
        const now = new Date();
        const rel = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${createHash('sha1').update(data).digest('hex').slice(0, 16)}.${ext}`;
        mkdirSync(dirname(file(rel)), { recursive: true });
        writeFileSync(file(rel), data);
        return send(res, 200, { ok: true, path: `/${rel}` });
      }
      case 'template': {
        if (needAuth()) return;
        // В разработке шаблон — index.html, обработанный Vite (со скриптами разработки)
        const raw = readFileSync(resolve(root, 'index.html'), 'utf8');
        return send(res, 200, { ok: true, template: await server.transformIndexHtml('/', raw) });
      }
      case 'publish': {
        if (!isPost || needAuth() || needCsrf()) return;
        const { files, content } = await json();
        if (!files || !files['index.html']) return fail(res, 'Нет страниц для публикации');
        for (const [name, body] of Object.entries(files)) {
          const isPage = /^(blog\/)?[a-z0-9-]{1,60}\.html$/.test(name);
          if (!isPage && !['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt'].includes(name)) return fail(res, `Недопустимое имя файла: ${name}`);
          if (isPage && (!body.includes('<div id="root">') || !body.includes('</html>'))) return fail(res, `Страница ${name} собрана не полностью — публикация отменена`);
        }
        for (const [name, body] of Object.entries(files)) {
          mkdirSync(dirname(file(`published/${name}`)), { recursive: true });
          writeFileSync(file(`published/${name}`), body);
        }
        if (content) writeJson('published.json', content);
        return send(res, 200, { ok: true, publishedAt: new Date().toISOString() });
      }
      case 'settings':
        if (needAuth()) return;
        {
          const s = readJson('settings.json', {});
          return send(res, 200, { ok: true, telegramChatId: s.telegramChatId || '', webhookUrl: s.webhookUrl || '', hasBotToken: Boolean(s.telegramBotToken) });
        }
      case 'settings-save': {
        if (!isPost || needAuth() || needCsrf()) return;
        const data = await json();
        const s = readJson('settings.json', {});
        if (data.telegramBotToken) s.telegramBotToken = data.telegramBotToken;
        if (data.clearBotToken) s.telegramBotToken = '';
        s.telegramChatId = data.telegramChatId || '';
        s.webhookUrl = data.webhookUrl || '';
        writeJson('settings.json', s);
        return send(res, 200, { ok: true });
      }
      default:
        return fail(res, 'Неизвестное действие', 404);
    }
  };

  const preview = async (req, res, server) => {
    if (!session.authed) {
      res.statusCode = 401;
      return res.end('Нужно войти в админку');
    }
    const page = new URL(req.url, 'http://localhost').searchParams.get('page') || '';
    const raw = readFileSync(resolve(root, 'index.html'), 'utf8');
    const html = await server.transformIndexHtml('/', raw);
    const content = readJson('content.json', {});
    const safe = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
    const script = `<script>window.__LM_PRERENDER__=true;window.__LM_PAGE__=${safe(page || null)};window.__LM_CONTENT__=${safe(content)};</script>`;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(html.replace('</head>', `${script}\n  </head>`));
  };

  return {
    name: 'admin-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/admin.php', (req, res) => api(req, res, server).catch((e) => fail(res, String(e?.message || e), 500)));
      server.middlewares.use('/api/preview.php', (req, res) => preview(req, res, server).catch((e) => fail(res, String(e?.message || e), 500)));
      // Фото, загруженные в админке при разработке
      server.middlewares.use('/uploads', (req, res, next) => {
        const path = file(`uploads${decodeURIComponent(req.url.split('?')[0])}`);
        if (!path.startsWith(file('uploads')) || !existsSync(path)) return next();
        const type = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' }[extname(path)] || 'application/octet-stream';
        res.setHeader('content-type', type);
        res.end(readFileSync(path));
      });
    },
  };
}
