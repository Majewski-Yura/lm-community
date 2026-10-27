# Инструкция по деплою сайта «Люди Медицины»

Сайт представляет собой оптимизированное одностраничное приложение (SPA) на React + Vite + Tailwind CSS. При сборке создаётся готовая папка `dist/` с файлом `index.html`.

---

## Что лежит в сборке

`npm run build` собирает сайт и сразу сохраняет каждую страницу как готовый HTML (скрипт `scripts/prerender.mjs`), чтобы Яндекс и Google видели текст без запуска JavaScript.

- `index.html` — главная с готовой разметкой, мета-тегами и Schema.org;
- `privacy-policy.html`, `oferta.html`, `pravila.html`, `soglasie-na-obrabotku.html` — документы; `diagnostic.html`, `anketa.html` — формы; `ledin-clinic.html`, `branch.html`, `bud-zdorov.html` — события; `home.html` — архив конференции 2025 (всё открывается по адресам без `.html`);
- `sitemap.xml` и `robots.txt` — создаются при сборке;
- `assets/` — скрипты и стили с хешем в имени (кешируются навсегда);
- `images/` и `fonts/` — картинки (WebP) и шрифты, которые раньше грузились с Tilda и Google Fonts.

Домен, заголовки и описания страниц — в `src/data/seo.ts`. Картинки и шрифты хранятся в `public/images` и `public/fonts`. Чтобы заменить фото, положите новый файл туда с тем же именем.

---

## Формы: диагностика, анкета, запись на события

Страницы `/diagnostic`, `/anketa` и формы записи на странице события отправляют ответы на `/api/form`. Это серверная функция (`server/form-handler.mjs`), она работает на **Netlify** (`netlify/functions/form.mjs`) и **Vercel** (`api/form.mjs`). На GitHub Pages и в Docker-образе с nginx серверных функций нет, поэтому формы там работать не будут.

В настройках проекта на хостинге задайте переменные окружения:

| Переменная | Что это |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен бота, который присылает ответы (создаётся в @BotFather) |
| `TELEGRAM_CHAT_ID` | ID чата или канала для ответов; бота нужно добавить туда |
| `FORMS_WEBHOOK_URL` | Необязательно. Адрес, куда раньше Tilda отправляла ответы форм (например, бэкенд бота сообщества): туда уйдут те же поля в том же формате |

Диагностика открывается в боте сообщества как мини-приложение и передаёт Telegram ID участника в поле `tg_id`, как раньше на Tilda. Чтобы бот продолжил показывать результаты, укажите в `FORMS_WEBHOOK_URL` адрес из настроек форм в Tilda (раздел «Сбор данных» → Webhook) и смените в настройках бота адрес мини-приложения на `https://людимедицины.рф/diagnostic`.

При локальной разработке без `TELEGRAM_BOT_TOKEN` ответы ничего не отправляют, а печатаются в консоль `npm run dev`.

## Старые адреса Tilda

`/priva`, копия конференции и служебные страницы Tilda перенаправляются (301) — правила в `public/_redirects` (Netlify), `vercel.json` и `nginx.conf`.

---

## Вариант 1. Netlify Drop (Самый быстрый, без терминала и git)

1. Выполните сборку:
   ```bash
   npm run build
   ```
2. Откройте страницу [app.netlify.com/drop](https://app.netlify.com/drop).
3. Перетащите папку `dist` прямо в окно браузера.
4. Через 5 секунд сайт доступен по персональной ссылке вида `https://random-name.netlify.app`.

---

## Вариант 2. Vercel (Через CLI или GitHub)

Конфигурация уже настроена в файле `vercel.json`.

### Через Vercel CLI:
```bash
npm i -g vercel
vercel
```

### Через панель Vercel:
1. Запушьте проект на GitHub / GitLab.
2. В панели [vercel.com](https://vercel.com) нажмите **"Add New Project"** и выберите репозиторий.
3. Все параметры подставятся автоматически (`Framework: Vite`, `Output: dist`).
4. Нажмите **Deploy**.

---

## Вариант 3. GitHub Pages (Автоматически при push)

В проекте уже настроен GitHub Actions workflow: `.github/workflows/deploy.yml`.

1. Запушьте проект в репозиторий на GitHub.
2. Перейдите в **Settings** репозитория → вкладка **Pages**.
3. В секции **Source** выберите **GitHub Actions**.
4. При каждом пуше в ветку `main` или `master` сайт будет автоматически собираться и публиковаться по адресу `https://<ваш-логин>.github.io/<имя-репозитория>/`.

---

## Вариант 4. Обычный хостинг (Beget / Timeweb / Reg.ru / cPanel)

1. Запустите сборку:
   ```bash
   npm run build
   ```
2. Подключитесь к файловому менеджеру хостинга (или через FTP / SFTP).
3. Загрузите содержимое папки `dist/` (файл `index.html` и сопутствующие файлы) в корневую директорию сайта (обычно `public_html/` или `httpdocs/`).

---

## Вариант 5. Docker / VPS (Ubuntu / Debian + Nginx / CapRover / Dokku / Railway)

В проекте уже подготовлены `Dockerfile` и `nginx.conf`.

### Сборка и запуск контейнера:
```bash
# Сборка образа
docker build -t ludi-mediciny .

# Запуск на порту 80 (или 8080)
docker run -d -p 80:80 --name ludi-mediciny-web ludi-mediciny
```

---

## Полезные команды

- `npm run dev` — запуск локального сервера разработки.
- `npm run build` — сборка production-версии в папку `dist/`.
- `npm run preview` — локальный предпросмотр собранной версии из папки `dist/`.
