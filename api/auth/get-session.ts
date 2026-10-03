import { auth } from "../../../src/lib/auth/server.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  console.log('[get-session] Iniciando verificação de sessão');

  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    console.log('[get-session] Sessão:', session ? 'encontrada' : 'não encontrada');
    return res.status(200).json({ session });
  } catch (error: any) {
    console.error('[get-session] Erro:', error.message, error.stack);
    return res.status(500).json({ success: false, message: error.message });
  }
}