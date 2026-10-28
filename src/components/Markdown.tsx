import React from 'react';
import { img } from '../content/store';

// Простая разметка текста записей блога: абзацы через пустую строку, «## » — подзаголовок,
// «- » — список, строка ![подпись](/uploads/…) — фото, [текст](https://…) — ссылка, **жирный**.
// Собираем React-элементы, а не HTML: текст из админки не может вставить на страницу чужой код.

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={key}>{bold[1]}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const href = link[2];
      const safe = /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(href) ? href : '#';
      const external = /^https?:\/\//i.test(safe);
      return (
        <a key={key} href={safe} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="text-[#f9cd60] underline underline-offset-4 hover:text-white">
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

export const Markdown: React.FC<{ text: string }> = ({ text }) => {
  const blocks = text.replace(/\r\n?/g, '\n').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-6 text-white/85 text-[16px] sm:text-[17px] leading-[1.7]">
      {blocks.map((block, i) => {
        const photo = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (photo) {
          return (
            <figure key={i} className="my-8">
              <img src={img(photo[2])} alt={photo[1]} loading="lazy" decoding="async" className="w-full rounded-[16px]" />
              {photo[1] && <figcaption className="mt-3 text-[14px] text-white/55 text-center">{photo[1]}</figcaption>}
            </figure>
          );
        }
        if (block.startsWith('## ')) {
          return (
            <h2 key={i} className="pt-4 font-headline text-white text-[24px] sm:text-[28px] font-medium leading-[1.25]">
              {inline(block.slice(3), `h${i}`)}
            </h2>
          );
        }
        const lines = block.split('\n');
        if (lines.every((l) => /^[-•]\s+/.test(l))) {
          return (
            <ul key={i} className="space-y-2.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[11px] w-1.5 h-1.5 rounded-full bg-[#f9cd60] shrink-0" />
                  <span>{inline(l.replace(/^[-•]\s+/, ''), `l${i}-${j}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <React.Fragment key={j}>
                {j > 0 && <br />}
                {inline(l, `p${i}-${j}`)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

/** Текст записи без разметки — для поисковиков и llms.txt. */
export function markdownToPlain(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_m, alt) => (alt ? `[Фото: ${alt}]` : ''))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^## /gm, '')
    .trim();
}
