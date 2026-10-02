import { Bell, BellOff, Loader2, Check, X, AlertCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadNotificationPrefs, saveNotificationPrefs } from "@/lib/notification-prefs";
import { toast } from "sonner";

type NotificationPrefs = {
  proposals: boolean;
  messages: boolean;
  jobUpdates: boolean;
  reminders: boolean;
  email: boolean;
};

interface PushSettingsProps {
  vapidPublicKey: string;
  onSubscribed?: () => void;
  onUnsubscribed?: () => void;
}

export function PushSettings({ vapidPublicKey, onSubscribed, onUnsubscribed }: PushSettingsProps) {
  const { 
    pushSubscription, 
    notificationPermission, 
    subscribeToPush, 
    unsubscribeFromPush, 
    requestNotificationPermission,
    vapidConfigured
  } = usePWA();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(true);

  const isSubscribed = !!pushSubscription;
  const pushAvailable = vapidConfigured && Boolean(vapidPublicKey.trim());

  // Carregar preferências do servidor
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const data = await loadNotificationPrefs();
        setPrefs(data);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
        setPrefs({ proposals: true, messages: true, jobUpdates: true, reminders: true, email: true });
      } finally {
        setPrefsLoading(false);
      }
    };
    loadPrefs();
  }, []);

  const handleSubscribe = async () => {
    if (!pushAvailable) {
      toast.error("Notificações push não configuradas. Configure as chaves VAPID nas variáveis de ambiente.");
      return;
    }
    if (notificationPermission === 'denied') {
      setShowPermissionDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      const subscription = await subscribeToPush(vapidPublicKey);
      if (subscription) {
        onSubscribed?.();
        toast.success("Notificações ativadas com sucesso!");
      } else if (notificationPermission !== 'granted') {
        toast.error("Permissão de notificação necessária");
      }
    } catch (error) {
      console.error('Subscribe failed:', error);
      toast.error("Falha ao ativar notificações. Verifique se as chaves VAPID estão configuradas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPush();
      onUnsubscribed?.();
      toast.success("Notificações desativadas");
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      toast.error("Falha ao desativar notificações");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionClick = async () => {
    await requestNotificationPermission();
    setShowPermissionDialog(false);
  };

  const handlePrefChange = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!prefs) return;
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    try {
      await saveNotificationPrefs(newPrefs);
      toast.success("Preferência salva");
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      toast.error("Falha ao salvar preferência");
      // Revert on error
      setPrefs(prefs);
    }
  };

  if (notificationPermission === 'denied' && !isSubscribed) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <BellOff className="size-6 text-muted" strokeWidth={2} />
          <div className="flex-1">
            <p className="font-medium">Notificações bloqueadas</p>
            <p className="text-sm text-muted">
              Para receber alertas, habilite nas configurações do navegador.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handlePermissionClick}>
            Abrir configurações
          </Button>
        </div>
      </div>
    );
  }

  if (prefsLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <Loader2 className="size-6 text-muted animate-spin" strokeWidth={2} />
          <div className="flex-1">
            <p className="font-medium">A carregar preferências...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full",
            isSubscribed ? "bg-primary/10" : "bg-muted/50"
          )}>
            {isSubscribed ? (
              <Bell className="size-5 text-primary" strokeWidth={2} />
            ) : (
              <Bell className="size-5 text-muted" strokeWidth={2} />
            )}
          </div>
          <div>
            <p className="font-medium">Notificações push</p>
            <p className="text-sm text-muted">
              {isSubscribed ? 'Recebendo alertas em tempo real' : 'Ative para receber propostas e mensagens'}
            </p>
          </div>
        </div>

        <Button
          variant={isSubscribed ? "outline" : "default"}
          size="sm"
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isLoading || (!isSubscribed && !pushAvailable)}
          className="gap-1.5"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isSubscribed ? (
            <>
              <X className="size-4" strokeWidth={2.5} />
              Desativar
            </>
          ) : (
            <>
              <Bell className="size-4" strokeWidth={2.5} />
              Ativar
            </>
          )}
        </Button>
      </div>

      {!pushAvailable && (
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-amber-600" strokeWidth={2} />
            <div className="flex-1">
              <p className="font-medium text-amber-800">Notificações push não configuradas</p>
              <p className="text-sm text-amber-700">
                As chaves VAPID não estão configuradas no servidor. 
                Configure <code>VITE_VAPID_PUBLIC_KEY</code> e <code>VAPID_PRIVATE_KEY</code> nas variáveis de ambiente do Vercel.
              </p>
            </div>
          </div>
        </div>
      )}

      {!vapidConfigured && pushAvailable && (
        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <Info className="size-5 text-blue-600" strokeWidth={2} />
            <div className="flex-1">
              <p className="font-medium text-blue-800">Chave VAPID detectada</p>
              <p className="text-sm text-blue-700">
                A chave pública VAPID está configurada. As notificações push estão prontas para uso.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSubscribed && prefs && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <NotificationToggle
            title="Novas propostas"
            description="Quando um profissional enviar orçamento"
            enabled={prefs.proposals}
            onChange={(v) => handlePrefChange('proposals', v)}
          />
          <NotificationToggle
            title="Mensagens no chat"
            description="Novas respostas dos profissionais"
            enabled={prefs.messages}
            onChange={(v) => handlePrefChange('messages', v)}
          />
          <NotificationToggle
            title="Status do pedido"
            description="Quando o pedido for aceito ou concluído"
            enabled={prefs.jobUpdates}
            onChange={(v) => handlePrefChange('jobUpdates', v)}
          />
          <NotificationToggle
            title="Lembretes"
            description="Pedidos sem resposta após 24h"
            enabled={prefs.reminders}
            onChange={(v) => handlePrefChange('reminders', v)}
          />
          <NotificationToggle
            title="Promoções e novidades"
            description="Ofertas especiais e novos recursos (opcional)"
            enabled={prefs.email}
            onChange={(v) => handlePrefChange('email', v)}
          />
        </div>
      )}
    </div>
  );
}

function NotificationToggle({ title, description, enabled, onChange }: { title: string; description: string; enabled: boolean; onChange?: (enabled: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border bg-bg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
      <input type="checkbox" checked={enabled} onChange={(e) => onChange?.(e.target.checked)} className="sr-only peer" />
      <div className="h-5 w-5 flex items-center justify-center rounded border-2 border-border peer-checked:border-primary peer-checked:bg-primary/10 transition-colors">
        {enabled && <Check className="size-3 text-primary" strokeWidth={3} />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
    </label>
  );
}

// Componente para página de configurações completa
export function PushSettingsPage({ vapidPublicKey }: { vapidPublicKey: string }) {
  const { pushSubscription, notificationPermission, subscribeToPush, unsubscribeFromPush, requestNotificationPermission, vapidConfigured } = usePWA();
  const [isLoading, setIsLoading] = useState(false);
  const pushAvailable = vapidConfigured && Boolean(vapidPublicKey.trim());
  const [pagePrefs, setPagePrefs] = useState<NotificationPrefs | null>(null);
  const [pagePrefsLoading, setPagePrefsLoading] = useState(true);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const data = await loadNotificationPrefs();
        setPagePrefs(data);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
        setPagePrefs({ proposals: true, messages: true, jobUpdates: true, reminders: true, email: true });
      } finally {
        setPagePrefsLoading(false);
      }
    };
    loadPrefs();
  }, []);

  const handlePagePrefChange = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!pagePrefs) return;
    const newPrefs = { ...pagePrefs, [key]: value };
    setPagePrefs(newPrefs);
    try {
      await saveNotificationPrefs(newPrefs);
      toast.success("Preferência salva");
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      toast.error("Falha ao salvar preferência");
      setPagePrefs(pagePrefs);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">Notificações</h1>
        <p className="mt-1 text-sm text-muted">
          Gerencie como e quando você recebe alertas do BiscateAO
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Permissões</h2>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full",
                notificationPermission === 'granted' ? "bg-green-500/10" :
                notificationPermission === 'denied' ? "bg-red-500/10" : "bg-muted/50"
              )}>
                {notificationPermission === 'granted' ? (
                  <Bell className="size-5 text-green-500" strokeWidth={2} />
                ) : notificationPermission === 'denied' ? (
                  <BellOff className="size-5 text-red-500" strokeWidth={2} />
                ) : (
                  <Bell className="size-5 text-muted" strokeWidth={2} />
                )}
              </div>
              <div>
                <p className="font-medium">Permissão do navegador</p>
                <p className="text-sm text-muted">
                  {notificationPermission === 'granted' ? 'Concedida ✓' :
                   notificationPermission === 'denied' ? 'Bloqueada - configure nas definições do navegador' :
                   'Não solicitada ainda'}
                </p>
              </div>
            </div>
            {notificationPermission !== 'granted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => { await requestNotificationPermission(); }}
              >
                {notificationPermission === 'denied' ? 'Abrir configurações' : 'Permitir'}
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Assinatura push</h2>
        <PushSettings vapidPublicKey={vapidPublicKey} />
      </section>

      {pagePrefsLoading ? (
        <div className="rounded-xl border border-border bg-surface p-5">
          <Loader2 className="size-6 text-muted animate-spin mx-auto" strokeWidth={2} />
        </div>
      ) : pagePrefs && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Tipos de notificação</h2>
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
            <NotificationToggle
              title="Novas propostas"
              description="Quando um profissional enviar orçamento para seu pedido"
              enabled={pagePrefs.proposals}
              onChange={(v) => handlePagePrefChange('proposals', v)}
            />
            <NotificationToggle
              title="Respostas no chat"
              description="Mensagens de profissionais nas suas conversas"
              enabled={pagePrefs.messages}
              onChange={(v) => handlePagePrefChange('messages', v)}
            />
            <NotificationToggle
              title="Pedido aceito/concluído"
              description="Atualizações de status dos seus pedidos"
              enabled={pagePrefs.jobUpdates}
              onChange={(v) => handlePagePrefChange('jobUpdates', v)}
            />
            <NotificationToggle
              title="Lembretes de pedidos"
              description="Pedidos sem resposta após 24 horas"
              enabled={pagePrefs.reminders}
              onChange={(v) => handlePagePrefChange('reminders', v)}
            />
            <NotificationToggle
              title="Promoções e novidades"
              description="Ofertas especiais e novos recursos (opcional)"
              enabled={pagePrefs.email}
              onChange={(v) => handlePagePrefChange('email', v)}
            />
          </div>
        </section>
      )}

      {pushSubscription && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Debug</h2>
          <details className="rounded-lg border border-border bg-surface p-4">
            <summary className="cursor-pointer text-sm font-medium text-muted">
              Detalhes da assinatura
            </summary>
            <pre className="mt-3 text-xs overflow-auto bg-bg p-3 rounded">
              {JSON.stringify(pushSubscription.toJSON(), null, 2)}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}