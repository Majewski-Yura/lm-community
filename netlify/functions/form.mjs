// Netlify Function: POST /api/form → общий обработчик форм (server/form-handler.mjs).
import { handleForm } from '../../server/form-handler.mjs';

export default (request) => handleForm(request, process.env);

export const config = { path: '/api/form' };
