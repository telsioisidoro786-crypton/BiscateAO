import { Download, X, Smartphone, WifiOff, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isOnline, install } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Não mostrar se já instalado, já dispensado, ou no iOS (usa tutorial próprio)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const wasDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

    if (isInstallable && !isInstalled && !dismissed && !wasDismissed && !isIOS) {
      // Mostrar após 10s na página
      const timer = setTimeout(() => setShowBanner(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  if (!showBanner || isInstalled || !isInstallable) return null;

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowBanner(false);
    }
  };

  return (
    <Dialog open={showBanner} onOpenChange={setShowBanner}>
      <DialogContent className="max-w-sm fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md animate-slide-up">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Download className="size-7 text-primary" strokeWidth={2} />
          </div>
          <DialogTitle className="text-lg font-semibold">Instalar BiscateAO</DialogTitle>
          <DialogDescription>
            Adicione à tela inicial para acesso rápido, funcionamento offline e notificações.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="rounded-lg bg-surface p-3">
            <WifiOff className="mx-auto size-5 text-muted mb-1" strokeWidth={2} />
            <p className="text-xs font-medium">Offline</p>
            <p className="text-[10px] text-faint">Funciona sem internet</p>
          </div>
          <div className="rounded-lg bg-surface p-3">
            <Smartphone className="mx-auto size-5 text-muted mb-1" strokeWidth={2} />
            <p className="text-xs font-medium">Rápido</p>
            <p className="text-[10px] text-faint">Acesso instantâneo</p>
          </div>
          <div className="rounded-lg bg-surface p-3">
            <CheckCircle2 className="mx-auto size-5 text-muted mb-1" strokeWidth={2} />
            <p className="text-xs font-medium">Notificações</p>
            <p className="text-[10px] text-faint">Alertas em tempo real</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDismiss} className="flex-1">
            Agora não
          </Button>
          <Button onClick={handleInstall} className="flex-1">
            Instalar
          </Button>
        </div>

        <p className="mt-3 text-center text-xs text-faint">
          Grátis · Seguro · 2MB
        </p>
      </DialogContent>
    </Dialog>
  );
}

// Componente para botão de instalar no menu/configurações
export function InstallButton() {
  const { isInstallable, isInstalled, install } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  if (isInstalled || !isInstallable) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        setIsInstalling(true);
        await install();
        setIsInstalling(false);
      }}
      disabled={isInstalling}
      className="gap-1.5"
    >
      <Download className="size-3.5" strokeWidth={2.5} />
      Instalar app
    </Button>
  );
}

// Banner compacto para topo da página (alternativa ao dialog)
export function InstallBanner() {
  const { isInstallable, isInstalled, install } = usePWA();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInstallable && !isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
      const timer = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  if (!visible || isInstalled || !isInstallable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down border-b border-border bg-bg/95 backdrop-blur-sm px-4 py-3 md:max-w-2xl md:mx-auto md:rounded-none md:border-l md:border-r">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Download className="size-4 text-primary" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-medium">Instalar BiscateAO</p>
            <p className="text-xs text-muted">Offline, notificações, acesso rápido</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setVisible(false); localStorage.setItem('pwa-install-dismissed', 'true'); }}>
            <X className="size-4" strokeWidth={2} />
          </Button>
          <Button size="sm" onClick={async () => { await install(); setVisible(false); }}>
            Instalar
          </Button>
        </div>
      </div>
    </div>
  );
}