import { auth } from "../auth-config.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Método não permitido" });
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    return res.status(200).json({ session });
  } catch (error) {
    console.error('[get-session] Erro:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}