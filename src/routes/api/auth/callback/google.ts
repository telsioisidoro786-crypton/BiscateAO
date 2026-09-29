import { createServerFileRoute } from "@tanstack/react-start/server";
import { getAuth } from "@/lib/auth/server";

export const ServerRoute = createServerFileRoute("/api/auth/callback/google").methods({
  GET: async ({ request }) => {
    const auth = getAuth();
    return auth.handler(request);
  },
});