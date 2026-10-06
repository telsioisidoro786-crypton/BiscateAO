import { betterAuth } from "better-auth";
import { Pool } from "pg";

const env = (key) => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const databaseUrl = env("DATABASE_URL");
const database = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

const socialProviders = {};
if (env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET")) {
  socialProviders.google = { clientId: env("GOOGLE_CLIENT_ID"), clientSecret: env("GOOGLE_CLIENT_SECRET") };
}
if (env("GITHUB_CLIENT_ID") && env("GITHUB_CLIENT_SECRET")) {
  socialProviders.github = { clientId: env("GITHUB_CLIENT_ID"), clientSecret: env("GITHUB_CLIENT_SECRET") };
}

// Fail fast if BETTER_AUTH_SECRET is not set in production
const authSecret = env("BETTER_AUTH_SECRET");
if (!authSecret) {
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  if (isProduction) {
    throw new Error("BETTER_AUTH_SECRET must be set in production environment");
  }
  console.warn("[Auth] WARNING: BETTER_AUTH_SECRET not set, using development fallback");
}

const auth = betterAuth({
  baseURL: "https://biscate-ao-seven.vercel.app",
  secret: env("BETTER_AUTH_SECRET") ?? "dev-secret-change-in-production",
  database: database ?? { type: "postgres" },
  trustedOrigins: ["http://localhost:8080", "http://127.0.0.1:8080", "https://*.grok-sandbox.com", "https://biscate-ao-seven.vercel.app"].filter(Boolean),
  socialProviders: Object.keys(socialProviders).length > 0 ? socialProviders : undefined,
  emailAndPassword: { enabled: true },
  session: { cookieCache: { enabled: true, maxAge: 300 } },
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: { session_token: { name: "__Host-session_token" }, session_data: { name: "__Host-session_data" }, account_data: { name: "__Host-account_data" } },
  },
});

export { auth };