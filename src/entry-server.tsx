import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export { PAGES, OG_IMAGE, SITE_NAME, SITE_URL, homeStructuredData } from './data/seo';

/** Готовый HTML страницы для поисковиков (см. scripts/prerender.mjs). */
export function render(pageSlug: string | null): string {
  return renderToString(
    <StrictMode>
      <App initialPageSlug={pageSlug} />
    </StrictMode>
  );
}
