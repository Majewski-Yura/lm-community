import React from 'react';
import { HeroIntro } from './HeroIntro';
import { PeopleSections } from './PeopleSections';
import { CalendarSection } from './CalendarSection';
import { CommunitySections } from './CommunitySections';
import { ClosingSections } from './ClosingSections';
import { Footer } from './Footer';
import { useScrollReveal } from '../lib/scrollReveal';

interface HomePageProps {
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

/** Главная страница сообщества: все секции + футер. */
export const HomePage: React.FC<HomePageProps> = ({ onNavigateAnchor, onOpenLegal }) => {
  useScrollReveal();

  return (
  <>
    <main>
      <HeroIntro onNavigateAnchor={onNavigateAnchor} />
      <PeopleSections />
      <CalendarSection onNavigateAnchor={onNavigateAnchor} />
      <CommunitySections />
      <ClosingSections onNavigateAnchor={onNavigateAnchor} onOpenLegal={onOpenLegal} />
    </main>
    <Footer onNavigateAnchor={onNavigateAnchor} onOpenLegal={onOpenLegal} />
  </>
  );
};
