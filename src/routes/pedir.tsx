import { createFileRoute } from "@tanstack/react-router";
import { JobForm } from "@/components/job-form";
import { useBiscate } from "@/lib/store";

type Search = { oficios?: string };

export const Route = createFileRoute("/pedir")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    oficios: typeof s.oficios === "string" ? s.oficios : undefined,
  }),
  component: Pedir,
});

function Pedir() {
  const { oficios } = Route.useSearch();
  const neighborhood = useBiscate((s) => s.neighborhood);
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold">Pedir um ofício</h1>
        <p className="mt-1 text-sm text-muted">
          Publicas o trabalho. Em minutos aparecem orçamentos de gente do bairro.
        </p>
      </header>
      <JobForm defaultCategory={oficios} defaultNeighborhood={neighborhood} />
    </div>
  );
}
