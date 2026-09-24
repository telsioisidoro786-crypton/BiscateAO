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

const database = env("DATABASE_URL")
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

const auth = betterAuth({
  baseURL: env("BETTER_AUTH_URL") ?? "http://localhost:8080",
  secret: env("BETTER_AUTH_SECRET")!,
  database,
  trustedOrigins: [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://*.grok-sandbox.com",
    env("BETTER_AUTH_URL")!,
  ].filter(Boolean),

  // Social providers via Supabase
  socialProviders: {
    google: {
      clientId: env("GOOGLE_CLIENT_ID"),
      clientSecret: env("GOOGLE_CLIENT_SECRET"),
    },
    github: {
      clientId: env("GITHUB_CLIENT_ID"),
      clientSecret: env("GITHUB_CLIENT_SECRET"),
    },
  },

  emailAndPassword: { enabled: emailAndPasswordEnabled },

  session: { cookieCache: { enabled: true, maxAge: 300 } },

  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: "__Host-session_token" },
      session_data: { name: "__Host-session_data" },
      account_data: { name: "__Host-account_data" },
    },
  },
});

export { auth };
