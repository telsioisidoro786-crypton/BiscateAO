import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BellOff, User, Shield, Palette, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePWA } from "@/hooks/usePWA";
import { PushSettingsPage } from "@/components/push-settings";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBiscate } from "@/lib/store";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export const Route = createFileRoute("/configuracoes")({
  component: Configuracoes,
});

function Configuracoes() {
  const { user, isPending } = useCurrentUser();
  const { pushSubscription, notificationPermission } = usePWA();
  const neighborhood = useBiscate((s) => s.neighborhood);
  const setNeighborhood = useBiscate((s) => s.setNeighborhood);
  const [activeTab, setActiveTab] = useState<'conta' | 'notificacoes' | 'app' | 'sobre'>('conta');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut('/');
    } catch {
      // handled by signOut
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" strokeWidth={2} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-2xl font-semibold">Configurações</h1>
        </header>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-card)] text-center">
          <p className="text-sm text-muted">
            Faça login para acessar as configurações.
          </p>
          <Button asChild className="w-full mt-4" size="lg">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    );
  }

  const userName = user.name || user.email || 'Usuário';
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold">Configurações</h1>
        <p className="mt-1 text-sm text-muted">
          Gerencie sua conta, notificações e preferências
        </p>
      </header>

      {/* Abas */}
      <div className="flex gap-1 bg-sunken rounded-xl p-1" role="tablist">
        {[
          { id: 'conta', label: 'Conta', icon: User },
          { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: pushSubscription ? 'Ativo' : null },
          { id: 'app', label: 'App', icon: Palette },
          { id: 'sobre', label: 'Sobre', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-bg text-ink shadow-[var(--shadow-card)]"
                : "text-muted hover:text-ink",
            )}
          >
            <tab.icon className="size-4" strokeWidth={2} />
            {tab.label}
            {tab.badge && (
              <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                {tab.badge}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      <div className="space-y-5">
        {activeTab === 'conta' && (
          <section className="space-y-5">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-display font-semibold text-primary">
                    {userInitials}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold">{userName}</p>
                  <p className="text-sm text-muted">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-medium mb-4">Bairro padrão</h3>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              >
                {[
                  "Viana", "Cacuaco", "Cazenga", "Palanca", "Sambizanga", "Rangel",
                  "Hoji-ya-Henda", "Camama", "Kilamba", "Talatona", "Benfica",
                  "Zango", "Panguila", "Maianga", "Samba", "Belas"
                ].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-medium mb-4">Segurança</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3" onClick={() => alert('Em breve: alterar senha')}>
                  <Shield className="size-4" strokeWidth={2} />
                  <span>Alterar senha</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={() => alert('Em breve: autenticação 2FA')}>
                  <Shield className="size-4" strokeWidth={2} />
                  <span>Autenticação de dois fatores</span>
                </Button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'notificacoes' && (
          <PushSettingsPage vapidPublicKey={VAPID_PUBLIC_KEY} />
        )}

        {activeTab === 'app' && (
          <section className="space-y-5">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-medium mb-4">Aparência</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer rounded-lg p-3 border border-border bg-bg">
                  <input type="radio" name="theme" defaultChecked className="sr-only" />
                  <div className="flex h-8 w-8 items-center justify-center rounded border-2 border-primary">
                    <span className="text-xs font-medium text-primary">☀️</span>
                  </div>
                  <div>
                    <p className="font-medium">Claro</p>
                    <p className="text-sm text-muted">Tema claro padrão</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer rounded-lg p-3 border border-border bg-bg">
                  <input type="radio" name="theme" className="sr-only" />
                  <div className="flex h-8 w-8 items-center justify-center rounded border-2 border-border">
                    <span className="text-xs font-medium text-muted">🌙</span>
                  </div>
                  <div>
                    <p className="font-medium">Escuro</p>
                    <p className="text-sm text-muted">Tema escuro (em breve)</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer rounded-lg p-3 border border-border bg-bg">
                  <input type="radio" name="theme" defaultChecked className="sr-only" />
                  <div className="flex h-8 w-8 items-center justify-center rounded border-2 border-border">
                    <span className="text-xs font-medium text-muted">⚙️</span>
                  </div>
                  <div>
                    <p className="font-medium">Sistema</p>
                    <p className="text-sm text-muted">Seguir preferência do dispositivo</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-medium mb-4">Dados e armazenamento</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3" onClick={() => alert('Em breve: limpar cache')}>
                  <span className="size-4">🗑️</span>
                  <span>Limpar cache offline</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={() => alert('Em breve: exportar dados')}>
                  <span className="size-4">📤</span>
                  <span>Exportar meus dados</span>
                </Button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'sobre' && (
          <section className="space-y-5">
            <div className="rounded-xl border border-border bg-surface p-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                <span className="text-3xl font-display font-semibold text-primary">BA</span>
              </div>
              <h3 className="font-display text-xl font-semibold">BiscateAO</h3>
              <p className="mt-2 text-sm text-muted">
                Versão 1.0.0 · Build development
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
              <Link
                to="/termos"
                className="flex items-center gap-3 rounded-lg p-3 border border-border bg-bg hover:bg-surface transition-colors"
              >
                <span className="size-5">📄</span>
                <span className="font-medium">Termos de Uso</span>
              </Link>
              <Link
                to="/privacidade"
                className="flex items-center gap-3 rounded-lg p-3 border border-border bg-bg hover:bg-surface transition-colors"
              >
                <span className="size-5">🔒</span>
                <span className="font-medium">Política de Privacidade</span>
              </Link>
              <Link
                to="/como-funciona"
                className="flex items-center gap-3 rounded-lg p-3 border border-border bg-bg hover:bg-surface transition-colors"
              >
                <span className="size-5">❓</span>
                <span className="font-medium">Como funciona</span>
              </Link>
              <Link
                to="/contato"
                className="flex items-center gap-3 rounded-lg p-3 border border-border bg-bg hover:bg-surface transition-colors"
              >
                <span className="size-5">📧</span>
                <span className="font-medium">Suporte e contato</span>
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-medium mb-3">Licenças de código aberto</h3>
              <p className="text-sm text-muted mb-3">
                Este aplicativo usa bibliotecas de código aberto. Obrigado à comunidade!
              </p>
              <div className="space-y-2 text-sm text-muted">
                <p>React · TanStack Router · TanStack Query · Tailwind CSS · Radix UI</p>
                <p>Zod · Zustand · Lucide React · Sonner · Date-fns · Workbox</p>
              </div>
            </div>
          </section>
        )}

        <div className="pt-4 border-t border-border">
          <Button
            variant="destructive"
            className="w-full"
            size="lg"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" strokeWidth={2} />
                Saindo...
              </>
            ) : (
              <>
                <LogOut className="mr-2 size-4" strokeWidth={2} />
                Sair da conta
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}