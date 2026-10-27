import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitForm } from '../lib/submitForm';
import { ChoiceGroup, FieldLabel, FormError, Honeypot, Scale, SubmitButton, TextArea, TextInput } from './forms';
import { SubpageShell } from './SubpageShell';

// Анкета «Итоги месяца» — перенесена со страницы /anketa на Tilda, имена полей те же.

const ROLES = ['Тариф «Врач»', 'Тариф «Управленец»', 'Тариф «Собственник/CEO»'] as const;
const RESOURCES = [
  'Чат-бот сообщества',
  'Чаты сообщества',
  'Канал сообщества',
  'База знаний Zenclass',
  'Random Coffee (для тарифов Собственник/CEO и Управленец)',
] as const;

const Q = {
  role: 'Укажите ваш тариф',
  name: 'Укажите ваше имя и фамилию',
  recomendation: 'Готовы ли вы рекомендовать сообщество «Люди Медицины» своим знакомым?',
  benefit: 'Что полезного и ценного вы получили за месяц пребывания в сообществе?',
  recommendation: 'Что вы бы изменили, добавили, убрали в сообществе? Поделитесь своими идеями',
  resources: 'Какими ресурсами сообщества вы воспользовались?',
};

interface AnketaPageProps {
  onBackHome: () => void;
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

export const AnketaPage: React.FC<AnketaPageProps> = (props) => {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [benefit, setBenefit] = useState('');
  const [ideas, setIdeas] = useState('');
  const [resources, setResources] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const missing = [
    !role && 'тариф',
    score === null && 'оценку',
    !benefit.trim() && 'что вы получили за месяц',
    !ideas.trim() && 'идеи для сообщества',
    resources.length === 0 && 'ресурсы',
  ].filter(Boolean) as string[];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (missing.length) {
      setError(`Заполните, пожалуйста: ${missing.join(', ')}.`);
      return;
    }
    setSending(true);
    setError(null);
    try {
      await submitForm(
        'anketa',
        [
          { name: 'role', label: Q.role, value: role },
          { name: 'name', label: Q.name, value: name },
          { name: 'recomendation', label: Q.recomendation, value: String(score) },
          { name: 'benefit', label: Q.benefit, value: benefit },
          { name: 'recommendation', label: Q.recommendation, value: ideas },
          { name: 'resources', label: Q.resources, value: resources.join('; ') },
        ],
        honeypot
      );
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <SubpageShell eyebrow="Анкета" title="Спасибо за ответы!" {...props}>
        <div className="rounded-[20px] border border-[#dec69a]/25 bg-white/[0.03] p-6 sm:p-10 max-w-[640px]">
          <CheckCircle2 className="w-10 h-10 text-[#f9cd60]" />
          <p className="mt-5 text-white text-[17px] leading-[1.6]">
            Ваши ответы помогут сделать сообщество лучше.
          </p>
        </div>
      </SubpageShell>
    );
  }

  return (
    <SubpageShell
      eyebrow="Анкета"
      title="Итоги месяца в сообществе «Люди Медицины»"
      meta="Ваши ответы помогут сделать сообщество лучше, анкета займёт всего пару минут."
      {...props}
    >
      <form className="relative max-w-[720px] space-y-10" onSubmit={onSubmit} noValidate>
        <Honeypot value={honeypot} onChange={setHoneypot} />

        <fieldset>
          <legend className="sr-only">{Q.role}</legend>
          <FieldLabel>{Q.role}</FieldLabel>
          <ChoiceGroup name="role" options={ROLES} value={role} onChange={(v) => setRole(v as string)} />
        </fieldset>

        <div>
          <FieldLabel htmlFor="anketa-name">{Q.name}</FieldLabel>
          <TextInput id="anketa-name" name="name" autoComplete="name" maxLength={200} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <FieldLabel hint="Оцените от 0 до 10, где 0 — точно нет, 10 — обязательно!">{Q.recomendation}</FieldLabel>
          <Scale
            name="recomendation"
            label={Q.recomendation}
            min={0}
            max={10}
            value={score}
            onChange={setScore}
            minLabel="0 — точно нет"
            maxLabel="10 — обязательно!"
          />
        </div>

        <div>
          <FieldLabel htmlFor="anketa-benefit">{Q.benefit}</FieldLabel>
          <TextArea id="anketa-benefit" name="benefit" maxLength={3000} value={benefit} onChange={(e) => setBenefit(e.target.value)} />
        </div>

        <div>
          <FieldLabel htmlFor="anketa-ideas">{Q.recommendation}</FieldLabel>
          <TextArea id="anketa-ideas" name="recommendation" maxLength={3000} value={ideas} onChange={(e) => setIdeas(e.target.value)} />
        </div>

        <fieldset>
          <legend className="sr-only">{Q.resources}</legend>
          <FieldLabel hint="Можно выбрать несколько">{Q.resources}</FieldLabel>
          <ChoiceGroup name="resources" options={RESOURCES} value={resources} onChange={(v) => setResources(v as string[])} multiple />
        </fieldset>

        <div>
          <FormError message={error} />
          <div className="mt-6">
            <SubmitButton loading={sending}>Отправить ответ</SubmitButton>
          </div>
          <p className="mt-4 text-white/45 text-[12px] leading-[1.5]">
            Отправляя анкету, вы соглашаетесь с политикой конфиденциальности.
          </p>
        </div>
      </form>
    </SubpageShell>
  );
};
