export const NEIGHBORHOODS = [
  "Viana",
  "Cacuaco",
  "Cazenga",
  "Palanca",
  "Sambizanga",
  "Rangel",
  "Hoji-ya-Henda",
  "Camama",
  "Kilamba",
  "Talatona",
  "Benfica",
  "Zango",
  "Panguila",
  "Maianga",
  "Samba",
  "Belas",
] as const;

export type Neighborhood = (typeof NEIGHBORHOODS)[number];

export type Category = {
  slug: string;
  name: string;
  namePlural: string;
  blurb: string;
  unit: string;
  image?: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "pedreiro",
    name: "Pedreiro",
    namePlural: "Pedreiros",
    blurb: "Obra, muro, reboco, laje",
    unit: "dia de obra",
    image: "/images/oficio-pedreiro.jpg",
  },
  {
    slug: "canalizador",
    name: "Canalizador",
    namePlural: "Canalizadores",
    blurb: "Torneira, cano, esgoto, tanque",
    unit: "visita",
    image: "/images/oficio-canalizador.jpg",
  },
  {
    slug: "electricista",
    name: "Electricista",
    namePlural: "Electricistas",
    blurb: "Quadro, tomadas, gerador à rede",
    unit: "visita",
    image: "/images/oficio-electricista.jpg",
  },
  {
    slug: "pintor",
    name: "Pintor",
    namePlural: "Pintores",
    blurb: "Interior, exterior, gesso",
    unit: "dia",
    image: "/images/oficio-pintor.jpg",
  },
  {
    slug: "soldador",
    name: "Soldador",
    namePlural: "Soldadores",
    blurb: "Portão, grade, estrutura",
    unit: "serviço",
    image: "/images/oficio-soldador.jpg",
  },
  {
    slug: "gerador",
    name: "Técnico de gerador",
    namePlural: "Técnicos de gerador",
    blurb: "Avulso, arranque, revisão",
    unit: "visita",
    image: "/images/oficio-gerador.jpg",
  },
  {
    slug: "cabeleireira",
    name: "Cabeleireira",
    namePlural: "Cabeleireiras",
    blurb: "Corte, tranças, barba",
    unit: "serviço",
    image: "/images/oficio-cabeleireira.jpg",
  },
  {
    slug: "marceneiro",
    name: "Marceneiro",
    namePlural: "Marceneiros",
    blurb: "Porta, armário, cozinha",
    unit: "orçamento",
  },
  {
    slug: "limpeza",
    name: "Limpeza",
    namePlural: "Profissionais de limpeza",
    blurb: "Casa, escritório, pós-obra",
    unit: "dia",
  },
  {
    slug: "mecanico",
    name: "Mecânico",
    namePlural: "Mecânicos",
    blurb: "Carro, moto, kupapata",
    unit: "diagnóstico",
  },
  {
    slug: "costureira",
    name: "Costureira",
    namePlural: "Costureiras",
    blurb: "Ajuste, fato, farda",
    unit: "peça",
  },
  {
    slug: "ac",
    name: "Técnico de AC",
    namePlural: "Técnicos de AC",
    blurb: "Instalação, gás, limpeza",
    unit: "visita",
  },
];

export type Review = {
  author: string;
  neighborhood: Neighborhood;
  rating: number;
  text: string;
  ago: string;
};

export type Worker = {
  id: string;
  name: string;
  category: string;
  neighborhood: Neighborhood;
  years: number;
  rateMin: number;
  rateMax: number;
  rating: number;
  jobsCount: number;
  availableToday: boolean;
  bio: string;
  skills: string[];
  responseMins: number;
  reviews: Review[];
  whatsapp: string;
};

// Re-export types from professionals.ts for server-side use
export type { Professional, ProfessionalWithReviews } from "@/lib/professionals";

import { WORKERS as MOCK_WORKERS } from "./catalog.mock";

let workersCache: Worker[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/** Convert Professional (from DB) to Worker (app type) */
function toWorker(prof: import("@/lib/professionals").Professional): Worker {
  return {
    id: prof.id,
    name: prof.name,
    category: prof.category,
    neighborhood: prof.neighborhood as Neighborhood,
    years: prof.years,
    rateMin: prof.rateMin,
    rateMax: prof.rateMax,
    rating: prof.rating,
    jobsCount: prof.jobsCount,
    availableToday: prof.availableToday,
    bio: prof.bio,
    skills: prof.skills,
    responseMins: prof.responseMins,
    reviews: prof.reviews?.map((r) => ({
      author: r.author,
      neighborhood: r.neighborhood as Neighborhood,
      rating: r.rating,
      text: r.text,
      ago: r.ago,
    })) ?? [],
    whatsapp: prof.whatsapp,
  };
}

/** Get all workers from DB (server-only) or fallback to mock */
export async function getAllWorkers(): Promise<Worker[]> {
  // Server-side: try database first
  if (typeof window === "undefined") {
    try {
      const { listProfessionals } = await import("@/lib/professionals");
      const pros = await listProfessionals({ limit: 200 });
      if (pros.length > 0) {
        workersCache = pros.map(toWorker);
        cacheTimestamp = Date.now();
        return workersCache;
      }
    } catch {
      // DB not available, fall through to mock
    }
  }

  // Client-side or DB failed: use cache or mock
  if (workersCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return workersCache;
  }
  workersCache = MOCK_WORKERS;
  cacheTimestamp = Date.now();
  return MOCK_WORKERS;
}

/** Synchronous access for client components (uses cache or mock) */
export function getWorkersSync(): Worker[] {
  if (workersCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return workersCache;
  }
  return MOCK_WORKERS;
}

/** Invalidate cache (call after mutations) */
export function invalidateWorkersCache() {
  workersCache = null;
  cacheTimestamp = 0;
}

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export async function getWorker(id: string): Promise<Worker | undefined> {
  // Server-side: try database first
  if (typeof window === "undefined") {
    try {
      const { getProfessional } = await import("@/lib/professionals");
      const prof = await getProfessional(id);
      if (prof) return toWorker(prof);
    } catch {
      // fall through
    }
  }
  // Fallback to mock
  return MOCK_WORKERS.find((w) => w.id === id);
}

export async function workersByCategory(slug: string): Promise<Worker[]> {
  if (typeof window === "undefined") {
    try {
      const { professionalsByCategory } = await import("@/lib/professionals");
      const pros = await professionalsByCategory(slug, 50);
      if (pros.length > 0) return pros.map(toWorker);
    } catch {
      // fall through
    }
  }
  return MOCK_WORKERS.filter((w) => w.category === slug);
}

export async function searchWorkers(query: string, neighborhood?: string): Promise<Worker[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  if (typeof window === "undefined") {
    try {
      const { searchProfessionals } = await import("@/lib/professionals");
      const pros = await searchProfessionals(q, neighborhood, 50);
      if (pros.length > 0) return pros.map(toWorker);
    } catch {
      // fall through
    }
  }

  // Fallback to mock search
  return MOCK_WORKERS.filter((w) => {
    const cat = getCategory(w.category);
    const hay = [
      w.name,
      w.bio,
      w.neighborhood,
      cat?.name,
      cat?.blurb,
      ...w.skills,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = hay.includes(q);
    const matchesHood = !neighborhood || w.neighborhood === neighborhood;
    return matchesQuery && matchesHood;
  }).sort((a, b) => {
    if (neighborhood) {
      if (a.neighborhood === neighborhood && b.neighborhood !== neighborhood) return -1;
      if (b.neighborhood === neighborhood && a.neighborhood !== neighborhood) return 1;
    }
    return b.rating - a.rating;
  });
}

export async function nearbyWorkers(neighborhood: string, limit = 6): Promise<Worker[]> {
  if (typeof window === "undefined") {
    try {
      const { nearbyProfessionals } = await import("@/lib/professionals");
      const pros = await nearbyProfessionals(neighborhood, limit);
      if (pros.length > 0) return pros.map(toWorker);
    } catch {
      // fall through
    }
  }
  const same = MOCK_WORKERS.filter((w) => w.neighborhood === neighborhood);
  const rest = MOCK_WORKERS.filter((w) => w.neighborhood !== neighborhood);
  return [...same, ...rest].slice(0, limit);
}

export const URGENCY = [
  { value: "hoje", label: "Hoje ainda" },
  { value: "amanha", label: "Amanhã" },
  { value: "semana", label: "Esta semana" },
  { value: "flexivel", label: "Flexível" },
] as const;

export function urgencyLabel(value: string) {
  return URGENCY.find((u) => u.value === value)?.label ?? value;
}