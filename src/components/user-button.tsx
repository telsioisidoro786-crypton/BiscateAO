import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User, Settings, Menu, Bell } from "lucide-react";
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
import { cn } from "@/lib/utils";

export function UserButton() {
  const { user, isPending } = useCurrentUserState();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  if (!mounted) return null;

  if (!authEnabled) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Menu">
        <Menu className="size-4" strokeWidth={2} />
      </Button>
    );
  }

  if (isPending || !user) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10" disabled aria-label="Entrar">
        <User className="size-4" strokeWidth={2} />
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
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
          <div className="size-8 rounded-full bg-primary flex items-center justify-center">
            <User className="size-4 text-primary-fg" strokeWidth={2.5} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-medium">
          {user.name ?? user.email ?? "Usuário"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/pedidos" onClick={() => navigate("/pedidos")} className="flex w-full items-center px-2 py-1.5 text-sm">
            Meus Pedidos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/guardados" onClick={() => navigate("/guardados")} className="flex w-full items-center px-2 py-1.5 text-sm">
            Guardados
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/configuracoes" onClick={() => navigate("/configuracoes")} className="flex w-full items-center px-2 py-1.5 text-sm">
            <Settings className="mr-2 size-4" strokeWidth={2} />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 size-4" strokeWidth={2} />
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