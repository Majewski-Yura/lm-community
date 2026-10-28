import { useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { CookieBanner } from './components/Footer';
import { LegalSubpageView } from './components/LegalSubpageView';
import { DiagnosticPage } from './components/DiagnosticPage';
import { AnketaPage } from './components/AnketaPage';
import { EventPageView } from './components/EventPageView';
import { Conference2025Page } from './components/Conference2025Page';
import { EVENT_PAGES } from './data/eventPages';
import { LEGAL_DOCS } from './data/legalPagesData';
import { pageMetaFor } from './data/seo';
import { CONFERENCE_2025_SLUG, isSubpage } from './data/subpages';
import { useOrphanFix } from './lib/orphans';
import { BLOG_SLUG, findBlogPost } from './data/blog';
import { BlogListPage, BlogPostPage } from './components/BlogSections';
import { BASE } from './lib/base';
import { IS_PRERENDER } from './content/store';
import { ASSETS } from './data/siteContent';

function resolveInitialPageSlug(): string | null {
  if (typeof window === 'undefined') return null;
  if (IS_PRERENDER) return window.__LM_PAGE__ ?? null;
  const segments = window.location.pathname
    .split('/')
    .filter((part) => part && part !== 'index.html');
  const last = segments[segments.length - 1]?.replace(/\.html$/, '');
  // Блог: /blog/ — все записи, /blog/<slug> — запись
  const blogIndex = segments.lastIndexOf(BLOG_SLUG);
  if (blogIndex !== -1) {
    const post = segments[blogIndex + 1]?.replace(/\.html$/, '');
    const slug = post && post !== 'index' ? `${BLOG_SLUG}/${post}` : BLOG_SLUG;
    if (isSubpage(slug)) return slug;
  }
  if (isSubpage(last)) return last;
  const cleanHash = window.location.hash.replace(/^#\/?/, '');
  if (isSubpage(cleanHash)) return cleanHash;
  return null;
}

const withHash = (href: string) => (href.startsWith('#') ? href : `#${href}`);

interface AppProps {
  /** Внутренняя страница при сборке готового HTML (на сервере адреса страницы нет). */
  initialPageSlug?: string | null;
}

export function App({ initialPageSlug }: AppProps) {
  const [pageSlug, setPageSlug] = useState<string | null>(() =>
    initialPageSlug !== undefined ? initialPageSlug : resolveInitialPageSlug()
  );

  useEffect(() => {
    document.title = pageMetaFor(pageSlug).title;
  }, [pageSlug]);

  useOrphanFix([pageSlug]);

  // Снимок для публикации из админки: готовый HTML страницы, теги <head> и файлы для поисковиков
  useEffect(() => {
    if (!IS_PRERENDER) return;
    let cancelled = false;
    (async () => {
      await document.fonts?.ready;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const seo = await import('./lib/seoFiles');
      if (cancelled) return;
      const page = pageMetaFor(pageSlug);
      window.__LM_SNAPSHOT__ = {
        slug: pageSlug,
        head: seo.headTags(page),
        html: document.getElementById('root')?.innerHTML ?? '',
        heroPreload: ASSETS.heroCrowdPhoto,
        pages: pageSlug === null ? seo.PAGES.map((p) => ({ slug: p.slug, file: seo.pageFile(p) })) : undefined,
        files:
          pageSlug === null
            ? { 'sitemap.xml': seo.sitemapXml(), 'robots.txt': seo.robotsTxt(), 'llms.txt': seo.llmsTxt(), 'llms-full.txt': seo.llmsFullTxt() }
            : undefined,
      };
    })();
    return () => {
      cancelled = true;
    };
  }, [pageSlug]);

  useEffect(() => {
    const onPopState = () => setPageSlug(resolveInitialPageSlug());
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
    };
  }, []);

  // Прокрутка к разделу из адреса (например, index.html#tarifi) после первой отрисовки.
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, '');
    if (!id || id.startsWith('/') || isSubpage(id)) return;
    const timer = window.setTimeout(() => {
      document.getElementById(id === 'dlykogo' ? 'dlyakogo' : id)?.scrollIntoView({ block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, []);

  const scrollToTarget = useCallback((rawHref: string) => {
    const cleanId = rawHref.replace(/^\/?#/, '');
    if (!cleanId || cleanId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const targetId = cleanId === 'dlykogo' ? 'dlyakogo' : cleanId;
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleNavigateAnchor = useCallback(
    (href: string) => {
      if (pageSlug) {
        setPageSlug(null);
        try {
          window.history.pushState(null, '', `${BASE}${withHash(href)}`);
        } catch {
          // file:// может запрещать работу с историей
        }
        requestAnimationFrame(() => {
          window.setTimeout(() => scrollToTarget(href), 50);
        });
      } else {
        try {
          window.history.replaceState(null, '', withHash(href));
        } catch {
          // file:// может запрещать работу с историей
        }
        scrollToTarget(href);
      }
    },
    [pageSlug, scrollToTarget]
  );

  const handleOpenLegal = useCallback((slug: string) => {
    setPageSlug(slug);
    try {
      window.history.pushState(null, '', `${BASE}${slug === BLOG_SLUG ? 'blog/' : slug}`);
    } catch {
      // file:// может запрещать работу с историей
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackHome = useCallback(() => {
    setPageSlug(null);
    try {
      window.history.pushState(null, '', BASE);
    } catch {
      // file:// может запрещать работу с историей
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#020201] text-[#ffffff]">
      <Navbar onNavigateAnchor={handleNavigateAnchor} isSubpage={Boolean(pageSlug)} />

      {pageSlug ? (
        <Subpage
          slug={pageSlug}
          onBackHome={handleBackHome}
          onNavigateAnchor={handleNavigateAnchor}
          onOpenLegal={handleOpenLegal}
        />
      ) : (
        <HomePage onNavigateAnchor={handleNavigateAnchor} onOpenLegal={handleOpenLegal} />
      )}

      {!IS_PRERENDER && <CookieBanner onOpenLegal={handleOpenLegal} />}
    </div>
  );
}

interface SubpageProps {
  slug: string;
  onBackHome: () => void;
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

function Subpage({ slug, ...nav }: SubpageProps) {
  if (LEGAL_DOCS[slug]) return <LegalSubpageView slug={slug} {...nav} />;
  if (EVENT_PAGES[slug]) return <EventPageView slug={slug} {...nav} />;
  if (slug === 'diagnostic') return <DiagnosticPage {...nav} />;
  if (slug === 'anketa') return <AnketaPage {...nav} />;
  if (slug === CONFERENCE_2025_SLUG) return <Conference2025Page {...nav} />;
  if (slug === BLOG_SLUG) return <BlogListPage {...nav} />;
  const post = findBlogPost(slug);
  if (post) return <BlogPostPage post={post} {...nav} />;
  return null;
}

export default App;
