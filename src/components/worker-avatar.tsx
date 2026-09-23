import { cn, initials } from "@/lib/utils";

const TONES = [
  "bg-[#3d2a24] text-[#f3ede3]",
  "bg-[#9b1d2d] text-[#fcfaf6]",
  "bg-[#5c4638] text-[#f3ede3]",
  "bg-[#1a1511] text-[#f3ede3]",
  "bg-[#7a4a32] text-[#fcfaf6]",
  "bg-[#2f6b4f] text-[#fcfaf6]",
];

function tone(id: string) {
  if (!id) return TONES[0];
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return TONES[n % TONES.length];
}

export function WorkerAvatar({
  id,
  name,
  size = "md",
}: {
  id: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "size-16 text-xl" : size === "sm" ? "size-9 text-xs" : "size-12 text-sm";
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-display font-semibold tracking-tight",
        dim,
        tone(id),
      )}
    >
      {initials(name ?? "?")}
    </div>
  );
}
