import { createServerFileRoute } from "@tanstack/react-start/server";
import { getAuth } from "@/lib/auth/server";

/**
 * Catch-all API route for Better Auth at `/api/auth/*`.
 * Handles all auth requests: sign-in, sign-out, session, OAuth callbacks, etc.
 * Uses rest parameter to capture all sub-paths.
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