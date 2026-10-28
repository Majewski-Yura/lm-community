import { C, img } from '../content/store';
export type Place = 'online' | 'offline';

export const PLACE_META: Record<Place, { label: string; color: string; text: string }> = {
  online: { label: 'Онлайн', color: '#f9cd60', text: '#020201' },
  offline: { label: 'Офлайн', color: '#8c4503', text: '#ffffff' },
};

export type EventFormat =
  | 'efir'
  | 'praktikum'
  | 'mastermind'
  | 'brunch'
  | 'excursion'
  | 'conference'
  | 'supervision'
  | 'kvartirnik'
  | 'qa';

export const FORMAT_META: Record<EventFormat, { label: string; about: string }> = {
  efir: {
    label: 'Прямой эфир',
    about:
      'Реальный опыт и\u00A0рабочие инструменты для\u00A0развития вас, команды или\u00A0клиники. Запись появится в\u00A0базе знаний\u00A0ZenClass.',
  },
  praktikum: {
    label: 'Практикум',
    about: 'Работаем руками: разбираем инструмент на\u00A0примерах и\u00A0сразу применяем его\u00A0к\u00A0задачам своей\u00A0клиники.',
  },
  mastermind: {
    label: 'Мастермайнд',
    about:
      'Приносите свою ситуацию: сложный пациент, ценообразование, продвижение, вопросы к\u00A0юристу. Разберем её\u00A0вместе с\u00A0экспертами и\u00A0коллегами.',
  },
  brunch: {
    label: 'Офлайн-встреча',
    about:
      'Живые встречи и\u00A0обмен энергией. Знакомимся с\u00A0резидентами в\u00A0уютной неформальной обстановке, делимся\u00A0опытом.',
  },
  excursion: {
    label: 'Экскурсия',
    about:
      'Увидеть опыт коллег, посмотреть, как\u00A0устроена другая клиника, задать интересующие вопросы её\u00A0топ-команде и\u00A0собственникам.',
  },
  conference: {
    label: 'Конференция',
    about:
      'Ведущая ежегодная отраслевая площадка для\u00A0собственников, руководителей и\u00A0лидеров частной медицины. Только реальный опыт, разбор ошибок и\u00A0работающие стратегии.',
  },
  supervision: {
    label: 'Супервизия',
    about: 'Групповая встреча с\u00A0психологической поддержкой для\u00A0тех, кто\u00A0ежедневно несет большой груз ответственности.',
  },
  kvartirnik: {
    label: 'Офлайн-встреча',
    about:
      'Тёплое общение, долгожданные встречи, классные гости и\u00A0объятия. А\u00A0еще много общения, живая музыка, знакомство и\u00A0пузырьки от\u00A0просекко.',
  },
  qa: {
    label: 'Прямой эфир',
    about: 'Открытая сессия: задайте свои вопросы основателю сообщества напрямую.',
  },
};

export interface CalendarEvent {
  id: string;
  day: number;
  /** Время или интервал, например '19:00' или '11:30 – 15:00'. Не указывайте, если времени нет. */
  time?: string;
  title: string;
  format: EventFormat;
  place: Place;
  /** Спикеры. Должность подтягивается из списков экспертов и участников на сайте. */
  speakers?: string[];
  /** Короткое описание события. Если не указано, показывается описание формата. */
  description?: string;
  /** Тезисы эфира. Заполните для отображения во всплывающем окне. */
  theses?: string[];
  /** Ссылка на внешнюю страницу события. */
  link?: { label: string; href: string };
  /** Выделить событие цветом (например, конференцию). */
  highlight?: boolean;
}

/** Спикеры не из списков экспертов и участников: фото и описание задаются в админке. */
export const GUEST_SPEAKERS: Record<string, { photo?: string; about?: string }> = Object.fromEntries(
  C.calendar.guestSpeakers.map((g) => [g.name, { photo: img(g.photo), about: g.about || undefined }]),
);

const MONTHS_NOM = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

export const CALENDAR_YEAR = C.calendar.year;
export const CALENDAR_MONTH_INDEX = Math.min(Math.max(C.calendar.month - 1, 0), 11); // 0 — январь
export const CALENDAR_TITLE = `Программа мероприятий на\u00A0${MONTHS_NOM[CALENDAR_MONTH_INDEX]}\u00A0${CALENDAR_YEAR}`;

const FORMATS = Object.keys(FORMAT_META) as EventFormat[];

export const CALENDAR_EVENTS: CalendarEvent[] = C.calendar.events
  .filter((e) => e.title && e.day >= 1 && e.day <= 31)
  .map((e, i) => ({
    id: `e${i}-${e.day}`,
    day: e.day,
    time: e.time || undefined,
    title: e.title,
    format: FORMATS.includes(e.format as EventFormat) ? (e.format as EventFormat) : 'efir',
    place: e.place === 'offline' ? 'offline' : 'online',
    speakers: e.speakers.filter(Boolean),
    description: e.description || undefined,
    theses: e.theses.filter(Boolean),
    link: e.linkHref ? { label: e.linkLabel || 'Подробнее', href: e.linkHref } : undefined,
    highlight: e.highlight || undefined,
  }));
