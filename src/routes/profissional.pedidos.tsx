import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { ClipboardList, Send, MessageSquare, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { listProfessionalOpenJobsOptional, submitProfessionalProposal, getProposalMessages, sendProposalMessage, type JobRow, type ProposalMessageRow } from "@/lib/jobs";
import { getSql } from "@/lib/db";
import { formatKz, relativeTime } from "@/lib/utils";
import { urgencyLabel } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NoJobs } from "@/components/empty-state";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WorkerAvatar } from "@/components/worker-avatar";
import { Loader2, Send as SendIcon, Check } from "lucide-react";
import { ProposalChatDialog } from "@/components/proposal-chat-dialog";

export const Route = createFileRoute("/profissional/pedidos")({
  loader: () => listProfessionalOpenJobsOptional(),
  component: PedidosProfissional,
});

function PedidosProfissional() {
  const data = Route.useLoaderData();
  if (!data.professional) return <section className="rounded-2xl bg-surface p-6 text-center shadow-[var(--shadow-card)]"><ClipboardList className="mx-auto size-8 text-primary" /><h1 className="mt-3 font-display text-xl font-semibold">Cria o teu perfil para receber pedidos</h1><p className="mt-2 text-sm text-muted">Vamos mostrar apenas os pedidos abertos do teu ofício.</p><Button asChild className="mt-4"><Link to="/profissional/cadastrar">Criar perfil profissional</Link></Button></section>;
  
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-medium text-primary">Área profissional</p>
        <h1 className="font-display text-2xl font-semibold">Pedidos para o teu ofício</h1>
        <p className="mt-1 text-sm text-muted">Envia um orçamento claro. O contacto do cliente continua protegido até ele aceitar.</p>
      </header>
      
      {/* Open jobs to bid on */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Pedidos abertos</h2>
        {data.jobs.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.jobs.map((job) => <QuoteCard key={job.id} job={job} />)}
          </div>
        ) : (
          <NoJobs />
        )}
      </section>
      
      {/* My proposals with chat */}
      <MyProposalsSection professionalId={data.professional.id} />
    </div>
  );
}

function QuoteCard({ job }: { job: JobRow }) {
  const router = useRouter(); const [amount, setAmount] = useState(""); const [eta, setEta] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); const price = Number(amount); if (!Number.isInteger(price) || price < 1) { toast.error("Indica um preço válido em Kz."); return; } setBusy(true); try { await submitProfessionalProposal({ data: { jobId: job.id, amount: price, eta, message } }); toast.success("Orçamento enviado ao cliente."); await router.invalidate(); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível enviar o orçamento."); } finally { setBusy(false); } }
  return <article className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-primary">{job.neighborhood} · {urgencyLabel(job.urgency)}</p><h2 className="mt-1 font-display text-lg font-semibold">{job.title}</h2></div><span className="shrink-0 text-xs text-faint">{relativeTime(job.created_at)}</span></div><p className="mt-3 text-sm text-muted">{job.description}</p><p className="mt-3 text-sm font-semibold">{job.budget_min || job.budget_max ? `Faixa do cliente: ${formatKz(job.budget_min ?? 0)}${job.budget_max ? ` – ${formatKz(job.budget_max)}` : ""}` : "Cliente não indicou orçamento"}</p><form onSubmit={submit} className="mt-4 grid gap-3 border-t border-border pt-4"><div className="grid grid-cols-2 gap-3"><Input required inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Preço (Kz)" /><Input required value={eta} onChange={(e) => setEta(e.target.value)} placeholder="Prazo, ex.: hoje 15h" /></div><Textarea required minLength={8} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explica o que está incluído no teu orçamento." /><Button type="submit" disabled={busy}><Send className="size-4" />{busy ? "A enviar…" : "Enviar orçamento"}</Button></form></article>;
}

// Professional's proposals with chat
function MyProposalsSection({ professionalId }: { professionalId: string }) {
  const router = useRouter();
  const [proposals, setProposals] = useState<Array<{
    id: string;
    amount: number;
    eta: string;
    message: string;
    created_at: string;
    job_id: string;
    job_title: string;
    job_neighborhood: string;
    client_name: string;
    client_avatar?: string;
    status: "pending" | "accepted" | "rejected";
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<typeof proposals[0] | null>(null);
  const [chatMessages, setChatMessages] = useState<ProposalMessageRow[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  useEffect(() => {
    loadProposals();
  }, [professionalId]);

  const loadProposals = async () => {
    try {
      const sql = await getSql();
      const props = await sql<{
        id: string;
        amount: number;
        eta: string;
        message: string;
        created_at: string;
        job_id: string;
        job_title: string;
        job_neighborhood: string;
        client_name: string;
        status: "pending" | "accepted" | "rejected";
      }>`
        select p.id, p.amount, p.eta, p.message, p.created_at, p.job_id,
               j.title as job_title, j.neighborhood as job_neighborhood,
               u.name as client_name,
               case when j.accepted_proposal_id = p.id then 'accepted'
                    when j.status = 'cancelado' then 'rejected'
                    else 'pending' end as status
        from proposals p
        join jobs j on j.id = p.job_id
        join "user" u on u.id = j.user_id
        where p.worker_id = (select id from professionals where owner_user_id = ${professionalId} limit 1)
        order by p.created_at desc
      `;
      setProposals(props);
    } catch (error) {
      console.error("Erro ao carregar propostas:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (proposalId: string) => {
    setChatLoading(true);
    try {
      const result = await getProposalMessages({ data: { proposalId } });
      setChatMessages(result.messages);
    } catch (error) {
      toast.error("Erro ao carregar mensagens");
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSelect = (proposal: typeof proposals[0]) => {
    setSelectedProposal(proposal);
    loadChatMessages(proposal.id);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatDraft.trim() || sendingChat || !selectedProposal) return;
    
    setSendingChat(true);
    try {
      const result = await sendProposalMessage({ data: { proposalId: selectedProposal.id, body: chatDraft } });
      setChatMessages(prev => [...prev, { 
        id: result.id, 
        proposal_id: selectedProposal.id, 
        user_id: "me", 
        sender_role: result.sender_role, 
        body: result.body, 
        read_at: null, 
        created_at: result.created_at 
      }]);
      setChatDraft("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar");
    } finally {
      setSendingChat(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (loading) return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold mb-3">As tuas propostas</h2>
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    </section>
  );

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold mb-3">As tuas propostas ({proposals.length})</h2>
      
      {proposals.length === 0 ? (
        <div className="rounded-2xl bg-surface p-6 text-center shadow-[var(--shadow-card)]">
          <MessageSquare className="mx-auto size-10 text-muted mb-3" />
          <h3 className="font-display text-lg font-semibold">Ainda não enviaste propostas</h3>
          <p className="mt-1 text-sm text-muted">Envia orçamentos nos pedidos acima para começar a conversar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <ProposalChatCard
              key={p.id}
              proposal={p}
              onSelect={handleChatSelect}
              selected={selectedProposal?.id === p.id}
            />
          ))}
        </div>
      )}
      
      {selectedProposal && (
        <ProposalChatDialog
          proposalId={selectedProposal.id}
          proposal={{
            id: selectedProposal.id,
            amount: selectedProposal.amount,
            eta: selectedProposal.eta,
            message: "",
            professional_name: "Tu",
            jobTitle: selectedProposal.job_title,
            jobId: selectedProposal.job_id,
          }}
          viewerRole="profissional"
        >
          <article className="rounded-2xl bg-surface shadow-[var(--shadow-card)] overflow-hidden">
            <div className="flex gap-3 p-4 border-b">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{selectedProposal.job_title}</h3>
                <p className="text-sm text-muted">{selectedProposal.job_neighborhood} · {formatKz(selectedProposal.amount)}</p>
              </div>
              <Badge variant={selectedProposal.status === "accepted" ? "good" : selectedProposal.status === "rejected" ? "outline" : "outline"}>
                {selectedProposal.status === "accepted" ? "Aceite" : selectedProposal.status === "rejected" ? "Rejeitado" : "Pendente"}
              </Badge>
            </div>
            
            <ScrollArea className="flex-1 p-4 space-y-3" style={{ maxHeight: "50vh" }}>
              {chatLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted">
                  <MessageSquare className="size-10 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma mensagem ainda</p>
                  <p className="text-xs mt-1">Inicia a conversa com o cliente</p>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg) => {
                    const isOwn = msg.sender_role === "profissional";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isOwn
                              ? "bg-primary text-primary-fg rounded-br-sm"
                              : "bg-surface shadow-sm rounded-bl-sm border border-border"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.body}</p>
                          <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${isOwn ? "justify-end text-primary-fg/70" : "justify-start text-muted"}`}>
                            <span>{formatTime(msg.created_at)}</span>
                            {isOwn && msg.read_at && <Check className="size-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div id="chat-end" />
                </>
              )}
            </ScrollArea>
            
            <form onSubmit={handleSendChat} className="border-t p-4 bg-background">
              <div className="flex gap-2">
                <Input
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  placeholder="Escreve uma mensagem..."
                  disabled={sendingChat}
                  className="flex-1"
                  maxLength={500}
                />
                <Button type="submit" size="icon" disabled={sendingChat || !chatDraft.trim()}>
                  {sendingChat ? <Loader2 className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
                </Button>
              </div>
            </form>
          </article>
        </ProposalChatDialog>
      )}
    </section>
  );
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

interface ProposalCardData {
  id: string;
  amount: number;
  eta: string;
  message: string;
  created_at: string;
  job_id: string;
  job_title: string;
  job_neighborhood: string;
  client_name: string;
  status: "pending" | "accepted" | "rejected";
}

function ProposalChatCard({ proposal, onSelect, selected }: { proposal: ProposalCardData; onSelect: (p: ProposalCardData) => void; selected: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <article className={`rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)] cursor-pointer transition-all ${selected ? "ring-2 ring-primary" : "hover:shadow-lg"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{proposal.job_title}</h3>
                <Badge variant={proposal.status === "accepted" ? "good" : proposal.status === "rejected" ? "outline" : "outline"}>
                  {proposal.status === "accepted" ? "Aceite" : proposal.status === "rejected" ? "Rejeitado" : "Pendente"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted truncate">{proposal.job_neighborhood}</p>
              <p className="mt-1 text-sm text-muted">{proposal.client_name}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <p className="font-display text-lg font-semibold text-primary">{formatKz(proposal.amount)}</p>
              <p className="text-xs text-muted">{relativeTime(proposal.created_at)}</p>
              <MessageSquare className="size-5 text-primary/70" />
            </div>
          </div>
        </article>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <button onClick={() => onSelect(proposal)} className="absolute top-2 right-2 z-10 hidden">
          Selecionar
        </button>
      </DialogContent>
    </Dialog>
  );
}
