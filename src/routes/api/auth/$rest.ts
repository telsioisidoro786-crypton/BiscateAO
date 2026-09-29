import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@/lib/auth/server";

/**
 * Catch-all API route for Better Auth at `/api/auth/*`.
 * Uses createFileRoute with server handlers so it gets included in route tree.
 */
export const Route = createFileRoute("/api/auth/$rest")({
  server: { handlers: {
    GET: async ({ request, params }) => {
      const auth = getAuth();
      const restPath = Array.isArray(params.rest) ? params.rest.join("/") : (params.rest || "");
      const url = new URL(request.url);
      url.pathname = `/api/auth/${restPath}`;
      const newRequest = new Request(url.toString(), request);
      return auth.handler(newRequest);
    },
    POST: async ({ request, params }) => {
      const auth = getAuth();
      const restPath = Array.isArray(params.rest) ? params.rest.join("/") : (params.rest || "");
      const url = new URL(request.url);
      url.pathname = `/api/auth/${restPath}`;
      const newRequest = new Request(url.toString(), request);
      return auth.handler(newRequest);
    },
  } },
});