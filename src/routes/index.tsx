import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  getCategory,
  urgencyLabel,
} from "@/lib/catalog";
import { listJobs } from "@/lib/jobs";
import { loadProfessionalSearch, type Professional } from "@/lib/professionals";
import { useBiscate } from "@/lib/store";
import { formatKz, relativeTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { WorkerCard } from "@/components/worker-card";

export const Route = createFileRoute("/")({
  loader: async ({ request }) => {
    const jobs = await listJobs({ data: {} });
    return { jobs, nearbyPros: [], neighborhood: "Viana" };
  },
  component: Home,
});

function Home() {
  const { jobs, nearbyPros, neighborhood: loaderNeighborhood } = Route.useLoaderData();
  const neighborhood = useBiscate((s) => s.neighborhood) || loaderNeighborhood;
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState<Professional[] | null>(null);
  const [searching, setSearching] = useState(false);

  const nearby = useMemo(() => {
    return nearbyPros.map((p) => ({
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
  }, [nearbyPros]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await loadProfessionalSearch({ data: { query, neighborhood, limit: 20 } });
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQ(value);
    if (value.trim()) {
      handleSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-ink text-primary-fg">
        <img
          src="/images/hero-oficina.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-35 outline-none"
        />
        <div className="relative space-y-3 px-5 py-7">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-fg/70">
            Luanda · ofícios do bairro
          </p>
          <h1 className="max-w-[14ch] font-display text-3xl font-semibold leading-tight">
            O biscate que precisas, hoje.
          </h1>
          <p className="max-w-[36ch] text-sm leading-relaxed text-primary-fg/80">
            Canalizador em Viana. Pedreiro no Palanca. Técnico de gerador no
            Cazenga. Orçamento no próprio dia, combinas no WhatsApp.
          </p>
        </div>
      </section>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={q}
          onChange={handleSearchChange}
          placeholder="Electricista, torneira, gerador…"
          className="h-12 rounded-lg bg-surface pl-10"
          aria-label="Procurar ofício"
        />
      </div>

      {q.trim() ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">
            Resultados em {neighborhood}
          </h2>
          {searching ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-20 bg-sunken rounded-xl" />
                </div>
              ))}
            </div>
          ) : searchResults && searchResults.length === 0 ? (
            <p className="text-sm text-muted">
              Ninguém com esse ofício nesta lista. Tenta outro bairro ou{" "}
              <Link to="/pedir" className="text-primary underline-offset-2 hover:underline">
                publica um pedido
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-2">
              {searchResults?.map((w) => (
                <WorkerCard
                  key={w.id}
                  worker={{
                    id: w.id,
                    name: w.name,
                    category: w.category,
                    neighborhood: w.neighborhood,
                    years: w.years,
                    rateMin: w.rateMin,
                    rateMax: w.rateMax,
                    rating: w.rating,
                    jobsCount: w.jobsCount,
                    availableToday: w.availableToday,
                    bio: w.bio,
                    skills: w.skills,
                    responseMins: w.responseMins,
                    whatsapp: w.whatsapp,
                    reviews: [] as any[],
                  }}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-lg font-semibold">Ofícios</h2>
              <Link
                to="/oficios"
                className="inline-flex items-center gap-1 text-sm text-muted"
              >
                Todos <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.slice(0, 6).map((c) => (
                <Link
                  key={c.slug}
                  to="/oficios/$slug"
                  params={{ slug: c.slug }}
                  className="group relative overflow-hidden rounded-xl bg-sunken"
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt=""
                      className="h-28 w-full object-cover outline-none transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-28 bg-sunken" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-3 py-2 text-sm font-medium text-primary-fg">
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-lg font-semibold">
                Perto de {neighborhood}
              </h2>
              <Link to="/oficios" className="text-sm text-muted">
                Ver ofícios
              </Link>
            </div>
            <div className="space-y-2">
              {nearby.map((w) => (
                <WorkerCard key={w.id} worker={w} />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-lg font-semibold">Pedidos abertos</h2>
              <Link to="/pedidos" className="text-sm text-muted">
                Quadro
              </Link>
            </div>
            <div className="space-y-2">
              {jobs.slice(0, 4).map((job) => {
                const cat = getCategory(job.category);
                return (
                  <Link
                    key={job.id}
                    to="/pedidos/$id"
                    params={{ id: job.id }}
                    className="block rounded-xl bg-surface p-4 shadow-[var(--shadow-card)]"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      {cat?.name} · {job.neighborhood} · {urgencyLabel(job.urgency)}
                    </p>
                    <p className="mt-1 font-display text-base font-semibold leading-snug">
                      {job.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {job.description}
                    </p>
                    <p className="mt-2 text-xs text-faint">
                      {job.budget_max ? `Até ${formatKz(job.budget_max)} · ` : null}
                      {relativeTime(job.created_at)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-lg font-semibold">Como funciona</h2>
            <ol className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
              <li>
                <span className="font-medium text-ink">1. Diz o ofício.</span>{" "}
                Bairro, urgência, o que se passou.
              </li>
              <li>
                <span className="font-medium text-ink">2. Recebe orçamentos.</span>{" "}
                Profissionais do bairro respondem no próprio dia.
              </li>
              <li>
                <span className="font-medium text-ink">3. Combina no WhatsApp.</span>{" "}
                Pagamento como quiseres — cash, Multicaixa, Unitel Money.
              </li>
            </ol>
            <Link
              to="/como-funciona"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Ver o método <ArrowRight className="size-3.5" />
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
