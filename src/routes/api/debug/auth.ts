import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@/lib/auth/server";

export const Route = createFileRoute("/api/debug/auth")({
  server: {
    handlers: {
      GET: () => {
        const auth = getAuth();
        // Better Auth stores providers internally
        // Try to access internal providers
        const providers = (auth as any).options?.socialProviders || {};
        const hasProviders = Object.keys(providers).length > 0;
        
        return Response.json({
          hasProviders,
          providerKeys: Object.keys(providers),
          providersConfig: providers,
          baseURL: (auth as any).options?.baseURL,
          allOptionsKeys: Object.keys((auth as any).options || {}),
        });
      },
    },
  },
});