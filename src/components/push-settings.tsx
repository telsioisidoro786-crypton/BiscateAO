import { Bell, BellOff, Loader2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadNotificationPrefs, saveNotificationPrefs } from "@/lib/notification-prefs";

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
  const { pushSubscription, notificationPermission, subscribeToPush, unsubscribeFromPush, requestNotificationPermission } = usePWA();
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(true);

  const isSubscribed = !!pushSubscription;
  const pushAvailable = Boolean(vapidPublicKey.trim());

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
    if (!pushAvailable) return;
    if (notificationPermission === 'denied') {
      setShowPermissionDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      const subscription = await subscribeToPush(vapidPublicKey);
      if (subscription) {
        onSubscribed?.();
      }
    } catch (error) {
      console.error('Subscribe failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPush();
      onUnsubscribed?.();
    } catch (error) {
      console.error('Unsubscribe failed:', error);
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
    } catch (error) {
      console.error('Failed to update notification preference:', error);
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

      {!pushAvailable ? (
        <p className="mt-4 rounded-lg bg-sunken px-3 py-2 text-sm text-muted">
          As notificações push ainda não estão disponíveis nesta versão. As tuas preferências continuam guardadas no dispositivo.
        </p>
      ) : null}

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
        </div>
      )}
    </div>
  );
}

function NotificationToggle({ title, description, enabled, onChange }: { title: string; description: string; enabled: boolean; onChange?: (enabled: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border bg-bg p-3 cursor-pointer">
      <input type="checkbox" checked={enabled} onChange={(e) => onChange?.(e.target.checked)} className="sr-only" />
      <div className="h-5 w-5 flex items-center justify-center rounded border-2 border-border">
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
  const { pushSubscription, notificationPermission, subscribeToPush, unsubscribeFromPush, requestNotificationPermission } = usePWA();
  const [isLoading, setIsLoading] = useState(false);
  const pushAvailable = Boolean(vapidPublicKey.trim());
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
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      // Revert on error
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
