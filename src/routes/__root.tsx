import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppShell } from "@/components/app-shell";
import { PWARegistrar } from "@/components/pwa-registrar";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "BiscateAO";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "O ofício que precisas, no bairro onde estás. Pedreiros, canalizadores, electricistas e mais — directo no WhatsApp.",
      },
      { name: "theme-color", content: "#9B1D2D" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;600;700&family=Figtree:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="pt" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-bg text-ink">
        <PreviewHostBridge />
        <AuthProvider>
          <AppShell>
            <Outlet />
          </AppShell>
          <PWARegistrar />
          <Toaster
            position="top-center"
            toastOptions={{
              className:
                "!bg-surface !text-ink !border-border !shadow-[var(--shadow-card)]",
            }}
          />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
