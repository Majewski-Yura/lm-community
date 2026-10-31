// Отдельные страницы событий (/ledin-clinic, /branch, /bud-zdorov и новые).
// Данные — в src/content/content.json → eventPages, правятся в админке: раздел «Страницы мероприятий».
// При registration: 'open' на странице появляется форма, ответы приходят в Telegram.
import { C, img } from '../content/store';

export interface EventPage {
  slug: string;
  /** Тип события над заголовком. */
  kind: string;
  title: string;
  /** Дата и время, как их пишем в анонсе. */
  when: string;
  where: string;
  about: string;
  /** Обложка страницы (необязательно). */
  cover?: string;
  /** Затемнение фото на фоне, % (0 — без затемнения). */
  dim?: number;
  registration: 'open' | 'closed';
}

export const EVENT_PAGES: Record<string, EventPage> = Object.fromEntries(
  (C.eventPages?.items ?? [])
    .filter((ev) => ev.slug)
    .map((ev) => [
      ev.slug,
      { ...ev, cover: ev.cover ? img(ev.cover) : undefined, registration: ev.registration === 'open' ? 'open' : 'closed' } as EventPage,
    ]),
);
