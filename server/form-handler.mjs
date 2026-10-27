// Приём форм сайта (диагностика, анкета, запись на события) и отправка ответов в Telegram.
// Общая логика для Netlify (netlify/functions/form.mjs) и Vercel (api/form.mjs).
//
// Переменные окружения на хостинге:
//   TELEGRAM_BOT_TOKEN — токен бота, который присылает ответы;
//   TELEGRAM_CHAT_ID   — чат или канал, куда их присылать (бот должен в нём состоять);
//   FORMS_DRY_RUN=1    — только для разработки: ничего не отправлять, а печатать ответ в консоль сервера.
//   FORMS_WEBHOOK_URL  — необязательно: адрес, куда раньше Tilda отправляла ответы (например, бэкенд бота
//                        сообщества). Туда уходят те же поля в том же формате application/x-www-form-urlencoded.

/** Какие формы принимаем и какие поля в них допустимы. */
const FORMS = {
  diagnostic: {
    title: 'Диагностическая карта участника',
    field: /^(status|tg_id|block[1-6]_(owner|doctor|manager|ceo)_question[1-3]|open_manager_question[1-3])$/,
  },
  anketa: {
    title: 'Анкета «Итоги месяца»',
    field: /^(role|name|recomendation|benefit|recommendation|resources)$/,
  },
  event: {
    title: 'Запись на событие',
    field: /^(event|name|messenger-type|messenger-id)$/,
  },
};

const MAX_FIELDS = 80;
const MAX_VALUE = 3000;
const MAX_LABEL = 300;
const TELEGRAM_LIMIT = 4000;

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const clean = (value, max) => String(value ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max);

/** Режет длинный текст на сообщения, которые пролезают в лимит Telegram. */
function chunks(text) {
  const parts = [];
  let current = '';
  for (const line of text.split('\n')) {
    if (current && current.length + line.length + 1 > TELEGRAM_LIMIT) {
      parts.push(current);
      current = '';
    }
    current = current ? `${current}\n${line}` : line.slice(0, TELEGRAM_LIMIT);
  }
  if (current) parts.push(current);
  return parts;
}

async function sendToTelegram(env, text) {
  for (const part of chunks(text)) {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // Без parse_mode: ответы посетителей уходят простым текстом и не могут сломать разметку.
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: part, disable_web_page_preview: true }),
    });
    if (!res.ok) throw new Error(`Telegram ответил ${res.status}`);
  }
}

async function sendToWebhook(env, formId, fields) {
  const body = new URLSearchParams({ formname: FORMS[formId].title, formid: formId });
  for (const f of fields) body.append(f.name, f.value);
  const res = await fetch(env.FORMS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Вебхук ответил ${res.status}`);
}

/**
 * Тело запроса: { form: 'diagnostic' | 'anketa' | 'event', fields: [{ name, label, value }], website: '' }.
 * website — скрытое поле-ловушка для ботов: человек его не видит и не заполняет.
 */
export async function handleForm(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'Только POST' });

  const dryRun = env.FORMS_DRY_RUN === '1';
  const hasTelegram = Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);
  if (!dryRun && !hasTelegram && !env.FORMS_WEBHOOK_URL) {
    return json(503, { ok: false, error: 'Приём форм не настроен на сервере' });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Неверный формат запроса' });
  }

  if (data?.website) return json(200, { ok: true }); // бот заполнил ловушку — молча игнорируем

  const formId = typeof data?.form === 'string' ? data.form : '';
  const form = FORMS[formId];
  if (!form || !Array.isArray(data.fields) || data.fields.length === 0 || data.fields.length > MAX_FIELDS) {
    return json(400, { ok: false, error: 'Неизвестная форма' });
  }

  const fields = [];
  for (const raw of data.fields) {
    const name = clean(raw?.name, 64);
    if (!form.field.test(name)) return json(400, { ok: false, error: `Недопустимое поле: ${name}` });
    const value = clean(raw?.value, MAX_VALUE);
    if (value) fields.push({ name, label: clean(raw?.label, MAX_LABEL) || name, value });
  }
  if (fields.length === 0) return json(400, { ok: false, error: 'Форма пустая' });

  const text = [`📝 ${form.title}`, '', ...fields.map((f) => `${f.label}\n— ${f.value}`)].join('\n');

  if (dryRun) {
    console.log(`[forms] ${formId}\n${text}`);
    return json(200, { ok: true });
  }

  try {
    await Promise.all([
      hasTelegram ? sendToTelegram(env, text) : null,
      env.FORMS_WEBHOOK_URL ? sendToWebhook(env, formId, fields) : null,
    ]);
  } catch (error) {
    console.error('Не удалось отправить форму:', error);
    return json(502, { ok: false, error: 'Не удалось отправить ответ, попробуйте ещё раз' });
  }

  return json(200, { ok: true });
}
