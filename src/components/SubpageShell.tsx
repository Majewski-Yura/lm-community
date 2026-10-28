import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Footer } from './Footer';

interface SubpageShellProps {
  eyebrow?: string;
  title: string;
  /** Строки под заголовком: дата, место и т.п. */
  meta?: React.ReactNode;
  onBackHome: () => void;
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
  children: React.ReactNode;
  /** Светлая страница (записи блога): бежевая шапка и светлый фон. */
  light?: boolean;
}

/** Каркас внутренней страницы: тёмная шапка с заголовком, содержимое на тёмном фоне и подвал. */
export const SubpageShell: React.FC<SubpageShellProps> = ({
  eyebrow,
  title,
  meta,
  onBackHome,
  onNavigateAnchor,
  onOpenLegal,
  children,
  light = false,
}) => (
  <div className={`min-h-screen flex flex-col ${light ? 'bg-[#faf7f1] text-[#020201]' : 'bg-[#020201] text-white'}`}>
    <div
      className={`pt-[108px] pb-[48px] px-4 sm:px-6 border-b ${
        light ? 'border-[#020201]/10 bg-[#eee6d7]' : 'border-white/10 bg-gradient-to-b from-[#1b1814] to-[#020201]'
      }`}
    >
      <div className="max-w-[960px] mx-auto">
        <button
          type="button"
          data-lm-home=""
          onClick={onBackHome}
          className={`inline-flex items-center gap-2 text-[13px] ${light ? 'text-[#8c4503] hover:text-[#020201]' : 'text-[#dec69a] hover:text-white'} font-medium transition-colors cursor-pointer`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться на&nbsp;главную</span>
        </button>
        {eyebrow && (
          <div className={`mt-6 ${light ? 'text-[#8c4503]' : 'text-[#dec69a]'} text-[12px] font-medium tracking-[2px] uppercase`}>{eyebrow}</div>
        )}
        <h1 className={`mt-3 font-headline ${light ? 'text-[#020201]' : 'text-white'} text-[28px] sm:text-[36px] lg:text-[44px] font-medium leading-[1.15]`}>
          {title}
        </h1>
        {meta && <div className={`mt-5 ${light ? 'text-[#3c3836]' : 'text-white/75'} text-[15px] leading-[1.6]`}>{meta}</div>}
      </div>
    </div>

    <main className="flex-1 px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-[960px] mx-auto">{children}</div>
    </main>

    <Footer onNavigateAnchor={onNavigateAnchor} onOpenLegal={onOpenLegal} />
  </div>
);
