import React, { useRef, useState } from 'react';
import { C } from '../content/store';
import { BriefcaseMedical, Building2, Play, Stethoscope, Users, type LucideIcon } from 'lucide-react';
import { ASSETS, INTRO_VIDEO_EMBED_URL, WHO_ROLES } from '../data/siteContent';
import { Eyebrow, JoinButton } from './ui';

/** Иконки ролей по порядку WHO_ROLES: главврачи, заведующие, меддиректора, CEO и основатели. */
const ROLE_ICONS: LucideIcon[] = [Stethoscope, Users, BriefcaseMedical, Building2];

interface HeroIntroProps {
  onNavigateAnchor: (href: string) => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({ onNavigateAnchor }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onNavigateAnchor(href);
  };

  const handleTogglePlay = () => {
    if (INTRO_VIDEO_EMBED_URL) {
      setIsPlaying(true);
      return;
    }
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  return (
    <>
      {/* =====================================================================
          1. HERO HEADER: Единое большое фото с конференции
      ====================================================================== */}
      <section
        id="top"
        className="relative min-h-[680px] h-[100svh] sm:min-h-[620px] max-h-[920px] overflow-hidden bg-[#020201] flex items-end"
      >
        {/* Телефон: фото занимает верх экрана, текст ниже и не закрывает лица; с sm — фото на весь экран */}
        <div data-lm-parallax className="absolute inset-x-0 top-0 h-[60%] sm:h-full overflow-hidden will-change-transform">
          <img
            src={ASSETS.heroCrowdPhoto}
            alt={C.hero.photoAlt}
            fetchPriority="high"
            className="lm-hero-zoom absolute inset-0 w-full h-full object-cover object-[38%_center] sm:object-center filter brightness-[1.12] saturate-[1.08]"
          />
          <div
            aria-hidden="true"
            className="sm:hidden absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(2,2,1,0.35) 0%, rgba(2,2,1,0) 25%, rgba(2,2,1,0) 60%, #020201 100%)' }}
          />
        </div>
        <div
          aria-hidden="true"
          className="hidden sm:block absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(2,2,1,0.45) 0%, rgba(2,2,1,0.05) 35%, rgba(2,2,1,0.55) 65%, rgba(2,2,1,0.92) 88%, #020201 100%)',
          }}
        />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-5 pb-14 sm:pb-20 lg:pb-[88px]">
          <div className="max-w-[1240px] mx-auto">
            <h1 className="sr-only">{C.hero.h1}</h1>
            <img
              src={ASSETS.heroWordmark}
              alt="Люди Медицины"
              className="w-[260px] sm:w-[420px] lg:w-[560px] h-auto block lm-hero-in drop-shadow-md" style={{ animationDelay: '250ms' }}
            />

            <p style={{ animationDelay: '420ms' }} className="lm-hero-in mt-6 sm:mt-8 max-w-[760px] font-headline text-white text-[22px] sm:text-[28px] lg:text-[34px] font-medium leading-[1.25]">
              {C.hero.subtitle}
            </p>

            <p style={{ animationDelay: '560ms' }} className="lm-hero-in mt-4 max-w-[580px] text-[#dec69a] text-[15px] sm:text-[17px] leading-[1.55]">
              {C.hero.lead}
            </p>

            <div style={{ animationDelay: '700ms' }} className="lm-hero-in mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
              <JoinButton href="#tarifi" onClick={(e) => goTo(e, '#tarifi')} variant="gold" />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. ВИДЕО ОТ ЛЮДМИЛЫ МОРОЗОВОЙ (под шапкой)
      ====================================================================== */}
      <section
        id="video"
        className="relative bg-[#020201] pt-6 pb-12 sm:pb-[72px] lg:pb-[100px] scroll-mt-20 overflow-hidden"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
          <div className="max-w-[1120px] mx-auto">
            <div className="mb-8">
              <Eyebrow line={ASSETS.lineSand} label={C.video.eyebrow} color="#dec69a" />
              <h2 className="mt-3 font-headline text-white text-[26px] sm:text-[34px] lg:text-[38px] font-medium leading-[1.2]">
                {C.video.title}
              </h2>
            </div>

            {/* Video Container */}
            <div data-lm="video-box" className="relative w-full rounded-[24px] lg:rounded-[32px] overflow-hidden border border-[#dec69a]/25 bg-gradient-to-br from-[#1b1814] via-[#12110f] to-[#020201] shadow-2xl">
              {INTRO_VIDEO_EMBED_URL && isPlaying ? (
                <div className="relative w-full aspect-video">
                  <iframe
                    src={`${INTRO_VIDEO_EMBED_URL}${
                      INTRO_VIDEO_EMBED_URL.includes('?') ? '&' : '?'
                    }autoplay=1`}
                    title={C.video.title}
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="relative w-full sm:min-h-[440px] lg:min-h-[520px] flex flex-col p-6 pt-0 sm:p-10 lg:p-12">
                  {/* Decorative Background Artwork / Portrait */}
                  <img
                    src={ASSETS.videoPoster}
                    alt="Людмила Морозова"
                    loading="lazy"
                    decoding="async"
                    className="pointer-events-none select-none relative self-center h-[300px] max-sm:[mask-image:linear-gradient(to_bottom,black_65%,transparent)] sm:absolute sm:self-auto sm:bottom-0 sm:right-[5%] sm:h-[92%] lg:h-[98%] w-auto object-contain object-bottom brightness-[1.12] saturate-[1.1] transition-transform duration-700 hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#020201] from-30% via-[#020201]/50 via-50% to-transparent to-65% pointer-events-none"
                  />

                  {/* Цитата, подпись и одна кнопка — без служебных плашек */}
                  <div className="relative z-10 max-w-[540px] -mt-10 sm:mt-auto sm:mb-auto">
                    <p className="font-headline text-white text-[24px] sm:text-[30px] lg:text-[34px] font-medium leading-[1.25]">
                      {C.video.quote}
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <span aria-hidden="true" className="w-8 h-px bg-[#dec69a]/60" />
                      <span className="text-[#dec69a] text-[14px] sm:text-[15px] leading-[1.4]">
                        {C.video.author}
                      </span>
                    </div>

                    <button
                      type="button"
                      data-lm="video-play"
                      onClick={handleTogglePlay}
                      className="group mt-9 inline-flex items-center gap-3 rounded-[4px] bg-[#f9cd60] hover:bg-white text-[#020201] px-7 py-3.5 font-bold text-[13px] tracking-[1px] uppercase transition-all duration-200 cursor-pointer shadow-lg"
                    >
                      <span className="w-7 h-7 rounded-full bg-[#020201] text-[#f9cd60] flex items-center justify-center transition-transform group-hover:scale-110">
                        <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                      </span>
                      <span>Смотреть видео</span>
                      {C.video.duration && <span className="font-medium normal-case tracking-normal text-[#020201]/60">{C.video.duration}</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. КТО ТАКИЕ ЛЮДИ МЕДИЦИНЫ?
      ====================================================================== */}
      <section id="dlyakogo" className="bg-[#020201] pb-12 sm:pb-[72px] lg:pb-[100px] scroll-mt-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
          <div className="max-w-[1240px] mx-auto">
            <Eyebrow line={ASSETS.lineSand} label={C.who.eyebrow} color="#dec69a" />
            <h2 className="mt-4 font-headline text-white text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.08]">
              {C.who.title}
            </h2>
            <p className="mt-4 max-w-[576px] text-[#dec69a] text-[14px] sm:text-[15px] leading-[1.63]">
              {C.who.lead}
            </p>

            <div className="mt-7 sm:mt-10 lg:mt-[56px] grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 4 Roles Badges */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {WHO_ROLES.map((role, i) => {
                  const Icon = ROLE_ICONS[i % ROLE_ICONS.length];
                  return (
                  <div
                    key={role + i}
                    className="rounded-[16px] p-4 min-[400px]:p-5 sm:p-6 min-h-[120px] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                    style={{ backgroundColor: ['#eee6d7', '#dec69a', '#dec69a', '#f9cd60'][i % 4] }}
                  >
                    <span className="w-11 h-11 rounded-[12px] bg-[#020201]/[0.07] flex items-center justify-center">
                      <Icon className="w-[22px] h-[22px] text-[#020201]/80" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="mt-4 font-headline text-[#020201] text-[15px] min-[360px]:text-[16px] min-[400px]:text-[18px] sm:text-[20px] font-semibold leading-[1.2] break-words">
                      {role}
                    </span>
                  </div>
                  );
                })}
              </div>

              {/* Stress & Solution White Card */}
              <div className="lg:col-span-7 rounded-[16px] bg-white p-7 sm:p-10 flex flex-col justify-center">
                <p className="font-headline text-[#020201] text-[22px] sm:text-[26px] font-medium leading-[1.3]">
                  {C.who.cardTitle}
                </p>
                <p className="mt-5 text-[#3c3836] text-[15px] leading-[1.63]">
                  {C.who.cardText}
                </p>
                <p className="mt-4 text-[#020201] text-[15px] font-medium leading-[1.63] border-l-2 border-[#d28802] pl-4">
                  {C.who.cardAccent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
