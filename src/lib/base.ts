/**
 * Адрес, от которого открывается сайт: «/» на своём домене и Netlify,
 * «/lm-community/» на GitHub Pages (задаётся переменной BASE_PATH при сборке).
 */
export const BASE = import.meta.env.BASE_URL;

/** Путь от корня сайта (`/images/…`, `/oferta`) с учётом подпапки. */
export const withBase = (path: string) => (path.startsWith('/') ? BASE + path.slice(1) : path);
