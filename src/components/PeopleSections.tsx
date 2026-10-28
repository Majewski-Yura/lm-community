import React, { useState } from 'react';
import { ChevronDown, HeartPulse, MessagesSquare, PiggyBank, Quote, Scale, UsersRound, type LucideIcon } from 'lucide-react';
import { ASSETS, CAN_DO, EXPERTS, PARTICIPANTS, TESTIMONIALS } from '../data/siteContent';
import { Avatar, Eyebrow, MobileSwiper } from './ui';

/** Сколько карточек показываем на телефоне до нажатия «Показать всех». На планшете и компьютере видны все. */
const MOBILE_VISIBLE = 6;

/** Иконки блока «Зачем сообщество» по порядку CAN_DO: сравнить опыт, сэкономить, защититься, кадры, выгорание. */
const CAN_DO_ICONS: LucideIcon[] = [MessagesSquare, PiggyBank, Scale, UsersRound, HeartPulse];

const mobileHidden = (index: number, expanded: boolean) => !expanded && index >= MOBILE_VISIBLE;

/** Фото автора отзыва берём из карточки участника с тем же именем. */
const participantPhoto = (name: string) => PARTICIPANTS.find((p) => p.name === name)?.photo;

const ShowAllButton: React.FC<{ onClick: () => void; tone: 'light' | 'white' }> = ({ onClick, tone }) => (
  <button
    type="button"
    onClick={onClick}
    className={`sm:hidden mt-4 w-full h-[52px] rounded-[12px] border inline-flex items-center justify-center gap-2 text-[14px] font-semibold text-[#020201] cursor-pointer ${
      tone === 'light' ? 'border-[#020201]/15 bg-white' : 'border-[#1a1612]/[0.12] bg-[#faf7f1]'
    }`}
  >
    Посмотреть ещё
    <ChevronDown className="w-4 h-4" />
  </button>
);

export const PeopleSections: React.FC = () => {
  const [allParticipants, setAllParticipants] = useState(false);

  return (
  <>
    {/* 5. УЧАСТНИКИ */}
    <section id="uchastniki" className="bg-[#eee6d7] py-12 sm:py-[72px] lg:py-[100px] scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
        <div className="max-w-[1240px] mx-auto">
          <Eyebrow line={ASSETS.lineGoldAmber} label="Участники" color="#d28802" />
          <h2 className="mt-4 font-headline text-[#020201] text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.1]">
            Среди Людей&nbsp;Медицины
          </h2>
          <p className="mt-2 text-[#d28802] text-[15px] sm:text-[17px] font-medium">
            (и&nbsp;это&nbsp;— лишь часть наших прекрасных участников!)
          </p>
          <p className="mt-4 max-w-[576px] text-[#3c3836] text-[14px] leading-[1.63]">
            Люди, которые каждый день принимают решения в&nbsp;медицине, управлении и&nbsp;развитии&nbsp;клиник
          </p>

          <div className="mt-7 sm:mt-10 lg:mt-[56px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {PARTICIPANTS.map((p, i) => (
              <article
                key={p.name + i}
                className={`rounded-[16px] bg-white p-5 items-start gap-4 ${mobileHidden(i, allParticipants) ? 'hidden sm:flex' : 'flex'} ${allParticipants && i >= MOBILE_VISIBLE ? 'lm-pop-in' : ''}`}
                style={allParticipants ? { animationDelay: `${(i - MOBILE_VISIBLE) * 60}ms` } : undefined}
              >
                <Avatar name={p.name} photo={p.photo} index={i} size={52} />
                <div>
                  <h3 className="font-headline text-[#020201] text-[16px] font-semibold leading-[1.3]">{p.name}</h3>
                  <p className="mt-1 text-[#3c3836] text-[13px] leading-[1.45]">{p.position}</p>
                </div>
              </article>
            ))}
          </div>
          {!allParticipants && (
            <ShowAllButton onClick={() => setAllParticipants(true)} tone="light" />
          )}
        </div>
      </div>
    </section>

    {/* 6. ОБРАТНАЯ СВЯЗЬ */}
    <section id="otzyvy" className="bg-[#3c3836] py-12 sm:py-[72px] lg:py-[100px] scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
        <div className="max-w-[1240px] mx-auto">
          <Eyebrow line={ASSETS.lineSand} label="Отзывы" color="#dec69a" />
          <h2 className="mt-4 font-headline text-white text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.1]">
            Обратная связь
          </h2>

          <MobileSwiper tone="dark" className="mt-7 sm:mt-10 lg:mt-[56px] sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <figure key={t.name} className="rounded-[16px] bg-white p-7 sm:p-9 flex flex-col justify-between">
                <div>
                  <Quote className="w-8 h-8 text-[#d28802]" />
                  <blockquote className="mt-4 font-headline text-[#020201] text-[18px] sm:text-[20px] font-medium leading-[1.45]">
                    «{t.quote}»
                  </blockquote>
                </div>
                <figcaption className="mt-7 pt-5 border-t border-[#1a1612]/10 flex items-center gap-4">
                  <Avatar name={t.name} photo={participantPhoto(t.name)} index={i + 1} size={48} />
                  <div>
                    <div className="text-[#020201] text-[15px] font-semibold">{t.name}</div>
                    <div className="text-[#8c4503] text-[12px] leading-[1.4] mt-0.5">{t.position}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </MobileSwiper>
        </div>
      </div>
    </section>

    {/* 7. ЧТО МОЖНО СДЕЛАТЬ В СООБЩЕСТВЕ */}
    <section id="zachem" className="bg-[#020201] py-12 sm:py-[72px] lg:py-[100px] scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
        <div className="max-w-[1240px] mx-auto">
          <Eyebrow line={ASSETS.lineSand} label="Зачем сообщество" color="#dec69a" />
          <h2 className="mt-4 font-headline text-white text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.1]">
            Что&nbsp;можно сделать в&nbsp;сообществе
          </h2>

          <MobileSwiper tone="dark" className="mt-7 sm:mt-10 lg:mt-[56px] sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {CAN_DO.map((item, i) => {
              const Icon = CAN_DO_ICONS[i];
              const accent = i === CAN_DO.length - 1;
              return (
              <article
                key={item.title}
                className={`rounded-[16px] p-7 sm:p-8 flex flex-col ${
                  i === CAN_DO.length - 1 ? 'bg-[#f9cd60] md:col-span-2 lg:col-span-1' : 'bg-white'
                }`}
              >
                <span className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${accent ? 'bg-[#020201]/[0.08]' : 'bg-[#eee6d7]'}`}>
                  <Icon className={`w-6 h-6 ${accent ? 'text-[#020201]/80' : 'text-[#d28802]'}`} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-headline text-[#020201] text-[20px] font-semibold leading-[1.3]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[#3c3836] text-[14px] leading-[1.6]">{item.text}</p>
              </article>
              );
            })}
          </MobileSwiper>
        </div>
      </div>
    </section>

    {/* 8. ЭКСПЕРТЫ */}
    <section id="eksperty" className="bg-white py-12 sm:py-[72px] lg:py-[100px] scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
        <div className="max-w-[1240px] mx-auto">
          <Eyebrow line={ASSETS.lineGoldAmber} label="Эксперты" color="#d28802" />
          <h2 className="mt-4 font-headline text-[#020201] text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.1]">
            Эксперты сообщества
          </h2>

          <MobileSwiper className="mt-7 sm:mt-10 lg:mt-[56px] sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {EXPERTS.map((ex, i) => (
              <article
                key={ex.name + i}
                className="rounded-[16px] border border-[#1a1612]/[0.08] bg-[#faf7f1] p-6 flex flex-col"
              >
                <Avatar name={ex.name} photo={ex.photo} index={i} size={72} />
                <h3 className="mt-5 font-headline text-[#020201] text-[18px] font-semibold leading-[1.3]">{ex.name}</h3>
                <p className="mt-2 text-[#3c3836] text-[13px] leading-[1.55]">{ex.position}</p>
              </article>
            ))}
          </MobileSwiper>

          <div className="mt-8 rounded-[16px] bg-[#f9cd60] p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-headline text-[#020201] text-[22px] sm:text-[26px] font-semibold">И&nbsp;многие&nbsp;другие!</span>
            <span className="text-[#020201] text-[15px] max-w-[460px]">
              Мы&nbsp;с&nbsp;радостью развиваем проявленность наших резидентов!
            </span>
          </div>
        </div>
      </div>
    </section>
  </>
  );
};
