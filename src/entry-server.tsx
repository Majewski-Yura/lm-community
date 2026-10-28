import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export { PAGES } from './data/seo';
export { headTags, pageFile, sitemapXml, robotsTxt, llmsTxt, llmsFullTxt } from './lib/seoFiles';

/** Готовый HTML страницы для поисковиков (см. scripts/prerender.mjs). */
export function render(pageSlug: string | null): string {
  return renderToString(
    <StrictMode>
      <App initialPageSlug={pageSlug} />
    </StrictMode>
  );
}
