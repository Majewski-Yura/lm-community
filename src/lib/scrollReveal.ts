import { useEffect } from 'react';

/** Что плавно появляется при прокрутке главной (кроме первого экрана). */
const REVEAL_SELECTORS = [
  'main section:not(#top) h2',
  'main section:not(#top) h2 ~ p',
  'main section:not(#top) article',
  'main section:not(#top) figure',
  '[data-lm="video-box"]',
  '#dlyakogo .grid .grid > div',
  '#dlyakogo .grid > div:last-child',
  '#kalendar .grid > div',
  '#kalendar [data-lm-event]',
  '#tarifi h2 ~ div',
  '[data-lm-gallery]',
  'main section .space-y-2 > div',
].join(',');

/** Подписи разделов: короткая линия и текст — у линии своя анимация. */
const EYEBROW_SELECTOR = 'main section:not(#top) img.h-\\[1px\\]';

/**
 * Появление блоков при прокрутке и лёгкий параллакс фото в шапке.
 * Работает только в браузере; при «уменьшить движение» в системе ничего не анимирует.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;

    const targets = new Set<HTMLElement>();
    document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS).forEach((el) => {
      // В карусели на телефоне карточки за краем экрана не анимируем по одной — появляется вся лента
      const swiper = el.closest<HTMLElement>('[class*="snap-x"]');
      targets.add(swiper && getComputedStyle(swiper).overflowX === 'auto' ? swiper : el);
    });
    document.querySelectorAll<HTMLElement>(EYEBROW_SELECTOR).forEach((line) => {
      const eyebrow = line.parentElement;
      if (eyebrow) {
        eyebrow.classList.add('lm-reveal-line');
        targets.add(eyebrow);
      }
    });

    targets.forEach((el) => {
      // Карточки в одном ряду появляются по очереди
      const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      const step = el.closest('#kalendar .grid') ? 45 : 90;
      el.style.setProperty('--lm-delay', `${(index % 7) * step}ms`);
      el.classList.add('lm-reveal');
    });
    root.classList.add('lm-anim');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.add('lm-in');
          observer.unobserve(el);
          // После появления убираем служебные классы, чтобы вернулись свои эффекты наведения
          if (!el.classList.contains('lm-reveal-line')) {
            el.addEventListener(
              'transitionend',
              (e) => {
                if (e.propertyName !== 'transform') return;
                el.classList.remove('lm-reveal', 'lm-in');
                el.style.removeProperty('--lm-delay');
              },
              { once: false },
            );
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    targets.forEach((el) => observer.observe(el));

    // Параллакс: фото в шапке уезжает медленнее страницы
    const photo = document.querySelector<HTMLElement>('[data-lm-parallax]');
    let frame = 0;
    const onScroll = () => {
      if (!photo || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) photo.style.transform = `translate3d(0, ${Math.round(y * 0.28)}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove('lm-anim');
      targets.forEach((el) => el.classList.remove('lm-reveal', 'lm-in', 'lm-reveal-line'));
    };
  }, []);
}
