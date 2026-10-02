import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/catalog";
import { loadCategoriesWithCounts } from "@/lib/professionals";

export const Route = createFileRoute("/oficios/")({
  loader: async () => {
    const categoriesWithCounts = await loadCategoriesWithCounts();
    return { categoriesWithCounts };
  },
  component: Oficios,
});

function Oficios() {
  const { categoriesWithCounts } = Route.useLoaderData();
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold">Ofícios</h1>
        <p className="mt-1 text-sm text-muted">
          Escolhe o trabalho. Vês quem está no bairro, com preço e reputação.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CATEGORIES.map((c) => {
          const count = categoriesWithCounts.find((cc) => cc.slug === c.slug)?.count ?? 0;
          return (
            <Link
              key={c.slug}
              to="/oficios/$slug"
              params={{ slug: c.slug }}
              className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-card)]"
            >
              {c.image ? (
                <img src={c.image} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="h-24 bg-sunken" />
              )}
              <div className="p-4">
                <p className="font-display text-lg font-semibold">{c.namePlural}</p>
                <p className="text-sm text-muted">{c.blurb}</p>
                <p className="mt-2 text-xs text-faint">
                  {count} profissionais · preço por {c.unit}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
