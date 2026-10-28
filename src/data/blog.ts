import { C, img, type BlogPost } from '../content/store';

/** Страница со всеми записями: /blog/. Запись — /blog/<slug>. */
export const BLOG_SLUG = 'blog';

export interface BlogEntry extends BlogPost {
  /** Адрес страницы записи внутри сайта: blog/<slug>. */
  pageSlug: string;
  coverSrc?: string;
}

/** Опубликованные записи, новые сверху. Черновики на сайт не попадают. */
export const BLOG_POSTS: BlogEntry[] = C.blog.posts
  .filter((p) => p.published && p.slug && p.title)
  .map((p) => ({ ...p, pageSlug: `${BLOG_SLUG}/${p.slug}`, coverSrc: img(p.cover) }))
  .sort((a, b) => b.date.localeCompare(a.date));

export const findBlogPost = (pageSlug: string) => BLOG_POSTS.find((p) => p.pageSlug === pageSlug);

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

/** «2026-11-28» → «28 ноября 2026». */
export function formatBlogDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS_GEN[m - 1]} ${y}`;
}
