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
  baseURL: "https://biscate-ao-seven.vercel.app",
  secret: env("BETTER_AUTH_SECRET") ?? "dev-secret-change-in-production",
  database,
  trustedOrigins: [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://*.grok-sandbox.com",
    "https://biscate-ao-seven.vercel.app",
  ].filter(Boolean),

  // Social providers - only when credentials are configured
  socialProviders: Object.keys(socialProviders).length > 0 ? socialProviders : undefined,

  emailAndPassword: {
    enabled: emailAndPasswordEnabled,
    sendVerificationEmail: async ({ user, url, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      const verifyUrl = `https://biscate-ao-seven.vercel.app/auth/confirm?token=${token}&type=signup&email=${encodeURIComponent(user.email)}`;
      
      try {
        const { sendVerificationEmail } = await import("../email/resend");
        await sendVerificationEmail(user.email, user.name || "", token);
        console.log('[Auth] Verification email sent successfully to:', user.email);
      } catch (error) {
        console.error('[Auth] Failed to send verification email:', error);
        throw error;
      }
    },
    sendResetPasswordEmail: async ({ user, url, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      const resetUrl = `https://biscate-ao-seven.vercel.app/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
      
      try {
        const { sendResetPasswordEmail } = await import("../email/resend");
        await sendResetPasswordEmail(user.email, user.name || "", token);
        console.log('[Auth] Reset password email sent successfully to:', user.email);
      } catch (error) {
        console.error('[Auth] Failed to send reset password email:', error);
        throw error;
      }
    },
  },

  session: { cookieCache: { enabled: true, maxAge: 300 } },

  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: "__Host-session_token" },
      session_data: { name: "__Host-session_data" },
      account_data: { name: "__Host-account_data" },
    },
  },
});

export { auth };