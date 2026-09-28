import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/debug/env")({
  server: {
    handlers: {
      GET: () => {
        const vars = {
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
          GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
          GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'SET' : 'MISSING',
          GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'MISSING',
          BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'MISSING',
          BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'SET' : 'MISSING',
          DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
          NODE_ENV: process.env.NODE_ENV || 'MISSING',
        };
        return Response.json(vars);
      },
    },
  },
});