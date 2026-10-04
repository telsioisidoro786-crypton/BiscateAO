/**
 * @import { VercelRequest, VercelResponse } from '@vercel/node'
 * @import { auth } from '../auth-server.js'
 */

import { auth } from "../auth-server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email, redirectTo } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório" });
  }

  console.log('[forgot-password] Iniciando para email:', email);
  console.log('[forgot-password] RESEND_API_KEY configurada:', !!process.env.RESEND_API_KEY);
  console.log('[forgot-password] BETTER_AUTH_URL:', process.env.BETTER_AUTH_URL);

  try {
    console.log('[forgot-password] Chamando auth.api.sendPasswordResetEmail...');
    await auth.api.sendPasswordResetEmail({
      body: {
        email,
        redirectTo: redirectTo || "https://biscate-ao-seven.vercel.app/reset-password",
      },
    });

    console.log('[forgot-password] Email enviado com sucesso para:', email);
    return res.status(200).json({ success: true, message: "E-mail enviado!" });
  } catch (error) {
    console.error('[forgot-password] Erro:', error.message, error.stack);
    return res.status(500).json({ success: false, message: error.message });
  }
}