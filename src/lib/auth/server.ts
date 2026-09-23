import { createClient } from "@supabase/supabase-js";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { emailAndPasswordEnabled } from "./email-password";
import { pgliteDialect } from "./pglite-dialect";
import { AUTH_PROVIDERS } from "./providers";

void ensureDbReady();

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const authDisabled = env("VITE_AUTH_ENABLED") === "false";

const supabaseUrl = env("SUPABASE_URL")!;
const supabaseAnonKey = env("SUPABASE_ANON_KEY")!;
const supabaseServiceKey = env("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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
      clientId: env("GOOGLE_CLIENT_ID")!,
      clientSecret: env("GOOGLE_CLIENT_SECRET")!,
    },
    github: {
      clientId: env("GITHUB_CLIENT_ID")!,
      clientSecret: env("GITHUB_CLIENT_SECRET")!,
    },
  },

  emailAndPassword: { enabled: true },

  // Sync user with Supabase Auth
  hooks: {
    after: {
      async createUser({ user, provider }) {
        if (provider) {
          try {
            await supabaseAdmin.auth.admin.createUser({
              email: user.email,
              user_metadata: {
                name: user.name,
                avatar_url: user.image,
                provider: provider.id,
              },
              email_confirm: true,
            });
          } catch (e) {
            console.warn("Supabase sync failed:", e);
          }
        }
      },
    },
  },

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