import { Resend } from "resend";

let resend = null;

function getResend() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não configurada");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendEmail(payload) {
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: "BiscateAO <noreply@biscateao.app>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[Resend] Send failed:", error);
    return { success: false, error: error.message };
  }
}

export async function sendVerificationEmail(email, name, token) {
  const verifyUrl = `https://biscate-ao-seven.vercel.app/auth/confirm?token=${token}&type=signup&email=${encodeURIComponent(email)}`;
  return sendEmail({
    to: email,
    subject: "Verifique seu email - BiscateAO",
    html: `<div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #1a1a1a;">Bem-vindo ao BiscateAO, ${name || ""}!</h2><p>Obrigado por se registrar. Clique no botão abaixo para verificar seu email:</p><p style="text-align: center; margin: 30px 0;"><a href="${verifyUrl}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Verificar Email</a></p><p style="color: #666; font-size: 14px;">Ou copie este link no navegador:</p><p style="color: #2563eb; word-break: break-all; font-size: 13px;">${verifyUrl}</p><hr style="margin: 30px 0; border-color: #eee;"><p style="color: #999; font-size: 12px;">Se não foi você quem criou esta conta, ignore este email.</p></div>`,
    text: `Bem-vindo ao BiscateAO! Verifique seu email: ${verifyUrl}`,
  });
}

export async function sendResetPasswordEmail(email, name, token) {
  const resetUrl = `https://biscate-ao-seven.vercel.app/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  return sendEmail({
    to: email,
    subject: "Redefinir sua senha - BiscateAO",
    html: `<div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #1a1a1a;">Redefinição de senha</h2><p>Olá ${name || ""},</p><p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p><p style="text-align: center; margin: 30px 0;"><a href="${resetUrl}" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Redefinir Senha</a></p><p style="color: #666; font-size: 14px;">Ou copie este link no navegador:</p><p style="color: #dc2626; word-break: break-all; font-size: 13px;">${resetUrl}</p><hr style="margin: 30px 0; border-color: #eee;"><p style="color: #999; font-size: 12px;">Se não foi você, ignore este email. O link expira em 1 hora.</p></div>`,
    text: `Redefinição de senha - BiscateAO: ${resetUrl}`,
  });
}