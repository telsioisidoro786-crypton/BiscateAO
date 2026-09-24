import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ClipboardList, Send } from "lucide-react";
import { toast } from "sonner";
import { listProfessionalOpenJobs, submitProfessionalProposal, type JobRow } from "@/lib/jobs";
import { formatKz, relativeTime } from "@/lib/utils";
import { urgencyLabel } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/profissional/pedidos")({
  loader: () => listProfessionalOpenJobs(),
  component: PedidosProfissional,
});

function PedidosProfissional() {
  const data = Route.useLoaderData();
  if (!data.professional) return <section className="rounded-2xl bg-surface p-6 text-center shadow-[var(--shadow-card)]"><ClipboardList className="mx-auto size-8 text-primary" /><h1 className="mt-3 font-display text-xl font-semibold">Cria o teu perfil para receber pedidos</h1><p className="mt-2 text-sm text-muted">Vamos mostrar apenas os pedidos abertos do teu ofício.</p><Button asChild className="mt-4"><Link to="/profissional/cadastrar">Criar perfil profissional</Link></Button></section>;
  return <div className="space-y-5"><header><p className="text-sm font-medium text-primary">Área profissional</p><h1 className="font-display text-2xl font-semibold">Pedidos para o teu ofício</h1><p className="mt-1 text-sm text-muted">Envia um orçamento claro. O contacto do cliente continua protegido até ele aceitar.</p></header>{data.jobs.length ? <div className="grid gap-4 lg:grid-cols-2">{data.jobs.map((job) => <QuoteCard key={job.id} job={job} />)}</div> : <div className="rounded-2xl bg-surface p-7 text-center shadow-[var(--shadow-card)]"><h2 className="font-display text-lg font-semibold">Sem pedidos novos por agora</h2><p className="mt-1 text-sm text-muted">Quando surgir um pedido de {data.professional.category}, ele aparece aqui.</p></div>}</div>;
}

function QuoteCard({ job }: { job: JobRow }) {
  const router = useRouter(); const [amount, setAmount] = useState(""); const [eta, setEta] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); const price = Number(amount); if (!Number.isInteger(price) || price < 1) { toast.error("Indica um preço válido em Kz."); return; } setBusy(true); try { await submitProfessionalProposal({ data: { jobId: job.id, amount: price, eta, message } }); toast.success("Orçamento enviado ao cliente."); await router.invalidate(); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível enviar o orçamento."); } finally { setBusy(false); } }
  return <article className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-primary">{job.neighborhood} · {urgencyLabel(job.urgency)}</p><h2 className="mt-1 font-display text-lg font-semibold">{job.title}</h2></div><span className="shrink-0 text-xs text-faint">{relativeTime(job.created_at)}</span></div><p className="mt-3 text-sm text-muted">{job.description}</p><p className="mt-3 text-sm font-semibold">{job.budget_min || job.budget_max ? `Faixa do cliente: ${formatKz(job.budget_min ?? 0)}${job.budget_max ? ` – ${formatKz(job.budget_max)}` : ""}` : "Cliente não indicou orçamento"}</p><form onSubmit={submit} className="mt-4 grid gap-3 border-t border-border pt-4"><div className="grid grid-cols-2 gap-3"><Input required inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Preço (Kz)" /><Input required value={eta} onChange={(e) => setEta(e.target.value)} placeholder="Prazo, ex.: hoje 15h" /></div><Textarea required minLength={8} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explica o que está incluído no teu orçamento." /><Button type="submit" disabled={busy}><Send className="size-4" />{busy ? "A enviar…" : "Enviar orçamento"}</Button></form></article>;
}
