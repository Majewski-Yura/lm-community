import React from 'react';
import { img } from '../content/store';
import { videoEmbed } from '../lib/video';
import { PhotoSlider } from './PhotoSlider';

// Простая разметка текста записей блога: абзацы через пустую строку, «## » — подзаголовок,
// «- » — список, строка ![подпись](/uploads/…) — фото, несколько таких строк подряд в одном абзаце — слайдер, строка @[подпись](https://rutube.ru/…) или просто
// ссылка на RuTube, VK Видео, YouTube — видео, [текст](https://…) — ссылка, **жирный**.
// Собираем React-элементы, а не HTML: текст из админки не может вставить на страницу чужой код.

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string, keyPrefix: string, light = false): React.ReactNode[] {
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
        <a key={key} href={safe} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className={`underline underline-offset-4 ${light ? 'text-[#8c4503] hover:text-[#020201]' : 'text-[#f9cd60] hover:text-white'}`}>
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

export const Markdown: React.FC<{ text: string; light?: boolean }> = ({ text, light = false }) => {
  const blocks = text.replace(/\r\n?/g, '\n').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`space-y-6 ${light ? 'text-[#3c3836]' : 'text-white/85'} text-[16px] sm:text-[17px] leading-[1.7]`}>
      {blocks.map((block, i) => {
        const photoLines = block.split('\n').map((l) => l.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/));
        if (photoLines.length > 1 && photoLines.every(Boolean)) {
          return <PhotoSlider key={i} light={light} photos={photoLines.map((m) => ({ src: img(m![2]) ?? m![2], caption: m![1] }))} />;
        }
        const photo = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (photo) {
          return (
            <figure key={i} className="my-8">
              <img src={img(photo[2])} alt={photo[1]} loading="lazy" decoding="async" className="w-full rounded-[16px]" />
              {photo[1] && <figcaption className={`mt-3 text-[14px] text-center ${light ? 'text-[#3c3836]/70' : 'text-white/55'}`}>{photo[1]}</figcaption>}
            </figure>
          );
        }
        const videoMatch = block.match(/^@\[([^\]]*)\]\(([^)\s]+)\)$/) ?? (/^https?:\/\/\S+$/.test(block) ? [block, '', block] : null);
        const video = videoMatch ? videoEmbed(videoMatch[2]) : null;
        if (video && videoMatch) {
          const caption = videoMatch[1];
          return (
            <figure key={i} className="my-8">
              <div className="relative w-full aspect-video overflow-hidden rounded-[16px] bg-[#020201]">
                <iframe
                  src={video.src}
                  title={caption || `Видео (${video.provider})`}
                  loading="lazy"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
              {caption && <figcaption className={`mt-3 text-[14px] text-center ${light ? 'text-[#3c3836]/70' : 'text-white/55'}`}>{caption}</figcaption>}
            </figure>
          );
        }
        if (block.startsWith('## ')) {
          return (
            <h2 key={i} className={`pt-4 font-headline ${light ? 'text-[#020201]' : 'text-white'} text-[24px] sm:text-[28px] font-medium leading-[1.25]`}>
              {inline(block.slice(3), `h${i}`, light)}
            </h2>
          );
        }
        const lines = block.split('\n');
        if (lines.every((l) => /^[-•]\s+/.test(l))) {
          return (
            <ul key={i} className="space-y-2.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3">
                  <span aria-hidden="true" className={`mt-[11px] w-1.5 h-1.5 rounded-full shrink-0 ${light ? 'bg-[#d28802]' : 'bg-[#f9cd60]'}`} />
                  <span>{inline(l.replace(/^[-•]\s+/, ''), `l${i}-${j}`, light)}</span>
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
                {inline(l, `p${i}-${j}`, light)}
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
    .replace(/@\[([^\]]*)\]\(([^)]*)\)/g, (_m, caption, url) => `[Видео${caption ? `: ${caption}` : ''}] (${url})`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^## /gm, '')
    .trim();
}
