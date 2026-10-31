import { C } from '../content/store';
import { CALENDAR_EVENTS, CALENDAR_TITLE, FORMAT_META, PLACE_META } from '../data/calendarData';
import { OG_IMAGE, PAGES, SITE_NAME, SITE_URL, homeStructuredData, type PageMeta } from '../data/seo';

export { PAGES };
import { EXPERTS, FOUNDERS, PARTICIPANTS, WHO_ROLES } from '../data/siteContent';
import { BLOG_POSTS, findBlogPost } from '../data/blog';
import { markdownToPlain } from '../components/Markdown';

// Всё, что видят поисковики и ИИ-ассистенты помимо самой разметки страницы:
// теги <head>, sitemap.xml, robots.txt и llms.txt. Используется при сборке (scripts/prerender.mjs)
// и при публикации из админки — так обе дороги дают одинаковый результат.

const plain = (s: string) => s.replace(/ /g, ' ');

const escapeAttr = (value: string) =>
  plain(String(value)).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Теги <head> страницы: заголовок, описание, canonical, Open Graph и Schema.org для главной. */
export function headTags(page: PageMeta): string {
  const url = `${SITE_URL}${page.path === '/' ? '/' : page.path}`;
  const post = page.slug ? findBlogPost(page.slug) : undefined;
  const ogImage = post?.cover ? absUrl(post.cover) : OG_IMAGE;
  const tags = [
    `<title>${escapeAttr(page.title)}</title>`,
    `<meta name="description" content="${escapeAttr(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${post ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escapeAttr(page.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(page.description)}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="alternate" type="text/plain" title="llms.txt" href="${SITE_URL}/llms.txt" />`,
  ];
  if (page.noindex) tags.push('<meta name="robots" content="noindex, nofollow" />');
  // "<" экранируем, чтобы текст событий и записей не мог закрыть тег <script>.
  const ld = (data: unknown) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
  if (page.slug === null) tags.push(ld(homeStructuredData()));
  if (post) {
    tags.push(`<meta property="article:published_time" content="${post.date}" />`);
    tags.push(
      ld({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: plain(post.title),
        description: plain(post.excerpt || post.title),
        datePublished: post.date,
        image: ogImage,
        url,
        mainEntityOfPage: url,
        inLanguage: 'ru-RU',
        author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: { '@id': `${SITE_URL}/#organization` },
        articleBody: markdownToPlain(plain(post.body)).slice(0, 5000),
      }),
    );
  }
  return tags.map((t) => `    ${t}`).join('\n');
}

/** Файл страницы в корне сайта: «/» → index.html, «/oferta» → oferta.html. */
export const pageFile = (page: PageMeta) =>
  page.path === '/' ? 'index.html' : page.path.endsWith('/') ? `${page.path.slice(1)}index.html` : `${page.path.slice(1)}.html`;

const absUrl = (path?: string) => (!path ? OG_IMAGE : /^https?:/.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);

export function sitemapXml(date = new Date().toISOString().slice(0, 10)): string {
  const urls = PAGES.filter((p) => !p.noindex).map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${date}</lastmod>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

/** Открыт для всех поисковиков и ИИ-ассистентов; служебные папки закрыты. */
export function robotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

# Поисковые и ИИ-ассистенты (ChatGPT, Claude, Perplexity, Google AI, Яндекс) — доступ открыт
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: YandexBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function eventsList(withDetails: boolean): string {
  return CALENDAR_EVENTS.map((ev) => {
    const date = `${ev.day} ${MONTHS_GEN[C.calendar.month - 1]} ${C.calendar.year}`;
    const head = `- ${date}${ev.time ? `, ${ev.time} (МСК)` : ''} — ${plain(ev.title)} (${PLACE_META[ev.place].label.toLowerCase()}, ${FORMAT_META[ev.format].label.toLowerCase()})`;
    if (!withDetails) return head;
    const extra = [
      ev.speakers?.length ? `  Спикеры: ${ev.speakers.map(plain).join(', ')}` : '',
      ev.description ? `  ${plain(ev.description)}` : '',
      ...(ev.theses ?? []).map((t) => `  • ${plain(t)}`),
    ].filter(Boolean);
    return [head, ...extra].join('\n');
  }).join('\n');
}

/** Краткая «визитка» сайта для ИИ-ассистентов (стандарт llmstxt.org). */
export function llmsTxt(): string {
  const t = C.tariff;
  return `# ${SITE_NAME}

> ${plain(C.seo.description)}

${plain(C.hero.subtitle)}. ${plain(C.hero.lead)}.

## Для кого
${WHO_ROLES.map((r) => `- ${plain(r)}`).join('\n')}

## Что есть в сообществе
${[...C.communityHas.items, ...C.communityExtra.items].map((i) => `- ${plain(i.title)} — ${plain(i.frequency)}`).join('\n')}

## Стоимость участия
${t.price ? `${plain(t.badge)}: ${plain(t.price)} ${plain(t.period)} (${plain(t.promoNote)}).` : `${plain(t.badge)}: цена уточняется.`}
Вступить: ${C.links.join}

## ${plain(CALENDAR_TITLE)}
${eventsList(false)}

## Основатели
${FOUNDERS.map((f) => `- ${plain(f.name)} — ${plain(f.role)}`).join('\n')}
${BLOG_POSTS.length ? `\n## Блог\n${BLOG_POSTS.slice(0, 20).map((p) => `- [${plain(p.title)}](${SITE_URL}/${p.pageSlug}) (${p.date})${p.excerpt ? `: ${plain(p.excerpt)}` : ''}`).join('\n')}\n` : ''}
## Страницы
- [Главная](${SITE_URL}/): о сообществе, участники, эксперты, календарь, тариф
- [Полная версия для ИИ](${SITE_URL}/llms-full.txt): все тексты сайта одним файлом
${PAGES.filter((p) => p.slug && !p.noindex).map((p) => `- [${plain(p.title.replace(/ \| .*$/, ''))}](${SITE_URL}${p.path})`).join('\n')}
`;
}

/** Все тексты главной одним файлом — чтобы ИИ-ассистенты отвечали о сообществе точно. */
export function llmsFullTxt(): string {
  const section = (title: string, body: string) => `## ${plain(title)}\n\n${body.trim()}\n`;
  const list = (items: string[]) => items.map((i) => `- ${plain(i)}`).join('\n');
  return [
    `# ${SITE_NAME}\n\n> ${plain(C.seo.description)}\n\nСайт: ${SITE_URL}\nВступить в сообщество: ${C.links.join}\n`,
    section(C.who.title, `${plain(C.who.lead)}\n\n${list([...WHO_ROLES])}\n\n${plain(C.who.cardTitle)} ${plain(C.who.cardText)} ${plain(C.who.cardAccent)}`),
    section(C.canDo.title, C.canDo.items.map((i) => `### ${plain(i.title)}\n${plain(i.text)}`).join('\n\n')),
    section(C.communityHas.title, C.communityHas.items.map((i) => `### ${plain(i.title)} (${plain(i.frequency)})\n${plain(i.description)}`).join('\n\n')),
    section(C.communityExtra.title, C.communityExtra.items.map((i) => `### ${plain(i.title)} (${plain(i.frequency)})\n${plain(i.description)}`).join('\n\n')),
    section(
      C.tariff.title,
      `${plain(C.tariff.badge)}: ${C.tariff.price ? `${plain(C.tariff.price)} ${plain(C.tariff.period)}` : 'цена уточняется'}. ${plain(C.tariff.promoNote)}.\n\n${plain(C.tariff.description)}\n\n${plain(C.tariff.featuresTitle)}:\n${list(C.tariff.features)}`,
    ),
    section(CALENDAR_TITLE, eventsList(true)),
    section(C.experts.title, EXPERTS.map((e) => `- ${plain(e.name)} — ${plain(e.position)}`).join('\n')),
    section(C.participants.title, PARTICIPANTS.map((p) => `- ${plain(p.name)} — ${plain(p.position)}`).join('\n')),
    section(C.testimonials.title, C.testimonials.items.map((t) => `> ${plain(t.quote)}\n> — ${plain(t.name)}, ${plain(t.position)}`).join('\n\n')),
    section(C.founders.title, FOUNDERS.map((f) => `### ${plain(f.name)}\n${plain(f.role)}\n\n${plain(f.bio)}\n\n${list(f.highlights)}`).join('\n\n')),
    section(C.values.title, `${plain(C.values.lead)}\n\n${C.values.items.map((v, i) => `${i + 1}. ${plain(v.title)} — ${plain(v.description)}`).join('\n')}`),
    section(C.ecosystem.title, `${plain(C.ecosystem.lead)}\n\n${C.ecosystem.items.map((e) => `### ${plain(e.title)}\n${plain(e.description)}`).join('\n\n')}`),
    ...(BLOG_POSTS.length
      ? [section('Блог', BLOG_POSTS.slice(0, 30).map((p) => `### ${plain(p.title)}\n${p.date} · ${SITE_URL}/${p.pageSlug}\n\n${markdownToPlain(plain(p.body))}`).join('\n\n'))]
      : []),
    section(C.final.title, plain(C.final.text)),
  ].join('\n');
}
