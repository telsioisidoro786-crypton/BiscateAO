import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@/lib/auth/server";

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
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => {
        // Ensure the full path is available for Better Auth routing
        const url = new URL(request.url);
        // The $ param contains the rest of the path
        const authPath = params.$ || "";
        // Reconstruct the full path for Better Auth
        url.pathname = `/api/auth/${authPath}`;
        const newRequest = new Request(url.toString(), request);
        return getAuth().handler(newRequest);
      },
      POST: ({ request, params }) => {
        const url = new URL(request.url);
        const authPath = params.$ || "";
        url.pathname = `/api/auth/${authPath}`;
        const newRequest = new Request(url.toString(), request);
        return getAuth().handler(newRequest);
      },
    },
  },
});
