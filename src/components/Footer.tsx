import { BASE } from '../lib/base';
import React, { useEffect, useState } from 'react';
import { ASSETS, NAV_LINKS } from '../data/siteContent';

interface FooterProps {
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

const LEGAL_LINKS = [
  { slug: 'privacy-policy', label: 'Политика конфиденциальности' },
  { slug: 'oferta', label: 'Публичная оферта' },
  { slug: 'pravila', label: 'Правила сообщества' },
  { slug: 'soglasie-na-obrabotku', label: 'Согласие на\u00A0обработку персональных данных' },
];

export const Footer: React.FC<FooterProps> = ({ onNavigateAnchor, onOpenLegal }) => {
  const half = Math.ceil(NAV_LINKS.length / 2);
  const columns = [NAV_LINKS.slice(0, half), NAV_LINKS.slice(half)];

  return (
    <footer className="bg-[#020201] py-10 lg:py-[41px] border-t border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
        <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row justify-between gap-10">
          <div className="flex flex-col justify-between gap-8">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                onNavigateAnchor('#top');
              }}
              className="inline-block w-fit"
              aria-label="Люди Медицины&nbsp;—&nbsp;наверх"
            >
              <img src={ASSETS.footerLogo} alt="Люди Медицины" loading="lazy" className="w-[130px] h-[35px] object-contain" />
            </a>
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-12 lg:gap-[72px]">
              <div className="text-[#dec69a] text-[12px] sm:text-[10px] leading-[1.35]">
                <div>ИП Морозова&nbsp;Л.В.</div>
                <div>ИНН 110115274857</div>
                <div>© 2026</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 sm:gap-y-2 text-[#f9cd60] text-[14px] sm:text-[12px] leading-[1.33]">
                {LEGAL_LINKS.map((l) => (
                  <a
                    key={l.slug}
                    href={`${BASE}${l.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenLegal(l.slug);
                    }}
                    className="py-3 sm:py-0 hover:underline underline-offset-4"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 sm:gap-16 lg:gap-[96px] text-[#dec69a] text-[14px] sm:text-[12px] leading-[1.33]">
            {columns.map((col, i) => (
              <div key={i} className="flex flex-col sm:gap-4">
                {col.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateAnchor(item.href);
                    }}
                    className="py-3 sm:py-0 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export const CookieBanner: React.FC<{ onOpenLegal: (slug: string) => void; forceShow?: boolean }> = ({
  onOpenLegal,
  forceShow = false,
}) => {
  // До проверки localStorage баннер скрыт: так готовый HTML совпадает с первой отрисовкой в браузере.
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    try {
      setAccepted(localStorage.getItem('t886cookiename_14200401') === 'accepted');
    } catch {
      setAccepted(false);
    }
  }, []);

  if (accepted && !forceShow) return null;

  return (
    <div
      data-lm="cookie"
      role="dialog"
      aria-label="Уведомление об&nbsp;использовании файлов&nbsp;cookie"
      className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:right-4 sm:left-auto z-[995] sm:max-w-[800px] bg-white rounded-t-[16px] sm:rounded-[16px] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6 sm:py-4 flex flex-row items-center justify-between gap-3 sm:gap-4"
      style={{ boxShadow: '0px 15px 30px -10px rgba(0, 11, 48, 0.2)' }}
    >
      {/* На телефоне — короткий текст, чтобы плашка не закрывала четверть экрана. */}
      <p className="text-[#020201] text-[13px] sm:text-[14px] leading-[1.35]">
        <span className="sm:hidden">Мы&nbsp;используем cookie. </span>
        <span className="hidden sm:inline">
          Используя наш сайт и&nbsp;нажимая кнопку &quot;Принимаю&quot;, вы&nbsp;даете согласие на&nbsp;использование файлов cookie. Более
          подробная информация:{' '}
        </span>
        <a
          href={`${BASE}soglasie-na-obrabotku`}
          onClick={(e) => {
            e.preventDefault();
            onOpenLegal('soglasie-na-obrabotku');
          }}
          className="inline-block py-3 -my-3 sm:py-0 sm:my-0 text-[#d28802] underline underline-offset-2"
        >
          <span className="sm:hidden">Подробнее</span>
          <span className="hidden sm:inline">Согласие на&nbsp;обработку персональных данных</span>
        </a>
        <span className="hidden sm:inline">. Они помогают нам улучшить работу&nbsp;сайта.</span>
      </p>
      <button
        type="button"
        onClick={() => {
          setAccepted(true);
          try {
            localStorage.setItem('t886cookiename_14200401', 'accepted');
          } catch {
            /* ignore */
          }
          window.dispatchEvent(new Event('lm:cookie-change'));
        }}
        data-lm="cookie-accept"
        className="shrink-0 min-h-[44px] bg-[#d28802] hover:bg-[#020201] text-white font-medium text-[14px] rounded-[4px] px-5 sm:px-6 transition-colors cursor-pointer"
      >
        Принимаю
      </button>
    </div>
  );
};
