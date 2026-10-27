import { withBase } from '../lib/base';
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

/** Фото спикеров, которых нет в списках экспертов и участников на сайте. */
export const SPEAKER_PHOTOS: Record<string, string> = {
  'Елена Золина': withBase('/images/avatars/elena-zolina.webp'),
  'Анна Кринжановская': withBase('/images/avatars/anna-krinzhanovskaya.webp'),
};

export const CALENDAR_TITLE = 'Программа мероприятий на\u00A0ноябрь\u00A02026';
export const CALENDAR_YEAR = 2026;
export const CALENDAR_MONTH_INDEX = 10; // ноябрь (0 — январь)

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'n04',
    day: 4,
    time: '19:00',
    title: 'Практикум «Оформление CV для\u00A0управленца»',
    format: 'praktikum',
    place: 'online',
    speakers: ['Дарья Бурцева'],
  },
  {
    id: 'n07',
    day: 7,
    time: '11:00',
    title: 'Открытый эфир «Страхи и\u00A0ложные убеждения: врача, руководителя, собственника»',
    format: 'efir',
    place: 'online',
    speakers: ['Людмила Морозова', 'Елена Зыкина', 'Анна Кринжановская'],
  },
  {
    id: 'n11',
    day: 11,
    time: '12:00',
    title: 'Эмоциональный интеллект в\u00A0медицине: практические инструменты для\u00A0врачей, управленцев и\u00A0собственников',
    format: 'efir',
    place: 'online',
    speakers: ['Ольга Быстрова'],
  },
  {
    id: 'n12',
    day: 12,
    time: '12:00',
    title: 'Маркетинг привёл пациента. А\u00A0что\u00A0дальше?',
    format: 'efir',
    place: 'online',
    speakers: ['Елена Золина'],
    description:
      'Как\u00A0система 7-СЕРВИС, путь пациента и\u00A0диагностика клиентского опыта помогают клинике сохранять рекламные инвестиции, укреплять доверие и\u00A0увеличивать возвращаемость.',
  },
  {
    id: 'n13',
    day: 13,
    title: 'Конференция «Люди\u00A0Медицины»',
    format: 'conference',
    place: 'offline',
    highlight: true,
    link: { label: 'Программа конференции', href: 'http://людимедицины-конференция.рф' },
  },
  {
    id: 'n18',
    day: 18,
    time: '16:30',
    title: 'Бранч «Среда возможностей»',
    format: 'brunch',
    place: 'offline',
  },
  {
    id: 'n19',
    day: 19,
    time: '18:00',
    title: 'Практикум «Технологические карты»',
    format: 'praktikum',
    place: 'online',
    speakers: ['Елена Зыкина'],
  },
  {
    id: 'n25',
    day: 25,
    time: '11:30 – 15:00',
    title: 'Экскурсия в\u00A0клинику «Три\u00A0сестры»',
    format: 'excursion',
    place: 'offline',
  },
  {
    id: 'n26',
    day: 26,
    time: '12:00',
    title: 'Работа с\u00A0ДМС',
    format: 'efir',
    place: 'online',
    speakers: ['Лариса Ткаченко'],
  },
  {
    id: 'n28',
    day: 28,
    time: '11:00 – 14:00',
    title: 'Мастермайнд «Маркетинг»',
    format: 'mastermind',
    place: 'online',
  },
];
