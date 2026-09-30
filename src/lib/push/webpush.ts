// Configuração VAPID - em produção, use variáveis de ambiente
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:contato@biscateao.app';

let webpushConfigured = false;
let webpushModule: any = null;

async function ensureWebpushConfigured() {
  if (webpushConfigured) return;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[webpush] VAPID keys not configured');
    return;
  }
  try {
    const webpush = await import('web-push');
    webpushModule = webpush.default;
    webpushModule.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    webpushConfigured = true;
  } catch (error) {
    console.warn('[webpush] Failed to configure VAPID:', error);
  }
}

interface WebPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  expirationTime?: number | null;
}

export async function sendPushNotification(
  subscription: PushSubscription | WebPushSubscription,
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
  await ensureWebpushConfigured();

  if (!webpushConfigured || !webpushModule) {
    console.warn('[webpush] VAPID keys not configured, skipping send');
    return { success: false, error: 'VAPID not configured' };
  }

  try {
    await webpushModule.sendNotification(subscription as any, JSON.stringify(payload));
    return { success: true };
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('[webpush] Subscription expired:', (subscription as any).endpoint);
      return { success: false, error: 'subscription_expired' };
    }
    console.error('[webpush] Send failed:', error);
    return { success: false, error: error.message };
  }
}

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

export const notificationTemplates = {
  newProposal: (proName: string, jobTitle: string, url: string) => ({
    title: 'Novo orcamento recebido!',
    body: `${proName} enviou orcamento para "${jobTitle}"`,
    tag: 'new-proposal',
    data: { url },
    actions: [
      { action: 'view', title: 'Ver proposta' },
      { action: 'dismiss', title: 'Depois' },
    ],
    requireInteraction: true,
  }),

  newMessage: (fromName: string, preview: string, url: string) => ({
    title: `${fromName} respondeu`,
    body: preview.length > 50 ? preview.slice(0, 50) + '...' : preview,
    tag: 'new-message',
    data: { url },
    actions: [
      { action: 'reply', title: 'Responder' },
      { action: 'dismiss', title: 'Depois' },
    ],
  }),

  jobAccepted: (proName: string, jobTitle: string, url: string) => ({
    title: 'Proposta aceita!',
    body: `Voce aceitou a proposta de ${proName} para "${jobTitle}"`,
    tag: 'job-accepted',
    data: { url },
    actions: [
      { action: 'chat', title: 'Conversar' },
      { action: 'dismiss', title: 'OK' },
    ],
    requireInteraction: true,
  }),

  jobCompleted: (jobTitle: string, url: string) => ({
    title: 'Trabalho concluido!',
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
    title: 'Lembrete: pedido sem resposta',
    body: `Seu pedido "${jobTitle}" nao tem propostas ha 24h`,
    tag: 'reminder',
    data: { url },
    actions: [
      { action: 'view', title: 'Ver pedido' },
      { action: 'dismiss', title: 'Depois' },
    ],
  }),

  promo: (title: string, body: string, url: string) => ({
    title: title,
    body,
    tag: 'promo',
    data: { url },
    actions: [
      { action: 'view', title: 'Ver' },
      { action: 'dismiss', title: 'Nao' },
    ],
  }),
};

export function generateVAPIDKeys(): { publicKey: string; privateKey: string } {
  return {
    publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
    privateKey: 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls',
  };
}

export { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY };