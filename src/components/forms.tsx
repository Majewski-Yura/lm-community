import React from 'react';
import { Loader2 } from 'lucide-react';

// Поля форм в стиле сайта: тёмный фон, золотые акценты. Используются в диагностике, анкете и записи на события.

export const FieldLabel: React.FC<{ htmlFor?: string; children: React.ReactNode; hint?: string }> = ({
  htmlFor,
  children,
  hint,
}) => (
  <div className="mb-3">
    <label htmlFor={htmlFor} className="block font-headline text-white text-[17px] sm:text-[19px] font-medium leading-[1.4]">
      {children}
    </label>
    {hint && <p className="mt-1 text-[#dec69a]/80 text-[13px] leading-[1.5]">{hint}</p>}
  </div>
);

const inputClass =
  'w-full rounded-[8px] border border-white/15 bg-white/[0.04] px-4 text-white text-[15px] placeholder:text-white/35 focus:outline-none focus:border-[#dec69a] focus:ring-1 focus:ring-[#dec69a] transition-colors';

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`${inputClass} h-[52px] ${props.className ?? ''}`} />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea rows={4} {...props} className={`${inputClass} py-3 leading-[1.5] resize-y ${props.className ?? ''}`} />
);

interface ChoiceGroupProps {
  name: string;
  options: readonly string[];
  /** Для одиночного выбора — строка, для множественного — массив. */
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}

export const ChoiceGroup: React.FC<ChoiceGroupProps> = ({ name, options, value, onChange, multiple = false }) => {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const toggle = (option: string) => {
    if (!multiple) return onChange(option);
    onChange(selected.includes(option) ? selected.filter((v) => v !== option) : [...selected, option]);
  };
  return (
    <div role={multiple ? 'group' : 'radiogroup'} className="grid gap-2.5">
      {options.map((option) => {
        const checked = selected.includes(option);
        return (
          <label
            key={option}
            className={`flex items-center gap-3 rounded-[8px] border px-4 py-3.5 cursor-pointer transition-colors ${
              checked ? 'border-[#dec69a] bg-[#dec69a]/10' : 'border-white/15 hover:border-white/35'
            }`}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={option}
              checked={checked}
              onChange={() => toggle(option)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={`shrink-0 w-5 h-5 border flex items-center justify-center ${multiple ? 'rounded-[4px]' : 'rounded-full'} ${
                checked ? 'border-[#f9cd60] bg-[#f9cd60]' : 'border-white/40'
              }`}
            >
              {checked && <span className={`bg-[#020201] ${multiple ? 'w-2.5 h-2.5 rounded-[2px]' : 'w-2 h-2 rounded-full'}`} />}
            </span>
            <span className="text-white text-[15px] leading-[1.4]">{option}</span>
          </label>
        );
      })}
    </div>
  );
};

interface ScaleProps {
  name: string;
  min: number;
  max: number;
  value: number | null;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
  /** Подпись для экранных читалок. */
  label: string;
}

/** Шкала оценок кнопками (1–5 в диагностике, 0–10 в анкете). */
export const Scale: React.FC<ScaleProps> = ({ name, min, max, value, onChange, minLabel, maxLabel, label }) => {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <div role="radiogroup" aria-label={label} className="flex gap-1.5 sm:gap-2">
        {values.map((v) => (
          <label
            key={v}
            className={`flex-1 min-w-0 h-[48px] rounded-[8px] border flex items-center justify-center text-[15px] font-semibold cursor-pointer transition-colors ${
              value === v
                ? 'border-[#f9cd60] bg-[#f9cd60] text-[#020201]'
                : 'border-white/15 text-white hover:border-[#dec69a]'
            }`}
          >
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only" />
            {v}
          </label>
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-4 text-[12px] text-white/55 leading-[1.4]">
        <span>{minLabel}</span>
        <span className="text-right">{maxLabel}</span>
      </div>
    </div>
  );
};

/** Скрытое поле-ловушка для ботов: человек его не видит. */
export const Honeypot: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
    <label>
      Не заполняйте это поле
      <input tabIndex={-1} autoComplete="off" name="website" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  </div>
);

export const SubmitButton: React.FC<{ loading: boolean; children: React.ReactNode; disabled?: boolean }> = ({
  loading,
  children,
  disabled,
}) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-[#f9cd60] hover:bg-white disabled:opacity-50 disabled:hover:bg-[#f9cd60] text-[#020201] px-9 h-[52px] min-w-[240px] text-[14px] font-bold tracking-[1.4px] uppercase transition-colors cursor-pointer disabled:cursor-not-allowed"
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

export const FormError: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <p role="alert" className="mt-4 rounded-[8px] border border-[#e46a5a]/50 bg-[#e46a5a]/10 px-4 py-3 text-[#ffb4a8] text-[14px] leading-[1.5]">
      {message}
    </p>
  ) : null;
