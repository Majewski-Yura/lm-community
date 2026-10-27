import React, { useEffect, useState } from 'react';
import { ASSETS, NAV_LINKS } from '../data/siteContent';

interface NavbarProps {
  onNavigateAnchor: (href: string) => void;
  isSubpage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateAnchor, isSubpage = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      } else {
        setScrollProgress(0);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSubpage]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    onNavigateAnchor(href);
  };

  return (
    <>
      {/* Tilda T602 Top Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-[1000] h-[3px] pointer-events-none bg-transparent">
        <div
          data-lm="progress"
          className="h-full bg-[#dec69a] transition-[width] duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Desktop Header (T1272 > 960px) */}
      <header className="hidden min-[961px]:block fixed top-0 left-0 right-0 z-[980]">
        <div
          className="w-full min-h-[70px] px-6 xl:px-10 rounded-b-[20px] flex items-center justify-between gap-4 border-b border-white/[0.04]"
          style={{
            backgroundColor: 'rgba(7, 9, 15, 0.70)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
          }}
        >
          {/* Left Logo */}
          <a
            href="#top"
            onClick={(e) => handleLinkClick(e, '#top')}
            className="shrink-0 flex items-center py-2 focus:outline-none"
            aria-label="Люди Медицины&nbsp;— На&nbsp;главную"
          >
            <img
              src={ASSETS.headerLogo}
              alt="Люди Медицины"
              className="w-[130px] max-w-[130px] h-auto block"
            />
          </a>

          {/* Center Navigation Links */}
          <nav aria-label="Основная навигация" className="flex items-center justify-center flex-wrap gap-x-4 xl:gap-x-6 gap-y-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href + item.label}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="text-[13px] xl:text-[14px] font-medium text-[#dec69a] hover:text-white transition-colors duration-300 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right CTA Button */}
          <div className="shrink-0">
            <a
              href="#tarifi"
              onClick={(e) => handleLinkClick(e, '#tarifi')}
              className="lm-btn-ripple inline-flex items-center justify-center bg-[#dec69a] hover:bg-white text-[#020201] font-semibold text-[12px] uppercase tracking-[0.4px] rounded-[4px] px-5 py-2.5 transition-colors duration-200"
            >
              Вступить
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar (<= 960px) */}
      <div className="min-[961px]:hidden fixed top-0 left-0 right-0 z-[990] bg-[#111111] min-h-[64px] px-5 flex items-center justify-between border-b border-white/[0.06]">
        <a
          href="#top"
          onClick={(e) => handleLinkClick(e, '#top')}
          className="flex items-center"
          aria-label="Люди Медицины&nbsp;— На&nbsp;главную"
        >
          <img
            src={ASSETS.headerLogo}
            alt="Люди Медицины"
            className="w-[122px] h-auto block"
          />
        </a>

        <button
          type="button"
          data-lm="burger"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Навигационное меню"
          className="w-10 h-10 bg-[#dec69a] rounded-[4px] flex flex-col items-center justify-center gap-[5px] cursor-pointer focus:outline-none"
        >
          <span
            data-lm-line=""
            className={`w-[20px] h-[2px] bg-[#020201] transition-transform duration-200 ${
              mobileOpen ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            data-lm-line=""
            className={`w-[20px] h-[2px] bg-[#020201] transition-opacity duration-200 ${
              mobileOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            data-lm-line=""
            className={`w-[20px] h-[2px] bg-[#020201] transition-transform duration-200 ${
              mobileOpen ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Drawer Overlay & Right Sidebar */}
      <div
          data-lm="drawer"
          className={`min-[961px]:hidden fixed inset-0 z-[985] ${mobileOpen ? '' : 'hidden'}`}
        >
          <div
            data-lm="drawer-close"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-[64px] right-0 bottom-0 w-full max-w-[340px] bg-[#020201] px-6 py-8 flex flex-col items-center justify-between overflow-y-auto border-l border-[#dec69a]/15">
            <nav className="flex flex-col items-center gap-5 w-full mt-2">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href + item.label}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="text-[16px] font-medium text-[#dec69a] hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <a
              href="#tarifi"
              onClick={(e) => handleLinkClick(e, '#tarifi')}
              className="mt-8 w-full max-w-[240px] inline-flex items-center justify-center bg-[#dec69a] hover:bg-white text-[#020201] font-semibold text-[12px] uppercase tracking-[0.6px] rounded-[4px] py-3.5 transition-colors"
            >
              Вступить
            </a>
          </div>
        </div>
    </>
  );
};
