import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@/lib/auth/server";

export const Route = createFileRoute("/api/auth/providers")({
  server: {
    handlers: {
      GET: () => {
        const auth = getAuth();
        const providers = (auth as any).options?.socialProviders || {};
        
        // Transform to the format expected by frontend
        const providerList = Object.entries(providers).map(([providerId, config]: [string, any]) => ({
          providerId,
          label: providerId.charAt(0).toUpperCase() + providerId.slice(1),
          // Don't expose clientSecret
          clientId: config.clientId,
        }));
        
        return Response.json({ providers: providerList });
      },
    },
  },
});