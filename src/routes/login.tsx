import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn, signOut, authEnabled, GROK_PROVIDERS } from "@/lib/auth/client";
import { useBiscate } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const setNeighborhood = useBiscate((s) => s.setNeighborhood);

  // Check if we're in a live preview iframe
  const inLivePreview = typeof window !== "undefined" &&
    window.location.hostname.endsWith(".grok-sandbox.com");

  const handleOAuthSignIn = async (providerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn(providerId, { callbackURL: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { authClient } = await import("@/lib/auth/client");
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut("/");
    } catch {
      setError("Erro ao sair");
      setIsLoading(false);
    }
  };

  if (!authEnabled) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-2xl font-semibold">Entrar</h1>
          <p className="mt-1 text-sm text-muted">
            Autenticação desativada. Modo de desenvolvimento ativo.
          </p>
        </header>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm text-muted">
            Para ativar autenticação, defina <code>VITE_AUTH_ENABLED=true</code>
            no <code>.grok/app-env.json</code> e reinicie o servidor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold">Entrar no BiscateAO</h1>
        <p className="mt-1 text-sm text-muted">
          Acesse sua conta para publicar pedidos, ver propostas e gerenciar favoritos.
        </p>
      </header>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Provedores OAuth via Broker */}
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Entrar com
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {GROK_PROVIDERS.map((provider) => (
            <Button
              key={provider.providerId}
              variant="outline"
              disabled={isLoading}
              onClick={() => handleOAuthSignIn(provider.providerId)}
              className="w-full justify-center gap-2"
            >
              {provider.label === "Google" && (
                <svg className="size-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {provider.label === "X" && (
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 9.12-1.92 1.533-9.31-10.07-8.51 9.12-1.52-1.528 7.23-8.26H2.058v-1.533h3.044L11.95 2.25h6.294Z" />
                </svg>
              )}
              {provider.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Email/Password (se habilitado) */}
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg px-2 text-muted">ou email</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="h-12 pl-10"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Label className="text-xs text-muted hover:text-ink cursor-pointer">
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="mr-1.5 size-4" />
              Mostrar senha
            </Label>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 pl-10 pr-10"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar com email"
          )}
        </Button>
      </form>

      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-card)]">
        <p className="text-sm text-muted text-center">
          Ao entrar, você concorda com nossos{" "}
          <Link to="/termos" className="text-primary underline-offset-2 hover:underline">
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link to="/privacidade" className="text-primary underline-offset-2 hover:underline">
            Política de Privacidade
          </Link>.
        </p>
      </div>
    </div>
  );
}