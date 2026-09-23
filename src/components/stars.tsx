import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = value >= i + 1 || value >= i + 0.75;
        const half = !fill && value >= i + 0.3;
        return (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              fill || half ? "fill-primary text-primary" : "text-border",
            )}
            strokeWidth={1.75}
          />
        );
      })}
    </span>
  );
}
