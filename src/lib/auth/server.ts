import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { emailAndPasswordEnabled } from "./email-password";
import { pgliteDialect } from "./pglite-dialect";

void ensureDbReady();

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const databaseUrl = env("DATABASE_URL");

/** Kept server-side so session verification can fail closed when auth is off. */
export const authConfigured = process.env.VITE_AUTH_ENABLED !== "false";
/** Cookie name shared with the preview popup handler. */
export const SESSION_TOKEN_COOKIE = "__Host-session_token";

const database = env("DATABASE_URL")
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

const isLocalhost = (env("BETTER_AUTH_URL") ?? "http://localhost:8080").startsWith("http://localhost") || (env("BETTER_AUTH_URL") ?? "http://localhost:8080").startsWith("http://127.0.0.1");

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
if (env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET")) {
  socialProviders.google = {
    clientId: env("GOOGLE_CLIENT_ID")!,
    clientSecret: env("GOOGLE_CLIENT_SECRET")!,
  };
}
if (env("GITHUB_CLIENT_ID") && env("GITHUB_CLIENT_SECRET")) {
  socialProviders.github = {
    clientId: env("GITHUB_CLIENT_ID")!,
    clientSecret: env("GITHUB_CLIENT_SECRET")!,
  };
}

const auth = betterAuth({
  baseURL: env("BETTER_AUTH_URL") ?? "http://localhost:8080",
  secret: env("BETTER_AUTH_SECRET") ?? "dev-secret-change-in-production",
  database,
  trustedOrigins: [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://*.grok-sandbox.com",
    env("BETTER_AUTH_URL") ?? "http://localhost:8080",
  ].filter(Boolean),

  // Social providers via Supabase - only when credentials are configured
  socialProviders: Object.keys(socialProviders).length > 0 ? socialProviders : undefined,

  emailAndPassword: { enabled: emailAndPasswordEnabled },

  session: { cookieCache: { enabled: true, maxAge: 300 } },

  advanced: {
    useSecureCookies: !isLocalhost,
    defaultCookieAttributes: { secure: !isLocalhost, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: "__Host-session_token" },
      session_data: { name: "__Host-session_data" },
      account_data: { name: "__Host-account_data" },
    },
  },
});

export { auth };
