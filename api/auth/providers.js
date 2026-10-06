import { auth } from "../auth-config.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Método não permitido" });
  try {
    const providers = auth.options?.socialProviders || {};
    const providerList = Object.entries(providers).map(([providerId, config]) => ({
      providerId,
      label: providerId.charAt(0).toUpperCase() + providerId.slice(1),
      clientId: config.clientId,
    }));
    return res.status(200).json({ providers: providerList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}