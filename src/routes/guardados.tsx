import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getWorker } from "@/lib/catalog";
import { WorkerCard } from "@/components/worker-card";
import { listSavedProfessionalsOptional } from "@/lib/account-workflows";
import { NoSaved } from "@/components/empty-state";

export const Route = createFileRoute("/guardados")({
  loader: () => listSavedProfessionalsOptional(),
  component: Guardados,
});

function Guardados() {
  const ids = Route.useLoaderData().map((row) => row.id);
  const workers = ids.map(getWorker).filter((w) => w != null);
  const navigate = useNavigate();

  if (workers.length === 0) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-2xl font-semibold">Guardados</h1>
          <p className="mt-1 text-sm text-muted">
            Profissionais que queres ter à mão neste telemóvel.
          </p>
        </header>
        <NoSaved onAction={() => navigate({ to: "/oficios" })} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold">Guardados</h1>
        <p className="mt-1 text-sm text-muted">
          Profissionais que queres ter à mão neste telemóvel.
        </p>
      </header>
      <div className="space-y-2">
        {workers.map((w) => (
          <WorkerCard key={w.id} worker={w} />
        ))}
      </div>
    </div>
  );
}
