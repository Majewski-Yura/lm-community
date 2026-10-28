import defaults from './content.json';
import { withBase } from '../lib/base';
import { typographDeep } from '../lib/typograph';

/** Запись блога: итоги мероприятий, отчёты за месяц, новости сообщества. */
export interface BlogPost {
  /** Адрес записи: /blog/<slug>. Латиница, цифры и дефисы. */
  slug: string;
  title: string;
  /** Дата в формате ГГГГ-ММ-ДД. */
  date: string;
  cover: string;
  excerpt: string;
  /** Текст записи: абзацы через пустую строку, «## Подзаголовок», фото — строкой ![подпись](/uploads/…). */
  body: string;
  /** Черновик не показывается на сайте. */
  published: boolean;
}

type Defaults = typeof defaults;

/** Всё содержимое сайта, которое меняется в админке: тексты, календарь, люди, фото, цена, блог. */
export type SiteContent = Omit<Defaults, 'blog'> & { blog: Omit<Defaults['blog'], 'posts'> & { posts: BlogPost[] } };

declare global {
  interface Window {
    /** Содержимое, опубликованное из админки: PHP вписывает его в каждую страницу перед скриптами сайта. */
    __LM_CONTENT__?: SiteContent;
    /** Админка открыла страницу, чтобы снять с неё готовый HTML для публикации. */
    __LM_PRERENDER__?: boolean;
    /** Какую страницу снимать: null — главная, иначе адрес внутренней страницы. */
    __LM_PAGE__?: string | null;
    /** Готовый снимок страницы для админки. */
    __LM_SNAPSHOT__?: {
      slug: string | null;
      head: string;
      html: string;
      heroPreload: string;
      /** Только у главной: все страницы сайта и файлы для поисковиков. */
      pages?: { slug: string | null; file: string }[];
      files?: Record<string, string>;
    };
  }
}

/** Страница открыта админкой для снимка: без анимаций, баннера cookie и правок под ширину экрана. */
export const IS_PRERENDER = typeof window !== 'undefined' && Boolean(window.__LM_PRERENDER__);

/** Объекты сливаем по ключам, массивы и значения берём из опубликованного: так новые поля получают значения по умолчанию. */
function merge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return override as T;
  if (typeof override !== 'object' || Array.isArray(override)) return base;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    result[key] = key in result ? merge(result[key], value) : value;
  }
  return result as T;
}

const published = typeof window !== 'undefined' ? window.__LM_CONTENT__ : undefined;

/** Содержимое сайта с неразрывными пробелами в текстах. */
export const C: SiteContent = typographDeep(merge(defaults as SiteContent, published));

/** Путь к картинке из админки (`/images/…`, `/uploads/…`) с учётом подпапки сайта; пустой — нет картинки. */
export const img = (path?: string): string | undefined => (path ? withBase(path) : undefined);
