import { useEffect, useState, useCallback } from 'react';
import { signOut, getBearerToken } from '@/lib/auth/client';

/**
 * Hook para gerenciar Service Worker, instalação PWA e notificações push
 */
export function usePWA() {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null | undefined>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Registrar Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerSWAsync = async () => {
      try {
        const { Workbox } = await import('workbox-window');
        const wb = new Workbox('/sw.js');
        const registration = await wb.register();
        setSwRegistration(registration);

        // Verificar se já está instalado
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsInstalled(isStandalone);

        if (registration) {
          // Listar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  if (confirm('Nova versão disponível! Recarregar para atualizar?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Verificar subscription push existente
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) setPushSubscription(subscription);
        }

      } catch (error) {
        console.error('[PWA] SW registration failed:', error);
      }
    };

    registerSWAsync();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // Online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if already installed (PWA launched from home screen)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Solicitar permissão de notificação
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  }, []);

  // Subscrever push notifications
  const subscribeToPush = useCallback(async (vapidPublicKey: string) => {
    if (!swRegistration) return null;

    try {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') return null;

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setPushSubscription(subscription);

      // Enviar subscription para o servidor
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) throw new Error('Não foi possível guardar a subscrição push.');

      return subscription;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      return null;
    }
  }, [swRegistration, requestNotificationPermission]);

  // Cancelar subscription
  const unsubscribeFromPush = useCallback(async () => {
    if (!pushSubscription) return;

    try {
      await pushSubscription.unsubscribe();
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: pushSubscription.endpoint }),
      });
      if (!response.ok) throw new Error('Não foi possível remover a subscrição push.');
      setPushSubscription(null);
    } catch (error) {
      console.error('[PWA] Push unsubscribe failed:', error);
    }
  }, [pushSubscription]);

  // Instalar PWA
  const install = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        setIsInstallable(false);
        setIsInstalled(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      return false;
    }
  }, [installPrompt]);

  // Registrar background sync
  const registerSync = useCallback(async (tag: string) => {
    if (!swRegistration || !('sync' in (swRegistration as any))) return;

    try {
      await (swRegistration as any).sync.register(tag);
    } catch (error) {
      console.error('[PWA] Sync registration failed:', error);
    }
  }, [swRegistration]);

  // Enviar ação offline para sync
  const queueOfflineAction = useCallback(async (type: 'proposta' | 'pedido' | 'chat', data: any) => {
    // Salvar no IndexedDB
    const storeName = type === 'proposta' ? 'pendingPropostas' :
                      type === 'pedido' ? 'pendingPedidos' : 'pendingChat';
    await addToOfflineDB(storeName, { ...data, id: crypto.randomUUID(), timestamp: Date.now() });

    // Registrar sync
    await registerSync(`sync-${type}s`);
  }, [registerSync]);

  return {
    swRegistration,
    installPrompt,
    isInstallable,
    isInstalled,
    pushSubscription,
    notificationPermission,
    isOnline,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    install,
    registerSync,
    queueOfflineAction,
  };
}

// Helper para abrir IndexedDB
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('biscateao-offline', 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      ['pendingPropostas', 'pendingPedidos', 'pendingChat', 'cachedProfissionais', 'cachedJobs']
        .forEach(name => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: 'id' });
          }
        });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Helper para adicionar ao IndexedDB
async function addToOfflineDB(storeName: string, data: any): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Converter VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Type augmentation
declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
  }
}
