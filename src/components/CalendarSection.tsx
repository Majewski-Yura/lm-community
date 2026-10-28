import React, { useEffect, useMemo, useState } from 'react';
import { C } from '../content/store';
import { JOIN_URL } from '../data/siteContent';
import { JoinButton } from './ui';
import { CalendarDays, ChevronDown, Clock, Mic, X } from 'lucide-react';
import {
  CALENDAR_EVENTS,
  CALENDAR_MONTH_INDEX,
  CALENDAR_TITLE,
  CALENDAR_YEAR,
  FORMAT_META,
  PLACE_META,
  GUEST_SPEAKERS,
  type CalendarEvent,
} from '../data/calendarData';
import { ASSETS, EXPERTS, PARTICIPANTS } from '../data/siteContent';
import { Avatar, Eyebrow } from './ui';

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEKDAYS_FULL = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function weekdayIndex(day: number): number {
  return (new Date(CALENDAR_YEAR, CALENDAR_MONTH_INDEX, day).getDay() + 6) % 7;
}

function formatDate(day: number): string {
  return `${day} ${MONTHS_GEN[CALENDAR_MONTH_INDEX]}, ${WEEKDAYS_FULL[weekdayIndex(day)]}`;
}

/** Должность спикера — из списков экспертов и участников на сайте. */
function speakerInfo(name: string) {
  const person = EXPERTS.find((p) => p.name === name) ?? PARTICIPANTS.find((p) => p.name === name);
  return { name, about: GUEST_SPEAKERS[name]?.about ?? person?.position, photo: person?.photo ?? GUEST_SPEAKERS[name]?.photo };
}

/** События без спикера в формате, где он обычно есть. */
const FORMATS_WITH_SPEAKER = new Set(['efir', 'praktikum', 'mastermind', 'supervision', 'qa']);

const byTime = (a: CalendarEvent, b: CalendarEvent) => (a.time ?? '').localeCompare(b.time ?? '');

/** На телефоне до нажатия «Весь месяц» видны события по главное (выделенное) включительно, без него — первые 4. */
const SORTED_EVENTS = CALENDAR_EVENTS.slice().sort((a, b) => a.day - b.day || byTime(a, b));
const highlightIndex = SORTED_EVENTS.findIndex((e) => e.highlight);
const MOBILE_VISIBLE_EVENTS = highlightIndex >= 0 ? highlightIndex + 1 : 4;

/** Плашка формата как в карточках программы: белая, бежевая обводка, цветная точка (онлайн — охра, офлайн — тёмная). */
const PlaceTag: React.FC<{ place: CalendarEvent['place'] }> = ({ place }) => (
  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e3d6bf] bg-white px-2.5 py-0.5 text-[#020201] text-[12px] font-medium leading-[1.5]">
    <span aria-hidden="true" className={`w-2 h-2 rounded-full ${place === 'online' ? 'bg-[#d4943a]' : 'bg-[#3c3836]'}`} />
    {PLACE_META[place].label}
  </span>
);

interface CalendarSectionProps {
  onNavigateAnchor: (href: string) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({ onNavigateAnchor }) => {
  const [active, setActive] = useState<CalendarEvent | null>(null);
  const [allMobileEvents, setAllMobileEvents] = useState(false);

  const daysInMonth = new Date(CALENDAR_YEAR, CALENDAR_MONTH_INDEX + 1, 0).getDate();
  const offset = weekdayIndex(1);

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    CALENDAR_EVENTS.forEach((e) => {
      (map[e.day] ||= []).push(e);
    });
    Object.values(map).forEach((list) => list.sort(byTime));
    return map;
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active]);

  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Ширина столбца: день недели с событиями — 3 доли, без событий — 1.
  const busyWeekdays = new Set(CALENDAR_EVENTS.map((e) => weekdayIndex(e.day)));
  // Недели без событий (обычно первая и последняя) — ниже остальных.
  const emptyRows = new Set(
    Array.from({ length: cells.length / 7 }, (_, row) => row).filter((row) =>
      cells.slice(row * 7, row * 7 + 7).every((day) => !day || !eventsByDay[day]),
    ),
  );
  const gridTemplateColumns = WEEKDAYS_SHORT.map((_, i) => (busyWeekdays.has(i) ? 'minmax(0,3fr)' : 'minmax(0,1fr)')).join(' ');

  return (
    <section id="kalendar" className="bg-[#3c3836] py-12 sm:py-[72px] lg:py-[100px] scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
        <div className="max-w-[1240px] mx-auto">
          <Eyebrow line={ASSETS.lineSand} label={C.calendar.eyebrow} color="#dec69a" />
          <h2 className="mt-4 font-headline text-white text-[28px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.1]">
            {CALENDAR_TITLE}
          </h2>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-white/50 text-[13px]">{C.calendar.hint}</span>
          </div>

          {/* Desktop grid: столбцы дней недели без событий — узкие */}
          <div className="hidden md:block mt-8">
            <div className="grid gap-1.5" style={{ gridTemplateColumns }}>
              {WEEKDAYS_SHORT.map((d) => (
                <div key={d} className="px-3 lg:px-4 pb-3 font-headline text-white text-[16px] lg:text-[20px] font-semibold uppercase">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns }}>
              {cells.map((day, idx) => {
                if (!day) return <div key={idx} />;
                const events = eventsByDay[day] || [];
                const highlight = events.some((ev) => ev.highlight);
                const rowHeight = emptyRows.has(Math.floor(idx / 7)) ? 'min-h-[88px] lg:min-h-[104px]' : 'min-h-[176px] lg:min-h-[208px]';
                const cardClass = `${rowHeight} rounded-[12px] p-3 lg:p-4 flex flex-col text-left ${
                  highlight
                    ? 'bg-[#7c1d24] text-white'
                    : events.length
                      ? 'bg-white text-[#020201]'
                      : 'bg-[#2a2725] text-white/45' // день без событий — тёмный
                }`;
                const dayRow = (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[18px] lg:text-[20px] font-medium leading-none">{day}</span>
                  </div>
                );

                // Одно событие — кликабельна вся карточка, время прижато к низу.
                if (events.length === 1) {
                  const ev = events[0];
                  return (
                    <button
                      key={idx}
                      type="button"
                      data-lm-event={ev.id}
                      onClick={() => setActive(ev)}
                      className={`${cardClass} cursor-pointer transition-colors ${highlight ? 'hover:bg-[#962630]' : 'hover:bg-[#f9cd60]'}`}
                    >
                      {dayRow}
                      <span className="mt-3 text-[13px] lg:text-[14px] font-medium leading-[1.3] line-clamp-6 hyphens-auto lg:hyphens-manual break-words">{ev.title}</span>
                      <span className="mt-auto pt-3 flex items-center justify-between gap-2">
                        <span className="text-[13px] lg:text-[14px] leading-none">{ev.time}</span>
                        <PlaceTag place={ev.place} />
                      </span>
                    </button>
                  );
                }

                return (
                  <div key={idx} className={cardClass}>
                    {dayRow}
                    <div className="mt-3 flex flex-col gap-2">
                      {events.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          data-lm-event={ev.id}
                          onClick={() => setActive(ev)}
                          className="text-left rounded-[8px] -mx-1.5 px-1.5 py-1 cursor-pointer transition-colors hover:bg-[#f9cd60]"
                        >
                          <span className="block text-[12px] lg:text-[13px] font-medium leading-[1.3] line-clamp-4 hyphens-auto lg:hyphens-manual break-words">{ev.title}</span>
                          <span className="mt-1 flex items-center justify-between gap-2">
                            <span className="text-[12px] leading-none">{ev.time}</span>
                            <PlaceTag place={ev.place} />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile list */}
          <div className="md:hidden mt-6 space-y-2.5">
            {SORTED_EVENTS
              .filter((_, i) => allMobileEvents || i < MOBILE_VISIBLE_EVENTS)
              .map((ev, i) => (
                <button
                  key={ev.id}
                  type="button"
                  data-lm-event={ev.id}
                  onClick={() => setActive(ev)}
                  style={i >= MOBILE_VISIBLE_EVENTS ? { animationDelay: `${(i - MOBILE_VISIBLE_EVENTS) * 70}ms` } : undefined}
                  className={`w-full text-left rounded-[12px] p-4 flex gap-4 items-start cursor-pointer ${i >= MOBILE_VISIBLE_EVENTS ? 'lm-pop-in' : ''} ${
                    ev.highlight ? 'bg-[#7c1d24] text-white' : 'bg-white text-[#020201]'
                  }`}
                >
                  <div className="shrink-0 w-12 text-center">
                    <div className="font-headline text-[24px] font-semibold leading-none">{ev.day}</div>
                    <div className={`mt-1 text-[12px] uppercase ${ev.highlight ? 'text-[#f9cd60]' : 'text-[#8c4503]'}`}>
                      {WEEKDAYS_SHORT[weekdayIndex(ev.day)]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <PlaceTag place={ev.place} />
                      {ev.time && (
                        <span className={`text-[14px] font-semibold ${ev.highlight ? 'text-[#f9cd60]' : 'text-[#8c4503]'}`}>
                          {ev.time}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[16px] font-medium leading-[1.35]">{ev.title}</div>
                  </div>
                </button>
              ))}
            {!allMobileEvents && CALENDAR_EVENTS.length > MOBILE_VISIBLE_EVENTS && (
              <button
                type="button"
                onClick={() => setAllMobileEvents(true)}
                className="w-full h-[52px] rounded-[12px] border border-white/20 inline-flex items-center justify-center gap-2 text-white text-[14px] font-semibold cursor-pointer"
              >
                Весь месяц ·&nbsp;ещё {CALENDAR_EVENTS.length - MOBILE_VISIBLE_EVENTS}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Важно! */}
          <div className="mt-10 rounded-[16px] border border-[#f9cd60]/35 bg-white/[0.04] p-6 sm:p-8 flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center">
            <span className="shrink-0 font-headline text-[#f9cd60] text-[24px] sm:text-[28px] font-bold">{C.calendar.importantTitle}</span>
            <p className="font-headline text-white/90 text-[17px] sm:text-[20px] font-medium leading-[1.4]">
              {C.calendar.importantText}
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <JoinButton href={JOIN_URL} external variant="gold" label="Присоединиться" className="w-full sm:w-auto" />
          </div>
        </div>
      </div>

      {/* Event popup */}
      {active && (
        <div
          className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
        >
          <div
            className="relative w-full sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-t-[20px] sm:rounded-[20px] bg-white text-[#020201] lm-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#020201] px-6 sm:px-8 pt-7 pb-6">
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Закрыть"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="inline-block rounded-[4px] bg-[#f9cd60] px-2.5 py-0.5 text-[#020201] text-[10px] font-semibold uppercase tracking-[1px]">
                {FORMAT_META[active.format].label}
              </span>
              <h3 className="mt-3 pr-8 font-headline text-white text-[22px] sm:text-[26px] font-semibold leading-[1.25]">
                {active.title}
              </h3>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[#dec69a] text-[13px]">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" /> {formatDate(active.day)}
                </span>
                {active.time && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {active.time} (МСК)
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 sm:px-8 py-6 space-y-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#020201]/60">Формат</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <PlaceTag place={active.place} />
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#020201]/60">
                  {active.theses && active.theses.length > 0 ? 'Тезисы' : 'О\u00A0событии'}
                </div>
                {active.theses && active.theses.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {active.theses.map((t) => (
                      <li key={t} className="flex gap-2.5 text-[14px] leading-[1.55]">
                        <span className="mt-[8px] w-1.5 h-1.5 rounded-full bg-[#d28802] shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[14px] leading-[1.6] text-[#3c3836]">
                    {active.description ?? FORMAT_META[active.format].about}
                  </p>
                )}
              </div>

              {(active.speakers?.length || FORMATS_WITH_SPEAKER.has(active.format)) && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#020201]/60">
                    {active.speakers && active.speakers.length > 1 ? 'Спикеры' : 'Спикер'}
                  </div>
                  {active.speakers?.length ? (
                    <div className="mt-3 space-y-2">
                      {active.speakers.map(speakerInfo).map((sp, i) => (
                        <div key={sp.name} className="flex items-center gap-4 rounded-[12px] bg-[#eee6d7] p-4">
                          <Avatar name={sp.name} photo={sp.photo} index={i} size={56} />
                          <div>
                            <div className="font-semibold text-[15px]">{sp.name}</div>
                            {sp.about && <div className="text-[13px] text-[#3c3836] leading-[1.45] mt-0.5">{sp.about}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 inline-flex items-center gap-2 text-[14px] text-[#3c3836]">
                      <Mic className="w-4 h-4 text-[#d28802]" />
                      Спикер и&nbsp;подробная программа будут объявлены в&nbsp;чате&nbsp;сообщества
                    </p>
                  )}
                </div>
              )}

              {active.link && (
                <a
                  href={active.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full h-[50px] items-center justify-center rounded-[4px] border border-[#020201] hover:bg-[#eee6d7] text-[#020201] text-[13px] font-bold uppercase tracking-[1.2px] transition-colors"
                >
                  {active.link.label}
                </a>
              )}

              {active.format === 'conference' && active.link ? (
                <a
                  href={active.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full h-[50px] items-center justify-center rounded-[4px] bg-[#020201] hover:bg-[#d28802] text-white text-[13px] font-bold uppercase tracking-[1.2px] transition-colors"
                >
                  Зарегистрироваться
                </a>
              ) : (
              <a
                href="#tarifi"
                onClick={(e) => {
                  e.preventDefault();
                  setActive(null);
                  onNavigateAnchor('#tarifi');
                }}
                className="flex w-full h-[50px] items-center justify-center rounded-[4px] bg-[#020201] hover:bg-[#d28802] text-white text-[13px] font-bold uppercase tracking-[1.2px] transition-colors"
              >
                Вступить, чтобы участвовать
              </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
