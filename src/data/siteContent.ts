import { withBase } from '../lib/base';
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
export const JOIN_URL = 'https://t.me/peopleofmedicine_community_bot';

/**
 * Видео от Людмилы Морозовой «Узнайте за 3 минуты, что такое „Люди Медицины“».
 * Поддерживает Rutube, VK Видео, YouTube или прямой MP4.
 */
export const INTRO_VIDEO_EMBED_URL: string =
  'https://rutube.ru/play/embed/6be68aa0a0c4c04942e3c09c052478b5';

/** Соцсети основателей. */
export const MOROZOVA_TELEGRAM_URL = 'https://t.me/Liudmila_Morozovamed';
export const DYAKONOVA_VK_URL = 'https://vk.com/';

export const ASSETS = {
  headerLogo: withBase('/images/Logo.svg'),
  footerLogo: withBase('/images/d8d0282b.svg'),
  heroWordmark: withBase('/images/0753a3e6.svg'),
  heroCrowdPhoto: withBase('/images/hero-community.webp'),
  videoPoster: withBase('/images/morozova-video.webp'),
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
  morozovaPhoto: withBase('/images/morozova.webp'),
  dyakonovaPhoto: withBase('/images/dyakonova.webp'),
} as const;

export const NAV_LINKS = [
  { label: 'Для\u00A0кого', href: '#dlyakogo' },
  { label: 'Видео', href: '#video' },
  { label: 'Участники', href: '#uchastniki' },
  { label: 'Отзывы', href: '#otzyvy' },
  { label: 'Эксперты', href: '#eksperty' },
  { label: 'Календарь', href: '#kalendar' },
  { label: 'Как\u00A0это\u00A0работает', href: '#kakrabotaet' },
  { label: 'Основатели', href: '#osnovateli' },
  { label: 'Тариф', href: '#tarifi' },
  { label: 'Ценности', href: '#cennosti' },
] as const;

export const WHO_ROLES = [
  'Главврачи',
  'Заведующие отделениями',
  'Медицинские директора',
  'CEO и\u00A0основатели клиник',
] as const;

export const PARTICIPANTS: PersonCard[] = [
  { name: 'Дина Лямина', position: 'CEO Medical On Group, г.\u00A0Красноярск', photo: withBase('/images/avatars/dina-lyamina.webp') },
  { name: 'Юлия Легкая', position: 'Совладелец и\u00A0исполнительный директор сети «КволитиМед», Екатеринбург', photo: withBase('/images/avatars/yuliya-legkaya.webp') },
  { name: 'Александра Царяпкина', position: 'Управляющий LA DENTAL soul,\u00A0Москва', photo: withBase('/images/avatars/aleksandra-tsaryapkina.webp') },
  { name: 'Айшат Бахулова', position: 'Ex-зав. отделением противоопухолевой лекарственной терапии АО ЕМЦ, ММОЦ, г.\u00A0Москва', photo: withBase('/images/avatars/ayshat-bakhulova.webp') },
  { name: 'Татьяна Фридман', position: 'CEO сети клиник «Практик»,\u00A0Пермь', photo: withBase('/images/avatars/tatyana-fridman.webp') },
  { name: 'Ольга Быстрова', position: 'Руководитель отдела обучения и\u00A0развития сотрудников РИО-стом, врач стоматолог-терапевт, г.\u00A0Москва', photo: withBase('/images/avatars/olga-bystrova.webp') },
  { name: 'Светлана Идрисова', position: 'Управляет сетью клиник «Небо»,\u00A0Ижевск', photo: withBase('/images/avatars/svetlana-idrisova.webp') },
  { name: 'Елена Звонарева', position: 'CEO сети клиник «ЛидерМед», Рыбинск', photo: withBase('/images/avatars/elena-zvonareva.webp') },
  { name: 'Нелли Багдалова', position: 'Главврач «Лечебного центра ФМК»,\u00A0Москва', photo: withBase('/images/avatars/nelli-bagdalova.webp') },
  { name: 'Александра Медзиновская', position: 'CEO «Ай Ви Медикал»,\u00A0Москва', photo: withBase('/images/avatars/aleksandra-medzinovskaya.webp') },
  { name: 'Заира Шейхмагомедова', position: 'Медицинский директор сети «Маммологический центр L7»,\u00A0Махачкала', photo: withBase('/images/avatars/zaira-sheykhmagomedova.webp') },
  { name: 'Ольга Загородникова', position: 'Заместитель директора по\u00A0развитию «АллергоСити», Новосибирск', photo: withBase('/images/avatars/olga-zagorodnikova.webp') },
  { name: 'Анна Исаева', position: 'Директор и\u00A0главврач сети «Детский\u00A0доктор»', photo: withBase('/images/avatars/anna-isaeva.webp') },
  { name: 'Елена Пустовет', position: 'Сооснователь сети клиник доказательной педиатрии «ПЛЮС», Ростов-на-Дону', photo: withBase('/images/avatars/elena-pustovet.webp') },
  { name: 'Елена Кузнецова', position: 'Управляющая клиникой реабилитации «Тое-клиника», Москва' },
  { name: 'Екатерина Мирзоян', position: 'Владелец сети медицинских центров «Гераци», Ростов-на-Дону', photo: withBase('/images/avatars/ekaterina-mirzoyan.webp') },
  { name: 'Ирина Орлова', position: 'Главврач клиники «Семейный доктор», Новый\u00A0Уренгой', photo: withBase('/images/avatars/irina-orlova.webp') },
  { name: 'Маргарита Локтева', position: 'Сооснователь клиники «Дом стоматологии», директор по\u00A0развитию,\u00A0Москва', photo: withBase('/images/avatars/margarita-lokteva.webp') },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Я\u00A0наконец-то внедрила регулярные one-to-one с\u00A0сотрудниками и\u00A0поняла, как\u00A0решать сложные конфликтные ситуации.',
    name: 'Александра Царяпкина',
    position: 'Управляющий LA DENTAL soul,\u00A0Москва',
  },
  {
    quote: 'С\u00A0каждого нового эфира беру что-то важное и\u00A0полезное для\u00A0нашей клиники. Хотя казалось, что\u00A0мы\u00A0и\u00A0так\u00A0уже\u00A0очень многое внедрили в\u00A0работу.',
    name: 'Юлия Легкая',
    position: 'Совладелец и\u00A0исполнительный директор сети «КволитиМед», Екатеринбург',
  },
  {
    quote: 'У\u00A0меня благодаря Людям Медицины началось конструктивное общение с\u00A0врачом, в\u00A0результате которого мы\u00A0согласовали ценообразование на\u00A0услуги.',
    name: 'Светлана Идрисова',
    position: 'Управляет сетью клиник «Небо»,\u00A0Ижевск',
  },
  {
    quote: 'После первого же бранча пересчитала экономику и\u00A0нашла, как\u00A0можно оптимизировать систему.',
    name: 'Александра Медзиновская',
    position: 'CEO «Ай Ви Медикал»,\u00A0Москва',
  },
];

export const CAN_DO: CanDoItem[] = [
  {
    title: 'Спросить «А\u00A0как\u00A0у\u00A0вас?»',
    text: 'Сравнить свои показатели (конверсии, бюджеты на\u00A0маркетинг, зарплатные фонды) и\u00A0сложные ситуации с\u00A0коллегами напрямую в\u00A0чате или\u00A0на\u00A0онлайн-встречах.',
  },
  {
    title: 'Сэкономить деньги\u00A0клиники',
    text: 'На\u00A0мастермайндах можно за\u00A01 час получить десятки готовых решений для\u00A0своих сложных кейсов\u00A0— от\u00A0падения выручки до\u00A0саботажа врачей при\u00A0внедрении новой\u00A0МИС.',
  },
  {
    title: 'Защитить клинику от\u00A0штрафов и\u00A0судов',
    text: 'Разобрать с\u00A0медицинскими юристами реальные кейсы потребительского экстремизма, увода базы пациентов и\u00A0новые требования Росздравнадзора.',
  },
  {
    title: 'Обсудить проблему\u00A0кадров',
    text: 'Обменяться своим опытом по\u00A0внедрению KPI и\u00A0корпоративной культуры, найти решения, как\u00A0удерживать «звездных» врачей без\u00A0ущерба для\u00A0бюджета и\u00A0как\u00A0работать с\u00A0зумерами.',
  },
  {
    title: 'Перестать выгорать в\u00A0одиночку',
    text: 'Сообщество\u00A0— это\u00A0место, где\u00A0можно выдохнуть и\u00A0получить искреннюю поддержку от\u00A0тех, кто\u00A0ежедневно несет точно такой же груз ответственности.',
  },
];

export const EXPERTS: PersonCard[] = [
  {
    name: 'Людмила Морозова',
    position: 'Основатель сообщества. Руководила федеральными медсетями, запустила 7\u00A0клиник с\u00A0нуля.',
    photo: withBase('/images/avatars/lyudmila-morozova.webp'),
  },
  { name: 'Лариса Ткаченко', position: 'COO сети клиник «Будь\u00A0здоров».', photo: withBase('/images/avatars/larisa-tkachenko.webp') },
  { name: 'Екатерина Концерева', position: 'Операционный директор LEDIN Clinic. 14\u00A0лет управляет медицинским бизнесом.', photo: withBase('/images/avatars/ekaterina-kontsereva.webp') },
  { name: 'Ангелина Романовская', position: 'Медицинский юрист, защищает права врачей. Руководит компанией «МФКЭКСПЕРТ».', photo: withBase('/images/avatars/angelina-romanovskaya.webp') },
  { name: 'Елена Зыкина', position: 'Прошла путь от\u00A0экономиста до\u00A0CEO сети из\u00A020+ филиалов. Сейчас консультирует руководителей медбизнеса.', photo: withBase('/images/avatars/elena-zykina.webp') },
  { name: 'Олеся Угай', position: 'Медицинский директор сетей «Бэбибум» и\u00A0«Лавиани». 11\u00A0лет в\u00A0медицинском управлении.', photo: withBase('/images/avatars/olesya-ugay.webp') },
  { name: 'Дарья Бурцева', position: 'Директор по\u00A0персоналу. Более 14\u00A0лет работает с\u00A0командами, среди проектов\u00A0— Шереметьево, Пулково.', photo: withBase('/images/avatars/darya-burtseva.webp') },
  { name: 'Святослав Коба', position: 'Главврач «Дентал Белгравия». Соавтор Матрицы компетенций главного\u00A0врача.', photo: withBase('/images/avatars/svyatoslav-koba.webp') },
  { name: 'Анна Мгоян', position: 'Репродуктолог, заместитель главврача по\u00A0ВРТ в\u00A0Клинике Фомина. MBA по\u00A0управлению в\u00A0здравоохранении.', photo: withBase('/images/avatars/anna-mgoyan.webp') },
  { name: 'Дмитрий Лесков', position: 'Кардиолог и\u00A0популяризатор доказательной медицины. Ведёт YouTube-канал о\u00A0здоровье.', photo: withBase('/images/avatars/dimitriy-leskov.webp') },
  { name: 'Павел Волков', position: 'Сердечно-сосудистый хирург, кандидат медицинских наук. Гендиректор «СильверМедикалГрупп».', photo: withBase('/images/avatars/pavel-volkov.webp') },
  { name: 'Елена Звонарева', position: 'Врач-реаниматолог, CEO сети «ЛидерМед». Первую клинику открыла в\u00A024\u00A0года.', photo: withBase('/images/avatars/elena-zvonareva.webp') },
];

export const COMMUNITY_HAS: FeatureCard[] = [
  {
    title: 'Бранч «Среда возможностей»',
    description: 'Живые встречи и\u00A0обмен энергией. Знакомимся с\u00A0резидентами в\u00A0уютной неформальной обстановке, делимся\u00A0опытом.',
    frequency: 'Раз в\u00A0месяц',
    icon: ASSETS.iconEvents,
  },
  {
    title: 'Random Coffee',
    description: 'Каждую неделю возможность познакомиться с\u00A0коллегой, выпить кофе (можно и\u00A0онлайн) и\u00A0спокойно поговорить один на\u00A0один.',
    frequency: 'Раз в\u00A0неделю',
    icon: ASSETS.iconGroups,
  },
  {
    title: 'Прямые эфиры с\u00A0ведущими экспертами',
    description: 'Реальный опыт и\u00A0рабочие инструменты для\u00A0развития вас, команды или\u00A0клиники: управление, маркетинг, HR, личный бренд, психологическая поддержка и\u00A0пр.',
    frequency: 'Несколько раз в\u00A0неделю',
    icon: ASSETS.iconChannel,
  },
  {
    title: 'Экскурсии в\u00A0клиники',
    description: 'Увидеть опыт коллег, посмотреть, как\u00A0устроена другая клиника, задать интересующие вопросы её\u00A0топ-команде и\u00A0собственникам.',
    frequency: 'Раз в\u00A0месяц',
    icon: ASSETS.iconEvents,
  },
  {
    title: 'Закрытый чат',
    description: 'Смело пишите о\u00A0своей проблеме, просите контакт, спрашивайте, как\u00A0поступали коллеги в\u00A0подобной ситуации. Здесь можно быстро найти нужного человека, рабочий совет и\u00A0настоящую поддержку.',
    frequency: '24/7',
    icon: ASSETS.iconChat,
  },
];

export const COMMUNITY_EXTRA: FeatureCard[] = [
  {
    title: 'Разборы кейсов и\u00A0мастермайнды',
    description: 'Приносите свою ситуацию: сложный пациент, ценообразование, продвижение, вопросы к\u00A0юристу. Разберем её\u00A0вместе с\u00A0экспертами и\u00A0коллегами.',
    frequency: 'В\u00A0рамках эфиров, в\u00A0чате',
    icon: ASSETS.iconGroups,
  },
  {
    title: 'Квартирник',
    description: 'Тёплое общение, долгожданные встречи, классные гости и\u00A0объятия. А\u00A0еще много общения, живая музыка, знакомство и\u00A0пузырьки от\u00A0просекко.',
    frequency: 'Через\u00A0месяц',
    icon: ASSETS.iconEvents,
  },
  {
    title: 'Диагностика',
    description: 'На\u00A0старте и\u00A0каждый месяц. Помогает определить, что\u00A0мешает двигаться дальше, и\u00A0отследить изменения.',
    frequency: 'Ежемесячно',
    icon: ASSETS.iconBot,
  },
  {
    title: 'Вакансии и\u00A0резюме',
    description: 'Расскажите о\u00A0вакансии в\u00A0своей клинике или\u00A0посмотрите, где\u00A0ищут специалиста с\u00A0вашим\u00A0опытом.',
    frequency: 'В\u00A0чате',
    icon: ASSETS.iconChat,
  },
  {
    title: 'Ежегодная конференция',
    description: 'Флагманское событие в\u00A0Москве. Живые истории от\u00A0спикеров-практиков, которые отзываются в\u00A0сердце каждого Человека Медицины.',
    frequency: '200+\u00A0участников со\u00A0всей\u00A0России',
    icon: ASSETS.iconEvents,
  },
  {
    title: 'База знаний\u00A0ZenClass',
    description: 'Не\u00A0успели на\u00A0эфир\u00A0— смотрите запись. Нужен шаблон или\u00A0чек-лист\u00A0— ищите в\u00A0базе\u00A0знаний.',
    frequency: '24/7',
    icon: ASSETS.iconKnowledge,
  },
];

/** Единый тариф: один уровень участия со всеми возможностями сообщества. */
export const SINGLE_TARIFF: SingleTariff = {
  title: 'Единый тариф',
  price: '7\u00A0000',
  period: 'руб. /\u00A0мес',
  promoNote: 'спеццена для\u00A0первых Людей\u00A0Медицины',
  description:
    'Доступ ко\u00A0всей экосистеме сообщества: закрытому чату, регулярным эфирам, мастермайндам, экскурсиям, базе знаний и\u00A0встречам с\u00A0Людмилой Морозовой.',
  features: [
    'Закрытый Telegram-чат и\u00A0Telegram-канал сообщества',
    'Эфиры с\u00A0приглашёнными экспертами и\u00A0сессии «Вопрос-ответ»',
    'База знаний ZenClass: записи эфиров, шаблоны документов, чек-листы',
    'Управленческие мастермайнды и\u00A0разборы реальных кейсов: HR, налоги, юридические риски,\u00A0маркетинг',
    'Стратегический кабинет с\u00A0Людмилой Морозовой и\u00A0закрытый круг собственников',
    'Встречи с\u00A0топ-экспертами: персонал, финансы, ИИ в\u00A0медицине, антикризис',
    'Экскурсии в\u00A0передовые клиники и\u00A0другие\u00A0бизнесы',
    'Random Coffee: еженедельное знакомство тет-а-тет с\u00A0участником сообщества',
    'Психологическая поддержка, коучинг и\u00A0мини-группы',
    'Закрытая база вакансий и\u00A0резюме от\u00A0участников',
    'Ежемесячная диагностика: на\u00A0старте и\u00A0каждый\u00A0месяц',
    'Специальные условия участия в\u00A0конференции и\u00A0кэмпах',
  ],
};

export const GALLERY_PHOTOS = [
  { full: withBase('/images/gallery-1.webp'), thumb: withBase('/images/gallery-1-thumb.webp') },
  { full: withBase('/images/gallery-2.webp'), thumb: withBase('/images/gallery-2-thumb.webp') },
  { full: withBase('/images/gallery-3.webp'), thumb: withBase('/images/gallery-3-thumb.webp') },
  { full: withBase('/images/gallery-4.webp'), thumb: withBase('/images/gallery-4-thumb.webp') },
  { full: withBase('/images/gallery-5.webp'), thumb: withBase('/images/gallery-5-thumb.webp') },
  { full: withBase('/images/gallery-6.webp'), thumb: withBase('/images/gallery-6-thumb.webp') },
] as const;

export const FOUNDERS: FounderItem[] = [
  {
    name: 'Людмила Морозова',
    role: 'Основатель и\u00A0идейный вдохновитель сообщества',
    bio: 'Предприниматель, визионер, основатель группы компаний «Люди Медицины». Формирует новую культуру медицинского бизнеса в\u00A0России.',
    photo: ASSETS.morozovaPhoto,
    highlights: [
      'Экс-CEO федеральных медицинских сетей (Medical On Group, ГК\u00A0«Медскан»)',
      'Топ-100 генеральных директоров в\u00A0медицинской отрасли',
      '20+\u00A0лет в\u00A0системе здравоохранения',
      '15+\u00A0лет управления медицинским бизнесом',
      '7\u00A0запущенных клиник с\u00A0нуля\u00A0(start-up)',
      '4\u00A0реализованных антикризисных проекта',
      '50+\u00A0компаний в\u00A0стратегическом партнёрстве',
    ],
    social: { type: 'telegram', label: 'Telegram', href: MOROZOVA_TELEGRAM_URL },
  },
  {
    name: 'Алёна Дьяконова',
    role: 'Сооснователь и\u00A0операционный директор сообщества',
    bio: 'Предприниматель, event-продюсер, основатель агентства по\u00A0развитию команд для\u00A0бизнеса «Точка-Т». Эксперт по\u00A0созданию профильных образовательных и\u00A0нетворкинговых событий.',
    photo: ASSETS.dyakonovaPhoto,
    highlights: [
      'Операционный директор ежегодной конференции «Люди\u00A0Медицины»',
      'Организатор VI Маммологического форума «Проектируя здоровье»',
      'Спикер Synergy University, Мой бизнес, Малый бизнес\u00A0Москвы',
      '300+\u00A0мероприятий в\u00A0России, Турции, Вьетнаме, на\u00A0Сейшелах',
      '2000+\u00A0слушателей-предпринимателей на\u00A0событиях',
      '10\u00A0запущенных проектов с\u00A0нуля',
      '4\u00A0созданных комьюнити-проекта (клубы на\u00A0100–2000 участников)',
    ],
    social: { type: 'vk', label: 'ВКонтакте', href: DYAKONOVA_VK_URL },
  },
];

export const COMMUNITY_VALUES: ValueItem[] = [
  { num: '01', title: 'Доверие', description: 'Мы\u00A0не\u00A0выносим личные истории, кейсы, финансовые данные и\u00A0внутренние обсуждения за\u00A0пределы сообщества без\u00A0согласия\u00A0автора.' },
  { num: '02', title: 'Взаимность', description: 'Мы\u00A0приходим не\u00A0только брать, но\u00A0и\u00A0делиться опытом, контактами, наблюдениями, вопросами и\u00A0поддержкой.' },
  { num: '03', title: 'Профессионализм', description: 'Мы\u00A0обсуждаем ситуации по\u00A0существу, аргументируем позицию и\u00A0уважаем разные уровни\u00A0опыта.' },
  { num: '04', title: 'Бережность', description: 'Мы\u00A0не\u00A0обесцениваем, не\u00A0атакуем, не\u00A0высмеиваем и\u00A0не\u00A0используем чужую уязвимость против\u00A0человека.' },
  { num: '05', title: 'Развитие', description: 'Мы\u00A0смотрим на\u00A0ошибки и\u00A0сложности как\u00A0на\u00A0материал для\u00A0роста, а\u00A0не\u00A0как\u00A0на\u00A0повод для\u00A0стыда или\u00A0конкуренции.' },
];

export const GROUP_ECOSYSTEM: EcosystemProject[] = [
  {
    num: '01',
    title: 'Сообщество «Люди\u00A0Медицины»',
    description: 'Профильное сообщество для\u00A0врачей и\u00A0лидеров медицины: владельцев клиник, управленцев, инвесторов. Безопасное пространство, где\u00A0помогают, поддерживают и\u00A0развивают. В\u00A0сообществе опыт конвертируется в\u00A0масштаб, а\u00A0партнерства строятся на\u00A0доверии.',
    buttons: [{ label: 'Вступить', href: '#tarifi' }],
  },
  {
    num: '02',
    title: 'Конференция «Люди\u00A0Медицины»',
    description: 'Ведущая ежегодная отраслевая площадка для\u00A0собственников, руководителей и\u00A0лидеров частной медицины. Место, где\u00A0задают прямые вопросы и\u00A0получают честные ответы. Только реальный опыт, разбор ошибок и\u00A0работающие стратегии.',
    buttons: [
      { label: 'ЗАБРОНИРОВАТЬ МЕСТО', href: 'https://ip-morozova-lyudmila.timepad.ru/event/4094375/', external: true },
      { label: 'ПОСМОТРЕТЬ ПРОГРАММУ', href: 'http://людимедицины-конференция.рф', external: true },
    ],
  },
  {
    num: '03',
    title: 'Консалтинговое агентство «Люди\u00A0Медицины»',
    description: 'Стратегическое партнерство с\u00A0измеримым результатом. Глубокий аудит и\u00A0выстраивание операционных процессов, вывод клиник из\u00A0кризиса, настройка системы и\u00A0экономики для\u00A0уверенного масштабирования.',
    buttons: [
      { label: 'Запросить аудит', href: 'https://lmpractice.ru/konsalting/', external: true },
      { label: 'Обсудить проект', href: 'https://lmpractice.ru/', external: true },
    ],
  },
  {
    num: '04',
    title: 'Стратегические сессии, практикум, менторство',
    description: 'Авторские форматы работы с\u00A0лидерами. Программы менторства и\u00A0сопровождения собственников и\u00A0CEO. Практикум для\u00A0собственников и\u00A0топ-менеджмента и\u00A0выездной трансформационный кэмп «ТОЧКА\u00A0СБОРКИ».',
    buttons: [{ label: 'Обсудить задачу', href: 'https://morozovamed.com/', external: true }],
  },
];
