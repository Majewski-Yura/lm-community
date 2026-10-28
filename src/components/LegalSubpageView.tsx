import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { LEGAL_DOCS } from '../data/legalPagesData';
import { Footer } from './Footer';

interface LegalSubpageViewProps {
  slug: string;
  onBackHome: () => void;
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

export const LegalSubpageView: React.FC<LegalSubpageViewProps> = ({
  slug,
  onBackHome,
  onNavigateAnchor,
  onOpenLegal,
}) => {
  const doc = LEGAL_DOCS[slug];

  if (!doc) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-[#020201]">
      {/* Dark Hero Header Band matching Tilda Legal Pages */}
      <div className="bg-[#020201] pt-[108px] pb-[56px] px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto">
          <button
            type="button"
            data-lm-home=""
              onClick={onBackHome}
            className="inline-flex items-center gap-2 text-[#dec69a] hover:text-white text-[13px] font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться на&nbsp;главную</span>
          </button>

          {doc.blocks[0] && doc.blocks[0].startsWith('Дата') && (
            <div className="mt-6 text-[#dec69a] text-[12px] font-medium tracking-[2px] uppercase">
              {doc.blocks[0]}
            </div>
          )}

          <h1 className="mt-3 font-headline text-[#ffffff] text-[26px] sm:text-[34px] lg:text-[40px] font-medium leading-[1.18]">
            {doc.blocks[0]?.startsWith('Дата') ? doc.blocks[1] : doc.blocks[0]}
          </h1>
        </div>
      </div>

      {/* Main Document Body */}
      <main className="flex-1 bg-[#ffffff] py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto space-y-4">
          {doc.blocks
            .slice(doc.blocks[0]?.startsWith('Дата') ? 2 : 1)
            .map((line, index) => {
              const isSectionHeading =
                /^(\d+\.\s+|Часть\s+\d+|Реквизиты|Приложение)/.test(line) &&
                line.length < 110;

              if (isSectionHeading) {
                return (
                  <h2
                    key={index}
                    className="pt-5 font-headline text-[#020201] text-[20px] sm:text-[22px] font-semibold leading-[1.35]"
                  >
                    {line}
                  </h2>
                );
              }

              return (
                <p
                  key={index}
                  className="text-[#1a1612] text-[14px] sm:text-[15px] font-normal leading-[1.65]"
                >
                  {line}
                </p>
              );
            })}

          <div className="pt-10 border-t border-black/10">
            <button
              type="button"
              data-lm-home=""
              onClick={onBackHome}
              className="inline-flex items-center gap-2 rounded-[4px] bg-[#020201] hover:bg-[#d28802] text-white px-6 py-3 text-[12px] font-semibold uppercase tracking-[1px] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>На&nbsp;главную страницу сообщества</span>
            </button>
          </div>
        </div>
      </main>

      <Footer onNavigateAnchor={onNavigateAnchor} onOpenLegal={onOpenLegal} />
    </div>
  );
};
