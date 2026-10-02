import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bookmark,
  ClipboardList,
  House,
  MapPin,
  Plus,
  Wrench,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { NEIGHBORHOODS } from "@/lib/catalog";
import { useBiscate } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { UserButtonClient } from "@/components/user-button";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const NAV = [
  { to: "/", label: "Início", icon: House, exact: true, primary: false },
  { to: "/oficios", label: "Ofícios", icon: Wrench, exact: false, primary: false },
  { to: "/pedir", label: "Pedir", icon: Plus, exact: false, primary: true },
  { to: "/pedidos", label: "Pedidos", icon: ClipboardList, exact: false, primary: false },
  { to: "/guardados", label: "Guardados", icon: Bookmark, exact: false, primary: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const neighborhood = useBiscate((s) => s.neighborhood);
  const setNeighborhood = useBiscate((s) => s.setNeighborhood);

  useEffect(() => {
    void Promise.resolve(useBiscate.persist.rehydrate()).then(() => {
      useBiscate.getState().markHydrated();
    });
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight">
            Biscate<span className="text-primary">AO</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium",
                  (item.exact ? pathname === item.to : pathname.startsWith(item.to))
                    ? "text-ink"
                    : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <UserButtonClient />
          <Drawer>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-sunken px-3 text-sm font-medium text-ink"
              >
                <MapPin className="size-3.5 text-primary" strokeWidth={2} />
                {neighborhood}
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>O teu bairro</DrawerTitle>
              </DrawerHeader>
              <div className="grid grid-cols-2 gap-2 overflow-y-auto px-4 pb-8">
                {NEIGHBORHOODS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNeighborhood(n)}
                    className={cn(
                      "h-11 rounded-md text-sm font-medium",
                      n === neighborhood
                        ? "bg-primary text-primary-fg"
                        : "bg-sunken text-ink",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 md:pb-12">
        {children}
      </main>

      <PWAInstallPrompt />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
        <ul className="mx-auto grid max-w-2xl grid-cols-5 px-1 pt-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex justify-center">
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-14 min-w-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                    item.primary
                      ? "text-primary"
                      : active
                        ? "text-ink"
                        : "text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full",
                      item.primary && "bg-primary text-primary-fg",
                      !item.primary && active && "bg-sunken",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={2} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
