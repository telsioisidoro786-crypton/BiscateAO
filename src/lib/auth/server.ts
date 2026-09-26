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

// SMTP transporter for sending emails (Gmail with App Password)
let smtpTransporter: any = null;
const smtpConfigured = env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS");
if (smtpConfigured) {
  const nodemailer = await import("nodemailer");
  smtpTransporter = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port: Number(env("SMTP_PORT") ?? "465"),
    secure: env("SMTP_SECURE") !== "false", // true for 465, false for 587
    auth: {
      user: env("SMTP_USER"),
      pass: env("SMTP_PASS"),
    },
  });
}

const fromEmail = env("SMTP_FROM") ?? "BiscateAO <noreply@biscateao.com>";
const baseUrl = env("BETTER_AUTH_URL") ?? "http://localhost:8080";

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!smtpTransporter) {
    console.warn("SMTP not configured, skipping email to:", to);
    return;
  }
  await smtpTransporter.sendMail({ from: fromEmail, to, subject, html });
};

const buildVerifyUrl = (token: string, type: string, email: string) => {
  return `${baseUrl}/auth/confirm?token=${token}&type=${type}&email=${encodeURIComponent(email)}`;
};

const auth = betterAuth({
  baseURL: baseUrl,
  secret: env("BETTER_AUTH_SECRET") ?? "dev-secret-change-in-production",
  database,
  trustedOrigins: [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://*.grok-sandbox.com",
    baseUrl,
  ].filter(Boolean),

  // Social providers via Supabase - only when credentials are configured
  socialProviders: Object.keys(socialProviders).length > 0 ? socialProviders : undefined,

  emailAndPassword: {
    enabled: emailAndPasswordEnabled,
    sendVerificationEmail: async ({ user, url, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      const verifyUrl = buildVerifyUrl(token, "signup", user.email);
      await sendEmail(
        user.email,
        "Verifique seu email - BiscateAO",
        `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a;">Bem-vindo ao BiscateAO, ${user.name || ""}!</h2>
          <p>Obrigado por se registrar. Clique no botão abaixo para verificar seu email:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Verificar Email</a>
          </p>
          <p style="color: #666; font-size: 14px;">Ou copie este link no navegador:</p>
          <p style="color: #2563eb; word-break: break-all; font-size: 13px;">${verifyUrl}</p>
          <hr style="margin: 30px 0; border-color: #eee;">
          <p style="color: #999; font-size: 12px;">Se não foi você quem criou esta conta, ignore este email.</p>
        </div>
        `
      );
    },
    sendResetPasswordEmail: async ({ user, url, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      const resetUrl = buildVerifyUrl(token, "recovery", user.email);
      await sendEmail(
        user.email,
        "Redefinir sua senha - BiscateAO",
        `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a;">Redefinição de senha</h2>
          <p>Olá ${user.name || ""},</p>
          <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Redefinir Senha</a>
          </p>
          <p style="color: #666; font-size: 14px;">Ou copie este link no navegador:</p>
          <p style="color: #dc2626; word-break: break-all; font-size: 13px;">${resetUrl}</p>
          <hr style="margin: 30px 0; border-color: #eee;">
          <p style="color: #999; font-size: 12px;">Se não foi você, ignore este email. O link expira em 1 hora.</p>
        </div>
        `
      );
    },
  },

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
