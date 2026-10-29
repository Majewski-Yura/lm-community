import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ImagePlus, Loader2, Plus, Trash2, Video, X } from 'lucide-react';
import { api } from './api';
import { prepareImage, type ImageKind } from './image';
import type { Field } from './schema';
import { videoEmbed } from '../lib/video';

type Obj = Record<string, unknown>;

/** Значение по пути «social.href». */
export function getPath(obj: Obj, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Obj)[key] : undefined), obj);
}

export function setPath(obj: Obj, path: string, value: unknown): Obj {
  const [key, ...rest] = path.split('.');
  if (rest.length === 0) return { ...obj, [key]: value };
  return { ...obj, [key]: setPath((obj[key] as Obj) ?? {}, rest.join('.'), value) };
}

/** Картинки из админки показываем с учётом подпапки сайта. */
const src = (path: string) => (path.startsWith('/') ? `${import.meta.env.BASE_URL}${path.slice(1)}` : path);

const inputClass =
  'w-full rounded-[10px] border border-[#1d1b19]/15 bg-white px-3 py-2 text-[15px] leading-[1.45] outline-none focus:border-[#c98a35] focus:ring-2 focus:ring-[#c98a35]/20';

function Label({ field }: { field: Field }) {
  return (
    <div className="mb-1.5">
      <div className="text-[13px] font-semibold text-[#1d1b19]">{field.label}</div>
      {field.help && <div className="text-[12px] text-[#1d1b19]/55 leading-[1.4] mt-0.5">{field.help}</div>}
    </div>
  );
}

export function ImageInput({ value, kind, onChange }: { value: string; kind: ImageKind; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      const { blob, name } = await prepareImage(file, kind);
      onChange(await api.upload(blob, name));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const shape = kind === 'avatar' ? 'w-24 h-24' : kind === 'card' ? 'w-48 aspect-[16/10]' : 'w-56 aspect-[3/2]';
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
      }}
      className="flex items-start gap-4"
    >
      <div className={`${shape} shrink-0 overflow-hidden rounded-[10px] bg-[#1d1b19]/[0.06] flex items-center justify-center`}>
        {value ? <img src={src(value)} alt="" className={`w-full h-full ${kind === 'photo' ? 'object-contain' : 'object-cover'}`} /> : <ImagePlus className="w-6 h-6 text-[#1d1b19]/30" />}
      </div>
      <div className="flex flex-col gap-2">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-[10px] bg-[#1d1b19] text-white px-3.5 py-2 text-[13px] font-semibold disabled:opacity-60 cursor-pointer"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {busy ? 'Загружаю…' : value ? 'Заменить фото' : 'Загрузить фото'}
        </button>
        {value && !busy && (
          <button type="button" onClick={() => onChange('')} className="self-start text-[12px] text-[#b3261e] cursor-pointer">
            Убрать фото
          </button>
        )}
        <div className="text-[12px] text-[#1d1b19]/45">Можно перетащить файл сюда</div>
        {error && <div className="text-[12px] text-[#b3261e]">{error}</div>}
      </div>
    </div>
  );
}

function StringsInput({ value, onChange, itemLabel, multiline }: { value: string[]; onChange: (v: string[]) => void; itemLabel: string; multiline?: boolean }) {
  const items = Array.isArray(value) ? value : [];
  const update = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5">
          {multiline ? (
            <textarea rows={2} value={item} placeholder={itemLabel} onChange={(e) => update(i, e.target.value)} className={inputClass} />
          ) : (
            <input value={item} placeholder={itemLabel} onChange={(e) => update(i, e.target.value)} className={inputClass} />
          )}
          <IconButton title="Выше" disabled={i === 0} onClick={() => move(i, -1)} icon={<ArrowUp className="w-4 h-4" />} />
          <IconButton title="Ниже" disabled={i === items.length - 1} onClick={() => move(i, 1)} icon={<ArrowDown className="w-4 h-4" />} />
          <IconButton title="Удалить" onClick={() => onChange(items.filter((_, j) => j !== i))} icon={<X className="w-4 h-4" />} danger />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#9a6418] cursor-pointer">
        <Plus className="w-4 h-4" /> Добавить
      </button>
    </div>
  );
}

function IconButton({ icon, onClick, title, disabled, danger }: { icon: React.ReactNode; onClick: () => void; title: string; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center border border-[#1d1b19]/10 bg-white disabled:opacity-30 cursor-pointer ${danger ? 'text-[#b3261e]' : 'text-[#1d1b19]/70'}`}
    >
      {icon}
    </button>
  );
}

/** Текст записи блога: абзацы, подзаголовки, фото и видео прямо в тексте. */
function MarkdownInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const addVideo = () => {
    const video = videoEmbed(videoUrl);
    if (!video) {
      setError('Не получилось распознать ссылку. Подходят ролики с RuTube, VK Видео и YouTube — скопируйте ссылку из адресной строки или кнопки «Поделиться».');
      return;
    }
    setError('');
    insert(`@[Подпись к видео](${videoUrl.trim()})`);
    setVideoUrl('');
    setVideoOpen(false);
  };

  const insert = (snippet: string) => {
    const el = ref.current;
    const pos = el ? el.selectionStart : value.length;
    const before = value.slice(0, pos);
    const after = value.slice(pos);
    const glueBefore = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
    onChange(`${before}${glueBefore}${snippet}\n\n${after.replace(/^\n+/, '')}`);
  };

  const addPhoto = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      const { blob, name } = await prepareImage(file, 'photo');
      const path = await api.upload(blob, name);
      insert(`![Подпись к фото](${path})`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        <button type="button" onClick={() => insert('## Подзаголовок')} className="rounded-[8px] border border-[#1d1b19]/15 bg-white px-3 py-1.5 text-[13px] cursor-pointer">
          Подзаголовок
        </button>
        <button type="button" onClick={() => insert('- Пункт списка\n- Ещё пункт')} className="rounded-[8px] border border-[#1d1b19]/15 bg-white px-3 py-1.5 text-[13px] cursor-pointer">
          Список
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="hidden" onChange={(e) => e.target.files?.[0] && addPhoto(e.target.files[0])} />
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#1d1b19] text-white px-3 py-1.5 text-[13px] disabled:opacity-60 cursor-pointer">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} Фото в текст
        </button>
        <button type="button" onClick={() => setVideoOpen((v) => !v)} className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#1d1b19] text-white px-3 py-1.5 text-[13px] cursor-pointer">
          <Video className="w-4 h-4" /> Видео в текст
        </button>
      </div>
      {videoOpen && (
        <div className="flex flex-wrap gap-2 mb-2">
          <input
            autoFocus
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addVideo();
              }
            }}
            placeholder="Ссылка на ролик: rutube.ru/video/…, vkvideo.ru/video-…, youtu.be/…"
            className={`${inputClass} flex-1 min-w-[240px]`}
          />
          <button type="button" onClick={addVideo} className="rounded-[8px] bg-[#9a6418] text-white px-4 py-1.5 text-[13px] font-semibold cursor-pointer">
            Вставить
          </button>
        </div>
      )}
      <textarea ref={ref} rows={14} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} font-mono text-[14px]`} />
      <div className="text-[12px] text-[#1d1b19]/55 mt-1 leading-[1.5]">
        Абзацы разделяйте пустой строкой. «## » в начале строки — подзаголовок, «- » — пункт списка. Фото и видео вставляются кнопками; текст в квадратных скобках — подпись. Видео можно добавить и просто ссылкой на ролик отдельным абзацем.
      </div>
      {error && <div className="text-[12px] text-[#b3261e] mt-1">{error}</div>}
    </div>
  );
}

function ListInput({ field, value, onChange }: { field: Extract<Field, { type: 'list' }>; value: Obj[]; onChange: (v: Obj[]) => void }) {
  const items = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState<number | null>(null);
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
    if (open === i) setOpen(i + d);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        const thumb = field.thumb ? String(getPath(item, field.thumb) || '') : '';
        return (
          <div key={i} className="rounded-[12px] border border-[#1d1b19]/10 bg-white">
            <div className="flex items-center gap-2 p-2 pl-3">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex-1 flex items-center gap-3 text-left cursor-pointer min-w-0">
                {isOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                {field.thumb && (
                  <span className="w-9 h-9 shrink-0 rounded-[8px] overflow-hidden bg-[#1d1b19]/[0.06]">{thumb && <img src={src(thumb)} alt="" className="w-full h-full object-cover" />}</span>
                )}
                <span className="truncate text-[14px] font-medium">{field.title(item, i)}</span>
              </button>
              <IconButton title="Выше" disabled={i === 0} onClick={() => move(i, -1)} icon={<ArrowUp className="w-4 h-4" />} />
              <IconButton title="Ниже" disabled={i === items.length - 1} onClick={() => move(i, 1)} icon={<ArrowDown className="w-4 h-4" />} />
              <IconButton
                title="Удалить"
                danger
                onClick={() => {
                  if (window.confirm(`Удалить «${field.title(item, i)}»?`)) {
                    onChange(items.filter((_, j) => j !== i));
                    setOpen(null);
                  }
                }}
                icon={<Trash2 className="w-4 h-4" />}
              />
            </div>
            {isOpen && (
              <div className="border-t border-[#1d1b19]/10 p-4 space-y-5">
                <Fields fields={field.fields} value={item} onChange={(next) => onChange(items.map((x, j) => (j === i ? next : x)))} />
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => {
          onChange([...items, field.newItem()]);
          setOpen(items.length);
        }}
        className="inline-flex items-center gap-1.5 rounded-[10px] border border-dashed border-[#9a6418]/50 px-3.5 py-2 text-[13px] font-semibold text-[#9a6418] cursor-pointer"
      >
        <Plus className="w-4 h-4" /> {field.addLabel}
      </button>
    </div>
  );
}

export function Fields({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <>
      {fields.map((field) => {
        const current = getPath(value, field.key);
        const set = (v: unknown) => {
          let next = setPath(value, field.key, v);
          // Новое фото галереи — старая уменьшенная копия больше не подходит
          if (field.type === 'image' && field.key === 'src' && 'thumb' in value) next = { ...next, thumb: '' };
          onChange(next);
        };
        return (
          <div key={field.key}>
            {field.type !== 'checkbox' && <Label field={field} />}
            {(() => {
              switch (field.type) {
                case 'text':
                case 'url':
                case 'date':
                  return (
                    <input
                      type={field.type === 'url' ? 'url' : field.type === 'date' ? 'date' : 'text'}
                      value={String(current ?? '')}
                      placeholder={field.placeholder}
                      onChange={(e) => set(e.target.value)}
                      className={inputClass}
                    />
                  );
                case 'textarea':
                  return <textarea rows={field.rows ?? 3} value={String(current ?? '')} onChange={(e) => set(e.target.value)} className={inputClass} />;
                case 'number':
                  return (
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      value={current === undefined || current === null ? '' : Number(current)}
                      onChange={(e) => set(e.target.value === '' ? 0 : Number(e.target.value))}
                      className={`${inputClass} max-w-[160px]`}
                    />
                  );
                case 'select':
                  return (
                    <select
                      value={String(current ?? '')}
                      onChange={(e) => set(typeof current === 'number' ? Number(e.target.value) : e.target.value)}
                      className={`${inputClass} max-w-[320px]`}
                    >
                      {field.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  );
                case 'checkbox':
                  return (
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={Boolean(current)} onChange={(e) => set(e.target.checked)} className="mt-0.5 w-5 h-5 accent-[#c98a35]" />
                      <span>
                        <span className="block text-[14px] font-semibold">{field.label}</span>
                        {field.help && <span className="block text-[12px] text-[#1d1b19]/55">{field.help}</span>}
                      </span>
                    </label>
                  );
                case 'image':
                  return <ImageInput value={String(current ?? '')} kind={field.kind} onChange={set} />;
                case 'strings':
                  return <StringsInput value={current as string[]} itemLabel={field.itemLabel} multiline={field.multiline} onChange={set} />;
                case 'markdown':
                  return <MarkdownInput value={String(current ?? '')} onChange={set} />;
                case 'list':
                  return <ListInput field={field} value={current as Obj[]} onChange={set} />;
              }
            })()}
          </div>
        );
      })}
    </>
  );
}
