import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Connect, type Plugin } from "vite";
import { handleForm } from "./server/form-handler.mjs";
import { adminDevApi } from "./server/admin-dev.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * /api/form при локальной разработке. Без TELEGRAM_BOT_TOKEN ответы не отправляются,
 * а печатаются в консоль сервера (FORMS_DRY_RUN). На хостинге работают функции из netlify/ и api/.
 */
function formsApi(): Plugin {
  const middleware: Connect.NextHandleFunction = async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const request = new Request(`http://localhost${req.url}`, {
      method: req.method,
      headers: { "content-type": req.headers["content-type"] ?? "" },
      body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
    });
    const env = { ...process.env, FORMS_DRY_RUN: process.env.TELEGRAM_BOT_TOKEN ? process.env.FORMS_DRY_RUN : "1" };
    const response = await handleForm(request, env);
    res.statusCode = response.status;
    res.setHeader("content-type", response.headers.get("content-type") ?? "application/json");
    res.end(await response.text());
  };
  return {
    name: "forms-api",
    configureServer: (server) => void server.middlewares.use("/api/form", middleware),
    configurePreviewServer: (server) => void server.middlewares.use("/api/form", middleware),
  };
}

// https://vite.dev/config/
export default defineConfig({
  // На GitHub Pages сайт лежит в подпапке репозитория: BASE_PATH=/lm-community/
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss(), formsApi(), adminDevApi({ root: __dirname })],
  build: {
    rollupOptions: {
      // Сайт и админка (/admin) — две страницы одной сборки
      input: { main: path.resolve(__dirname, 'index.html'), admin: path.resolve(__dirname, 'admin/index.html') },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
