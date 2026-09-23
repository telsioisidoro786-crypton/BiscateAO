import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Clock, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { getCategory } from "@/lib/catalog";
import { getProfessional } from "@/lib/professionals";
import { formatRate } from "@/lib/utils";
import { useBiscate } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/stars";
import { WorkerAvatar } from "@/components/worker-avatar";
import { JobForm } from "@/components/job-form";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export const Route = createFileRoute("/profissionais/$id")({
  loader: async ({ params }) => {
    const professional = await getProfessional(params.id);
    return { professional };
  },
  component: Perfil,
});

function Perfil() {
  const { professional } = Route.useLoaderData();
  const saved = useBiscate((s) => s.savedIds.includes(professional?.id ?? ""));
  const toggleSaved = useBiscate((s) => s.toggleSaved);
  const [open, setOpen] = useState(false);

  if (!professional) {
    return (
      <p className="text-sm text-muted">
        Profissional não encontrado.{" "}
        <Link to="/oficios" className="text-primary">
          Ver ofícios
        </Link>
      </p>
    );
  }

  const cat = getCategory(professional.category);
  const wa = `https://wa.me/${professional.whatsapp}?text=${encodeURIComponent(
    `Olá ${professional.name.split(" ")[0]}, vi-te no BiscateAO. Preciso de ${cat?.name.toLowerCase() ?? "um serviço"} em ${professional.neighborhood}.`,
  )}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <WorkerAvatar id={professional.id} name={professional.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-display text-2xl font-semibold leading-tight">
              {professional.name}
            </h1>
            <button
              type="button"
              aria-label={saved ? "Tirar dos guardados" : "Guardar"}
              onClick={() => toggleSaved(professional.id)}
              className="flex size-11 items-center justify-center rounded-full bg-sunken"
            >
              {saved ? (
                <BookmarkCheck className="size-5 text-primary" />
              ) : (
                <Bookmark className="size-5" />
              )}
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">
            {cat?.name} · {professional.years} anos de ofício
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <Stars value={professional.rating} />
            <span className="tabular-nums font-medium">{professional.rating.toFixed(1)}</span>
            <span className="text-muted">· {professional.jobsCount} trabalhos</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {professional.availableToday ? <Badge variant="good">Livre hoje</Badge> : null}
        <Badge>
          <MapPin className="mr-1 size-3" />
          {professional.neighborhood}
        </Badge>
        <Badge>
          <Clock className="mr-1 size-3" />
          Responde em {professional.responseMins} min
        </Badge>
      </div>

      <p className="text-sm leading-relaxed text-ink">{professional.bio}</p>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Preço por {cat?.unit}
        </p>
        <p className="mt-1 font-display text-xl font-semibold tabular-nums">
          {formatRate(professional.rateMin, professional.rateMax)}
        </p>
        <p className="text-xs text-muted">Material e deslocação combinam-se à parte.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {professional.skills.map((s) => (
          <Badge key={s} variant="outline">
            {s}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          className="w-full sm:flex-1"
          onClick={() => setOpen(true)}
        >
          Pedir orçamento
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Pedir orçamento</DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-8">
              <JobForm
                defaultCategory={professional.category}
                defaultNeighborhood={professional.neighborhood}
                preferredWorkerId={professional.id}
                workerName={professional.name}
              />
            </div>
          </DrawerContent>
        </Drawer>
        <Button asChild variant="outline" size="lg" className="w-full sm:flex-1">
          <a href={wa} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">No bairro dizem</h2>
        {professional.reviews.map((r) => (
          <blockquote
            key={r.id}
            className="rounded-xl bg-surface p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{r.author}</p>
              <Stars value={r.rating} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink">{r.text}</p>
            <p className="mt-2 text-xs text-faint">
              {r.neighborhood} · {r.ago}
            </p>
          </blockquote>
        ))}
      </section>
    </div>
  );
}
