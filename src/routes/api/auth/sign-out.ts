import { createServerFileRoute } from "@tanstack/react-start/server";
import { getAuth } from "@/lib/auth/server";

export const ServerRoute = createServerFileRoute("/api/auth/sign-out").methods({
  POST: async ({ request }) => {
    const auth = getAuth();
    return auth.handler(request);
  },
});