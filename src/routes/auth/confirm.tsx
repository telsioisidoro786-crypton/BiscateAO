import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth/confirm")({
  component: ConfirmEmail,
});

function ConfirmEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const type = params.get("type");
    const emailParam = params.get("email");

    if (emailParam) setEmail(emailParam);

    const verify = async () => {
      try {
        if (type === "recovery" || params.get("type") === "recovery") {
          // Password reset flow - redirect to reset password page
          window.location.href = `/reset-password?token=${token}&email=${emailParam}`;
          return;
        }

        // Email verification
        const { data, error } = await authClient.verifyEmail({ token: token || "" });
        if (error) throw new Error(error.message);
        
        setStatus("success");
        setMessage("Email verificado com sucesso! Bem-vindo ao BiscateAO.");
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Erro ao verificar email. O link pode ter expirado.");
      }
    };

    verify();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="text-center">
        <div className={cn(
          "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
          status === "success" ? "bg-green-500/10" : "bg-red-500/10"
        )}>
          {status === "success" ? (
            <CheckCircle className="size-8 text-green-500" strokeWidth={2} />
          ) : (
            <AlertCircle className="size-8 text-red-500" strokeWidth={2} />
          )}
        </div>
        <h1 className="font-display text-2xl font-semibold">
          {status === "success" ? "Email Verificado" : "Erro na Verificação"}
        </h1>
        <p className="mt-2 text-sm text-muted max-w-xs mx-auto">{message}</p>
      </header>

      <div className="rounded-xl border border-border bg-surface p-5 text-center">
        {status === "success" && (
          <>
            <p className="text-sm text-muted mb-4">
              A sua conta foi ativada. Já pode entrar e começar a usar o BiscateAO.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link to="/login">Entrar agora</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-sm text-muted mb-4">
              O link de verificação pode ter expirado ou já foi usado.
            </p>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link to="/login">Voltar ao Login</Link>
            </Button>
            <Button asChild className="w-full mt-3" size="lg">
              <Link to="/reset-password">Reenviar Email</Link>
            </Button>
          </>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 text-center">
        <Mail className="mx-auto size-8 text-primary mb-3" strokeWidth={1.5} />
        <h3 className="font-medium">Não recebeu o email?</h3>
        <p className="mt-1 text-sm text-muted">
          Verifique a pasta de spam/lixo eletrónico.
        </p>
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link to="/login">Reenviar Email de Verificação</Link>
        </Button>
      </div>
    </div>
  );
}