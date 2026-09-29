import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@/lib/auth/server";

export const Route = createFileRoute("/api/auth/sign-out")({
  server: { handlers: {
    POST: async ({ request }) => {
      const auth = getAuth();
      return auth.handler(request);
    },
  } },
});