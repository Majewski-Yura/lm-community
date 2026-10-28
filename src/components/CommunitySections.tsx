import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Send, X } from 'lucide-react';
import {
  ASSETS,
  COMMUNITY_EXTRA,
  COMMUNITY_HAS,
  FOUNDERS,
  GALLERY_PHOTOS,
  type FeatureCard,
  type SocialLink,
} from '../data/siteContent';
import { Eyebrow, MobileSwiper } from './ui';
import { TariffSection } from './TariffSection';

const VkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.79 17.5c-5.47 0-8.59-3.75-8.72-9.99h2.74c.09 4.58 2.11 6.52 3.71 6.92V7.51h2.58v3.95c1.58-.17 3.24-1.97 3.8-3.95h2.58c-.43 2.44-2.23 4.24-3.51 4.98 1.28.6 3.33 2.17 4.11 5.01h-2.84c-.61-1.9-2.13-3.37-4.14-3.57v3.57h-.31Z" />
  </svg>
);

const SocialButton: React.FC<{ social: SocialLink }> = ({ social }) => (
  <a
    href={social.href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 rounded-[4px] border border-[#d28802] px-4 h-[44px] sm:h-[36px] text-[#d28802] hover:bg-[#d28802] hover:text-white transition-colors text-[11px] font-semibold tracking-[1.2px] uppercase"
  >
    {social.type === 'telegram' ? <Send className="w-4 h-4" /> : <VkIcon className="w-5 h-5" />}
    {social.label}
  </a>
);

/** Сколько достижений основателя видно на телефоне до нажатия «Ещё». */
const FOUNDER_HIGHLIGHTS_MOBILE = 3;

const FeatureCardView: React.FC<{ item: FeatureCard; dark?: boolean }> = ({ item, dark }) => (
  <article
    className={`group rounded-[16px] overflow-hidden flex flex-col ${dark ? 'bg-white' : 'bg-white border border-[#1a1612]/[0.08]'}`}
  >
    {item.photo && (
      <div className="aspect-[16/10] overflow-hidden bg-[#3c3836]">
        <img
          src={item.photo}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
    )}
    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-6">
      <div>
        {!item.photo && <img src={item.icon} alt="" className="w-6 h-6" />}
        <h3 className={`${item.photo ? '' : 'mt-5 '}font-headline text-[#020201] text-[19px] font-semibold leading-[1.3]`}>{item.title}</h3>
        <p className="mt-3 text-[#3c3836] text-[14px] leading-[1.6]">{item.description}</p>
      </div>
      <span className="self-start rounded-[4px] bg-[#f9cd60] px-3 py-1 text-[#020201] text-[12px] sm:text-[10px] font-bold tracking-[1.2px] uppercase">
        {item.frequency}
      </span>
    </div>
  </article>
);

const FeatureGrid: React.FC<{ items: FeatureCard[]; dark?: boolean }> = ({ items, dark }) => {
  const [open, setOpen] = useState<number | null>(null);

  // Карточки с фото: на телефоне — открытые карточки в карусели со свайпом, с планшета — сетка
  if (items.some((item) => item.photo)) {
    return (
      <MobileSwiper
        tone={dark ? 'dark' : 'light'}
        className="mt-7 sm:mt-10 lg:mt-[56px] sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-6"
      >
        {items.map((item) => (
          <FeatureCardView key={item.title} item={item} dark={dark} />
        ))}
      </MobileSwiper>
    );
  }

  return (
    <>
      {/* Телефон: аккордеон — видны названия и периодичность, описание по нажатию */}
      <div className="sm:hidden mt-7 space-y-2">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.title} className={`rounded-[12px] bg-white ${dark ? '' : 'border border-[#1a1612]/[0.08]'}`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left cursor-pointer"
              >
                <img src={item.icon} alt="" className="w-5 h-5 shrink-0" />
                <span className="flex-1">
                  <span className="block font-headline text-[#020201] text-[16px] font-semibold leading-[1.3]">{item.title}</span>
                  <span className="block mt-0.5 text-[#8c4503] text-[12px] leading-[1.3]">{item.frequency}</span>
                </span>
                <ChevronDown className={`w-5 h-5 shrink-0 text-[#020201]/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`lm-collapse ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
                <div>
                  <p className="px-4 pb-4 -mt-1 pl-[50px] text-[#3c3836] text-[14px] leading-[1.6]">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:grid mt-7 sm:mt-10 lg:mt-[56px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <FeatureCardView key={item.title} item={item} dark={dark} />
        ))}
      </div>
    </>
  );
};

export const CommunitySections: React.FC = () => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [activeFounder, setActiveFounder] = useState(0);
  const [founderSwitched, setFounderSwitched] = useState(false);
  const [founderExpanded, setFounderExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx((p) => (p === null ? null : (p + 1) % GALLERY_PHOTOS.length));
      if (e.key === 'ArrowLeft')
        setLightboxIdx((p) => (p === null ? null : (p - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx]);

  return (
    <>
      {/* 9. ЧТО ЕСТЬ В СООБЩЕСТВЕ? */}
      <section id="kakrabotaet" className="relative bg-[#020201] py-12 sm:py-[72px] lg:py-[100px] overflow-hidden scroll-mt-20">
        <img
          src={ASSETS.ecosystemRingsSvg}
          alt=""
          loading="lazy"
          aria-hidden="true"
          className="pointer-events-none select-none absolute top-0 right-[-160px] lg:right-0 w-[560px] lg:w-[799px] h-auto opacity-80"
        />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-5">
          <div className="max-w-[1240px] mx-auto">
            <Eyebrow line={ASSETS.lineSand} label="Как&nbsp;это&nbsp;работает" color="#dec69a" />
            <h2 className="mt-4 font-headline text-white text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.1]">
              Что&nbsp;есть в&nbsp;сообществе?
            </h2>
            <FeatureGrid items={COMMUNITY_HAS} dark />
          </div>
        </div>
      </section>

      {/* 10. ЧТО ЕЩЁ У НАС ЕСТЬ? */}
      <section className="bg-[#eee6d7] py-12 sm:py-[72px] lg:py-[100px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
          <div className="max-w-[1240px] mx-auto">
            <Eyebrow line={ASSETS.lineGoldAmber} label="А&nbsp;также" color="#d28802" />
            <h2 className="mt-4 font-headline text-[#020201] text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.1]">
              Что&nbsp;еще у&nbsp;нас&nbsp;есть?
            </h2>
            <FeatureGrid items={COMMUNITY_EXTRA} />
          </div>
        </div>
      </section>

      <TariffSection />

      {/* ФОТОГАЛЕРЕЯ */}
      <section aria-label="Фотогалерея встреч сообщества" className="bg-[#eee6d7] py-10 sm:py-0">
        <MobileSwiper bleed={false} className="w-full sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-0 sm:px-0 [&>*]:rounded-[12px] sm:[&>*]:rounded-none">
          {GALLERY_PHOTOS.map((photo, index) => (
            <button
              key={photo.full}
              type="button"
              data-lm-gallery={index}
              onClick={() => setLightboxIdx(index)}
              className="group relative aspect-[4/3] overflow-hidden bg-[#3c3836] cursor-zoom-in block"
              aria-label={`Открыть фотографию ${index + 1}`}
            >
              <img
                src={photo.thumb}
                alt={`Встречи сообщества Люди Медицины — фото ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </MobileSwiper>
      </section>

      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[1100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxIdx(null)}>
          <button type="button" onClick={() => setLightboxIdx(null)} aria-label="Закрыть" className="fixed top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer">
            <X className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((lightboxIdx - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length);
            }}
            aria-label="Предыдущее фото"
            className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src={GALLERY_PHOTOS[lightboxIdx].full} alt="" onClick={(e) => e.stopPropagation()} className="max-w-[92vw] max-h-[88vh] object-contain rounded-[8px]" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((lightboxIdx + 1) % GALLERY_PHOTOS.length);
            }}
            aria-label="Следующее фото"
            className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* 11. КТО СТОИТ ЗА ПРОЕКТОМ? */}
      <section id="osnovateli" className="bg-[#3c3836] py-12 sm:py-[72px] lg:py-[100px] scroll-mt-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
          <div className="max-w-[1240px] mx-auto">
            <Eyebrow line={ASSETS.lineFounders} label="Основатели" color="#c9a96e" />
            <h2 className="mt-4 font-headline text-white text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.1]">
              Кто&nbsp;стоит за&nbsp;проектом?
            </h2>

            {/* Телефон и планшет: переключатель между основателями */}
            <div role="tablist" className="lg:hidden mt-7 sm:mt-10 grid grid-cols-2 gap-1 rounded-[12px] bg-white/10 p-1">
              {FOUNDERS.map((f, i) => (
                <button
                  key={f.name}
                  type="button"
                  role="tab"
                  aria-selected={activeFounder === i}
                  onClick={() => {
                    setActiveFounder(i);
                    setFounderSwitched(true);
                  }}
                  className={`rounded-[8px] px-2 py-2.5 text-[13px] font-semibold leading-[1.2] whitespace-nowrap transition-colors cursor-pointer ${
                    activeFounder === i ? 'bg-white text-[#020201]' : 'text-white/75'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            <div className="mt-3 sm:mt-4 lg:mt-[56px] grid grid-cols-1 lg:grid-cols-2 gap-6">
              {FOUNDERS.map((f, fi) => (
                <article
                  key={f.name}
                  className={`rounded-[16px] bg-white p-6 sm:p-9 lg:p-10 flex-col ${activeFounder === fi ? 'flex' : 'hidden lg:flex'} ${founderSwitched && activeFounder === fi ? 'lm-pop-in' : ''}`}
                >
                  <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-6">
                    <div className="max-w-[330px]">
                      <h3 className="font-headline text-[#020201] text-[24px] font-semibold leading-[1.33]">{f.name}</h3>
                      <div className="mt-1.5 text-[#8c4503] text-[12px] tracking-[0.3px] uppercase leading-[1.33]">{f.role}</div>
                      <p className="mt-5 text-[#020201] text-[13px] leading-[1.5]">{f.bio}</p>
                      <div className="mt-5">
                        <SocialButton social={f.social} />
                      </div>
                    </div>
                    <div className="w-[112px] h-[126px] sm:w-[167px] sm:h-[187px] rounded-[16px] overflow-hidden shrink-0 bg-[#eee6d7]">
                      <img src={f.photo} alt={f.name} loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
                    </div>
                  </div>

                  <img src={ASSETS.founderDivider} alt="" className="mt-6 mb-5 w-full h-[1px] object-cover" />
                  <ul className="space-y-1.5 text-[#020201]/55 text-[13px] leading-[1.54]">
                    {f.highlights.map((h, hi) => (
                      <li
                        key={h}
                        className={`items-start gap-2 ${!founderExpanded[fi] && hi >= FOUNDER_HIGHLIGHTS_MOBILE ? 'hidden lg:flex' : 'flex'} ${founderExpanded[fi] && hi >= FOUNDER_HIGHLIGHTS_MOBILE ? 'lm-pop-in' : ''}`}
                        style={founderExpanded[fi] ? { animationDelay: `${(hi - FOUNDER_HIGHLIGHTS_MOBILE) * 60}ms` } : undefined}
                      >
                        <span className="mt-[7px] w-1 h-1 rounded-full bg-[#020201]/50 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  {!founderExpanded[fi] && f.highlights.length > FOUNDER_HIGHLIGHTS_MOBILE && (
                    <button
                      type="button"
                      onClick={() => setFounderExpanded((prev) => ({ ...prev, [fi]: true }))}
                      className="lg:hidden mt-1 min-h-[44px] self-start inline-flex items-center gap-1 text-[#8c4503] text-[13px] font-semibold cursor-pointer"
                    >
                      Ещё {f.highlights.length - FOUNDER_HIGHLIGHTS_MOBILE}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
