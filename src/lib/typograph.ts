const NBSP = ' ';

/** Короткие слова, которые не должны оставаться в конце строки. */
const SHORT =
  'в|во|на|и|а|но|к|ко|с|со|у|о|об|обо|от|до|по|из|за|не|ни|для|без|при|что|как|или|да|под|над|про|через|это|мы|вы|я|он|она|их|его|её|все|уже|так|чем|где|кто';

const SHORT_WORD = new RegExp(`(?<=(?:^|[\\s\\u00A0«("„])(?:${SHORT}))[ \\t]+(?=\\S)`, 'giu');
const NUMBER_WORD = /(?<=(?:^|[\s ])\d+[+%]?)[ \t]+(?=[А-Яа-яЁё])/gu;
const BEFORE_DASH = /(?<=\S)[ \t]+(?=—)/gu;
const CYRILLIC = /[А-Яа-яЁё]/;

/**
 * Неразрывные пробелы в русском тексте: предлоги и союзы — к следующему слову, число — к слову после него,
 * тире — к предыдущему слову. Последнее слово абзаца привязывает сам сайт после отрисовки (lib/orphans),
 * потому что только там известна ширина строки.
 */
export function typograph(text: string): string {
  if (!CYRILLIC.test(text)) return text;
  let out = text;
  // Дважды — для цепочек вроде «и в клинике»
  out = out.replace(SHORT_WORD, NBSP).replace(SHORT_WORD, NBSP);
  out = out.replace(NUMBER_WORD, NBSP);
  out = out.replace(BEFORE_DASH, NBSP);
  return out;
}

/** typograph для всех строк объекта (содержимое сайта из админки). */
export function typographDeep<T>(value: T): T {
  if (typeof value === 'string') return typograph(value) as T;
  if (Array.isArray(value)) return value.map(typographDeep) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typographDeep(v)])) as T;
  }
  return value;
}
