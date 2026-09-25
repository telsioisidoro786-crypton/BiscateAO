"use client";

import { cn } from "@/lib/utils";
import { Search, Inbox, Users, Star, MapPin, Bell, AlertCircle, Package, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  className?: string;
  iconClassName?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4", className)}>
      <div className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sunken", "text-muted")}>
        {Icon && <Icon className={cn("size-7", "stroke-width-1.5", iconClassName)} />}
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted max-w-xs">{description}</p>
      {action && (
        <Button
          variant={action.variant || 'default'}
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline';
}

interface NoProfessionalsProps {
  onAction?: () => void;
}
export function NoProfessionals({ onAction }: NoProfessionalsProps) {
  return (
    <EmptyState
      icon={Users}
      title="Nenhum profissional encontrado"
      description="Ainda não há profissionais cadastrados nesta categoria e bairro."
      action={onAction ? { label: "Cadastrar profissional", onClick: onAction } : undefined}
    />
  );
}

interface NoJobsProps {
  onAction?: () => void;
}
export function NoJobs({ onAction }: NoJobsProps) {
  return (
    <EmptyState
      icon={Package}
      title="Nenhum pedido encontrado"
      description="Ainda não há pedidos publicados nesta categoria."
      action={onAction ? { label: "Publicar pedido", onClick: onAction, variant: 'default' } : undefined}
    />
  );
}

interface NoSavedProps {
  onAction?: () => void;
}
export function NoSaved({ onAction }: NoSavedProps) {
  return (
    <EmptyState
      icon={Star}
      title="Nada guardado ainda"
      description="Guarda profissionais ou pedidos para acessar rapidamente depois."
      action={onAction ? { label: "Ver ofícios", onClick: onAction, variant: 'outline' } : undefined}
    />
  );
}

interface NoSearchResultsProps {
  onAction?: () => void;
}
export function NoSearchResults({ onAction }: NoSearchResultsProps) {
  return (
    <EmptyState
      icon={Search}
      title="Nenhum resultado"
      description="Não encontramos profissionais com esses critérios. Tenta ajustar a busca."
      action={onAction ? { label: "Limpar filtros", onClick: onAction, variant: 'outline' } : undefined}
    />
  );
}

export function NoProposals() {
  return (
    <EmptyState
      icon={Package}
      title="Nenhuma proposta ainda"
      description="Quando um profissional enviar orçamento, vais ver aqui."
    />
  );
}

export function NoMessages() {
  return (
    <EmptyState
      icon={MessageCircle}
      title="Nenhuma mensagem"
      description="A conversa aparece aqui depois de aceitares uma proposta."
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="Nenhuma notificação"
      description="As tuas notificações vão aparecer aqui."
    />
  );
}

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}
export function ErrorState({ message, onRetry }: ErrorProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      iconClassName="text-red-500"
      title="Algo correu mal"
      description={message}
      action={onRetry ? { label: "Tentar novamente", onClick: onRetry, variant: 'outline' } : undefined}
    />
  );
}

interface OfflineProps {
  onRetry?: () => void;
}
export function OfflineState({ onRetry }: OfflineProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      iconClassName="text-amber-500"
      title="Estás offline"
      description="Verifica a tua ligação à internet para continuar."
      action={onRetry ? { label: "Tentar novamente", onClick: onRetry, variant: 'outline' } : undefined}
    />
  );
}