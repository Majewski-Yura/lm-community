// Сохраняет каждую страницу сайта как готовый HTML, чтобы поисковики видели текст без запуска JavaScript.
// Запускается после `vite build` и `vite build --ssr` (см. "build" в package.json).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const ssrDir = resolve(root, 'dist-ssr');

const { render, PAGES, OG_IMAGE, SITE_NAME, SITE_URL, homeStructuredData } = await import(
  pathToFileURL(resolve(ssrDir, 'entry-server.js')).href
);

const template = readFileSync(resolve(dist, 'index.html'), 'utf8');

const escapeAttr = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function headFor(page) {
  const url = `${SITE_URL}${page.path === '/' ? '/' : page.path}`;
  const tags = [
    `<title>${escapeAttr(page.title)}</title>`,
    `<meta name="description" content="${escapeAttr(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escapeAttr(page.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(page.description)}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  if (page.noindex) tags.push('<meta name="robots" content="noindex, nofollow" />');
  if (page.slug === null) {
    // "<" экранируем, чтобы текст событий не мог закрыть тег <script>.
    const json = JSON.stringify(homeStructuredData()).replace(/</g, '\\u003c');
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }
  return tags.map((t) => `    ${t}`).join('\n');
}

// Заменяем блок между метками SEO в index.html на теги конкретной страницы.
const SEO_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;
if (!SEO_BLOCK.test(template) || !template.includes('<div id="root"></div>')) {
  throw new Error('В index.html нет меток <!-- seo:start --> / <!-- seo:end --> или пустого <div id="root">');
}

// Предзагрузка фона шапки нужна только главной.
const withoutHomeOnly = (html) => html.replace(/\n\s*<[^>]*data-home-only[^>]*>/g, '');

for (const page of PAGES) {
  const base = page.slug === null ? template.replace(/ data-home-only/g, '') : withoutHomeOnly(template);
  const html = base
    .replace(SEO_BLOCK, headFor(page).trimStart())
    .replace('<div id="root"></div>', `<div id="root">${render(page.slug)}</div>`);
  // /oferta → dist/oferta.html: так адрес без слеша на конце открывается на Netlify, Vercel (cleanUrls) и nginx.
  const file = page.path === '/' ? resolve(dist, 'index.html') : resolve(dist, `${page.path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`prerender: ${page.path}`);
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.filter((p) => !p.noindex).map(
  (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`
).join('\n')}
</urlset>
`;
writeFileSync(resolve(dist, 'sitemap.xml'), sitemap);
writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log('prerender: sitemap.xml, robots.txt');

rmSync(ssrDir, { recursive: true, force: true });
