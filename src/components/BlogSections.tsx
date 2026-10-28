import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { C } from '../content/store';
import { ASSETS } from '../data/siteContent';
import { BLOG_POSTS, BLOG_SLUG, formatBlogDate, type BlogEntry } from '../data/blog';
import { BASE } from '../lib/base';
import { Markdown } from './Markdown';
import { SubpageShell } from './SubpageShell';
import { Eyebrow, MobileSwiper } from './ui';

interface NavProps {
  onBackHome: () => void;
  onNavigateAnchor: (href: string) => void;
  onOpenLegal: (slug: string) => void;
}

/** Ссылка на страницу внутри сайта: настоящий адрес для поисковиков, переход без перезагрузки для людей. */
function openLink(slug: string, onOpen: (slug: string) => void) {
  return {
    href: `${BASE}${slug === BLOG_SLUG ? 'blog/' : slug}`,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      onOpen(slug);
    },
  };
}

const PostCard: React.FC<{ post: BlogEntry; onOpen: (slug: string) => void; light?: boolean }> = ({ post, onOpen, light }) => (
  <a
    {...openLink(post.pageSlug, onOpen)}
    className={`group rounded-[16px] overflow-hidden flex flex-col ${light ? 'bg-white border border-[#1a1612]/[0.08]' : 'bg-white'}`}
  >
    <div className="aspect-[16/10] overflow-hidden bg-[#3c3836]">
      {post.coverSrc && (
        <img src={post.coverSrc} alt={post.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      )}
    </div>
    <div className="flex-1 p-6 sm:p-7 flex flex-col">
      <time dateTime={post.date} className="text-[#8c4503] text-[13px] font-medium">
        {formatBlogDate(post.date)}
      </time>
      <h3 className="mt-2 font-headline text-[#020201] text-[19px] sm:text-[20px] font-semibold leading-[1.3]">{post.title}</h3>
      {post.excerpt && <p className="mt-3 text-[#3c3836] text-[14px] leading-[1.6] line-clamp-4">{post.excerpt}</p>}
      <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[#020201] text-[13px] font-bold tracking-[1px] uppercase">
        Читать <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </span>
    </div>
  </a>
);

/** Блок на главной: три последние записи и ссылка на все. Без опубликованных записей блок не показывается. */
export const BlogSection: React.FC<{ onOpenLegal: (slug: string) => void }> = ({ onOpenLegal }) => {
  if (BLOG_POSTS.length === 0) return null;
  return (
    <section id="blog" className="bg-[#eee6d7] py-12 sm:py-[76px] lg:py-[100px] scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5">
        <div className="max-w-[1240px] mx-auto">
          <Eyebrow line={ASSETS.lineGoldAmber} label={C.blog.eyebrow} color="#d28802" />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-headline text-[#020201] text-[30px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.1]">{C.blog.title}</h2>
              {C.blog.lead && <p className="mt-4 max-w-[576px] text-[#3c3836] text-[14px] sm:text-[15px] leading-[1.63]">{C.blog.lead}</p>}
            </div>
            {BLOG_POSTS.length > 3 && (
              <a
                {...openLink(BLOG_SLUG, onOpenLegal)}
                className="self-start sm:self-auto inline-flex items-center gap-2 rounded-[4px] border border-[#020201] px-5 h-[44px] text-[#020201] text-[13px] font-bold tracking-[1.2px] uppercase hover:bg-[#020201] hover:text-white transition-colors"
              >
                Все записи <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
          <MobileSwiper className="mt-7 sm:mt-10 lg:mt-[56px] sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {BLOG_POSTS.slice(0, 3).map((post) => (
              <PostCard key={post.slug} post={post} onOpen={onOpenLegal} light />
            ))}
          </MobileSwiper>
        </div>
      </div>
    </section>
  );
};

/** /blog/ — все записи. */
export const BlogListPage: React.FC<NavProps> = (nav) => (
  <SubpageShell eyebrow={C.blog.eyebrow} title={C.blog.title} meta={C.blog.lead} {...nav}>
    {BLOG_POSTS.length === 0 ? (
      <p className="text-white/70">Скоро здесь появятся первые записи.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {BLOG_POSTS.map((post) => (
          <PostCard key={post.slug} post={post} onOpen={nav.onOpenLegal} />
        ))}
      </div>
    )}
  </SubpageShell>
);

/** /blog/<slug> — запись. */
export const BlogPostPage: React.FC<NavProps & { post: BlogEntry }> = ({ post, ...nav }) => {
  const index = BLOG_POSTS.findIndex((p) => p.slug === post.slug);
  const older = BLOG_POSTS[index + 1];
  return (
    <SubpageShell eyebrow={formatBlogDate(post.date)} title={post.title} meta={post.excerpt} light {...nav}>
      <article>
        {post.coverSrc && <img src={post.coverSrc} alt={post.title} decoding="async" className="w-full rounded-[20px] mb-10 aspect-[16/10] object-cover" />}
        <Markdown text={post.body} light />
      </article>
      <div className="mt-14 pt-8 border-t border-[#020201]/10 flex flex-col sm:flex-row gap-4 justify-between">
        <a {...openLink(BLOG_SLUG, nav.onOpenLegal)} className="inline-flex items-center gap-2 text-[#8c4503] hover:text-[#020201] text-[14px] font-medium">
          <ArrowLeft className="w-4 h-4" /> Все записи блога
        </a>
        {older && (
          <a {...openLink(older.pageSlug, nav.onOpenLegal)} className="inline-flex items-center gap-2 text-[#8c4503] hover:text-[#020201] text-[14px] font-medium sm:text-right">
            {older.title} <ArrowRight className="w-4 h-4 shrink-0" />
          </a>
        )}
      </div>
    </SubpageShell>
  );
};
