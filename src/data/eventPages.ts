// Отдельные страницы событий (перенесены с Tilda: /ledin-clinic, /branch, /bud-zdorov).
// Чтобы открыть запись на новое событие, добавьте его сюда с registration: 'open' —
// на странице появится форма, ответы придут в Telegram (см. server/form-handler.mjs).

export interface EventPage {
  slug: string;
  /** Тип события над заголовком. */
  kind: string;
  title: string;
  /** Дата и время, как их пишем в анонсе. */
  when: string;
  where: string;
  about: string;
  registration: 'open' | 'closed';
}

export const EVENT_PAGES: Record<string, EventPage> = {
  'ledin-clinic': {
    slug: 'ledin-clinic',
    kind: 'Визит-экскурсия',
    title: 'Экскурсия в\u00A0«Ледин\u00A0Клиника»',
    when: '25\u00A0сентября 2026, 15:00–18:00',
    where: 'Москва, ул. Трубецкая,\u00A012',
    about:
      'Увидеть опыт коллег, посмотреть, как\u00A0устроена другая клиника, задать интересующие вопросы её\u00A0топ-команде и\u00A0собственникам.',
    registration: 'closed',
  },
  branch: {
    slug: 'branch',
    kind: 'Бранч',
    title: 'Бранч «Среда возможностей»',
    when: '21\u00A0октября 2026, 16:30–20:00',
    where: 'Москва, ресторан Signature\u00A0Art',
    about:
      'Живые встречи и\u00A0обмен энергией. Знакомимся с\u00A0резидентами в\u00A0уютной неформальной обстановке, делимся\u00A0опытом.',
    registration: 'closed',
  },
  'bud-zdorov': {
    slug: 'bud-zdorov',
    kind: 'Визит-экскурсия',
    title: 'Экскурсия в\u00A0клинику «Будь\u00A0здоров»',
    when: '29\u00A0октября 2026, 16:00–18:00',
    where: 'Москва, Сущевский вал,\u00A012',
    about:
      'Увидеть опыт коллег, посмотреть, как\u00A0устроена другая клиника, задать интересующие вопросы её\u00A0топ-команде и\u00A0собственникам.',
    registration: 'closed',
  },
};
