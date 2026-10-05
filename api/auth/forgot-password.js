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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Método não permitido" });
  const { email, redirectTo } = req.body;
  if (!email) return res.status(400).json({ message: "Email é obrigatório" });
  try {
    await auth.api.sendPasswordResetEmail({
      body: { email, redirectTo: redirectTo || "https://biscate-ao-seven.vercel.app/reset-password" },
    });
    return res.status(200).json({ success: true, message: "E-mail enviado!" });
  } catch (error) {
    console.error('[forgot-password] Erro:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}