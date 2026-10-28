// Подготовка фото в браузере перед загрузкой: поворот по EXIF, обрезка и сжатие.
// На сервер уходит уже лёгкий файл — хостинг не нагружается и не нужен GD/Imagick.

export type ImageKind =
  /** Аватарка: квадрат 600×600, лицо обычно в верхней части кадра. */
  | 'avatar'
  /** Фото в карточке: 16:10, 1280 px по ширине. */
  | 'card'
  /** Большое фото (шапка, галерея, блог): до 2000 px по длинной стороне, без обрезки. */
  | 'photo';

const SIZES: Record<ImageKind, { width: number; height?: number }> = {
  avatar: { width: 600, height: 600 },
  card: { width: 1280, height: 800 },
  photo: { width: 2000 },
};

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImage(file: File, kind: ImageKind): Promise<{ blob: Blob; name: string }> {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) && !/\.(jpe?g|png|webp|heic)$/i.test(file.name)) {
    throw new Error('Подходят фото в JPG, PNG или WebP');
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('Не получилось открыть фото. Сохраните его как JPG и попробуйте ещё раз.');
  }

  const target = SIZES[kind];
  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;
  let dw: number;
  let dh: number;

  if (target.height) {
    // Обрезка под нужные пропорции: по центру, а для аватарок — с запасом сверху, где обычно голова
    const ratio = target.width / target.height;
    if (sw / sh > ratio) {
      const w = sh * ratio;
      sx = (sw - w) / 2;
      sw = w;
    } else {
      const h = sw / ratio;
      sy = kind === 'avatar' ? Math.max(0, (sh - h) * 0.25) : (sh - h) / 2;
      sh = h;
    }
    const scale = Math.min(1, target.width / sw);
    dw = Math.round(sw * scale);
    dh = Math.round(sh * scale);
  } else {
    const scale = Math.min(1, target.width / Math.max(sw, sh));
    dw = Math.round(sw * scale);
    dh = Math.round(sh * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Браузер не смог обработать фото');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, dw, dh);
  bitmap.close();

  // WebP — самый лёгкий; старый Safari его не умеет сохранять, тогда JPEG
  let blob = await toBlob(canvas, 'image/webp', 0.84);
  let ext = 'webp';
  if (!blob || blob.type !== 'image/webp') {
    blob = await toBlob(canvas, 'image/jpeg', 0.86);
    ext = 'jpg';
  }
  if (!blob) throw new Error('Не удалось сжать фото');
  return { blob, name: `${file.name.replace(/\.[^.]+$/, '').slice(0, 40) || 'photo'}.${ext}` };
}
