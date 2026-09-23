import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { getCategory, type Worker } from "@/lib/catalog";
import { formatRate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/stars";
import { WorkerAvatar } from "@/components/worker-avatar";

export function WorkerCard({ worker }: { worker: Worker }) {
  const cat = getCategory(worker.category);
  return (
    <Link
      to="/profissionais/$id"
      params={{ id: worker.id }}
      className="flex gap-3 rounded-xl bg-surface p-3 shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-150 ease-[var(--ease-out)] hover:shadow-[var(--shadow-card-hover)]"
    >
      <WorkerAvatar id={worker.id} name={worker.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-display text-base font-semibold leading-snug text-ink">
            {worker.name}
          </p>
          {worker.availableToday ? (
            <Badge variant="good">Hoje</Badge>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-muted">
          {cat?.name} · {formatRate(worker.rateMin, worker.rateMax)}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Stars value={worker.rating} />
            <span className="tabular-nums text-ink">{worker.rating.toFixed(1)}</span>
            <span>({worker.jobsCount})</span>
          </span>
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="size-3" strokeWidth={2} />
            {worker.neighborhood}
          </span>
        </div>
      </div>
    </Link>
  );
}
