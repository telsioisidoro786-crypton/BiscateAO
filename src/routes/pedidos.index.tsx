import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getCategory, urgencyLabel } from "@/lib/catalog";
import { listMyJobsOptional } from "@/lib/jobs";
import { formatKz, relativeTime } from "@/lib/utils";
import { NoJobs } from "@/components/empty-state";

export const Route = createFileRoute("/pedidos/")({
  loader: () => listMyJobsOptional(),
  component: Pedidos,
});

function Pedidos() {
  const jobs = Route.useLoaderData();
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold">Meus pedidos</h1>
        <p className="mt-1 text-sm text-muted">Acompanha pedidos, propostas e serviços concluídos.</p>
      </header>
      <div className="space-y-2">
        {jobs.map((job) => {
          const cat = getCategory(job.category);
          return (
            <Link key={job.id} to="/pedidos/$id" params={{ id: job.id }} className="block rounded-xl bg-surface p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{cat?.name} · {job.neighborhood} · {urgencyLabel(job.urgency)}</p>
                <span className="text-xs font-medium text-primary">{job.status ?? "aberto"}</span>
              </div>
              <p className="mt-1 font-display text-base font-semibold leading-snug">{job.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{job.description}</p>
              <p className="mt-2 text-xs text-faint">{job.budget_max ? `Até ${formatKz(job.budget_max)} · ` : null}{relativeTime(job.created_at)}</p>
            </Link>
          );
        })}
        {jobs.length === 0 && (
          <NoJobs onAction={() => navigate({ to: "/pedir" })} />
        )}
      </div>
    </div>
  );
}
