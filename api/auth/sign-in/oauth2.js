import { auth } from "../../auth-config.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Método não permitido" });
  try {
    const { providerId, callbackURL, errorCallbackURL } = req.body;
    const result = await auth.api.signIn.social({
      body: {
        provider: providerId,
        callbackURL: callbackURL || "/",
        errorCallbackURL: errorCallbackURL || "/",
      },
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}