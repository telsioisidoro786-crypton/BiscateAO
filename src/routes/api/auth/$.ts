import { createRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

/**
 * Better Auth API handler at `/api/auth/*`.
 *
 * All auth requests (sign-in, sign-out, session, OAuth callbacks, etc.) route
 * through this single handler. The `*` param captures the full auth path so
 * Better Auth can match its internal routes (`/sign-in/email`, `/callback/google`, etc.).
 *
 * TanStack Start's `createRoute` with a server handler gives us the `Request`
 * and returns a `Response` — exactly what Better Auth's `handler` expects.
 */
export const Route = createRoute({
  path: "/api/auth/$",
  method: ["GET", "POST"],
  handler: async ({ request }) => {
    // Forward the request to Better Auth's built-in handler
    // It reads cookies, validates CSRF, manages sessions, etc.
    return auth.handler(request);
  },
});