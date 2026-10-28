// Запросы к серверной части админки (public/api/admin.php; при разработке — server/admin-dev.mjs).

const API = '/api/admin.php';

let csrf = '';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(action: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}?action=${action}`, {
      credentials: 'same-origin',
      ...init,
      headers: { ...(init?.headers ?? {}), ...(init?.method === 'POST' ? { 'X-CSRF-Token': csrf } : {}) },
    });
  } catch {
    throw new ApiError('Нет связи с сервером. Проверьте интернет.', 0);
  }
  const data = (await res.json().catch(() => null)) as ({ ok?: boolean; error?: string; csrf?: string } & T) | null;
  if (!res.ok || !data?.ok) throw new ApiError(data?.error || `Сервер ответил ${res.status}`, res.status);
  if (data.csrf) csrf = data.csrf;
  return data;
}

const post = <T>(action: string, body: unknown) =>
  request<T>(action, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

export interface AdminState {
  needsSetup: boolean;
  authed: boolean;
}

export interface Backup {
  name: string;
  savedAt: string;
  size: number;
}

export interface ServerSettings {
  telegramChatId: string;
  webhookUrl: string;
  hasBotToken: boolean;
}

export const api = {
  state: () => request<AdminState>('state'),
  setup: (password: string) => post('setup', { password }),
  login: (password: string) => post('login', { password }),
  logout: () => post('logout', {}),
  changePassword: (current: string, password: string) => post('password', { current, password }),
  content: () => request<{ content: Record<string, unknown> }>('content').then((r) => r.content),
  save: (content: unknown) => post<{ savedAt: string }>('save', { content }),
  backups: () => request<{ backups: Backup[] }>('backups').then((r) => r.backups),
  restore: (name: string) => post<{ content: Record<string, unknown> }>('restore', { name }).then((r) => r.content),
  template: () => request<{ template: string }>('template').then((r) => r.template),
  publish: (files: Record<string, string>, content: unknown) => post<{ publishedAt: string }>('publish', { files, content }),
  settings: () => request<ServerSettings>('settings'),
  saveSettings: (data: { telegramBotToken?: string; clearBotToken?: boolean; telegramChatId: string; webhookUrl: string }) =>
    post('settings-save', data),
  upload: (file: Blob, name: string) => {
    const form = new FormData();
    form.append('file', file, name);
    return request<{ path: string }>('upload', { method: 'POST', body: form }).then((r) => r.path);
  },
};
