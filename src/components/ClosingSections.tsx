import React from 'react';
import { C, img } from '../content/store';
import { GraduationCap, HandHeart, HeartHandshake, ShieldCheck, Sprout, type LucideIcon } from 'lucide-react';
import {
  ASSETS,
  COMMUNITY_VALUES,
  GROUP_ECOSYSTEM,
  JOIN_URL,
} from '../data/siteContent';
import { Eyebrow, JoinButton, MobileSwiper } from './ui';
import { BlogSection } from './BlogSections';

/** Иконки ценностей по номеру: доверие, взаимность, профессионализм, бережность, развитие. */
const VALUE_ICONS: Record<string, LucideIcon> = {
  '01': ShieldCheck,
  '02': HeartHandshake,
  '03': GraduationCap,
  '04': HandHeart,
  '05': Sprout,
};

interface ClosingSectionsProps {
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

export const ClosingSections: React.FC<ClosingSectionsProps> = ({ onNavigateAnchor, onOpenLegal }) => {
  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onNavigateAnchor(href);
  };

  return (
    <>
      {/* =====================================================================
          12. ПРИЗЫВ ВСТУПИТЬ (цена и состав тарифа — в TariffSection)
      ====================================================================== */}
      <section
        className="relative bg-[#020201] py-14 sm:py-[80px] lg:py-[110px] overflow-hidden scroll-mt-20"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url('${ASSETS.heroCrowdPhoto}')` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#020201] via-[#020201]/85 to-[#020201]"
        />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-5">
          <div className="max-w-[860px] mx-auto rounded-[28px] lg:rounded-[40px] border border-[#dec69a]/40 bg-[#020201]/80 backdrop-blur-md px-6 py-12 sm:px-12 sm:py-16 text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <Eyebrow line={ASSETS.lineSand} label={C.cta.eyebrow} color="#dec69a" />

            <h2 className="mt-6 font-headline text-white text-[26px] min-[400px]:text-[30px] sm:text-[40px] lg:text-[46px] font-medium leading-[1.15]">
              {C.cta.title}
            </h2>

            <p className="mt-3 font-headline text-[#f9cd60] text-[24px] sm:text-[30px] font-semibold">
              {C.cta.accent}
            </p>

            <p className="mt-4 max-w-[560px] text-[#dec69a] text-[15px] sm:text-[16px] leading-[1.55]">
              {C.cta.text}
            </p>

            <JoinButton href={JOIN_URL} external variant="gold" className="mt-10" />
          </div>
        </div>
      </section>

      {/* =====================================================================
          13. ЦЕННОСТИ СООБЩЕСТВА
      ====================================================================== */}
      <section id="cennosti" className="bg-[#eee6d7] py-12 sm:py-[76px] lg:py-[100px] scroll-mt-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
          <div className="max-w-[1240px] mx-auto">
            <div className="flex items-center gap-3">
              <img src={ASSETS.lineValues} alt="" className="w-[24px] h-[1px] shrink-0" />
              <span className="text-[#b8924a] text-[12px] sm:text-[10px] font-bold tracking-[2.5px] sm:tracking-[3px] uppercase leading-[1.5]">
                {C.values.eyebrow}
              </span>
            </div>
            <h2 className="mt-4 font-headline text-[#020201] text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.08]">
              {C.values.title}
            </h2>
            <p className="mt-4 max-w-[474px] text-[#020201] text-[14px] leading-[1.63]">
              {C.values.lead}
            </p>
            <MobileSwiper className="mt-7 sm:mt-10 lg:mt-[64px] sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-[24px]">
              {COMMUNITY_VALUES.map((val) => {
                const Icon = VALUE_ICONS[val.num];
                return (
                <article
                  key={val.num}
                  className="rounded-[16px] bg-white border border-[#1a1612]/[0.08] p-7 lg:p-[28px] lg:min-h-[234px]"
                >
                  <div className="flex items-start justify-between">
                    {Icon && (
                      <span className="w-12 h-12 rounded-[12px] bg-[#eee6d7] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#d28802]" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                    )}
                    <span className="text-[#d28802] text-[12px] leading-[1.33] font-semibold">{val.num}</span>
                  </div>
                  <h3 className="mt-5 font-headline text-[#020201] text-[18px] font-semibold leading-[1.4]">
                    {val.title}
                  </h3>
                  <p className="mt-3.5 text-[#020201] text-[12px] leading-[1.5]">{val.description}</p>
                </article>
                );
              })}
            </MobileSwiper>
          </div>
        </div>
      </section>

      {/* =====================================================================
          14. ОБЩАЯ ЭКОСИСТЕМА
      ====================================================================== */}
      <section className="bg-white py-12 sm:py-[76px] lg:py-[100px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
          <div className="max-w-[1240px] mx-auto">
            <div className="flex items-center gap-3">
              <img src={ASSETS.lineGoldAmber} alt="" className="w-[24px] h-[1px] shrink-0" />
              <span className="text-[#d28802] text-[12px] sm:text-[10px] font-bold tracking-[2.5px] sm:tracking-[3px] uppercase leading-[1.5]">
                {C.ecosystem.eyebrow}
              </span>
            </div>
            <h2 className="mt-4 font-headline text-[#020201] text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.08]">
              {C.ecosystem.title}
            </h2>
            <p className="mt-4 max-w-[576px] text-[#020201] text-[14px] leading-[1.63]">
              {C.ecosystem.lead}
            </p>
            <MobileSwiper className="mt-7 sm:mt-10 lg:mt-[64px] sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-[24px]">
              {GROUP_ECOSYSTEM.map((item) => (
                <article
                  key={item.num}
                  className="rounded-[16px] bg-white border border-[#1a1612]/[0.08] p-7 sm:p-[32px] lg:min-h-[300px] flex flex-col justify-between"
                >
                  <div>
                    <div className="font-headline text-[#d28802] text-[36px] font-medium leading-[1.11]">
                      {item.num}
                    </div>
                    <h3 className="mt-4 font-headline text-[#020201] text-[18px] font-semibold leading-[1.4]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-[#3c3836] text-[14px] leading-[1.63]">{item.description}</p>
                  </div>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    {item.buttons.map((btn) => (
                      <a
                        key={btn.label}
                        href={btn.href}
                        target={btn.external ? '_blank' : undefined}
                        rel={btn.external ? 'noopener noreferrer' : undefined}
                        onClick={btn.external ? undefined : (e) => goTo(e, btn.href)}
                        className="inline-flex items-center justify-center rounded-[4px] border border-[#d28802] px-4 h-[44px] sm:h-[33px] text-[#d28802] hover:bg-[#d28802] hover:text-white transition-colors text-[12px] sm:text-[10px] font-semibold tracking-[1.5px] uppercase"
                      >
                        {btn.label}
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </MobileSwiper>
          </div>
        </div>
      </section>

      <BlogSection onOpenLegal={onOpenLegal} />

      {/* =====================================================================
          15. ВЫ НЕ ОДНИ!
      ====================================================================== */}
      <section className="relative overflow-hidden bg-[#020201] py-20 sm:py-[110px] lg:py-[150px]">
        {C.final.photo && (
          <>
            <img src={img(C.final.photo)} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-[70%_30%]" />
            {/* Затемнение: текст читается на любом фото */}
            <div aria-hidden="true" className="absolute inset-0 bg-[#020201]/35" />
            {/* Слева темнее — там текст, справа видно людей на фото */}
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#020201]/90 via-[#020201]/60 to-transparent" />
          </>
        )}
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-5">
          <div className="max-w-[1240px] mx-auto">
          <div className="max-w-[620px] flex flex-col items-start text-left">
          <h2 className="font-headline text-white text-[36px] sm:text-[44px] lg:text-[52px] font-semibold leading-[1.1]">
            {C.final.title}
          </h2>
          <p className="mt-6 text-white/90 text-[16px] sm:text-[18px] leading-[1.6]">
            {C.final.text}
          </p>
          <JoinButton href={JOIN_URL} external variant="gold" className="mt-10" />
          </div>
          </div>
        </div>
      </section>
    </>
  );
};
