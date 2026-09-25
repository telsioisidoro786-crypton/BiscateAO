"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Skeleton({ className, width, height, rounded = 'md' }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-sunken",
        {
          'rounded-none': rounded === 'none',
          'rounded-sm': rounded === 'sm',
          'rounded-md': rounded === 'md',
          'rounded-lg': rounded === 'lg',
          'rounded-xl': rounded === 'xl',
          'rounded-full': rounded === 'full',
        },
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5 space-y-3", className)}>
      <Skeleton width="40%" height={24} rounded="lg" />
      <Skeleton width="60%" height={16} rounded="md" />
      <Skeleton width="80%" height={16} rounded="md" />
      <Skeleton width="40%" height={12} rounded="sm" />
    </div>
  );
}

export function WorkerCardSkeleton({ className }: { className?: string }) {
  return (
    <article className={cn("rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)] space-y-3", className)}>
      <div className="flex gap-3">
        <Skeleton width={56} height={56} rounded="full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton width="50%" height={20} rounded="lg" />
          <Skeleton width="30%" height={24} rounded="lg" />
        </div>
      </div>
      <Skeleton width="70%" height={14} rounded="md" />
      <Skeleton width="100%" height={14} rounded="md" />
      <Skeleton width="100%" height={14} rounded="md" />
      <Skeleton width="100%" height={14} rounded="md" />
    </article>
  );
}

export function JobCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl bg-surface p-4 shadow-[var(--shadow-card)] space-y-2", className)}>
      <Skeleton width="50%" height={12} rounded="sm" />
      <Skeleton width="60%" height={20} rounded="lg" />
      <Skeleton width="80%" height={14} rounded="md" />
      <Skeleton width="40%" height={12} rounded="sm" />
    </div>
  );
}

export function ListSkeleton({ count = 4, component: Component = CardSkeleton, className }: { count?: number; component?: React.ComponentType<{ className?: string }>; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} className="animate-pulse" />
      ))}
    </div>
  );
}

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-5 animate-pulse", className)}>
      <Skeleton width="30%" height={32} rounded="lg" />
      <Skeleton width="50%" height={16} rounded="md" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}