// Публикация из админки: каждая страница сайта открывается со свежим черновиком в невидимом окне,
// сайт сам отрисовывает её и отдаёт готовый HTML (window.__LM_SNAPSHOT__), а админка собирает
// из шаблона полноценные .html-файлы. Поисковики и ИИ-ассистенты получают текст без запуска скриптов.
import { api } from './api';

type Snapshot = NonNullable<Window['__LM_SNAPSHOT__']>;

const SEO_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;
const HOME_ONLY = /\n?\s*<[^>]*data-home-only[^>]*>/g;

function snapshot(page: string | null, timeoutMs = 45000): Promise<Snapshot> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    // Ширина как у компьютера: на ней у карточек нет «мобильных» стилей
    frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:1440px;height:900px;border:0;visibility:hidden';
    frame.src = `/api/preview.php?page=${encodeURIComponent(page ?? '')}&t=${Date.now()}`;
    const started = Date.now();
    const done = (fn: () => void) => {
      window.clearInterval(timer);
      frame.remove();
      fn();
    };
    const timer = window.setInterval(() => {
      try {
        const snap = frame.contentWindow?.__LM_SNAPSHOT__;
        if (snap && snap.html) return done(() => resolve(snap));
      } catch {
        // окно ещё грузится
      }
      if (Date.now() - started > timeoutMs) done(() => reject(new Error(`Страница ${page ?? 'главная'} не отрисовалась`)));
    }, 250);
    document.body.appendChild(frame);
  });
}

/** JSON для вставки внутрь <script>: «<» не даст тексту закрыть тег. */
const inlineJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, (ch) => (ch === '\u2028' ? '\\u2028' : '\\u2029'));

function assemble(template: string, snap: Snapshot, content: unknown): string {
  let html = template;
  if (snap.slug === null) {
    // Предзагрузка фото шапки — с актуальным файлом из админки
    html = html.replace(/<link[^>]*data-home-only[^>]*>/, `<link rel="preload" href="${snap.heroPreload}" as="image" fetchpriority="high" />`);
  } else {
    html = html.replace(HOME_ONLY, '');
  }
  const script = `    <script>window.__LM_CONTENT__=${inlineJson(content)};</script>`;
  // Функции замены, а не строки: в тексте сайта могут встретиться «$&» и подобное
  return html.replace(SEO_BLOCK, () => `${snap.head.trimStart()}\n${script}`).replace('<div id="root"></div>', () => `<div id="root">${snap.html}</div>`);
}

/** В страницы сайта уходят только опубликованные записи блога: черновики не должны попасть даже в исходный код. */
function publicContent(content: unknown): unknown {
  const c = content as { blog?: { posts?: { published?: boolean }[] } };
  if (!c?.blog?.posts) return content;
  return { ...c, blog: { ...c.blog, posts: c.blog.posts.filter((p) => p.published) } };
}

export async function publishSite(draft: unknown, onProgress: (text: string) => void): Promise<number> {
  const content = publicContent(draft);
  onProgress('Готовлю шаблон…');
  const template = await api.template();
  if (!SEO_BLOCK.test(template) || !template.includes('<div id="root"></div>')) {
    throw new Error('Шаблон страницы повреждён — загрузите сайт заново из архива');
  }

  onProgress('Собираю главную…');
  const home = await snapshot(null);
  const files: Record<string, string> = { 'index.html': assemble(template, home, content), ...(home.files ?? {}) };

  const others = (home.pages ?? []).filter((p) => p.slug !== null);
  let done = 0;
  // По три страницы одновременно — быстро и без нагрузки на браузер
  const queue = [...others];
  const worker = async () => {
    while (queue.length) {
      const page = queue.shift()!;
      const snap = await snapshot(page.slug);
      files[page.file] = assemble(template, snap, content);
      done += 1;
      onProgress(`Собираю страницы: ${done} из ${others.length}…`);
    }
  };
  await Promise.all([worker(), worker(), worker()]);

  onProgress('Публикую…');
  await api.publish(files, draft);
  return Object.keys(files).length;
}
