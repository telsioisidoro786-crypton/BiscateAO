import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = "BiscateAO <noreply@biscateao.app>";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não configurada");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string; id?: string }> {
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
  } catch (error: any) {
    console.error("[Resend] Send failed:", error);
    return { success: false, error: error.message };
  }
}

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<{ success: boolean; error?: string }> {
  const verifyUrl = `https://biscate-ao-seven.vercel.app/auth/confirm?token=${token}&type=signup&email=${encodeURIComponent(email)}`;
  
  return sendEmail({
    to: email,
    subject: "Verifique seu email - BiscateAO",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">Bem-vindo ao BiscateAO, ${name || ""}!</h2>
        <p>Obrigado por se registrar. Clique no botão abaixo para verificar seu email:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Verificar Email</a>
        </p>
        <p style="color: #666; font-size: 14px;">Ou copie este link no navegador:</p>
        <p style="color: #2563eb; word-break: break-all; font-size: 13px;">${verifyUrl}</p>
        <hr style="margin: 30px 0; border-color: #eee;">
        <p style="color: #999; font-size: 12px;">Se não foi você quem criou esta conta, ignore este email.</p>
      </div>
    `,
    text: `Bem-vindo ao BiscateAO! Verifique seu email: ${verifyUrl}`,
  });
}

export async function sendResetPasswordEmail(email: string, name: string, token: string): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `https://biscate-ao-seven.vercel.app/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  
  return sendEmail({
    to: email,
    subject: "Redefinir sua senha - BiscateAO",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">Redefinição de senha</h2>
        <p>Olá ${name || ""},</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Redefinir Senha</a>
        </p>
        <p style="color: #666; font-size: 14px;">Ou copie este link no navegador:</p>
        <p style="color: #dc2626; word-break: break-all; font-size: 13px;">${resetUrl}</p>
        <hr style="margin: 30px 0; border-color: #eee;">
        <p style="color: #999; font-size: 12px;">Se não foi você, ignore este email. O link expira em 1 hora.</p>
      </div>
    `,
    text: `Redefinição de senha - BiscateAO: ${resetUrl}`,
  });
}

export async function sendBulkEmails(emails: string[], subject: string, html: string): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  
  for (const email of emails) {
    const result = await sendEmail({ to: email, subject, html });
    if (result.success) sent++;
    else failed++;
  }
  
  return { sent, failed };
}

// ============================================
// EMAILS DE NOTIFICAÇÃO DE APLICAÇÃO
// ============================================

interface WelcomeEmailParams {
  email: string;
  name: string;
}

export async function sendWelcomeEmail({ email, name }: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: email,
    subject: "Bem-vindo ao BiscateAO! 🎉",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">BiscateAO</h1>
          <p style="color: #2563eb; margin: 8px 0 0;">O biscate que precisas, hoje.</p>
        </div>
        
        <h2 style="color: #1a1a1a;">Olá, ${name || "vizinho"}! 👋</h2>
        
        <p>Obrigado por confirmares o teu email. A tua conta está agora ativa e pronta para usar.</p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 12px; color: #1e40af;">O que podes fazer agora:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
            <li style="margin-bottom: 8px;"><strong>Publicar pedidos</strong> — Canalizador, electricista, pedreiro, gerador… o que precisares.</li>
            <li style="margin-bottom: 8px;"><strong>Receber orçamentos</strong> — Profissionais do bairro respondem no próprio dia.</li>
            <li style="margin-bottom: 8px;"><strong>Combinar no WhatsApp</strong> — Pagamento como quiseres: cash, Multicaixa, Unitel Money.</li>
            <li style="margin-bottom: 8px;"><strong>Guardar favoritos</strong> — Encontraste um bom profissional? Guarda para next time.</li>
          </ul>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://biscate-ao-seven.vercel.app/pedir" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Publicar o meu primeiro pedido</a>
        </p>
        
        <hr style="margin: 30px 0; border-color: #eee;">
        
        <p style="color: #666; font-size: 14px;">És profissional e queres receber pedidos do bairro?</p>
        <p style="text-align: center; margin: 16px 0;">
          <a href="https://biscate-ao-seven.vercel.app/profissional/cadastrar" style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Criar perfil profissional</a>
        </p>
        
        <hr style="margin: 30px 0; border-color: #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Dúvidas? Responde a este email — lemos tudo.<br>
          BiscateAO · Luanda, Angola
        </p>
      </div>
    `,
    text: `Bem-vindo ao BiscateAO, ${name || ""}! A tua conta está ativa. Publica o teu primeiro pedido: https://biscate-ao-seven.vercel.app/pedir`,
  });
}

interface NewProposalEmailParams {
  clientEmail: string;
  clientName: string;
  professionalName: string;
  professionalCategory: string;
  jobTitle: string;
  jobNeighborhood: string;
  amount: number;
  eta: string;
  proposalUrl: string;
}

export async function sendNewProposalEmail(params: NewProposalEmailParams): Promise<{ success: boolean; error?: string }> {
  const { clientEmail, clientName, professionalName, professionalCategory, jobTitle, jobNeighborhood, amount, eta, proposalUrl } = params;
  
  return sendEmail({
    to: clientEmail,
    subject: `Novo orçamento: ${professionalName} (${professionalCategory}) — ${jobTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Novo orçamento recebido 📋</h1>
        </div>
        
        <p>Olá ${clientName || ""},</p>
        <p>O <strong>${professionalName}</strong> (${professionalCategory}) enviou um orçamento para o teu pedido:</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px; color: #1a1a1a;">${jobTitle}</h3>
          <p style="margin: 4px 0; color: #475569;">📍 ${jobNeighborhood}</p>
          
          <div style="display: flex; gap: 24px; margin-top: 16px; flex-wrap: wrap;">
            <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Orçamento</p>
              <p style="margin: 4px 0 0; font-size: 20px; font-weight: 700; color: #16a34a;">${(amount / 1000).toFixed(0)} Kz</p>
            </div>
            <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Disponibilidade</p>
              <p style="margin: 4px 0 0; font-weight: 600; color: #1a1a1a;">${eta}</p>
            </div>
          </div>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${proposalUrl}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Ver proposta e responder</a>
        </p>
        
        <p style="color: #666; font-size: 14px;">Podes ver todas as propostas, comparar preços e combinar directamente no WhatsApp.</p>
        
        <hr style="margin: 30px 0; border-color: #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          BiscateAO · Luanda, Angola
        </p>
      </div>
    `,
    text: `Novo orçamento de ${professionalName} (${professionalCategory}) para "${jobTitle}" em ${jobNeighborhood}: ${(amount / 1000).toFixed(0)} Kz, ${eta}. Ver: ${proposalUrl}`,
  });
}

interface NewMessageEmailParams {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderRole: "cliente" | "profissional";
  jobTitle: string;
  messagePreview: string;
  messageUrl: string;
}

export async function sendNewMessageEmail(params: NewMessageEmailParams): Promise<{ success: boolean; error?: string }> {
  const { recipientEmail, recipientName, senderName, senderRole, jobTitle, messagePreview, messageUrl } = params;
  
  const roleLabel = senderRole === "cliente" ? "cliente" : "profissional";
  
  return sendEmail({
    to: recipientEmail,
    subject: `${senderName} (${roleLabel}) respondeu: ${jobTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Nova mensagem 💬</h1>
        </div>
        
        <p>Olá ${recipientName || ""},</p>
        <p><strong>${senderName}</strong> (${roleLabel}) enviou uma mensagem no teu pedido:</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #475569; font-weight: 600;">${jobTitle}</p>
          <p style="margin: 0; color: #1a1a1a; font-style: italic;">"${messagePreview}"</p>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${messageUrl}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Responder no chat</a>
        </p>
        
        <p style="color: #666; font-size: 14px;">A conversa fica disponível depois de aceitares a proposta. Combina detalhes, horário e pagamento directamente.</p>
        
        <hr style="margin: 30px 0; border-color: #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          BiscateAO · Luanda, Angola
        </p>
      </div>
    `,
    text: `${senderName} (${roleLabel}) respondeu em "${jobTitle}": ${messagePreview}. Responder: ${messageUrl}`,
  });
}

interface Reminder24hEmailParams {
  clientEmail: string;
  clientName: string;
  jobTitle: string;
  jobNeighborhood: string;
  jobUrl: string;
  jobCategory: string;
}

export async function sendReminder24hEmail(params: Reminder24hEmailParams): Promise<{ success: boolean; error?: string }> {
  const { clientEmail, clientName, jobTitle, jobNeighborhood, jobUrl, jobCategory } = params;
  
  return sendEmail({
    to: clientEmail,
    subject: `Lembrete: "${jobTitle}" sem propostas há 24h ⏰`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #dc2626; font-size: 24px; margin: 0;">Pedido sem resposta ⏰</h1>
        </div>
        
        <p>Olá ${clientName || ""},</p>
        <p>O teu pedido não recebeu nenhuma proposta nas últimas 24 horas:</p>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 8px; color: #dc2626;">${jobTitle}</h3>
          <p style="margin: 4px 0; color: #991b1b;">📍 ${jobNeighborhood} · ${jobCategory}</p>
        </div>
        
        <p>Às vezes os profissionais não veem o pedido a tempo. Podes:</p>
        <ul style="color: #475569;">
          <li style="margin-bottom: 8px;"><strong>Rever o pedido</strong> — descrição clara, fotos se ajudar, orçamento realista.</li>
          <li style="margin-bottom: 8px;"><strong>Alargar o bairro</strong> — profissionais de bairros vizinhos também podem ir.</li>
          <li style="margin-bottom: 8px;"><strong>Republicar</strong> — apaga e cria de novo para subir no feed.</li>
        </ul>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${jobUrl}" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Ver e editar o pedido</a>
        </p>
        
        <hr style="margin: 30px 0; border-color: #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          BiscateAO · Luanda, Angola
        </p>
      </div>
    `,
    text: `Lembrete: o teu pedido "${jobTitle}" em ${jobNeighborhood} não tem propostas há 24h. Ver e editar: ${jobUrl}`,
  });
}

interface JobAcceptedEmailParams {
  professionalEmail: string;
  professionalName: string;
  clientName: string;
  jobTitle: string;
  jobNeighborhood: string;
  chatUrl: string;
}

export async function sendJobAcceptedEmail(params: JobAcceptedEmailParams): Promise<{ success: boolean; error?: string }> {
  const { professionalEmail, professionalName, clientName, jobTitle, jobNeighborhood, chatUrl } = params;
  
  return sendEmail({
    to: professionalEmail,
    subject: `✅ Proposta aceite! ${clientName} quer trabalhar contigo`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #16a34a; font-size: 28px; margin: 0;">Proposta aceite! ✅</h1>
        </div>
        
        <p>Olá ${professionalName},</p>
        <p>Boas notícias! O <strong>${clientName}</strong> aceitou a tua proposta para:</p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 8px; color: #166534;">${jobTitle}</h3>
          <p style="margin: 4px 0; color: #15803d;">📍 ${jobNeighborhood}</p>
        </div>
        
        <p>O chat já está aberto para combinares os detalhes directamente com o cliente (horário, material, pagamento).</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${chatUrl}" style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Abrir chat no WhatsApp</a>
        </p>
        
        <p style="color: #666; font-size: 14px;">Lembra-te: bom trabalho gera boas avaliações e mais pedidos no futuro! 💪</p>
        
        <hr style="margin: 30px 0; border-color: #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          BiscateAO · Luanda, Angola
        </p>
      </div>
    `,
    text: `Proposta aceite! ${clientName} aceitou o teu orçamento para "${jobTitle}" em ${jobNeighborhood}. Chat: ${chatUrl}`,
  });
}

interface JobCompletedEmailParams {
  clientEmail: string;
  clientName: string;
  professionalName: string;
  jobTitle: string;
  reviewUrl: string;
}

export async function sendJobCompletedEmail(params: JobCompletedEmailParams): Promise<{ success: boolean; error?: string }> {
  const { clientEmail, clientName, professionalName, jobTitle, reviewUrl } = params;
  
  return sendEmail({
    to: clientEmail,
    subject: `Trabalho concluído — Avalia o ${professionalName} ⭐`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Trabalho concluído 🎉</h1>
        </div>
        
        <p>Olá ${clientName || ""},</p>
        <p>O <strong>${professionalName}</strong> marcou o trabalho como concluído:</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 8px; color: #1a1a1a;">${jobTitle}</h3>
        </div>
        
        <p>A tua avaliação ajuda outros vizinhos a escolherem o melhor profissional.</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${reviewUrl}" style="background: #f59e0b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Avaliar profissional</a>
        </p>
        
        <hr style="margin: 30px 0; border-color: #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          BiscateAO · Luanda, Angola
        </p>
      </div>
    `,
    text: `Trabalho "${jobTitle}" concluído por ${professionalName}. Avalia: ${reviewUrl}`,
  });
}