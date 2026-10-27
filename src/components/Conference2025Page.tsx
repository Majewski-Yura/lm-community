import { withBase } from '../lib/base';
import React from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { CONFERENCE_2025 as C } from '../data/conference2025';
import { SubpageShell } from './SubpageShell';

interface Conference2025PageProps {
  onBackHome: () => void;
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="font-headline text-white text-[26px] sm:text-[32px] font-medium leading-[1.2]">{children}</h2>
);

/** Архив конференции 14 ноября 2025 — бывшая страница /home на Tilda. */
export const Conference2025Page: React.FC<Conference2025PageProps> = (props) => (
  <SubpageShell
    eyebrow="Архив · конференция прошла"
    title={C.title}
    meta={
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 text-[#dec69a]">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="w-4 h-4" /> {C.date}
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin className="w-4 h-4" /> {C.place}
        </span>
      </div>
    }
    {...props}
  >
    <div className="rounded-[16px] bg-[#7c1d24] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
      <p className="flex-1 font-headline text-white text-[18px] sm:text-[20px] font-medium leading-[1.4]">
        Следующая конференция «Люди Медицины»&nbsp;— 13&nbsp;ноября 2026&nbsp;года. Программа и&nbsp;участие&nbsp;— на&nbsp;сайте конференции.
      </p>
      <a
        href={C.nextConferenceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 inline-flex items-center justify-center rounded-[4px] bg-white hover:bg-[#f9cd60] text-[#020201] px-7 h-[50px] text-[13px] font-bold tracking-[1.2px] uppercase transition-colors"
      >
        Конференция 2026
      </a>
    </div>

    <section className="mt-16 grid lg:grid-cols-[1fr_280px] gap-8 lg:gap-12 items-start">
      <div>
        <p className="text-[#dec69a] text-[13px] font-medium uppercase tracking-[2px]">{C.tagline}</p>
        <h2 className="mt-3 font-headline text-white text-[24px] sm:text-[28px] font-medium">Дорогие коллеги и&nbsp;друзья!</h2>
        <div className="mt-5 space-y-4 text-white/85 text-[16px] leading-[1.7]">
          {C.letter.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="mt-6 text-white font-semibold">Людмила Морозова</p>
        <p className="text-white/60 text-[14px]">Основатель и&nbsp;идейный вдохновитель конференции</p>
      </div>
      <img
        src={withBase('/images/conference-2025/morozova.webp')}
        alt="Людмила Морозова"
        loading="lazy"
        className="w-full max-w-[280px] aspect-[410/239] object-cover object-top rounded-[16px]"
      />
    </section>

    <section className="mt-16">
      <SectionTitle>{C.whoTitle}</SectionTitle>
      <div className="mt-5 space-y-4 text-white/85 text-[16px] leading-[1.7] max-w-[760px]">
        {C.who.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </section>

    <section className="mt-16">
      <SectionTitle>Спикеры конференции</SectionTitle>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {C.speakers.map((s) => (
          <article key={s.name} className="rounded-[16px] overflow-hidden border border-white/10 bg-white/[0.03]">
            <img
              src={withBase(`/images/conference-2025/${s.photo}.webp`)}
              alt={s.name}
              loading="lazy"
              decoding="async"
              className="w-full aspect-[410/239] object-cover object-top"
            />
            <div className="p-5">
              <h3 className="font-headline text-white text-[18px] font-semibold">{s.name}</h3>
              <p className="mt-2 text-white/70 text-[14px] leading-[1.55]">{s.about}</p>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="mt-16">
      <SectionTitle>Программа</SectionTitle>
      <div className="mt-8 space-y-6">
        {C.program.map((part) => (
          <div key={part.title} className="rounded-[16px] border border-white/10 p-5 sm:p-6">
            <h3 className="text-[#f9cd60] text-[13px] font-bold uppercase tracking-[1.5px]">{part.title}</h3>
            <ul className="mt-4 space-y-3">
              {part.items.map((item) => (
                <li key={item.time + item.text} className="grid grid-cols-[96px_1fr] sm:grid-cols-[120px_1fr] gap-3 text-[15px] leading-[1.5]">
                  <span className="text-[#dec69a] font-semibold">{item.time}</span>
                  <span className="text-white/90">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>

    <section className="mt-16 grid md:grid-cols-2 gap-4">
      <div className="rounded-[16px] bg-[#f9cd60] p-6 sm:p-8 text-[#020201]">
        <h2 className="font-headline text-[22px] font-semibold">{C.formatTitle}</h2>
        <p className="mt-3 text-[15px] leading-[1.6]">{C.format}</p>
      </div>
      <div className="rounded-[16px] border border-white/10 p-6 sm:p-8">
        <h2 className="font-headline text-white text-[22px] font-semibold">Где&nbsp;проходила</h2>
        <p className="mt-3 text-white/80 text-[15px] leading-[1.6]">{C.venue}</p>
      </div>
    </section>

    <section className="mt-16">
      <SectionTitle>Организаторы</SectionTitle>
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {C.organizers.map((o) => (
          <div key={o.name} className="rounded-[16px] border border-white/10 p-6">
            <h3 className="font-headline text-white text-[19px] font-semibold">{o.name}</h3>
            <ul className="mt-4 space-y-2.5">
              {o.points.map((p) => (
                <li key={p} className="flex gap-2.5 text-white/80 text-[14px] leading-[1.55]">
                  <span className="mt-[8px] w-1.5 h-1.5 rounded-full bg-[#dec69a] shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  </SubpageShell>
);
