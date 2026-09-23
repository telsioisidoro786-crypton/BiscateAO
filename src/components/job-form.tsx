import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CATEGORIES, NEIGHBORHOODS, URGENCY } from "@/lib/catalog";
import { createJob } from "@/lib/jobs";
import { useBiscate } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function JobForm({
  defaultCategory,
  defaultNeighborhood,
  preferredWorkerId,
  workerName,
}: {
  defaultCategory?: string;
  defaultNeighborhood?: string;
  preferredWorkerId?: string;
  workerName?: string;
}) {
  const navigate = useNavigate();
  const rememberJob = useBiscate((s) => s.rememberJob);
  const storeHood = useBiscate((s) => s.neighborhood);
  const [category, setCategory] = useState(defaultCategory ?? "canalizador");
  const [neighborhood, setNeighborhood] = useState(
    defaultNeighborhood ?? storeHood,
  );
  const [urgency, setUrgency] = useState<(typeof URGENCY)[number]["value"]>("hoje");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const budgetMax = budget ? Number(budget.replace(/\s/g, "")) : undefined;
    if (budget && Number.isNaN(budgetMax)) {
      toast.error("Orçamento em kwanzas, só números.");
      return;
    }
    setBusy(true);
    try {
      const result = await createJob({
        data: {
          category,
          description,
          neighborhood,
          urgency,
          budgetMax,
          preferredWorkerId,
        },
      });
      if (!result.job) throw new Error("Pedido não gravado.");
      rememberJob(result.job.id);
      toast.success("Pedido no ar. Já tens orçamentos.");
      await navigate({
        to: "/pedidos/$id",
        params: { id: result.job.id },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não deu para publicar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {workerName ? (
        <p className="rounded-md bg-sunken px-3 py-2 text-sm text-ink">
          Pedido directo a <span className="font-medium">{workerName}</span>.
          Outros profissionais do mesmo ofício também podem responder.
        </p>
      ) : null}

      <fieldset className="space-y-2">
        <Label>Ofício</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={cn(
                "h-11 rounded-md px-2 text-sm font-medium",
                category === c.slug
                  ? "bg-primary text-primary-fg"
                  : "bg-sunken text-ink",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <Label htmlFor="desc">O que se passa</Label>
        <Textarea
          id="desc"
          required
          minLength={8}
          maxLength={400}
          placeholder="Ex.: a torneira da cozinha pinga desde ontem, já fechei o registo."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-xs text-muted">
          Sem telefone nem nome — o contacto vai no WhatsApp depois de aceitares.
        </p>
      </fieldset>

      <fieldset className="space-y-2">
        <Label>Quando</Label>
        <div className="grid grid-cols-2 gap-2">
          {URGENCY.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => setUrgency(u.value)}
              className={cn(
                "h-11 rounded-md text-sm font-medium",
                urgency === u.value
                  ? "bg-primary text-primary-fg"
                  : "bg-sunken text-ink",
              )}
            >
              {u.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <Label htmlFor="hood">Bairro</Label>
        <select
          id="hood"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {NEIGHBORHOODS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="space-y-2">
        <Label htmlFor="budget">Tecto do orçamento (opcional)</Label>
        <Input
          id="budget"
          inputMode="numeric"
          placeholder="Ex.: 10000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
      </fieldset>

      <Button type="submit" className="w-full" size="lg" disabled={busy}>
        {busy ? "A publicar…" : "Pedir orçamentos"}
      </Button>
    </form>
  );
}
