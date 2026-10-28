// Разделы админки и их поля. Ключи совпадают с src/content/content.json.
import type { ImageKind } from './image';

export type Field =
  | { key: string; label: string; type: 'text' | 'url' | 'date'; help?: string; placeholder?: string }
  | { key: string; label: string; type: 'textarea'; help?: string; rows?: number }
  | { key: string; label: string; type: 'number'; help?: string; min?: number; max?: number }
  | { key: string; label: string; type: 'image'; kind: ImageKind; help?: string }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; help?: string }
  | { key: string; label: string; type: 'checkbox'; help?: string }
  | { key: string; label: string; type: 'strings'; itemLabel: string; help?: string; multiline?: boolean }
  | {
      key: string;
      label: string;
      type: 'list';
      /** Подпись элемента в свёрнутом виде, например имя участника. */
      title: (item: Record<string, unknown>, index: number) => string;
      thumb?: string;
      fields: Field[];
      newItem: () => Record<string, unknown>;
      addLabel: string;
      help?: string;
    }
  | { key: string; label: string; type: 'markdown'; help?: string };

export interface Section {
  id: string;
  title: string;
  hint?: string;
  fields: Field[];
}

const eyebrow: Field = { key: 'eyebrow', label: 'Надпись над заголовком', type: 'text' };
const title: Field = { key: 'title', label: 'Заголовок', type: 'text' };

const person = (addLabel: string): Field => ({
  key: 'items',
  label: 'Люди',
  type: 'list',
  title: (item) => String(item.name || 'Без имени'),
  thumb: 'photo',
  addLabel,
  newItem: () => ({ name: '', position: '', photo: '' }),
  fields: [
    { key: 'name', label: 'Имя и фамилия', type: 'text' },
    { key: 'position', label: 'Должность и город', type: 'textarea', rows: 2 },
    { key: 'photo', label: 'Фото', type: 'image', kind: 'avatar', help: 'Квадратное, лицо по центру. Обрежется автоматически.' },
  ],
});

const ICONS = [
  { value: '/images/7ec95727.svg', label: 'Молния (встречи)' },
  { value: '/images/66f3d7e3.svg', label: 'Люди (группы)' },
  { value: '/images/dae3d55a.svg', label: 'Облачко (эфиры)' },
  { value: '/images/742879e0.svg', label: 'Звезда (чат)' },
  { value: '/images/9222b7cd.svg', label: 'ИИ (бот)' },
  { value: '/images/eb17b48e.svg', label: 'Книга (база знаний)' },
];

const features = (addLabel: string): Field => ({
  key: 'items',
  label: 'Карточки',
  type: 'list',
  title: (item) => String(item.title || 'Без названия'),
  thumb: 'photo',
  addLabel,
  newItem: () => ({ title: '', description: '', frequency: '', icon: ICONS[0].value, photo: '' }),
  fields: [
    { key: 'title', label: 'Название', type: 'text' },
    { key: 'description', label: 'Описание', type: 'textarea', rows: 3 },
    { key: 'frequency', label: 'Как часто', type: 'text', placeholder: 'Раз в месяц' },
    { key: 'photo', label: 'Фото', type: 'image', kind: 'card', help: 'Если фото есть — карточка показывается с ним, иначе с иконкой.' },
    { key: 'icon', label: 'Иконка (если нет фото)', type: 'select', options: ICONS },
  ],
});

export const FORMATS = [
  { value: 'efir', label: 'Прямой эфир' },
  { value: 'praktikum', label: 'Практикум' },
  { value: 'mastermind', label: 'Мастермайнд' },
  { value: 'brunch', label: 'Бранч / офлайн-встреча' },
  { value: 'kvartirnik', label: 'Квартирник' },
  { value: 'excursion', label: 'Экскурсия' },
  { value: 'conference', label: 'Конференция' },
  { value: 'supervision', label: 'Супервизия' },
  { value: 'qa', label: 'Вопрос-ответ' },
];

const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

export const SECTIONS: Section[] = [
  {
    id: 'calendar',
    title: 'Календарь',
    hint: 'Каждый месяц: выберите месяц и год, обновите список событий и опубликуйте.',
    fields: [
      { key: 'month', label: 'Месяц', type: 'select', options: MONTHS.map((m, i) => ({ value: String(i + 1), label: m })) },
      { key: 'year', label: 'Год', type: 'number', min: 2024, max: 2100 },
      {
        key: 'events',
        label: 'События',
        type: 'list',
        title: (item) => `${item.day || '?'} — ${item.title || 'Без названия'}`,
        addLabel: 'Добавить событие',
        newItem: () => ({ day: 1, time: '', title: '', format: 'efir', place: 'online', speakers: [], description: '', theses: [], linkLabel: '', linkHref: '', highlight: false }),
        fields: [
          { key: 'day', label: 'Число', type: 'number', min: 1, max: 31 },
          { key: 'time', label: 'Время (МСК)', type: 'text', placeholder: '19:00 или 11:30 – 15:00' },
          { key: 'title', label: 'Название', type: 'text' },
          { key: 'format', label: 'Формат', type: 'select', options: FORMATS },
          { key: 'place', label: 'Где', type: 'select', options: [{ value: 'online', label: 'Онлайн' }, { value: 'offline', label: 'Офлайн' }] },
          { key: 'speakers', label: 'Спикеры', type: 'strings', itemLabel: 'Имя и фамилия', help: 'Фото и должность подтянутся из экспертов, участников или гостевых спикеров ниже.' },
          { key: 'description', label: 'Описание', type: 'textarea', rows: 3, help: 'Если пусто — покажется стандартное описание формата.' },
          { key: 'theses', label: 'Тезисы', type: 'strings', itemLabel: 'Тезис', multiline: true },
          { key: 'linkLabel', label: 'Текст кнопки-ссылки', type: 'text', placeholder: 'Программа конференции' },
          { key: 'linkHref', label: 'Ссылка', type: 'url' },
          { key: 'highlight', label: 'Выделить красным (главное событие месяца)', type: 'checkbox' },
        ],
      },
      {
        key: 'guestSpeakers',
        label: 'Гостевые спикеры',
        type: 'list',
        title: (item) => String(item.name || 'Без имени'),
        thumb: 'photo',
        help: 'Спикеры, которых нет среди экспертов и участников.',
        addLabel: 'Добавить спикера',
        newItem: () => ({ name: '', about: '', photo: '' }),
        fields: [
          { key: 'name', label: 'Имя и фамилия (как в событии)', type: 'text' },
          { key: 'about', label: 'Кто это', type: 'textarea', rows: 2 },
          { key: 'photo', label: 'Фото', type: 'image', kind: 'avatar' },
        ],
      },
      eyebrow,
      { key: 'hint', label: 'Подсказка под заголовком', type: 'text' },
      { key: 'importantTitle', label: 'Плашка: заголовок', type: 'text' },
      { key: 'importantText', label: 'Плашка: текст', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'blog',
    title: 'Блог',
    hint: 'Итоги мероприятий, отчёты за месяц, новости. Последние три записи видны на главной.',
    fields: [
      {
        key: 'posts',
        label: 'Записи',
        type: 'list',
        title: (item) => `${item.published ? '' : '[черновик] '}${item.title || 'Без названия'}`,
        thumb: 'cover',
        addLabel: 'Новая запись',
        newItem: () => ({ slug: '', title: '', date: new Date().toISOString().slice(0, 10), cover: '', excerpt: '', body: '', published: false }),
        fields: [
          { key: 'title', label: 'Заголовок', type: 'text' },
          { key: 'date', label: 'Дата', type: 'date' },
          { key: 'slug', label: 'Адрес записи', type: 'text', help: 'Латиницей через дефис: itogi-noyabrya. Если пусто — придумается из заголовка.' },
          { key: 'cover', label: 'Обложка', type: 'image', kind: 'card' },
          { key: 'excerpt', label: 'Анонс', type: 'textarea', rows: 3, help: '1–2 предложения: видны в списке записей и в поисковиках.' },
          { key: 'body', label: 'Текст', type: 'markdown' },
          { key: 'published', label: 'Опубликовать на сайте', type: 'checkbox', help: 'Пока галочки нет, запись — черновик и на сайте не видна.' },
        ],
      },
      eyebrow,
      title,
      { key: 'lead', label: 'Подзаголовок', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'hero',
    title: 'Шапка',
    fields: [
      { key: 'photo', label: 'Большое фото', type: 'image', kind: 'photo', help: 'Горизонтальное фото зала, где видно много людей.' },
      { key: 'photoAlt', label: 'Описание фото (для поисковиков)', type: 'text' },
      { key: 'subtitle', label: 'Подзаголовок', type: 'textarea', rows: 2 },
      { key: 'lead', label: 'Текст под подзаголовком', type: 'textarea', rows: 2 },
      { key: 'h1', label: 'Главный заголовок для поисковиков (на странице не виден)', type: 'text' },
    ],
  },
  {
    id: 'video',
    title: 'Видео',
    fields: [
      eyebrow,
      title,
      { key: 'embedUrl', label: 'Ссылка на видео для встраивания', type: 'url', help: 'Rutube, VK Видео или YouTube: ссылка из кода «Встроить».' },
      { key: 'quote', label: 'Цитата', type: 'textarea', rows: 2 },
      { key: 'author', label: 'Подпись', type: 'text' },
      { key: 'duration', label: 'Длительность', type: 'text', placeholder: '3 мин' },
      { key: 'poster', label: 'Портрет', type: 'image', kind: 'photo', help: 'PNG или WebP с прозрачным фоном смотрится лучше всего.' },
    ],
  },
  {
    id: 'who',
    title: 'Для кого',
    fields: [
      eyebrow,
      title,
      { key: 'lead', label: 'Подзаголовок', type: 'textarea', rows: 2 },
      { key: 'roles', label: 'Роли (4 карточки)', type: 'strings', itemLabel: 'Роль' },
      { key: 'cardTitle', label: 'Белая карточка: заголовок', type: 'textarea', rows: 2 },
      { key: 'cardText', label: 'Белая карточка: текст', type: 'textarea', rows: 3 },
      { key: 'cardAccent', label: 'Белая карточка: выделенный текст', type: 'textarea', rows: 3 },
    ],
  },
  {
    id: 'participants',
    title: 'Участники',
    fields: [eyebrow, title, { key: 'note', label: 'Приписка', type: 'text' }, { key: 'lead', label: 'Подзаголовок', type: 'textarea', rows: 2 }, person('Добавить участника')],
  },
  {
    id: 'testimonials',
    title: 'Отзывы',
    fields: [
      eyebrow,
      title,
      {
        key: 'items',
        label: 'Отзывы',
        type: 'list',
        title: (item) => String(item.name || 'Без имени'),
        addLabel: 'Добавить отзыв',
        help: 'Фото автора берётся из участников с тем же именем.',
        newItem: () => ({ quote: '', name: '', position: '' }),
        fields: [
          { key: 'quote', label: 'Отзыв', type: 'textarea', rows: 3 },
          { key: 'name', label: 'Имя и фамилия', type: 'text' },
          { key: 'position', label: 'Должность и город', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'canDo',
    title: 'Зачем сообщество',
    fields: [
      eyebrow,
      title,
      {
        key: 'items',
        label: 'Пункты',
        type: 'list',
        title: (item) => String(item.title || 'Без названия'),
        addLabel: 'Добавить пункт',
        newItem: () => ({ title: '', text: '' }),
        fields: [
          { key: 'title', label: 'Заголовок', type: 'text' },
          { key: 'text', label: 'Текст', type: 'textarea', rows: 3 },
        ],
      },
    ],
  },
  {
    id: 'experts',
    title: 'Эксперты',
    fields: [eyebrow, title, person('Добавить эксперта'), { key: 'moreTitle', label: 'Жёлтая плашка: заголовок', type: 'text' }, { key: 'moreText', label: 'Жёлтая плашка: текст', type: 'text' }],
  },
  { id: 'communityHas', title: 'Что есть в сообществе', fields: [eyebrow, title, features('Добавить карточку')] },
  { id: 'communityExtra', title: 'Что ещё у нас есть', fields: [eyebrow, title, features('Добавить карточку')] },
  {
    id: 'tariff',
    title: 'Тариф',
    fields: [
      eyebrow,
      title,
      { key: 'badge', label: 'Название тарифа', type: 'text' },
      { key: 'price', label: 'Цена', type: 'text', placeholder: '7 000', help: 'Только число. Пусто — на сайте «Цена уточняется».' },
      { key: 'period', label: 'Период', type: 'text', placeholder: 'руб. / мес' },
      { key: 'promoNote', label: 'Приписка под ценой', type: 'text' },
      { key: 'description', label: 'Описание', type: 'textarea', rows: 3 },
      { key: 'featuresTitle', label: 'Заголовок списка', type: 'text' },
      { key: 'features', label: 'Что входит', type: 'strings', itemLabel: 'Пункт' },
    ],
  },
  {
    id: 'gallery',
    title: 'Галерея',
    fields: [
      {
        key: 'photos',
        label: 'Фото',
        type: 'list',
        title: (_item, i) => `Фото ${i + 1}`,
        thumb: 'src',
        addLabel: 'Добавить фото',
        newItem: () => ({ src: '', thumb: '' }),
        fields: [{ key: 'src', label: 'Фото', type: 'image', kind: 'photo' }],
      },
    ],
  },
  {
    id: 'founders',
    title: 'Основатели',
    fields: [
      eyebrow,
      title,
      {
        key: 'items',
        label: 'Основатели',
        type: 'list',
        title: (item) => String(item.name || 'Без имени'),
        thumb: 'photo',
        addLabel: 'Добавить основателя',
        newItem: () => ({ name: '', role: '', bio: '', photo: '', highlights: [], social: { type: 'telegram', label: 'Telegram', href: '' } }),
        fields: [
          { key: 'name', label: 'Имя и фамилия', type: 'text' },
          { key: 'role', label: 'Роль', type: 'text' },
          { key: 'bio', label: 'О себе', type: 'textarea', rows: 3 },
          { key: 'photo', label: 'Фото', type: 'image', kind: 'photo' },
          { key: 'highlights', label: 'Достижения', type: 'strings', itemLabel: 'Пункт' },
          { key: 'social.type', label: 'Соцсеть', type: 'select', options: [{ value: 'telegram', label: 'Telegram' }, { value: 'vk', label: 'ВКонтакте' }] },
          { key: 'social.label', label: 'Подпись кнопки', type: 'text' },
          { key: 'social.href', label: 'Ссылка на соцсеть', type: 'url' },
        ],
      },
    ],
  },
  { id: 'cta', title: 'Призыв вступить', fields: [eyebrow, title, { key: 'accent', label: 'Выделенная строка', type: 'text' }, { key: 'text', label: 'Текст', type: 'textarea', rows: 2 }] },
  {
    id: 'values',
    title: 'Ценности',
    fields: [
      eyebrow,
      title,
      { key: 'lead', label: 'Подзаголовок', type: 'textarea', rows: 2 },
      {
        key: 'items',
        label: 'Ценности',
        type: 'list',
        title: (item) => String(item.title || 'Без названия'),
        addLabel: 'Добавить ценность',
        newItem: () => ({ title: '', description: '' }),
        fields: [
          { key: 'title', label: 'Название', type: 'text' },
          { key: 'description', label: 'Описание', type: 'textarea', rows: 2 },
        ],
      },
    ],
  },
  {
    id: 'ecosystem',
    title: 'Экосистема',
    fields: [
      eyebrow,
      title,
      { key: 'lead', label: 'Подзаголовок', type: 'textarea', rows: 2 },
      {
        key: 'items',
        label: 'Проекты',
        type: 'list',
        title: (item) => String(item.title || 'Без названия'),
        addLabel: 'Добавить проект',
        newItem: () => ({ title: '', description: '', buttons: [] }),
        fields: [
          { key: 'title', label: 'Название', type: 'text' },
          { key: 'description', label: 'Описание', type: 'textarea', rows: 3 },
          {
            key: 'buttons',
            label: 'Кнопки',
            type: 'list',
            title: (item) => String(item.label || 'Кнопка'),
            addLabel: 'Добавить кнопку',
            newItem: () => ({ label: '', href: '', external: true }),
            fields: [
              { key: 'label', label: 'Текст', type: 'text' },
              { key: 'href', label: 'Ссылка', type: 'url' },
              { key: 'external', label: 'Открывать в новой вкладке', type: 'checkbox' },
            ],
          },
        ],
      },
    ],
  },
  { id: 'final', title: 'Финальный блок', fields: [title, { key: 'text', label: 'Текст', type: 'textarea', rows: 4 }, { key: 'photo', label: 'Фото на фоне', type: 'image', kind: 'photo', help: 'Горизонтальное фото, сайт затемнит его, чтобы текст читался.' }] },
  {
    id: 'seo',
    title: 'SEO и ссылки',
    hint: 'То, что видят поисковики и ИИ-ассистенты в результатах поиска.',
    fields: [
      { key: 'title', label: 'Заголовок страницы в поиске', type: 'text', help: 'До 70 знаков.' },
      { key: 'description', label: 'Описание в поиске', type: 'textarea', rows: 3, help: '140–160 знаков.' },
      { key: 'siteUrl', label: 'Адрес сайта', type: 'url', help: 'С https://, без слеша на конце. Нужен для поисковиков.' },
      { key: 'ogImage', label: 'Картинка для соцсетей и мессенджеров', type: 'image', kind: 'photo', help: 'Горизонтальная, 1200×630.' },
    ],
  },
  {
    id: 'links',
    title: 'Ссылка «Вступить»',
    fields: [{ key: 'join', label: 'Куда ведут все кнопки «Вступить»', type: 'url', help: 'Например, Telegram-бот сообщества.' }],
  },
  { id: 'footer', title: 'Подвал сайта', fields: [{ key: 'legal', label: 'Реквизиты', type: 'strings', itemLabel: 'Строка' }] },
];
