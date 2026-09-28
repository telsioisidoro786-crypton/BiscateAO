import { createServerFileRoute } from "@tanstack/react-start/server";
import { getAuth } from "@/lib/auth/server";

/**
 * Catch-all API route for Better Auth at `/api/auth/*`.
 * This uses createServerFileRoute which handles catch-all patterns correctly.
 */
export const ServerRoute = createServerFileRoute("/api/auth/$rest").methods({
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
});