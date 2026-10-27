import { BASE } from '../lib/base';
import React, { useState } from 'react';
import { CalendarDays, CheckCircle2, MapPin } from 'lucide-react';
import { EVENT_PAGES } from '../data/eventPages';
import { submitForm } from '../lib/submitForm';
import { ChoiceGroup, FieldLabel, FormError, Honeypot, SubmitButton, TextInput } from './forms';
import { SubpageShell } from './SubpageShell';

const MESSENGERS = ['Telegram', 'WhatsApp'] as const;

interface EventPageViewProps {
  slug: string;
  onBackHome: () => void;
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

/** Страница события: описание и форма записи (если запись открыта). */
export const EventPageView: React.FC<EventPageViewProps> = ({ slug, ...props }) => {
  const event = EVENT_PAGES[slug];
  const [name, setName] = useState('');
  const [messenger, setMessenger] = useState<string>('Telegram');
  const [contact, setContact] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!event) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      setError('Укажите, пожалуйста, имя и\u00A0контакт для\u00A0связи.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await submitForm(
        'event',
        [
          { name: 'event', label: 'Событие', value: `${event.title}, ${event.when}` },
          { name: 'name', label: 'Имя и\u00A0фамилия', value: name },
          { name: 'messenger-type', label: 'Способ связи', value: messenger },
          { name: 'messenger-id', label: messenger === 'Telegram' ? 'Ник в\u00A0Telegram' : 'Номер WhatsApp', value: contact },
        ],
        honeypot
      );
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <SubpageShell
      eyebrow={event.kind}
      title={event.title}
      meta={
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 text-[#dec69a]">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> {event.when}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {event.where}
          </span>
        </div>
      }
      {...props}
    >
      <p className="max-w-[720px] font-headline text-white text-[19px] sm:text-[22px] font-medium leading-[1.45]">{event.about}</p>

      {event.registration === 'closed' ? (
        <div className="mt-10 max-w-[720px] rounded-[16px] border border-white/15 bg-white/[0.03] p-6 sm:p-8">
          <p className="font-headline text-[#f9cd60] text-[20px] font-medium">Регистрация закрыта</p>
          <p className="mt-2 text-white/75 text-[15px] leading-[1.6]">
            Следите за&nbsp;следующими анонсами&nbsp;— все&nbsp;встречи сообщества собраны в&nbsp;календаре.
          </p>
          <a
            href={`${BASE}#kalendar`}
            onClick={(e) => {
              e.preventDefault();
              props.onNavigateAnchor('#kalendar');
            }}
            className="mt-6 inline-flex items-center justify-center rounded-[4px] bg-[#f9cd60] hover:bg-white text-[#020201] px-8 h-[52px] text-[14px] font-bold tracking-[1.4px] uppercase transition-colors"
          >
            Календарь мероприятий
          </a>
        </div>
      ) : done ? (
        <div className="mt-10 max-w-[720px] rounded-[16px] border border-[#dec69a]/25 bg-white/[0.03] p-6 sm:p-8">
          <CheckCircle2 className="w-9 h-9 text-[#f9cd60]" />
          <p className="mt-4 text-white text-[17px] leading-[1.6]">
            Заявка отправлена! Наш коммьюнити-менеджер свяжется с&nbsp;вами, чтобы подтвердить участие.
          </p>
        </div>
      ) : (
        <form className="relative mt-10 max-w-[720px] space-y-8" onSubmit={onSubmit} noValidate>
          <Honeypot value={honeypot} onChange={setHoneypot} />
          <p className="text-white/75 text-[15px] leading-[1.6]">
            Чтобы записаться, заполните короткую анкету. Наш коммьюнити-менеджер свяжется с&nbsp;вами, чтобы подтвердить участие.
          </p>
          <div>
            <FieldLabel htmlFor="event-name">Укажите ваше имя и&nbsp;фамилию</FieldLabel>
            <TextInput id="event-name" name="name" autoComplete="name" maxLength={200} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <fieldset>
            <legend className="sr-only">Способ связи</legend>
            <FieldLabel hint="Для&nbsp;Telegram обязательно укажите&nbsp;ник">Выберите удобный способ&nbsp;связи</FieldLabel>
            <ChoiceGroup name="messenger-type" options={MESSENGERS} value={messenger} onChange={(v) => setMessenger(v as string)} />
            <TextInput
              className="mt-3"
              aria-label={messenger === 'Telegram' ? 'Ник в\u00A0Telegram' : 'Номер WhatsApp'}
              placeholder={messenger === 'Telegram' ? '@ник' : '+7 900 000-00-00'}
              maxLength={100}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </fieldset>
          <div>
            <FormError message={error} />
            <div className="mt-6">
              <SubmitButton loading={sending}>Зарегистрироваться</SubmitButton>
            </div>
            <p className="mt-4 text-white/45 text-[12px] leading-[1.5]">
              Оставляя заявку, вы&nbsp;соглашаетесь с&nbsp;политикой конфиденциальности.
            </p>
          </div>
        </form>
      )}
    </SubpageShell>
  );
};
