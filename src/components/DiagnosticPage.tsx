import { withBase } from '../lib/base';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  DIAGNOSTIC_INSTRUCTION,
  DIAGNOSTIC_RESULT_URL,
  DIAGNOSTIC_STATUSES,
  DIAGNOSTIC_TITLE,
  type DiagnosticStatus,
} from '../data/diagnosticData';
import { submitForm, type FormField } from '../lib/submitForm';
import { ChoiceGroup, FieldLabel, FormError, Honeypot, Scale, SubmitButton, TextArea } from './forms';
import { SubpageShell } from './SubpageShell';

interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  initDataUnsafe?: { user?: { id?: number } };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

/**
 * Диагностика открывается в боте сообщества как мини-приложение Telegram.
 * Скрипт Telegram подключаем только на этой странице и берём из него ID участника (поле tg_id, как на Tilda).
 */
function useTelegramUser() {
  const [tgId, setTgId] = useState('');
  const [inTelegram, setInTelegram] = useState(false);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    script.onload = () => {
      const tg = window.Telegram?.WebApp;
      const id = tg?.initDataUnsafe?.user?.id;
      if (!tg || !id) return;
      tg.ready();
      setInTelegram(true);
      setTgId(String(id));
    };
    document.head.appendChild(script);
    return () => script.remove();
  }, []);
  return { tgId, inTelegram };
}

type Step = { kind: 'cover' } | { kind: 'status' } | { kind: 'block'; index: number } | { kind: 'open' } | { kind: 'done' };

interface DiagnosticPageProps {
  onBackHome: () => void;
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

export const DiagnosticPage: React.FC<DiagnosticPageProps> = (props) => {
  const { tgId, inTelegram } = useTelegramUser();
  const [step, setStep] = useState<Step>({ kind: 'cover' });
  const [statusLabel, setStatusLabel] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status: DiagnosticStatus | undefined = DIAGNOSTIC_STATUSES.find((s) => s.label === statusLabel);

  // Экраны после выбора статуса: блоки вопросов и (у управленцев) открытые вопросы.
  const totalScreens = status ? status.blocks.length + (status.openQuestions ? 1 : 0) : 0;
  const screenNumber = step.kind === 'block' ? step.index + 1 : step.kind === 'open' ? totalScreens : 0;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const isLastBlock = (index: number) => status !== undefined && index === status.blocks.length - 1;

  const fields = useMemo<FormField[]>(() => {
    if (!status) return [];
    const list: FormField[] = [{ name: 'status', label: 'Статус участия', value: status.label }];
    if (tgId) list.push({ name: 'tg_id', label: 'Telegram ID', value: tgId });
    status.blocks.forEach((block, bi) =>
      block.questions.forEach((q) =>
        list.push({ name: q.name, label: `Блок ${bi + 1}. ${block.title}: ${q.text}`, value: String(scores[q.name] ?? '') })
      )
    );
    status.openQuestions?.forEach((q) => list.push({ name: q.name, label: q.text, value: openAnswers[q.name] ?? '' }));
    return list;
  }, [status, tgId, scores, openAnswers]);

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      await submitForm('diagnostic', fields, honeypot);
      setStep({ kind: 'done' });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const next = () => {
    if (!status) return;
    if (step.kind === 'status') return setStep({ kind: 'block', index: 0 });
    if (step.kind === 'block') {
      if (!isLastBlock(step.index)) return setStep({ kind: 'block', index: step.index + 1 });
      if (status.openQuestions) return setStep({ kind: 'open' });
      return void send();
    }
    if (step.kind === 'open') return void send();
  };

  const back = () => {
    if (step.kind === 'block') setStep(step.index === 0 ? { kind: 'status' } : { kind: 'block', index: step.index - 1 });
    else if (step.kind === 'open' && status) setStep({ kind: 'block', index: status.blocks.length - 1 });
    else if (step.kind === 'status') setStep({ kind: 'cover' });
  };

  const canContinue =
    step.kind === 'status'
      ? Boolean(status)
      : step.kind === 'block' && status
        ? status.blocks[step.index].questions.every((q) => scores[q.name])
        : step.kind === 'open' && status?.openQuestions
          ? status.openQuestions.every((q) => (openAnswers[q.name] ?? '').trim())
          : false;

  const willSubmit =
    (step.kind === 'block' && isLastBlock(step.index) && !status?.openQuestions) || step.kind === 'open';

  if (step.kind === 'cover') {
    return (
      <SubpageShell eyebrow="Диагностика" title={DIAGNOSTIC_TITLE} {...props}>
        <div className="relative overflow-hidden rounded-[20px] border border-[#dec69a]/25">
          <img
            src={withBase('/images/diagnostic-cover.webp')}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020201] via-[#020201]/80 to-transparent" />
          <div className="relative p-6 sm:p-10 lg:p-12 max-w-[560px]">
            <p className="font-headline text-white text-[20px] sm:text-[24px] font-medium leading-[1.35]">
              Помогает определить, что мешает двигаться дальше, и отследить изменения.
            </p>
            <p className="mt-4 text-[#dec69a] text-[15px] leading-[1.6]">
              Выберите свой статус в сообществе и оцените утверждения по шкале от 1 до 5 — результат придёт в бот
              сообщества.
            </p>
            <button
              type="button"
              onClick={() => setStep({ kind: 'status' })}
              className="mt-8 inline-flex items-center gap-2 rounded-[4px] bg-[#f9cd60] hover:bg-white text-[#020201] px-8 h-[52px] text-[14px] font-bold tracking-[1.4px] uppercase transition-colors cursor-pointer"
            >
              Начать диагностику
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </SubpageShell>
    );
  }

  if (step.kind === 'done') {
    return (
      <SubpageShell eyebrow="Диагностика" title="Спасибо, ответы отправлены!" {...props}>
        <div className="rounded-[20px] border border-[#dec69a]/25 bg-white/[0.03] p-6 sm:p-10 max-w-[640px]">
          <CheckCircle2 className="w-10 h-10 text-[#f9cd60]" />
          {inTelegram ? (
            <>
              <p className="mt-5 text-white text-[17px] leading-[1.6]">
                Теперь закройте мини-приложение, чтобы увидеть результат вашей диагностики в боте.
              </p>
              <button
                type="button"
                onClick={() => window.Telegram?.WebApp?.close()}
                className="mt-8 inline-flex items-center justify-center rounded-[4px] bg-[#f9cd60] hover:bg-white text-[#020201] px-8 h-[52px] text-[14px] font-bold tracking-[1.4px] uppercase transition-colors cursor-pointer"
              >
                Закрыть и вернуться в бот
              </button>
            </>
          ) : (
            <>
              <p className="mt-5 text-white text-[17px] leading-[1.6]">
                Результат диагностики пришлёт бот сообщества «Люди Медицины».
              </p>
              <a
                href={DIAGNOSTIC_RESULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center rounded-[4px] bg-[#f9cd60] hover:bg-white text-[#020201] px-8 h-[52px] text-[14px] font-bold tracking-[1.4px] uppercase transition-colors"
              >
                Открыть бот
              </a>
            </>
          )}
        </div>
      </SubpageShell>
    );
  }

  const block = step.kind === 'block' && status ? status.blocks[step.index] : null;

  return (
    <SubpageShell eyebrow="Диагностика" title={DIAGNOSTIC_TITLE} {...props}>
      <form
        className="relative max-w-[720px]"
        onSubmit={(e) => {
          e.preventDefault();
          if (canContinue && !sending) next();
        }}
      >
        <Honeypot value={honeypot} onChange={setHoneypot} />

        {status && screenNumber > 0 && (
          <div className="mb-8">
            <div className="flex justify-between text-[12px] text-white/55 uppercase tracking-[1.5px]">
              <span>{status.label}</span>
              <span>
                Шаг {screenNumber} из {totalScreens}
              </span>
            </div>
            <div className="mt-2 h-[3px] rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[#dec69a] transition-[width] duration-300" style={{ width: `${(screenNumber / totalScreens) * 100}%` }} />
            </div>
          </div>
        )}

        {step.kind === 'status' && (
          <fieldset>
            <legend className="sr-only">Статус участия</legend>
            <FieldLabel>Выберите ваш статус участия в сообществе «Люди Медицины»</FieldLabel>
            <ChoiceGroup
              name="status"
              options={DIAGNOSTIC_STATUSES.map((s) => s.label)}
              value={statusLabel}
              onChange={(v) => setStatusLabel(v as string)}
            />
          </fieldset>
        )}

        {block && step.kind === 'block' && status && (
          <fieldset>
            <legend className="font-headline text-[#f9cd60] text-[22px] sm:text-[26px] font-medium leading-[1.3]">
              Блок {step.index + 1}/{status.blocks.length}. {block.title}
            </legend>
            <p className="mt-3 text-white/70 text-[14px] leading-[1.6]">{DIAGNOSTIC_INSTRUCTION}</p>
            <div className="mt-8 space-y-8">
              {block.questions.map((q) => (
                <div key={q.name}>
                  <FieldLabel>{q.text}</FieldLabel>
                  <Scale
                    name={q.name}
                    label={q.text}
                    min={1}
                    max={5}
                    value={scores[q.name] ?? null}
                    onChange={(v) => setScores((prev) => ({ ...prev, [q.name]: v }))}
                    minLabel="1 — совсем не соответствует"
                    maxLabel="5 — полностью соответствует"
                  />
                </div>
              ))}
            </div>
          </fieldset>
        )}

        {step.kind === 'open' && status?.openQuestions && (
          <fieldset className="space-y-8">
            <legend className="font-headline text-[#f9cd60] text-[22px] sm:text-[26px] font-medium leading-[1.3]">
              Несколько вопросов о ваших задачах
            </legend>
            {status.openQuestions.map((q) => (
              <div key={q.name}>
                <FieldLabel htmlFor={q.name}>{q.text}</FieldLabel>
                <TextArea
                  id={q.name}
                  name={q.name}
                  required
                  maxLength={3000}
                  value={openAnswers[q.name] ?? ''}
                  onChange={(e) => setOpenAnswers((prev) => ({ ...prev, [q.name]: e.target.value }))}
                />
              </div>
            ))}
          </fieldset>
        )}

        <FormError message={error} />

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <SubmitButton loading={sending} disabled={!canContinue}>
            {willSubmit ? 'Отправить' : 'Продолжить'}
          </SubmitButton>
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-2 text-[#dec69a] hover:text-white text-[14px] font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
        </div>
      </form>
    </SubpageShell>
  );
};
