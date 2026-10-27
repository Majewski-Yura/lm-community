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
import { BASE } from './lib/base';

function resolveInitialPageSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const segments = window.location.pathname
    .split('/')
    .filter((part) => part && part !== 'index.html');
  const last = segments[segments.length - 1]?.replace(/\.html$/, '');
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
      window.history.pushState(null, '', `${BASE}${slug}`);
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

      <CookieBanner onOpenLegal={handleOpenLegal} />
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
  return null;
}

export default App;
