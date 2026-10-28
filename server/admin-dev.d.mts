import type { Plugin } from 'vite';

/** Копия API админки для локальной разработки (см. admin-dev.mjs). */
export function adminDevApi(options: { root: string }): Plugin;
