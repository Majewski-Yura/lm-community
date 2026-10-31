import { BASE } from '../lib/base';
import React, { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { EVENT_PAGES } from '../data/eventPages';
import { submitForm } from '../lib/submitForm';
import { Footer } from './Footer';
import { Honeypot } from './forms';

const MESSENGERS = ['Telegram', 'WhatsApp'] as const;

interface EventPageViewProps {
  slug: string;
  onBackHome: () => void;
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

// Поля формы — как на Tilda: светло-серые, без скруглений, высотой 50 px
const fieldClass =
  'w-full h-[50px] bg-[#f0f0f0] px-4 text-[#020201] text-[15px] placeholder:text-[#020201]/40 outline-none focus:ring-2 focus:ring-[#8c4503]/40';

/** Значок WhatsApp: в lucide его нет. */
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1 0-.3-.1-.5-.2Z" />
  </svg>
);

/** Затемнение фото: процент из админки (по умолчанию 75), сверху на 15 пунктов сильнее. */
function overlay(dim?: number): string {
  const d = Math.min(95, Math.max(0, Number.isFinite(dim) ? Number(dim) : 75)) / 100;
  return `linear-gradient(to bottom, rgba(0,0,0,${Math.min(0.95, d + 0.15).toFixed(2)}), rgba(0,0,0,${d.toFixed(2)}))`;
}

/**
 * Страница события в вёрстке Tilda: экран с затемнённым фото, слева дата, место и заголовок,
 * справа бежевая карточка с формой записи (если запись открыта).
 */
export const EventPageView: React.FC<EventPageViewProps> = ({ slug, onNavigateAnchor, onOpenLegal }) => {
  const event = EVENT_PAGES[slug];
  const [name, setName] = useState('');
  const [messenger, setMessenger] = useState<string>('Telegram');
  const [contact, setContact] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!event) return null;
  const open = event.registration === 'open';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      setError('Укажите, пожалуйста, имя и контакт для связи.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await submitForm(
        'event',
        [
          { name: 'event', label: 'Событие', value: `${event.title}, ${event.when}` },
          { name: 'name', label: 'Имя и фамилия', value: name },
          { name: 'messenger-type', label: 'Способ связи', value: messenger },
          { name: 'messenger-id', label: messenger === 'Telegram' ? 'Ник в Telegram' : 'Номер WhatsApp', value: contact },
        ],
        honeypot,
      );
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020201]">
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        {event.cover && (
          <img src={event.cover} alt="" aria-hidden="true" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Затемнение настраивается в админке; сверху чуть сильнее, как на Tilda */}
        <div aria-hidden="true" className="absolute inset-0" style={{ background: overlay(event.dim) }} />

        <div
          className={`relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-5 pt-[104px] pb-12 sm:pb-16 flex flex-col gap-10 ${
            open ? 'lg:flex-row lg:items-center lg:justify-between' : 'items-center text-center'
          }`}
        >
          <div className={open ? 'max-w-[700px]' : 'max-w-[860px]'}>
            <p className="text-white text-[12px] sm:text-[14px] font-semibold tracking-[2.5px] leading-[1.5]">
              {event.when}, {event.where}
            </p>
            <h1 className="mt-5 sm:mt-6 font-headline text-white text-[38px] sm:text-[56px] lg:text-[72px] font-semibold leading-[1.15]">
              {event.title}
            </h1>
            {event.about && <p className="mt-5 sm:mt-7 text-white/90 text-[16px] sm:text-[18px] leading-[1.7]">{event.about}</p>}
            {open ? (
              <p className="mt-4 text-white/90 text-[16px] sm:text-[18px] leading-[1.7]">
                Чтобы записаться, заполните короткую анкету. Наш коммьюнити-менеджер свяжется с&nbsp;вами, чтобы подтвердить участие.
              </p>
            ) : (
              <>
                <p className="mt-5 text-white text-[17px] sm:text-[20px] leading-[1.6]">Регистрация закрыта, следите за&nbsp;следующими анонсами!</p>
                <a
                  href={`${BASE}#kalendar`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateAnchor('#kalendar');
                  }}
                  className="mt-8 inline-flex items-center justify-center bg-[#f9cd60] hover:bg-white text-[#020201] px-8 h-[50px] text-[13px] font-bold tracking-[1.2px] uppercase transition-colors"
                >
                  Календарь мероприятий
                </a>
              </>
            )}
          </div>

          {open && (
            <div className="w-full lg:w-[360px] shrink-0 bg-[#eee6d7] p-6 sm:p-[34px]">
              {done ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="mx-auto w-10 h-10 text-[#8c4503]" />
                  <p className="mt-4 text-[#020201] text-[17px] leading-[1.55]">
                    Заявка отправлена! Наш коммьюнити-менеджер свяжется с&nbsp;вами, чтобы подтвердить участие.
                  </p>
                </div>
              ) : (
                <form className="relative space-y-5" onSubmit={onSubmit} noValidate>
                  <Honeypot value={honeypot} onChange={setHoneypot} />
                  <div>
                    <label htmlFor="event-name" className="block text-[#020201] text-[16px] leading-[1.5] mb-2">
                      Укажите ваше имя и&nbsp;фамилию
                    </label>
                    <input
                      id="event-name"
                      name="name"
                      autoComplete="name"
                      maxLength={200}
                      placeholder="Иван Петров"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <fieldset>
                    <legend className="text-[#020201] text-[16px] leading-[1.5] mb-2">
                      Выберите удобный способ связи (для&nbsp;Telegram обязательно укажите&nbsp;ник)
                    </legend>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {MESSENGERS.map((m) => {
                        const active = messenger === m;
                        return (
                          <label
                            key={m}
                            className={`inline-flex items-center gap-1.5 h-[34px] px-3 text-[14px] cursor-pointer border transition-colors ${
                              active ? 'bg-white border-[#020201]/40 text-[#020201]' : 'border-transparent text-[#020201]/75 hover:text-[#020201]'
                            }`}
                          >
                            <input type="radio" name="messenger-type" value={m} checked={active} onChange={() => setMessenger(m)} className="sr-only" />
                            {m === 'Telegram' ? <Send className="w-4 h-4 text-[#229ED9]" /> : <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />}
                            {m}
                          </label>
                        );
                      })}
                    </div>
                    <input
                      aria-label={messenger === 'Telegram' ? 'Ник в Telegram' : 'Номер WhatsApp'}
                      placeholder={messenger === 'Telegram' ? 'Имя пользователя или телефон' : '+7 900 000-00-00'}
                      maxLength={100}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className={fieldClass}
                    />
                  </fieldset>
                  {error && <p className="text-[#b3261e] text-[14px] leading-[1.45]">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full h-[50px] bg-[#8c4503] hover:bg-[#6f3602] disabled:opacity-70 text-white text-[15px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Зарегистрироваться
                  </button>
                  <p className="text-[#020201]/80 text-[13px] leading-[1.5]">
                    Оставляя заявку, вы&nbsp;соглашаетесь с&nbsp;
                    <a
                      href={`${BASE}privacy-policy`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenLegal('privacy-policy');
                      }}
                      className="underline underline-offset-2 text-[#8c4503]"
                    >
                      политикой конфиденциальности
                    </a>
                    .
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer onNavigateAnchor={onNavigateAnchor} onOpenLegal={onOpenLegal} />
    </div>
  );
};
