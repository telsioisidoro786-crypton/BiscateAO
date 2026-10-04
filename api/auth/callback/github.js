/**
 * @import { VercelRequest, VercelResponse } from '@vercel/node'
 * @import { auth } from '../../auth-server.js'
 */

import { auth } from "../../auth-server.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const result = await auth.handler(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}