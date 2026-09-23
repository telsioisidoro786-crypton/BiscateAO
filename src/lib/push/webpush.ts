import webpush from 'web-push';

// Configuração VAPID - em produção, use variáveis de ambiente
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:contato@biscateao.app';

// Configurar web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * Enviar notificação push para uma subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: { url?: string };
    actions?: Array<{ action: string; title: string }>;
    requireInteraction?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[webpush] VAPID keys not configured, skipping send');
    return { success: false, error: 'VAPID not configured' };
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error: any) {
    // 410/404 = subscription inválida/expirada
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('[webpush] Subscription expired:', subscription.endpoint);
      return { success: false, error: 'subscription_expired' };
    }
    console.error('[webpush] Send failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar notificação para múltiplas subscriptions
 */
export async function sendBulkPushNotifications(
  subscriptions: PushSubscription[],
  payload: Parameters<typeof sendPushNotification>[1]
): Promise<{ sent: number; failed: number; expired: string[] }> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );

  let sent = 0;
  let failed = 0;
  const expired: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.success) sent++;
      else {
        failed++;
        if (result.value.error === 'subscription_expired') {
          expired.push(subscriptions[index].endpoint);
        }
      }
    } else {
      failed++;
    }
  });

  return { sent, failed, expired };
}

/**
 * Payloads padrão para diferentes tipos de notificação
 */
export const notificationTemplates = {
  newProposal: (proName: string, jobTitle: string, url: string) => ({
    title: '💰 Nova proposta recebida!',
    body: `${proName} enviou orçamento para "${jobTitle}"`,
    tag: 'new-proposal',
    data: { url },
    actions: [
      { action: 'view', title: 'Ver proposta' },
      { action: 'dismiss', title: 'Depois' },
    ],
    requireInteraction: true,
  }),

  newMessage: (fromName: string, preview: string, url: string) => ({
    title: `💬 ${fromName} respondeu`,
    body: preview.length > 50 ? preview.slice(0, 50) + '...' : preview,
    tag: 'new-message',
    data: { url },
    actions: [
      { action: 'reply', title: 'Responder' },
      { action: 'dismiss', title: 'Depois' },
    ],
  }),

  jobAccepted: (proName: string, jobTitle: string, url: string) => ({
    title: '✅ Proposta aceita!',
    body: `Você aceitou a proposta de ${proName} para "${jobTitle}"`,
    tag: 'job-accepted',
    data: { url },
    actions: [
      { action: 'chat', title: 'Conversar' },
      { action: 'dismiss', title: 'OK' },
    ],
    requireInteraction: true,
  }),

  jobCompleted: (jobTitle: string, url: string) => ({
    title: '🎉 Trabalho concluído!',
    body: `"${jobTitle}" foi finalizado. Avalie o profissional.`,
    tag: 'job-completed',
    data: { url },
    actions: [
      { action: 'rate', title: 'Avaliar' },
      { action: 'dismiss', title: 'Depois' },
    ],
    requireInteraction: true,
  }),

  reminder: (jobTitle: string, url: string) => ({
    title: '⏰ Lembrete: pedido sem resposta',
    body: `Seu pedido "${jobTitle}" não tem propostas há 24h`,
    tag: 'reminder',
    data: { url },
    actions: [
      { action: 'view', title: 'Ver pedido' },
      { action: 'dismiss', title: 'Depois' },
    ],
  }),

  promo: (title: string, body: string, url: string) => ({
    title: `🎁 ${title}`,
    body,
    tag: 'promo',
    data: { url },
    actions: [
      { action: 'view', title: 'Ver' },
      { action: 'dismiss', title: 'Não' },
    ],
  }),
};

/**
 * Gerar chaves VAPID (rodar uma vez no setup)
 */
export function generateVAPIDKeys(): { publicKey: string; privateKey: string } {
  // Em produção, use: npx web-push generate-vapid-keys
  // Este é apenas um placeholder - NÃO USE EM PRODUÇÃO
  return {
    publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
    privateKey: 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls',
  };
}

export { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY };