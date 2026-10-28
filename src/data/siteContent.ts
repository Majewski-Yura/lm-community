import { withBase } from '../lib/base';
import { C, img } from '../content/store';

// Тексты, люди, календарь и фото меняются в админке и лежат в src/content/content.json.
// Здесь — приведение их к виду, который ждут компоненты, и служебные картинки оформления.

export interface PersonCard {
  name: string;
  position: string;
  photo?: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  position: string;
}

export interface CanDoItem {
  title: string;
  text: string;
}

export interface FeatureCard {
  title: string;
  description: string;
  frequency: string;
  icon: string;
  /** Фото с мероприятий сообщества — если есть, карточка показывается с фотографией вместо иконки. */
  photo?: string;
}

export interface SingleTariff {
  title: string;
  /** Цена без валюты, например «7 000». Пустая строка — цена ещё не утверждена. */
  price: string;
  period: string;
  promoNote: string;
  description: string;
  features: string[];
}

export interface SocialLink {
  type: 'telegram' | 'vk';
  label: string;
  href: string;
}

export interface FounderItem {
  name: string;
  role: string;
  bio: string;
  photo: string;
  highlights: string[];
  social: SocialLink;
}

export interface ValueItem {
  num: string;
  title: string;
  description: string;
}

export interface EcosystemProject {
  num: string;
  title: string;
  description: string;
  buttons: { label: string; href: string; external?: boolean }[];
}

/** Ссылка на Telegram-бот сообщества — используется всеми кнопками «Вступить». */
export const JOIN_URL = C.links.join;

/** Видео от Людмилы Морозовой. Поддерживает Rutube, VK Видео, YouTube или прямой MP4. */
export const INTRO_VIDEO_EMBED_URL: string = C.video.embedUrl;

/** Картинки оформления (логотипы, линии, иконки) — не меняются в админке. */
export const ASSETS = {
  headerLogo: withBase('/images/logo-yellow.svg'),
  footerLogo: withBase('/images/d8d0282b.svg'),
  heroWordmark: withBase('/images/0753a3e6.svg'),
  heroCrowdPhoto: img(C.hero.photo) ?? withBase('/images/hero-community.webp'),
  videoPoster: img(C.video.poster) ?? withBase('/images/morozova-video.webp'),
  lineSand: withBase('/images/c8392eea.svg'),
  lineDark: withBase('/images/82667fb3.svg'),
  lineGoldAmber: withBase('/images/aa1c4cf6.svg'),
  lineFounders: withBase('/images/e3c3b0bf.svg'),
  lineValues: withBase('/images/292c1ee8.svg'),
  founderDivider: withBase('/images/580eb2f6.svg'),
  btnArrow: withBase('/images/e994e54e.svg'),
  ecosystemRingsSvg: withBase('/images/692dee5d.svg'),
  checkSand: withBase('/images/9839b10d.svg'),
  checkGold: withBase('/images/7709015d.svg'),
  iconKnowledge: withBase('/images/eb17b48e.svg'),
  iconBot: withBase('/images/9222b7cd.svg'),
  iconEvents: withBase('/images/7ec95727.svg'),
  iconGroups: withBase('/images/66f3d7e3.svg'),
  iconChat: withBase('/images/742879e0.svg'),
  iconChannel: withBase('/images/dae3d55a.svg'),
} as const;

export const NAV_LINKS = [
  { label: 'Для\u00A0кого', href: '#dlyakogo' },
  { label: 'Участники', href: '#uchastniki' },
  { label: 'Отзывы', href: '#otzyvy' },
  { label: 'Эксперты', href: '#eksperty' },
  { label: 'Календарь', href: '#kalendar' },
  { label: 'Как\u00A0это\u00A0работает', href: '#kakrabotaet' },
  { label: 'Основатели', href: '#osnovateli' },
  { label: 'Тариф', href: '#tarifi' },
  { label: 'Ценности', href: '#cennosti' },
  // Блог — в меню, только когда есть опубликованные записи
  ...(C.blog.posts.some((p) => p.published) ? [{ label: 'Блог', href: '#blog' }] : []),
];

const pad2 = (n: number) => String(n).padStart(2, '0');
const person = (p: { name: string; position: string; photo?: string }): PersonCard => ({ ...p, photo: img(p.photo) });

export const WHO_ROLES: readonly string[] = C.who.roles;
export const PARTICIPANTS: PersonCard[] = C.participants.items.map(person);
export const TESTIMONIALS: Testimonial[] = C.testimonials.items;
export const CAN_DO: CanDoItem[] = C.canDo.items;
export const EXPERTS: PersonCard[] = C.experts.items.map(person);

const feature = (f: { title: string; description: string; frequency: string; icon: string; photo?: string }): FeatureCard => ({
  ...f,
  icon: img(f.icon) ?? '',
  photo: img(f.photo),
});
export const COMMUNITY_HAS: FeatureCard[] = C.communityHas.items.map(feature);
export const COMMUNITY_EXTRA: FeatureCard[] = C.communityExtra.items.map(feature);

export const SINGLE_TARIFF: SingleTariff = {
  title: C.tariff.badge,
  price: C.tariff.price,
  period: C.tariff.period,
  promoNote: C.tariff.promoNote,
  description: C.tariff.description,
  features: C.tariff.features,
};

export const GALLERY_PHOTOS = C.gallery.photos.map((g) => ({ full: img(g.src) ?? '', thumb: img(g.thumb || g.src) ?? '' }));

export const FOUNDERS: FounderItem[] = C.founders.items.map((f) => ({
  ...f,
  photo: img(f.photo) ?? '',
  social: { ...f.social, type: f.social.type === 'vk' ? 'vk' : 'telegram' },
}));

export const COMMUNITY_VALUES: ValueItem[] = C.values.items.map((v, i) => ({ num: pad2(i + 1), ...v }));
export const GROUP_ECOSYSTEM: EcosystemProject[] = C.ecosystem.items.map((e, i) => ({ num: pad2(i + 1), ...e }));
