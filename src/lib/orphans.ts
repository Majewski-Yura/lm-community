import { useEffect } from 'react';
import { IS_PRERENDER } from '../content/store';

const NBSP = ' ';
const TEXT_SELECTOR = 'h1,h2,h3,h4,p,li,blockquote,figcaption,span,a,button,div';

/** Исходный текст узлов, в которых мы заменили пробел, — чтобы при новой ширине экрана начать с чистого листа. */
const originals = new WeakMap<Text, string>();

function wordRects(node: Text, start: number, end: number) {
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  return range.getClientRects();
}

/**
 * Последнее слово абзаца не должно оставаться одно на строке.
 * Пара «предпоследнее + последнее» склеивается неразрывным пробелом, только если она помещается в ширину блока,
 * поэтому на узком экране текст не вылезает за край карточки.
 */
function fixOrphans(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(TEXT_SELECTOR).forEach((el) => {
    if (el.children.length || !el.offsetParent) return;
    const node = el.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE || node !== el.lastChild) return;
    const text = node as Text;

    const original = originals.get(text);
    if (original !== undefined && text.nodeValue !== original) text.nodeValue = original;
    const value = text.nodeValue ?? '';
    const words = [...value.matchAll(/[^\s ]+/g)];
    if (words.length < 3) return;

    const last = words[words.length - 1];
    const prev = words[words.length - 2];
    const lastRects = wordRects(text, last.index!, last.index! + last[0].length);
    const prevRects = wordRects(text, prev.index!, prev.index! + prev[0].length);
    if (lastRects.length !== 1 || !prevRects.length) return;
    if (Math.abs(lastRects[0].top - prevRects[prevRects.length - 1].top) < 3) return;

    // Между словами обычный пробел — пробуем склеить и проверяем, что ничего не вылезло
    const gapStart = prev.index! + prev[0].length;
    const gap = value.slice(gapStart, last.index!);
    if (!/^[ \t\n]+$/.test(gap)) return;
    originals.set(text, value);
    text.nodeValue = value.slice(0, gapStart) + NBSP + value.slice(last.index!);
    // Пара не влезла: текст вылез за край или слово разорвалось посередине (break-words)
    const newLast = gapStart + 1;
    const broken =
      wordRects(text, newLast, newLast + last[0].length).length !== 1 ||
      wordRects(text, prev.index!, gapStart).length !== 1;
    if (broken || el.scrollWidth > el.clientWidth + 1) text.nodeValue = value;
  });
}

/** Следит за висячими последними словами на странице: после отрисовки, загрузки шрифтов и смены ширины экрана. */
export function useOrphanFix(deps: unknown[] = []) {
  useEffect(() => {
    // В снимке для публикации не склеиваем: ширина экрана у посетителя будет другой
    if (IS_PRERENDER) return;
    let timer = 0;
    let lastWidth = window.innerWidth;
    const run = () => fixOrphans(document);
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, 150);
    };
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      schedule();
    };

    schedule();
    document.fonts?.ready.then(schedule);
    window.addEventListener('resize', onResize);
    // Раскрытые списки и аккордеоны добавляют новый текст
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
