import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKz(value: number) {
  return `${new Intl.NumberFormat("pt-PT").format(value)} Kz`;
}

export function formatRate(min: number, max: number) {
  return `${formatKz(min)} – ${formatKz(max)}`;
}

export function initials(name: string) {
  const parts = name.replace(/["'].*?["']/, "").split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? "");
  return (first + last).toUpperCase();
}

const SENSITIVE =
  /\+?244[\s.-]?\d[\d\s.-]{7,12}|\b9\d{8}\b|\b9\d{2}[\s.-]\d{3}[\s.-]\d{3}\b|\S+@\S+\.\S+/gi;

export function stripSensitive(text: string) {
  return text.replace(SENSITIVE, "").replace(/\s{2,}/g, " ").trim();
}

export function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const minutes = Math.max(0, Math.round((now - then) / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "há 1 hora" : `há ${hours} horas`;
  const days = Math.round(hours / 24);
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return new Date(iso).toLocaleDateString("pt-PT");
}
