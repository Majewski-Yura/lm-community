// Ссылки на видео → адрес встроенного плеера. Встраиваем только RuTube, VK Видео и YouTube:
// чужие адреса не превращаются в iframe, поэтому через текст записи нельзя вставить на сайт посторонний код.

export interface VideoEmbed {
  provider: 'RuTube' | 'VK Видео' | 'YouTube';
  src: string;
}

const YOUTUBE_ID = /^[\w-]{11}$/;

export function videoEmbed(raw: string): VideoEmbed | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  const parts = url.pathname.split('/').filter(Boolean);

  // RuTube: /video/<id>/, /video/private/<id>/?p=<ключ>, /play/embed/<id>, /shorts/<id>
  if (host === 'rutube.ru') {
    const id = parts.find((p) => /^[0-9a-f]{32}$/i.test(p));
    if (!id) return null;
    const key = url.searchParams.get('p');
    return { provider: 'RuTube', src: `https://rutube.ru/play/embed/${id}${key ? `?p=${encodeURIComponent(key)}` : ''}` };
  }

  // VK Видео: /video-123_456, ?z=video-123_456, /video_ext.php?oid=…&id=…&hash=…
  if (host === 'vk.com' || host === 'vk.ru' || host === 'vkvideo.ru') {
    if (parts[0] === 'video_ext.php') {
      const oid = url.searchParams.get('oid');
      const id = url.searchParams.get('id');
      if (!oid || !id || !/^-?\d+$/.test(oid) || !/^\d+$/.test(id)) return null;
      const hash = url.searchParams.get('hash');
      return { provider: 'VK Видео', src: `https://vk.com/video_ext.php?oid=${oid}&id=${id}${hash ? `&hash=${encodeURIComponent(hash)}` : ''}&hd=2` };
    }
    const m = `${url.pathname} ${url.searchParams.get('z') ?? ''}`.match(/video(-?\d+)_(\d+)/);
    if (!m) return null;
    return { provider: 'VK Видео', src: `https://vk.com/video_ext.php?oid=${m[1]}&id=${m[2]}&hd=2` };
  }

  // YouTube: watch?v=…, youtu.be/…, /shorts/…, /embed/…, /live/…
  let ytId: string | null = null;
  if (host === 'youtu.be') ytId = parts[0] ?? null;
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    ytId = url.searchParams.get('v') ?? (['shorts', 'embed', 'live'].includes(parts[0]) ? parts[1] : null);
  }
  if (ytId && YOUTUBE_ID.test(ytId)) {
    return { provider: 'YouTube', src: `https://www.youtube-nocookie.com/embed/${ytId}` };
  }

  return null;
}
