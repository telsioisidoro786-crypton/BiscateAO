import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES, getCategory, urgencyLabel } from "@/lib/catalog";
import { listJobs } from "@/lib/jobs";
import { useBiscate } from "@/lib/store";
import { formatKz, relativeTime, cn } from "@/lib/utils";

type Search = { oficios?: string };

export const Route = createFileRoute("/pedidos/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    oficios: typeof s.oficios === "string" ? s.oficios : undefined,
  }),
  loaderDeps: ({ search }) => ({ oficios: search.oficios }),
  loader: ({ deps }) => listJobs({ data: { category: deps.oficios } }),
  component: Pedidos,
});

function Pedidos() {
  const jobs = Route.useLoaderData();
  const { oficios } = Route.useSearch();
  const myIds = useBiscate((s) => s.myJobIds);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold">Pedidos abertos</h1>
        <p className="mt-1 text-sm text-muted">
          O quadro do bairro. Publica o teu se não vês o ofício certo.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          to="/pedidos"
          className={cn(
            "h-10 shrink-0 rounded-full px-3 text-sm font-medium leading-10",
            !oficios ? "bg-primary text-primary-fg" : "bg-sunken text-ink",
          )}
        >
          Todos
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to="/pedidos"
            search={{ oficios: c.slug }}
            className={cn(
              "h-10 shrink-0 rounded-full px-3 text-sm font-medium leading-10",
              oficios === c.slug
                ? "bg-primary text-primary-fg"
                : "bg-sunken text-ink",
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {myIds.length > 0 ? (
        <p className="text-xs text-muted">
          Tens {myIds.length} pedido{myIds.length === 1 ? "" : "s"} teu
          {myIds.length === 1 ? "" : "s"} neste aparelho.
        </p>
      ) : null}

      <div className="space-y-2">
        {jobs.map((job) => {
          const cat = getCategory(job.category);
          const mine = myIds.includes(job.id);
          return (
            <Link
              key={job.id}
              to="/pedidos/$id"
              params={{ id: job.id }}
              className="block rounded-xl bg-surface p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {cat?.name} · {job.neighborhood} · {urgencyLabel(job.urgency)}
                </p>
                {mine ? (
                  <span className="text-xs font-medium text-primary">Teu</span>
                ) : null}
              </div>
              <p className="mt-1 font-display text-base font-semibold leading-snug">
                {job.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{job.description}</p>
              <p className="mt-2 text-xs text-faint">
                {job.budget_max ? `Até ${formatKz(job.budget_max)} · ` : null}
                {relativeTime(job.created_at)}
              </p>
            </Link>
          );
        })}
        {jobs.length === 0 ? (
          <p className="text-sm text-muted">
            Ainda não há pedidos neste ofício.{" "}
            <Link to="/pedir" className="text-primary">
              Publica um
            </Link>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}
