// Vercel Function: POST /api/form → общий обработчик форм (server/form-handler.mjs).
import { handleForm } from '../server/form-handler.mjs';

export function POST(request) {
  return handleForm(request, process.env);
}
