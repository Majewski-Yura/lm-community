import { CALENDAR_EVENTS, CALENDAR_MONTH_INDEX, CALENDAR_YEAR, FORMAT_META, type CalendarEvent } from './calendarData';
import { DIAGNOSTIC_TITLE } from './diagnosticData';
import { EVENT_PAGES } from './eventPages';
import { LEGAL_DOCS } from './legalPagesData';
import { FOUNDERS } from './siteContent';
import { CONFERENCE_2025_SLUG } from './subpages';
import { C } from '../content/store';
import { BLOG_POSTS, BLOG_SLUG } from './blog';

/** Адрес сайта для canonical, og:url и sitemap.xml (задаётся в админке, без слеша на конце). */
export const SITE_URL = C.seo.siteUrl.replace(/\/+$/, '');
export const SITE_NAME = 'Люди Медицины';
export const OG_IMAGE = /^https?:/.test(C.seo.ogImage) ? C.seo.ogImage : `${SITE_URL}${C.seo.ogImage}`;

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  /** Приоритет в sitemap.xml: главная — 1, документы — 0.3. */
  priority: number;
  /** Внутренняя страница (/<slug>); null — главная. */
  slug: string | null;
  /** Служебная страница (анкета, диагностика): не индексируем и не кладём в sitemap. */
  noindex?: boolean;
}

export const HOME_META: PageMeta = {
  path: '/',
  title: C.seo.title.replace(/\u00A0/g, ' '),
  description: C.seo.description.replace(/\u00A0/g, ' '),
  priority: 1,
  slug: null,
};

export const PAGES: PageMeta[] = [
  HOME_META,
  ...Object.values(LEGAL_DOCS).map((doc) => ({
    path: `/${doc.slug}`,
    title: `${doc.pageTitle} | Люди Медицины`,
    description: `${doc.pageTitle} сообщества «Люди Медицины».`,
    priority: 0.3,
    slug: doc.slug,
  })),
  {
    path: '/diagnostic',
    title: `${DIAGNOSTIC_TITLE} | Люди Медицины`,
    description: 'Диагностика для участников сообщества: оцените стратегию, финансы, команду и личную эффективность — результат придёт в бот.',
    priority: 0.3,
    slug: 'diagnostic',
    noindex: true,
  },
  {
    path: '/anketa',
    title: 'Итоги месяца в сообществе «Люди Медицины» | Анкета',
    description: 'Анкета для участников сообщества «Люди Медицины»: что было полезно за месяц и что стоит изменить.',
    priority: 0.3,
    slug: 'anketa',
    noindex: true,
  },
  ...Object.values(EVENT_PAGES).map((ev) => ({
    path: `/${ev.slug}`,
    title: `${ev.title} — ${ev.when} | Люди Медицины`,
    description: `${ev.kind} сообщества «Люди Медицины»: ${ev.when}, ${ev.where}. ${ev.about}`,
    priority: 0.5,
    slug: ev.slug,
  })),
  {
    path: `/${BLOG_SLUG}/`,
    title: `${C.blog.title} — блог сообщества | Люди Медицины`.replace(/\u00A0/g, ' '),
    description: C.blog.lead.replace(/\u00A0/g, ' '),
    priority: 0.6,
    slug: BLOG_SLUG,
  },
  ...BLOG_POSTS.map((p) => ({
    path: `/${p.pageSlug}`,
    title: `${p.title} | Люди Медицины`.replace(/\u00A0/g, ' '),
    description: (p.excerpt || p.title).replace(/\u00A0/g, ' '),
    priority: 0.6,
    slug: p.pageSlug,
  })),
  {
    path: `/${CONFERENCE_2025_SLUG}`,
    title: 'Конференция «Люди Медицины» 14 ноября 2025 — спикеры и программа | Люди Медицины',
    description: 'Архив премьерной конференции «Люди Медицины» 14 ноября 2025 года в Москве: спикеры, программа и организаторы.',
    priority: 0.5,
    slug: CONFERENCE_2025_SLUG,
  },
];

export function pageMetaFor(slug: string | null): PageMeta {
  return PAGES.find((p) => p.slug === slug) ?? HOME_META;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** '11:30 – 15:00' → ['11:30', '15:00']. */
function splitTime(time?: string): [string | undefined, string | undefined] {
  if (!time) return [undefined, undefined];
  const [start, end] = time.split(/\s*[–-]\s*/);
  return [start, end];
}

function eventDate(day: number, time?: string): string {
  const date = `${CALENDAR_YEAR}-${pad(CALENDAR_MONTH_INDEX + 1)}-${pad(day)}`;
  return time ? `${date}T${time}:00+03:00` : date;
}

function eventSchema(ev: CalendarEvent) {
  const [start, end] = splitTime(ev.time);
  const online = ev.place === 'online';
  return {
    '@type': 'Event',
    name: ev.title,
    description: ev.description ?? FORMAT_META[ev.format].about,
    startDate: eventDate(ev.day, start),
    ...(end ? { endDate: eventDate(ev.day, end) } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: online
      ? { '@type': 'VirtualLocation', url: SITE_URL }
      : { '@type': 'Place', name: ev.title, address: { '@type': 'PostalAddress', addressCountry: 'RU' } },
    organizer: { '@id': `${SITE_URL}/#organization` },
    ...(ev.speakers?.length ? { performer: ev.speakers.map((name) => ({ '@type': 'Person', name })) } : {}),
    url: ev.link?.href ?? `${SITE_URL}/#kalendar`,
  };
}

/** Разметка Schema.org для главной: организация, сайт, основатели, тариф и события календаря. */
export function homeStructuredData() {
  const org = `${SITE_URL}/#organization`;
  const abs = (path: string) => (/^https?:/.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': org,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo-yellow.svg`,
        description: HOME_META.description,
        founder: FOUNDERS.map((f) => ({
          '@type': 'Person',
          name: f.name.replace(/\u00A0/g, ' '),
          jobTitle: f.role.replace(/\u00A0/g, ' '),
          image: abs(C.founders.items.find((x) => x.name === f.name)?.photo ?? ''),
          ...(f.social.href && !/^https?:\/\/(vk\.com|t\.me)\/?$/.test(f.social.href) ? { sameAs: [f.social.href] } : {}),
        })),
        sameAs: [C.links.join],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: 'ru-RU',
        publisher: { '@id': org },
      },
      ...(C.tariff.price
        ? [
            {
              '@type': 'Service',
              name: `${C.tariff.badge} сообщества «${SITE_NAME}»`.replace(/\u00A0/g, ' '),
              description: C.tariff.description.replace(/\u00A0/g, ' '),
              provider: { '@id': org },
              offers: {
                '@type': 'Offer',
                price: C.tariff.price.replace(/\D/g, ''),
                priceCurrency: 'RUB',
                url: `${SITE_URL}/#tarifi`,
                description: C.tariff.promoNote.replace(/\u00A0/g, ' '),
              },
            },
          ]
        : []),
      ...CALENDAR_EVENTS.map(eventSchema),
    ],
  };
}
