import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@/lib/auth/server";

/**
 * Catch-all route for Better Auth API at `/api/auth/*`.
 * Handles all auth requests: sign-in, sign-out, session, OAuth callbacks, etc.
 */
export const Route = createFileRoute("/api/auth/$rest")({
  server: {
    handlers: {
      GET: ({ request, params }) => {
        const auth = getAuth();
        // Restore the full path for Better Auth routing
        const restPath = Array.isArray(params.rest) ? params.rest.join("/") : (params.rest || "");
        const url = new URL(request.url);
        url.pathname = `/api/auth/${restPath}`;
        const newRequest = new Request(url.toString(), request);
        return auth.handler(newRequest);
      },
      POST: ({ request, params }) => {
        const auth = getAuth();
        const restPath = Array.isArray(params.rest) ? params.rest.join("/") : (params.rest || "");
        const url = new URL(request.url);
        url.pathname = `/api/auth/${restPath}`;
        const newRequest = new Request(url.toString(), request);
        return auth.handler(newRequest);
      },
    },
  },
});