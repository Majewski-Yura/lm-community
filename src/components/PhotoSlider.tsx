import React, { useCallback, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SliderPhoto {
  src: string;
  caption: string;
}

/**
 * Слайдер фото в записи блога: лента с прокруткой по слайдам (свайп на телефоне), стрелки и счётчик.
 * Без библиотек — CSS scroll-snap; до запуска скриптов фото уже видны и листаются.
 */
export const PhotoSlider: React.FC<{ photos: SliderPhoto[]; light?: boolean }> = ({ photos, light = false }) => {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Шаг считаем от слайда, к которому лента уже едет: быстрые нажатия подряд не теряются
  const target = useRef(0);
  const animatingUntil = useRef(0);
  const step = useCallback((delta: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(photos.length - 1, target.current + delta));
    target.current = next;
    animatingUntil.current = Date.now() + 700;
    setIndex(next);
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  }, [photos.length]);

  // Свайп: номер слайда — по положению ленты. Пока она едет после нажатия стрелки, не вмешиваемся.
  const onScroll = () => {
    const el = track.current;
    if (!el || Date.now() < animatingUntil.current) return;
    target.current = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(target.current);
  };

  const caption = photos[index]?.caption;
  const arrow = `absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-white/90 hover:bg-white text-[#020201] shadow-md transition-opacity cursor-pointer disabled:opacity-0 disabled:pointer-events-none`;

  return (
    <figure className="my-8" aria-roledescription="слайдер" aria-label={`Фото: ${photos.length}`}>
      <div className="relative">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex overflow-x-auto snap-x snap-mandatory rounded-[16px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((p, i) => (
            <div key={p.src + i} className="snap-center shrink-0 w-full" aria-roledescription="слайд" aria-label={`${i + 1} из ${photos.length}`}>
              <img src={p.src} alt={p.caption} loading="lazy" decoding="async" className="w-full aspect-[3/2] object-cover bg-[#3c3836]" />
            </div>
          ))}
        </div>
        <button type="button" aria-label="Предыдущее фото" disabled={index === 0} onClick={() => step(-1)} className={`${arrow} left-3`}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button type="button" aria-label="Следующее фото" disabled={index === photos.length - 1} onClick={() => step(1)} className={`${arrow} right-3`}>
          <ChevronRight className="w-5 h-5" />
        </button>
        <span className="absolute bottom-3 right-3 rounded-full bg-[#020201]/70 text-white text-[12px] font-semibold px-2.5 py-1">
          {index + 1} / {photos.length}
        </span>
      </div>
      <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
        {photos.map((p, i) => (
          <span key={p.src + i} className={`h-1.5 rounded-full transition-all ${i === index ? `w-5 ${light ? 'bg-[#d28802]' : 'bg-[#f9cd60]'}` : `w-1.5 ${light ? 'bg-[#020201]/20' : 'bg-white/30'}`}`} />
        ))}
      </div>
      {caption && <figcaption className={`mt-2 text-[14px] text-center ${light ? 'text-[#3c3836]/70' : 'text-white/55'}`}>{caption}</figcaption>}
    </figure>
  );
};
