import { createServerFileRoute } from "@tanstack/react-start/server";
import { getAuth } from "@/lib/auth/server";

export const ServerRoute = createServerFileRoute("/api/auth/providers").methods({
  GET: async () => {
    const auth = getAuth();
    const providers = (auth as any).options?.socialProviders || {};
    
    const providerList = Object.entries(providers).map(([providerId, config]: [string, any]) => ({
      providerId,
      label: providerId.charAt(0).toUpperCase() + providerId.slice(1),
      clientId: config.clientId,
    }));
    
    return Response.json({ providers: providerList });
  },
});