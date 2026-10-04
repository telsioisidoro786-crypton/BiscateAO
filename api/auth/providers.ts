import { auth } from "../auth-server";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const providers = (auth as any).options?.socialProviders || {};
    const providerList = Object.entries(providers).map(([providerId, config]: [string, any]) => ({
      providerId,
      label: providerId.charAt(0).toUpperCase() + providerId.slice(1),
      clientId: config.clientId,
    });

    return res.status(200).json({ providers: providerList });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}