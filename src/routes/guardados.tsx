import { createFileRoute, Link } from "@tanstack/react-router";
import { getWorker } from "@/lib/catalog";
import { WorkerCard } from "@/components/worker-card";
import { listSavedProfessionals } from "@/lib/account-workflows";

export const Route = createFileRoute("/guardados")({
  loader: () => listSavedProfessionals(),
  component: Guardados,
});

function Guardados() {
  const ids = Route.useLoaderData().map((row) => row.id);
  const workers = ids.map(getWorker).filter((w) => w != null);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold">Guardados</h1>
        <p className="mt-1 text-sm text-muted">
          Profissionais que queres ter à mão neste telemóvel.
        </p>
      </header>
      {workers.length === 0 ? (
        <p className="text-sm text-muted">
          Ainda não guardaste ninguém. Abre um perfil e toca no marcador.{" "}
          <Link to="/oficios" className="text-primary">
            Ver ofícios
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-2">
          {workers.map((w) => (
            <WorkerCard key={w.id} worker={w} />
          ))}
        </div>
      )}
    </div>
  );
}
