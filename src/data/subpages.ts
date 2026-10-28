import { EVENT_PAGES } from './eventPages';
import { LEGAL_DOCS } from './legalPagesData';
import { BLOG_POSTS, BLOG_SLUG } from './blog';

/** Адрес архивной страницы конференции 2025 — как на Tilda. */
export const CONFERENCE_2025_SLUG = 'home';

/** Все внутренние страницы сайта: адрес /<slug> (записи блога — /blog/<slug>). */
export const SUBPAGE_SLUGS: string[] = [
  ...Object.keys(LEGAL_DOCS),
  'diagnostic',
  'anketa',
  ...Object.keys(EVENT_PAGES),
  CONFERENCE_2025_SLUG,
  BLOG_SLUG,
  ...BLOG_POSTS.map((p) => p.pageSlug),
];

export const isSubpage = (slug: string | undefined | null): slug is string =>
  Boolean(slug) && SUBPAGE_SLUGS.includes(slug as string);
