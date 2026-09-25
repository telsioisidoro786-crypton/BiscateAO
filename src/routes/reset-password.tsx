import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";
import { signOut, authEnabled } from "@/lib/auth/client";
import { useBiscate } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const [step, setStep] = useState<"request" | "confirm" | "success">("request");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
      setStep("confirm");
    }
  }, []);

  if (!authEnabled) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-2xl font-semibold">Redefinir senha</h1>
          <p className="mt-1 text-sm text-muted">
            Autenticação desativada. Modo de desenvolvimento ativo.
          </p>
        </header>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-card)] text-center">
          <p className="text-sm text-muted">
            Para ativar autenticação, defina <code>VITE_AUTH_ENABLED=true</code>
            no <code>.grok/app-env.json</code> e reinicie o servidor.
          </p>
        </div>
      </div>
    );
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { authClient } = await import("@/lib/auth/client");
      const { error } = await (authClient as any).forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw new Error(error.message);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    setIsLoading(true);
    try {
      const { authClient } = await import("@/lib/auth/client");
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (error) throw new Error(error.message);
      await navigate({ to: "/login" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir senha");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { authClient } = await import("@/lib/auth/client");
      const { error } = await (authClient as any).forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw new Error(error.message);
      toast.success("Email reenviado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reenviar");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-2xl font-semibold">Redefinir senha</h1>
          <p className="mt-1 text-sm text-muted">
            Verifique seu email para redefinir a senha
          </p>
        </header>

        <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-6 text-green-600" />
          </div>
          <h2 className="font-display text-lg font-semibold text-green-800">
            Email enviado!
          </h2>
          <p className="mt-2 text-sm text-green-700">
            Enviamos um link para <strong className="text-green-900">{email}</strong>.
            Verifique sua caixa de entrada (e spam) e clique no link para redefinir sua senha.
          </p>
        </div>

        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm text-muted mb-4">
            Não recebeu o email? Verifique a pasta de spam ou tente novamente.
          </p>
          <Button variant="outline" className="w-full" onClick={() => setStep("request")}>
            Reenviar email
          </Button>
        </div>

        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm text-muted text-center">
            Lembrou a senha?{" "}
            <Link to="/login" className="text-primary underline-offset-2 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="space-y-5">
        <header>
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
            <RotateCcw className="size-4" />
            Voltar
          </Link>
          <h1 className="font-display text-2xl font-semibold">Redefinir senha</h1>
          <p className="mt-1 text-sm text-muted">
            Digite sua nova senha para <strong className="text-ink">{email}</strong>
          </p>
        </header>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2" role="alert">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleConfirmReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="h-12 pl-10 pr-10"
                required
                minLength={8}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="h-12 pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Redefinindo...
              </>
            ) : (
              "Redefinir senha"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          Lembrou a senha?{" "}
          <Link to="/login" className="text-primary underline-offset-2 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    );
  }

  // Step: request
  return (
    <div className="space-y-5">
      <header>
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
          <RotateCcw className="size-4" />
          Voltar
        </Link>
        <h1 className="font-display text-2xl font-semibold">Redefinir senha</h1>
        <p className="mt-1 text-sm text-muted">
          Digite seu email para receber um link de redefinição
        </p>
      </header>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2" role="alert">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleRequestReset} className="space-y-4">
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

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar link de redefinição"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Lembrou a senha?{" "}
        <Link to="/login" className="text-primary underline-offset-2 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}