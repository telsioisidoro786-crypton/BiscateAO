"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X, Loader2, MessageSquare, Check } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatKz, relativeTime } from "@/lib/utils";
import { getProposalMessages, sendProposalMessage, type ProposalMessageRow } from "@/lib/jobs";
import { toast } from "sonner";
import { ReactNode } from "react";

interface ProposalChatDialogProps {
  proposalId: string;
  proposal: {
    id: string;
    amount: number;
    eta: string;
    message: string;
    professional_name?: string;
    professional_rating?: number;
    professional_available_today?: boolean;
    professional_neighborhood?: string;
    professional_avatar?: string;
    jobTitle: string;
    jobId: string;
  };
  viewerRole: "cliente" | "profissional";
  onAccept?: () => void;
  children: ReactNode;
}

export function ProposalChatDialog({ proposalId, proposal, viewerRole, onAccept, children }: ProposalChatDialogProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ProposalMessageRow[]>([]);
  const [viewerRoleState, setViewerRoleState] = useState<"cliente" | "profissional">(viewerRole);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    try {
      const result = await getProposalMessages({ data: { proposalId } });
      setMessages(result.messages);
      setViewerRoleState(result.viewerRole);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    
    setSending(true);
    try {
      const result = await sendProposalMessage({ data: { proposalId, body: draft } });
      setMessages(prev => [...prev, { 
        id: result.id, 
        proposal_id: proposalId, 
        user_id: "me", 
        sender_role: result.sender_role, 
        body: result.body, 
        read_at: null, 
        created_at: result.created_at 
      }]);
      setDraft("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar");
    } finally {
      setSending(false);
    }
  }

  async function handleAccept() {
    if (!onAccept) return;
    try {
      await onAccept();
      setOpen(false);
      toast.success("Orçamento aceite! A conversa continua no chat principal.");
    } catch (error) {
      toast.error("Não foi possível aceitar");
    }
  }

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  useEffect(() => {
    loadMessages();
  }, [proposalId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={proposal.professional_avatar} alt={proposal.professional_name ?? "Profissional"} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {proposal.professional_name?.charAt(0) ?? "P"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <DialogTitle className="truncate font-semibold">{proposal.professional_name ?? "Profissional"}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-xs text-muted">
                <Badge variant="outline" className="h-4 px-1.5">{formatKz(proposal.amount)}</Badge>
                <Badge variant="outline" className="h-4 px-1.5">{proposal.eta}</Badge>
                {proposal.professional_available_today && (
                  <Badge variant="outline" className="h-4 px-1.5">
                    <Check className="size-2.5 mr-1" /> Livre hoje
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b bg-muted/30">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Sobre o pedido</p>
            <p className="text-sm font-medium mt-1 truncate">{proposal.jobTitle}</p>
          </div>

          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 space-y-3" style={{ maxHeight: "50vh" }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted">
                <MessageSquare className="size-10 mb-2 opacity-50" />
                <p className="text-sm">Nenhuma mensagem ainda</p>
                <p className="text-xs mt-1">Seja o primeiro a escrever</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwn = msg.sender_role === viewerRoleState;
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
                <div ref={messagesEndRef} />
              </>
            )}
          </ScrollArea>

          <form onSubmit={handleSend} className="border-t p-4 bg-background">
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escreve uma mensagem..."
                disabled={sending}
                className="flex-1"
                maxLength={500}
              />
              <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
          </form>

          {viewerRoleState === "cliente" && onAccept && (
            <div className="border-t p-4 bg-background">
              <Button onClick={handleAccept} className="w-full" size="lg">
                <Check className="size-4 mr-2" />
                Aceitar este orçamento
              </Button>
              <p className="text-xs text-center text-muted mt-2">
                Após aceitar, a conversa continua no chat principal do pedido
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}