// Сохраняет каждую страницу сайта как готовый HTML, чтобы поисковики и ИИ-ассистенты видели текст без запуска JavaScript.
// Запускается после `vite build` и `vite build --ssr` (см. "build" в package.json).
// Те же функции (src/lib/seoFiles.ts) использует кнопка «Опубликовать» в админке.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const ssrDir = resolve(root, 'dist-ssr');

const { render, PAGES, headTags, pageFile, sitemapXml, robotsTxt, llmsTxt, llmsFullTxt } = await import(
  pathToFileURL(resolve(ssrDir, 'entry-server.js')).href
);

const template = readFileSync(resolve(dist, 'index.html'), 'utf8');

// Заменяем блок между метками SEO в index.html на теги конкретной страницы.
const SEO_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;
if (!SEO_BLOCK.test(template) || !template.includes('<div id="root"></div>')) {
  throw new Error('В index.html нет меток <!-- seo:start --> / <!-- seo:end --> или пустого <div id="root">');
}

// Заготовки для публикации из админки (PHP): чистый шаблон страницы и стартовое содержимое.
mkdirSync(resolve(dist, 'private'), { recursive: true });
writeFileSync(resolve(dist, 'private/template.html'), template);
copyFileSync(resolve(root, 'src/content/content.json'), resolve(dist, 'private/content.json'));

// Предзагрузка фона шапки нужна только главной.
const withoutHomeOnly = (html) => html.replace(/\n\s*<[^>]*data-home-only[^>]*>/g, '');

for (const page of PAGES) {
  const base = page.slug === null ? template.replace(/ data-home-only/g, '') : withoutHomeOnly(template);
  const html = base
    .replace(SEO_BLOCK, headTags(page).trimStart())
    .replace('<div id="root"></div>', `<div id="root">${render(page.slug)}</div>`);
  // /oferta → dist/oferta.html: так адрес без слеша на конце открывается на Netlify, Vercel (cleanUrls), nginx и Apache.
  const file = resolve(dist, pageFile(page));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`prerender: ${page.path}`);
}

writeFileSync(resolve(dist, 'sitemap.xml'), sitemapXml());
writeFileSync(resolve(dist, 'robots.txt'), robotsTxt());
writeFileSync(resolve(dist, 'llms.txt'), llmsTxt());
writeFileSync(resolve(dist, 'llms-full.txt'), llmsFullTxt());
console.log('prerender: sitemap.xml, robots.txt, llms.txt, llms-full.txt');
