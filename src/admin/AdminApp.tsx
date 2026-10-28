import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, History, Loader2, LogOut, Menu, Save, Send, Settings, X } from 'lucide-react';
import { api, ApiError, type Backup, type ServerSettings } from './api';
import { Fields } from './fields';
import { publishSite } from './publish';
import { SECTIONS } from './schema';

type Content = Record<string, unknown>;
type View = { kind: 'section'; id: string } | { kind: 'backups' } | { kind: 'settings' };

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/** «Итоги ноября» → «itogi-noyabrya». */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Перед сохранением: адреса записей блога и проверка ошибок, которые сломали бы сайт. */
function normalize(content: Content): { content: Content; problems: string[] } {
  const problems: string[] = [];
  const blog = (content.blog ?? {}) as { posts?: Record<string, unknown>[] };
  const seen = new Set<string>();
  const posts = (blog.posts ?? []).map((post, i) => {
    let slug = slugify(String(post.slug || '')) || slugify(String(post.title || '')) || `zapis-${i + 1}`;
    while (seen.has(slug)) slug = `${slug}-2`;
    seen.add(slug);
    if (post.published && !String(post.title || '').trim()) problems.push(`Блог: у записи №${i + 1} нет заголовка`);
    return { ...post, slug };
  });
  const calendar = (content.calendar ?? {}) as { events?: Record<string, unknown>[] };
  (calendar.events ?? []).forEach((ev, i) => {
    const day = Number(ev.day);
    if (!String(ev.title || '').trim()) problems.push(`Календарь: у события №${i + 1} нет названия`);
    if (!(day >= 1 && day <= 31)) problems.push(`Календарь: у события «${ev.title || i + 1}» неверное число`);
  });
  return { content: { ...content, blog: { ...blog, posts } }, problems };
}

function Login({ needsSetup, onDone }: { needsSetup: boolean; onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (needsSetup && password !== repeat) return setError('Пароли не совпадают');
    setBusy(true);
    try {
      await (needsSetup ? api.setup(password) : api.login(password));
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-[380px] rounded-[20px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)] space-y-4">
        <img src={`${import.meta.env.BASE_URL}images/favicon.png`} alt="" className="w-10 h-10" />
        <div>
          <h1 className="text-[22px] font-semibold">{needsSetup ? 'Придумайте пароль' : 'Вход в админку'}</h1>
          <p className="text-[14px] text-[#1d1b19]/60 mt-1">
            {needsSetup ? 'Первый вход: задайте пароль для админки сайта. Не короче 8 символов.' : 'Люди Медицины — управление сайтом'}
          </p>
        </div>
        <input
          type="password"
          autoFocus
          autoComplete={needsSetup ? 'new-password' : 'current-password'}
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-[10px] border border-[#1d1b19]/15 px-3 py-2.5 text-[15px] outline-none focus:border-[#c98a35]"
        />
        {needsSetup && (
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Пароль ещё раз"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            className="w-full rounded-[10px] border border-[#1d1b19]/15 px-3 py-2.5 text-[15px] outline-none focus:border-[#c98a35]"
          />
        )}
        {error && <div className="text-[13px] text-[#b3261e]">{error}</div>}
        <button disabled={busy || password.length === 0} className="w-full rounded-[10px] bg-[#1d1b19] text-white py-2.5 font-semibold disabled:opacity-50 cursor-pointer">
          {busy ? 'Минутку…' : needsSetup ? 'Сохранить пароль и войти' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

function BackupsView({ onRestore }: { onRestore: (content: Content) => void }) {
  const [list, setList] = useState<Backup[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.backups().then(setList).catch((e) => setError(e.message));
  }, []);
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#1d1b19]/65">
        При каждом сохранении предыдущая версия черновика сохраняется сюда (последние 60). Восстановление заменит черновик — потом нажмите «Опубликовать».
      </p>
      {error && <div className="text-[13px] text-[#b3261e]">{error}</div>}
      {!list && !error && <Loader2 className="w-5 h-5 animate-spin" />}
      {list?.length === 0 && <div className="text-[14px]">Копий пока нет.</div>}
      <div className="space-y-2">
        {list?.map((b) => (
          <div key={b.name} className="flex items-center justify-between gap-3 rounded-[12px] bg-white border border-[#1d1b19]/10 px-4 py-3">
            <span className="text-[14px]">{new Date(b.savedAt).toLocaleString('ru-RU')}</span>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Заменить текущий черновик этой копией?')) return;
                try {
                  onRestore(await api.restore(b.name));
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
              className="rounded-[10px] border border-[#1d1b19]/15 px-3 py-1.5 text-[13px] font-semibold cursor-pointer"
            >
              Восстановить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  const [settings, setSettings] = useState<ServerSettings | null>(null);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwMessage, setPwMessage] = useState('');
  useEffect(() => {
    api.settings().then(setSettings).catch((e) => setMessage(e.message));
  }, []);
  const input = 'w-full rounded-[10px] border border-[#1d1b19]/15 bg-white px-3 py-2 text-[15px] outline-none focus:border-[#c98a35]';
  if (!settings) return <Loader2 className="w-5 h-5 animate-spin" />;
  return (
    <div className="space-y-10 max-w-[560px]">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setMessage('');
          try {
            await api.saveSettings({ telegramBotToken: token, telegramChatId: settings.telegramChatId, webhookUrl: settings.webhookUrl });
            setToken('');
            setSettings(await api.settings());
            setMessage('Сохранено');
          } catch (err) {
            setMessage((err as Error).message);
          }
        }}
      >
        <h2 className="text-[18px] font-semibold">Ответы форм в Telegram</h2>
        <p className="text-[13px] text-[#1d1b19]/60">Анкета, диагностика и запись на события присылают ответы ботом в выбранный чат. Бота создают в @BotFather и добавляют в чат.</p>
        <label className="block">
          <span className="text-[13px] font-semibold">Токен бота {settings.hasBotToken && <span className="text-[#2e7d32] font-normal">· задан</span>}</span>
          <input type="password" placeholder={settings.hasBotToken ? 'Оставьте пустым, чтобы не менять' : '123456789:AA…'} value={token} onChange={(e) => setToken(e.target.value)} className={input} />
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold">ID чата</span>
          <input value={settings.telegramChatId} onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })} placeholder="-1001234567890" className={input} />
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold">Вебхук (необязательно)</span>
          <input value={settings.webhookUrl} onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })} placeholder="https://…" className={input} />
        </label>
        <button className="rounded-[10px] bg-[#1d1b19] text-white px-4 py-2 font-semibold cursor-pointer">Сохранить</button>
        {message && <div className="text-[13px]">{message}</div>}
      </form>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setPwMessage('');
          try {
            await api.changePassword(pw.current, pw.next);
            setPw({ current: '', next: '' });
            setPwMessage('Пароль изменён');
          } catch (err) {
            setPwMessage((err as Error).message);
          }
        }}
      >
        <h2 className="text-[18px] font-semibold">Пароль админки</h2>
        <input type="password" autoComplete="current-password" placeholder="Текущий пароль" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className={input} />
        <input type="password" autoComplete="new-password" placeholder="Новый пароль (от 8 символов)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={input} />
        <button className="rounded-[10px] bg-[#1d1b19] text-white px-4 py-2 font-semibold cursor-pointer">Сменить пароль</button>
        {pwMessage && <div className="text-[13px]">{pwMessage}</div>}
      </form>
    </div>
  );
}

export function AdminApp() {
  const [state, setState] = useState<{ needsSetup: boolean; authed: boolean } | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [dirty, setDirty] = useState(false);
  const [view, setView] = useState<View>({ kind: 'section', id: SECTIONS[0].id });
  const [status, setStatus] = useState<{ text: string; tone: 'info' | 'ok' | 'error' } | null>(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadState = useCallback(async () => {
    try {
      const s = await api.state();
      setState(s);
      if (s.authed) setContent(await api.content());
    } catch (e) {
      setStatus({ text: (e as Error).message, tone: 'error' });
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Предупреждение при закрытии вкладки с несохранёнными правками
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [dirty]);

  const handleApiError = (e: unknown) => {
    if (e instanceof ApiError && e.status === 401) {
      setState((s) => (s ? { ...s, authed: false } : s));
      setStatus({ text: 'Сеанс закончился — войдите снова. Правки на экране сохранятся.', tone: 'error' });
      return;
    }
    setStatus({ text: (e as Error).message, tone: 'error' });
  };

  const save = async (): Promise<Content | null> => {
    if (!content) return null;
    const { content: normalized, problems } = normalize(content);
    if (problems.length) {
      setStatus({ text: problems.join(' · '), tone: 'error' });
      return null;
    }
    setBusy(true);
    try {
      await api.save(normalized);
      setContent(normalized);
      setDirty(false);
      setStatus({ text: 'Черновик сохранён. Чтобы изменения появились на сайте, нажмите «Опубликовать».', tone: 'ok' });
      return normalized;
    } catch (e) {
      handleApiError(e);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    const saved = dirty || !content ? await save() : content;
    if (!saved) return;
    setBusy(true);
    try {
      const count = await publishSite(saved, (text) => setStatus({ text, tone: 'info' }));
      setStatus({ text: `Опубликовано: ${count} файлов. Сайт обновлён.`, tone: 'ok' });
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy(false);
    }
  };

  const section = view.kind === 'section' ? SECTIONS.find((s) => s.id === view.id) : undefined;
  const sectionValue = useMemo(() => (section && content ? ((content[section.id] as Content) ?? {}) : {}), [section, content]);

  if (!state) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!state.authed) return <Login needsSetup={state.needsSetup} onDone={loadState} />;
  if (!content) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const navButton = (active: boolean) =>
    `w-full text-left rounded-[10px] px-3 py-2 text-[14px] cursor-pointer ${active ? 'bg-[#1d1b19] text-white font-semibold' : 'hover:bg-[#1d1b19]/[0.06]'}`;
  const go = (v: View) => {
    setView(v);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-[#f6f3ee]/95 backdrop-blur border-b border-[#1d1b19]/10">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-3">
          <button type="button" className="lg:hidden w-10 h-10 flex items-center justify-center cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} aria-label="Меню">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="font-semibold text-[15px] hidden sm:block">Люди Медицины · админка</div>
          <div className="flex-1" />
          <a href={`${import.meta.env.BASE_URL}`} target="_blank" rel="noreferrer" className="hidden md:inline-flex items-center gap-1.5 text-[13px] text-[#1d1b19]/70 hover:text-[#1d1b19]">
            Сайт <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href="/api/preview.php" target="_blank" rel="noreferrer" className="hidden md:inline-flex items-center gap-1.5 text-[13px] text-[#1d1b19]/70 hover:text-[#1d1b19]">
            Предпросмотр черновика <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button type="button" disabled={busy || !dirty} onClick={save} className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#1d1b19]/20 bg-white px-3.5 py-2 text-[14px] font-semibold disabled:opacity-40 cursor-pointer">
            <Save className="w-4 h-4" /> <span className="hidden sm:inline">Сохранить</span>
          </button>
          <button type="button" disabled={busy} onClick={publish} className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#c98a35] text-white px-3.5 py-2 text-[14px] font-semibold disabled:opacity-60 cursor-pointer">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Опубликовать
          </button>
        </div>
        {status && (
          <div
            className={`px-4 py-2 text-[13px] text-center ${status.tone === 'error' ? 'bg-[#fde7e6] text-[#8c1d18]' : status.tone === 'ok' ? 'bg-[#e6f4ea] text-[#1e5b2a]' : 'bg-[#fff4dc] text-[#6b4a0e]'}`}
          >
            {status.tone === 'ok' && <CheckCircle2 className="inline w-4 h-4 mr-1 -mt-0.5" />}
            {status.text}
          </div>
        )}
      </header>

      <div className="max-w-[1200px] mx-auto px-4 py-6 flex gap-8">
        <nav className={`${menuOpen ? 'block' : 'hidden'} lg:block fixed lg:static inset-x-0 top-16 bottom-0 z-10 lg:z-auto bg-[#f6f3ee] lg:bg-transparent overflow-y-auto p-4 lg:p-0 lg:w-[240px] shrink-0`}>
          <div className="space-y-1 lg:sticky lg:top-24">
            {SECTIONS.map((s) => (
              <button key={s.id} type="button" onClick={() => go({ kind: 'section', id: s.id })} className={navButton(view.kind === 'section' && view.id === s.id)}>
                {s.title}
              </button>
            ))}
            <div className="h-px bg-[#1d1b19]/10 my-3" />
            <button type="button" onClick={() => go({ kind: 'backups' })} className={`${navButton(view.kind === 'backups')} flex items-center gap-2`}>
              <History className="w-4 h-4" /> Резервные копии
            </button>
            <button type="button" onClick={() => go({ kind: 'settings' })} className={`${navButton(view.kind === 'settings')} flex items-center gap-2`}>
              <Settings className="w-4 h-4" /> Настройки
            </button>
            <button
              type="button"
              onClick={async () => {
                if (dirty && !window.confirm('Есть несохранённые правки. Всё равно выйти?')) return;
                await api.logout().catch(() => {});
                setDirty(false);
                setContent(null);
                loadState();
              }}
              className={`${navButton(false)} flex items-center gap-2 text-[#1d1b19]/60`}
            >
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          </div>
        </nav>

        <main className="flex-1 min-w-0 pb-24">
          {section && (
            <>
              <h1 className="text-[26px] font-semibold">{section.title}</h1>
              {section.hint && <p className="text-[14px] text-[#1d1b19]/60 mt-1">{section.hint}</p>}
              <div className="mt-6 space-y-6 rounded-[16px] bg-white/60 p-4 sm:p-6 border border-[#1d1b19]/[0.06]">
                <Fields
                  fields={section.fields}
                  value={sectionValue}
                  onChange={(next) => {
                    setContent({ ...content, [section.id]: next });
                    setDirty(true);
                  }}
                />
              </div>
            </>
          )}
          {view.kind === 'backups' && (
            <>
              <h1 className="text-[26px] font-semibold mb-4">Резервные копии</h1>
              <BackupsView
                onRestore={(restored) => {
                  setContent(restored);
                  setDirty(false);
                  setStatus({ text: 'Черновик восстановлен из копии. Нажмите «Опубликовать», чтобы вернуть его на сайт.', tone: 'ok' });
                }}
              />
            </>
          )}
          {view.kind === 'settings' && (
            <>
              <h1 className="text-[26px] font-semibold mb-6">Настройки</h1>
              <SettingsView />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
