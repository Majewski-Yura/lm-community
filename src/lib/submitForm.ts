export interface FormField {
  /** Имя поля — как на Tilda, его видит бот сообщества. */
  name: string;
  /** Подпись вопроса — для сообщения в Telegram. */
  label: string;
  value: string;
}

export type FormId = 'diagnostic' | 'anketa' | 'event';

/** Отправляет ответы на /api/form (server/form-handler.mjs). Бросает ошибку с понятным текстом. */
export async function submitForm(form: FormId, fields: FormField[], honeypot = ''): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/form', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ form, fields, website: honeypot }),
    });
  } catch {
    throw new Error('Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.');
  }
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'Не удалось отправить ответ, попробуйте ещё раз.');
  }
}
