import { Link, createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: () => (
      <main className="mx-auto grid min-h-dvh max-w-2xl place-items-center px-4 text-center">
        <section className="max-w-sm rounded-xl bg-surface p-6 shadow-[var(--shadow-card)]">
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="mt-2 font-display text-2xl font-semibold">Esta página não existe</h1>
          <p className="mt-2 text-sm text-muted">Pode ter sido removida ou o endereço está incompleto.</p>
          <Link to="/" className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg">Voltar ao início</Link>
        </section>
      </main>
    ),
  });
}
