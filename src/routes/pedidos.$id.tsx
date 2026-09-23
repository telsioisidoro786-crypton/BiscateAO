import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { MessageCircle, Send } from "lucide-react";
import { getCategory, getWorker, urgencyLabel } from "@/lib/catalog";
import { getJob, type ProposalRow } from "@/lib/jobs";
import { useBiscate } from "@/lib/store";
import { formatKz, relativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkerAvatar } from "@/components/worker-avatar";
import { Stars } from "@/components/stars";

export const Route = createFileRoute("/pedidos/$id")({
  loader: async ({ params }) => getJob({ data: { id: params.id } }),
  component: Pedido,
});

function Pedido() {
  const data = Route.useLoaderData();
  const acceptedMap = useBiscate((s) => s.accepted);
  const acceptProposal = useBiscate((s) => s.acceptProposal);
  const chats = useBiscate((s) => s.chats);
  const sendChat = useBiscate((s) => s.sendChat);
  const [draft, setDraft] = useState("");

  if (!data?.job) {
    return (
      <p className="text-sm text-muted">
        Este pedido já não está no quadro.{" "}
        <Link to="/pedidos" className="text-primary">
          Ver pedidos
        </Link>
      </p>
    );
  }

  const { job, proposals } = data;
  const cat = getCategory(job.category);
  const acceptedId = acceptedMap[job.id];
  const accepted = proposals.find((p) => p.id === acceptedId);
  const acceptedWorker = accepted ? getWorker(accepted.worker_id) : undefined;
  const thread = chats[job.id] ?? [];

  function accept(p: ProposalRow) {
    const w = getWorker(p.worker_id);
    const greeting = `Combinado. Sou ${w?.name.split(" ")[0] ?? "eu"}. ${p.eta}. Manda a referência da casa e eu levo as ferramentas.`;
    acceptProposal(job.id, p.id, greeting);
  }

  function onSend(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    sendChat(job.id, text);
    setDraft("");
  }

  const wa =
    acceptedWorker &&
    `https://wa.me/${acceptedWorker.whatsapp}?text=${encodeURIComponent(
      `Olá ${acceptedWorker.name.split(" ")[0]}, aceitei o teu orçamento no BiscateAO (${formatKz(accepted!.amount)}). ${job.title} em ${job.neighborhood}.`,
    )}`;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {cat?.name} · {job.neighborhood} · {urgencyLabel(job.urgency)}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold leading-tight">
          {job.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink">{job.description}</p>
        <p className="mt-2 text-xs text-faint">
          {job.budget_max ? `Tecto ${formatKz(job.budget_max)} · ` : null}
          {relativeTime(job.created_at)}
        </p>
      </header>

      {accepted && acceptedWorker ? (
        <section className="space-y-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Combinado</h2>
            <Badge variant="good">Aceite</Badge>
          </div>
          <Link
            to="/profissionais/$id"
            params={{ id: acceptedWorker.id }}
            className="flex items-center gap-3"
          >
            <WorkerAvatar id={acceptedWorker.id} name={acceptedWorker.name} />
            <div>
              <p className="font-medium">{acceptedWorker.name}</p>
              <p className="text-sm text-muted tabular-nums">
                {formatKz(accepted.amount)} · {accepted.eta}
              </p>
            </div>
          </Link>
          <div className="space-y-2 rounded-md bg-sunken p-3">
            {thread.map((line, i) => (
              <p
                key={i}
                className={
                  line.from === "me"
                    ? "ml-6 rounded-md bg-primary px-3 py-2 text-sm text-primary-fg"
                    : "mr-6 rounded-md bg-surface px-3 py-2 text-sm text-ink"
                }
              >
                {line.text}
              </p>
            ))}
          </div>
          <form onSubmit={onSend} className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escreve a referência da casa…"
            />
            <Button type="submit" size="icon" aria-label="Enviar">
              <Send className="size-4" />
            </Button>
          </form>
          {wa ? (
            <Button asChild variant="outline" className="w-full">
              <a href={wa} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                Abrir no WhatsApp
              </a>
            </Button>
          ) : null}
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">
            {proposals.length} orçamento{proposals.length === 1 ? "" : "s"}
          </h2>
          {proposals.map((p) => {
            const w = getWorker(p.worker_id);
            if (!w) return null;
            return (
              <article
                key={p.id}
                className="rounded-xl bg-surface p-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start gap-3">
                  <WorkerAvatar id={w.id} name={w.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to="/profissionais/$id"
                        params={{ id: w.id }}
                        className="font-display font-semibold leading-snug"
                      >
                        {w.name}
                      </Link>
                      <p className="tabular-nums text-sm font-semibold">
                        {formatKz(p.amount)}
                      </p>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <Stars value={w.rating} />
                      <span>{w.neighborhood}</span>
                      <span>{p.eta}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{p.message}</p>
                    <Button
                      className="mt-3 w-full"
                      onClick={() => accept(p)}
                    >
                      Aceitar este orçamento
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
