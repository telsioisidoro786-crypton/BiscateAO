import { Link } from "@tanstack/react-router";
import { BadgePlus, Bookmark, ClipboardList, LogOut, Settings, User } from "lucide-react";
import { useState, useEffect } from "react";
import { signOut, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserButton() {
  const { user, isPending } = useCurrentUserState();
  if (!authEnabled) {
    return (
      <Button asChild variant="ghost" size="icon" className="h-10 w-10" aria-label="Entrar ou criar conta">
        <Link to="/login"><User className="size-4" strokeWidth={2} /></Link>
      </Button>
    );
  }

  if (isPending || !user) {
    return (
      <Button asChild variant="ghost" size="icon" className="h-10 w-10" aria-label="Entrar ou criar conta">
        <Link to="/login"><User className="size-4" strokeWidth={2} /></Link>
      </Button>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut("/");
    } catch {
      // Error handled by signOut function
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Abrir menu da conta">
          <div className="size-8 rounded-full bg-primary flex items-center justify-center">
            <User className="size-4 text-primary-fg" strokeWidth={2.5} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 rounded-xl border-border bg-surface p-2 shadow-[var(--shadow-card)]" align="end" sideOffset={10} forceMount>
        <DropdownMenuLabel className="flex items-center gap-3 px-2 py-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {(user.displayName ?? user.primaryEmail ?? "U").charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-semibold text-ink">{user.displayName ?? "A tua conta"}</span>
            <span className="block truncate text-xs font-normal text-muted">{user.primaryEmail ?? "Sessão ativa"}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/pedidos" className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-sm">
            <ClipboardList className="size-4 text-primary" />
            Meus pedidos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/guardados" className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-sm">
            <Bookmark className="size-4 text-primary" />
            Guardados
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profissional/cadastrar" className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-sm">
            <BadgePlus className="size-4 text-primary" />
            Criar perfil profissional
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profissional/pedidos" className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-sm">
            <ClipboardList className="size-4 text-primary" />
            Pedidos para o meu ofício
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/configuracoes" className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-sm">
            <Settings className="size-4 text-primary" strokeWidth={2} />
            Definições
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-3 size-4" strokeWidth={2} />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Wrapper to handle client-side rendering
export function UserButtonClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10" disabled aria-hidden="true">
        <User className="size-4" strokeWidth={2} />
      </Button>
    );
  }

  return <UserButton />;
}
