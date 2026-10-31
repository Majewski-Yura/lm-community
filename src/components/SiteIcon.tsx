import { img } from '../content/store';
import { siteIcon } from '../lib/siteIcons';

/** Иконка карточки: из набора (по названию) или своя картинка, загруженная в админке. */
export function SiteIcon({ name, fallback, className }: { name?: string; fallback: string; className: string }) {
  if (name && name.startsWith('/')) return <img src={img(name)} alt="" aria-hidden="true" className={`${className} object-contain`} />;
  const Icon = siteIcon(name, fallback);
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}
