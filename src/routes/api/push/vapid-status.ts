import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/push/vapid-status")({
  server: { handlers: {
    GET: async () => {
      const publicKey = process.env.VITE_VAPID_PUBLIC_KEY || '';
      const privateKey = process.env.VAPID_PRIVATE_KEY || '';
      
      return Response.json({
        configured: !!(publicKey && privateKey),
        hasPublicKey: !!publicKey,
        hasPrivateKey: !!privateKey,
      });
  } } },
});