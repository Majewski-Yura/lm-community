import React, { useEffect, useRef, useState } from 'react';

interface EyebrowProps {
  line: string;
  label: string;
  color: string;
}

export const Eyebrow: React.FC<EyebrowProps> = ({ line, label, color }) => (
  <div className="flex items-center gap-3">
    <img src={line} alt="" className="w-[24px] h-[1px] shrink-0" />
    <span
      className="text-[12px] font-medium tracking-[3px] uppercase leading-[1.33]"
      style={{ color }}
    >
      {label}
    </span>
  </div>
);

const AVATAR_COLORS = ['#eee6d7', '#dec69a', '#f9cd60'];

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

interface AvatarProps {
  name: string;
  photo?: string;
  index: number;
  size?: number;
}

/** Аватарка — закруглённый квадрат (радиус — четверть стороны). */
export const Avatar: React.FC<AvatarProps> = ({ name, photo, index, size = 64 }) => {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        loading="lazy"
        decoding="async"
        className="object-cover object-top shrink-0 bg-[#eee6d7]"
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.25) }}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="shrink-0 flex items-center justify-center font-headline font-semibold text-[#020201]"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.25),
        backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
        fontSize: Math.round(size * 0.34),
      }}
    >
      {getInitials(name)}
    </div>
  );
};

interface JoinButtonProps {
  href: string;
  label?: string;
  variant?: 'white' | 'gold' | 'dark';
  external?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export const JoinButton: React.FC<JoinButtonProps> = ({
  href,
  label = 'Вступить в\u00A0сообщество',
  variant = 'white',
  external = false,
  onClick,
  className = '',
}) => {
  const styles =
    variant === 'gold'
      ? 'bg-[#f9cd60] text-[#07090f] hover:bg-white'
      : variant === 'dark'
        ? 'bg-[#020201] text-white hover:bg-[#3c3836]'
        : 'bg-white text-[#07090f] hover:bg-[#020201] hover:text-white';
  return (
    <a
      href={href}
      onClick={onClick}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`lm-btn-ripple inline-flex items-center justify-center rounded-[4px] px-9 h-[52px] min-w-[270px] text-[14px] font-bold tracking-[1.4px] uppercase transition-colors duration-200 ${styles} ${className}`}
    >
      {label}
    </a>
  );
};

interface MobileSwiperProps {
  /** Классы для планшета и компьютера: там вместо карусели обычная сетка (sm:grid …). */
  className?: string;
  /** Цвет точек: на тёмном фоне — светлые, на светлом — тёмные. */
  tone?: 'light' | 'dark';
  /** false — карусель не выходит за отступы контейнера (для блоков во всю ширину экрана). */
  bleed?: boolean;
  children: React.ReactNode;
}

/** На телефоне — горизонтальная карусель со свайпом и точками, начиная с sm — сетка из className. */
export const MobileSwiper: React.FC<MobileSwiperProps> = ({ className = '', tone = 'light', bleed = true, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = React.Children.count(children);

  const frame = useRef(0);

  /** Эффект глубины при листании: карточка в фокусе — во весь размер, соседние чуть меньше и приглушены. */
  const applyDepth = () => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    if (getComputedStyle(el).overflowX !== 'auto' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((item) => {
        item.style.transform = '';
        item.style.opacity = '';
      });
      return;
    }
    const anchor = el.getBoundingClientRect().left + 16;
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const distance = Math.min(Math.abs(rect.left - anchor) / rect.width, 1);
      item.style.transformOrigin = rect.left > anchor ? 'left center' : 'right center';
      item.style.transform = `scale(${(1 - distance * 0.07).toFixed(3)})`;
      item.style.opacity = (1 - distance * 0.45).toFixed(3);
    });
  };

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setActive(max > 0 ? Math.round((el.scrollLeft / max) * (count - 1)) : 0);
    if (!frame.current) {
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        applyDepth();
      });
    }
  };

  useEffect(() => {
    applyDepth();
    window.addEventListener('resize', applyDepth);
    return () => {
      window.removeEventListener('resize', applyDepth);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTo = (i: number) => {
    const el = ref.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (el && item) el.scrollTo({ left: item.offsetLeft - el.offsetLeft - 16, behavior: 'smooth' });
  };

  return (
    <>
      <div
        ref={ref}
        onScroll={onScroll}
        className={`flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:w-[85%] [&>*]:snap-start sm:overflow-visible sm:snap-none sm:[&>*]:w-auto sm:[&>*]:shrink ${
          bleed ? '-mx-4 sm:mx-0 sm:px-0' : ''
        } ${className}`}
      >
        {children}
      </div>
      {count > 1 && (
        <div className="sm:hidden mt-3 flex justify-center">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Карточка ${i + 1} из ${count}`}
              className="h-6 px-2 flex items-center cursor-pointer"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${i === active ? 'w-5' : 'w-1.5'} ${
                  tone === 'dark'
                    ? i === active ? 'bg-white' : 'bg-white/30'
                    : i === active ? 'bg-[#020201]' : 'bg-[#020201]/25'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
};
