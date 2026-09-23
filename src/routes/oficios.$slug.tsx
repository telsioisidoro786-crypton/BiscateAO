import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { getCategory } from "@/lib/catalog";
import { professionalsByCategory } from "@/lib/professionals";
import { useBiscate } from "@/lib/store";
import { WorkerCard } from "@/components/worker-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/oficios/$slug")({
  loader: async ({ params }) => {
    const { slug } = params;
    const category = slug;

    const professionals = await professionalsByCategory(category, 100);
    return { professionals };
  },
  component: Oficio,
});

function Oficio() {
  const { slug } = Route.useParams();
  const { professionals } = Route.useLoaderData();
  const cat = getCategory(slug);
  const neighborhood = useBiscate((s) => s.neighborhood);

  const workers = useMemo(() => {
    return professionals.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      neighborhood: p.neighborhood,
      years: p.years,
      rateMin: p.rateMin,
      rateMax: p.rateMax,
      rating: Number(p.rating),
      jobsCount: p.jobsCount,
      availableToday: p.availableToday,
      bio: p.bio,
      skills: p.skills,
      responseMins: p.responseMins,
      whatsapp: p.whatsapp,
      reviews: [] as any[],
    }));
  }, [professionals, neighborhood]);

  if (!cat) {
    return (
      <p className="text-sm text-muted">
        Ofício desconhecido.{" "}
        <Link to="/oficios" className="text-primary">
          Ver todos
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {cat.image ? (
        <img
          src={cat.image}
          alt=""
          className="h-40 w-full rounded-xl object-cover"
        />
      ) : null}
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {cat.blurb}
        </p>
        <h1 className="font-display text-2xl font-semibold">{cat.namePlural}</h1>
      </header>

      <div className="space-y-2">
        {workers.map((w) => (
          <WorkerCard key={w.id} worker={w} />
        ))}
        {workers.length === 0 ? (
          <p className="text-sm text-muted">Ninguém com esses filtros.</p>
        ) : null}
      </div>

      <Button asChild className="w-full" size="lg">
        <Link to="/pedir" search={{ oficios: slug }}>
          Publicar pedido de {cat.name.toLowerCase()}
        </Link>
      </Button>
    </div>
  );
}
