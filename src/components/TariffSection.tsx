import React, { useState } from 'react';
import { C } from '../content/store';
import { Check, ChevronDown } from 'lucide-react';
import { ASSETS, JOIN_URL, SINGLE_TARIFF } from '../data/siteContent';
import { Eyebrow, JoinButton } from './ui';

/** Сколько возможностей тарифа видно на телефоне до нажатия «Все возможности». */
const MOBILE_VISIBLE_FEATURES = 6;

/** Единый тариф: цена, описание и полный список того, что входит. */
export const TariffSection: React.FC = () => {
  const [allFeatures, setAllFeatures] = useState(false);
  const t = SINGLE_TARIFF;

  return (
    <section id="tarifi" className="bg-[#020201] py-12 sm:py-[72px] lg:py-[100px] scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
        <div className="max-w-[1240px] mx-auto">
          <Eyebrow line={ASSETS.lineSand} label={C.tariff.eyebrow} color="#dec69a" />
          <h2 className="mt-4 font-headline text-white text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.1]">
            {C.tariff.title}
          </h2>

          <div className="mt-7 sm:mt-10 lg:mt-[56px] rounded-[20px] lg:rounded-[28px] border border-[#dec69a]/40 bg-gradient-to-br from-[#1b1814] to-[#020201] grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="p-6 sm:p-10 lg:p-12 flex flex-col lg:border-r border-[#dec69a]/20">
              <span className="self-start rounded-[4px] bg-[#f9cd60] px-3 py-1 text-[#020201] text-[11px] font-bold tracking-[1.2px] uppercase">
                {t.title}
              </span>
              <div className="mt-6 flex items-baseline gap-2">
                {t.price ? (
                  <>
                    <span className="font-headline text-white text-[48px] sm:text-[56px] font-medium leading-none">{t.price}</span>
                    <span className="text-[#dec69a] text-[15px]">{t.period}</span>
                  </>
                ) : (
                  <span className="font-headline text-white/50 text-[28px] font-medium leading-none">Цена уточняется</span>
                )}
              </div>
              <p className="mt-3 text-[#f9cd60] text-[13px] leading-[1.4]">{t.promoNote}</p>
              <p className="mt-6 text-white/80 text-[15px] leading-[1.6]">{t.description}</p>
              <JoinButton href={JOIN_URL} external variant="gold" className="mt-8 lg:mt-auto self-stretch sm:self-start min-w-0 sm:min-w-[270px] whitespace-nowrap px-4! sm:px-9!" />
            </div>

            <div className="p-6 pt-0 sm:p-10 sm:pt-0 lg:p-12">
              <div className="lg:hidden h-px bg-[#dec69a]/20 mb-6" />
              <div className="text-[#dec69a] text-[12px] font-medium tracking-[2px] uppercase">{C.tariff.featuresTitle}</div>
              <ul className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                {t.features.map((f, i) => (
                  <li
                    key={f}
                    className={`items-start gap-3 text-white/85 text-[14px] leading-[1.5] ${
                      !allFeatures && i >= MOBILE_VISIBLE_FEATURES ? 'hidden sm:flex' : 'flex'
                    } ${allFeatures && i >= MOBILE_VISIBLE_FEATURES ? 'lm-pop-in' : ''}`}
                    style={allFeatures ? { animationDelay: `${(i - MOBILE_VISIBLE_FEATURES) * 50}ms` } : undefined}
                  >
                    <Check className="w-4 h-4 mt-[3px] shrink-0 text-[#f9cd60]" strokeWidth={2.5} aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {!allFeatures && t.features.length > MOBILE_VISIBLE_FEATURES && (
                <button
                  type="button"
                  onClick={() => setAllFeatures(true)}
                  className="sm:hidden mt-3 min-h-[44px] inline-flex items-center gap-1 text-[#f9cd60] text-[14px] font-semibold cursor-pointer"
                >
                  Все&nbsp;возможности&nbsp;({t.features.length})
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
