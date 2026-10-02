import { auth } from "@lib/auth/server";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const { provider, callbackURL, errorCallbackURL } = req.body;
    const result = await auth.api.signIn.social({
      body: {
        provider,
        callbackURL: callbackURL || "/",
        errorCallbackURL: errorCallbackURL || "/",
      },
    });
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}