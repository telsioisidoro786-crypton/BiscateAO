import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { URGENCY } from "@/lib/catalog";
import { WORKERS } from "@/lib/catalog.mock";
import { stripSensitive } from "@/lib/utils";

export type JobRow = {
  id: string;
  category: string;
  title: string;
  description: string;
  neighborhood: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string;
  preferred_worker_id: string | null;
  created_at: string;
};

export type ProposalRow = {
  id: string;
  job_id: string;
  worker_id: string;
  amount: number;
  message: string;
  eta: string;
  created_at: string;
};

const jobInput = z.object({
  category: z.string().min(2).max(40),
  title: z.string().max(80).optional(),
  description: z.string().min(8).max(400),
  neighborhood: z.string().min(2).max(40),
  budgetMin: z.number().int().min(0).max(5_000_000).optional(),
  budgetMax: z.number().int().min(0).max(5_000_000).optional(),
  urgency: z.enum(["hoje", "amanha", "semana", "flexivel"]),
  preferredWorkerId: z.string().max(80).optional(),
});

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function pickWorkers(category: string, neighborhood: string, preferred?: string) {
  const pool = WORKERS.filter((w) => w.category === category);
  const preferredWorker = preferred ? getWorker(preferred) : undefined;
  const same = pool.filter((w) => w.neighborhood === neighborhood);
  const rest = pool.filter((w) => w.neighborhood !== neighborhood);
  const ordered = [
    ...(preferredWorker && preferredWorker.category === category
      ? [preferredWorker]
      : []),
    ...same,
    ...rest,
  ].filter((w, i, arr) => arr.findIndex((x) => x.id === w.id) === i);
  return ordered.slice(0, 3);
}

function proposalFor(
  worker: (typeof WORKERS)[number],
  urgency: string,
  isPreferred: boolean,
) {
  const span = Math.max(0, worker.rateMax - worker.rateMin);
  const amount =
    worker.rateMin + Math.round((isPreferred ? 0.35 : 0.55) * span);
  const eta =
    urgency === "hoje"
      ? worker.availableToday
        ? "hoje, em 1–3 horas"
        : "amanhã de manhã"
      : urgency === "amanha"
        ? "amanhã"
        : "esta semana";
  const extra = isPreferred
    ? " Vi o teu pedido e posso priorizar."
    : worker.availableToday
      ? " Estou livre hoje."
      : "";
  return {
    amount,
    eta,
    message: `Faço este tipo de trabalho. ${worker.skills.slice(0, 2).join(" e ")}. Preço da visita à volta disto, material à parte.${extra}`,
  };
}

export const listJobs = createServerFn({ method: "GET" })
  .validator(
    z.object({
      category: z.string().optional(),
      neighborhood: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const category = data.category;
    const neighborhood = data.neighborhood;
    if (category && neighborhood) {
      return sql<JobRow>`
        select id, category, title, description, neighborhood, budget_min, budget_max, urgency, preferred_worker_id, created_at::text as created_at
        from jobs
        where category = ${category} and neighborhood = ${neighborhood}
        order by created_at desc
        limit 40
      `;
    }
    if (category) {
      return sql<JobRow>`
        select id, category, title, description, neighborhood, budget_min, budget_max, urgency, preferred_worker_id, created_at::text as created_at
        from jobs
        where category = ${category}
        order by created_at desc
        limit 40
      `;
    }
    if (neighborhood) {
      return sql<JobRow>`
        select id, category, title, description, neighborhood, budget_min, budget_max, urgency, preferred_worker_id, created_at::text as created_at
        from jobs
        where neighborhood = ${neighborhood}
        order by created_at desc
        limit 40
      `;
    }
    return sql<JobRow>`
      select id, category, title, description, neighborhood, budget_min, budget_max, urgency, preferred_worker_id, created_at::text as created_at
      from jobs
      order by created_at desc
      limit 40
    `;
  });

export const getJob = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const jobs = await sql<JobRow>`
      select id, category, title, description, neighborhood, budget_min, budget_max, urgency, preferred_worker_id, created_at::text as created_at
      from jobs where id = ${data.id} limit 1
    `;
    const job = jobs[0];
    if (!job) return null;
    const proposals = await sql<ProposalRow>`
      select id, job_id, worker_id, amount, message, eta, created_at::text as created_at
      from proposals where job_id = ${data.id}
      order by amount asc, created_at asc
    `;
    return { job, proposals };
  });

export const createJob = createServerFn({ method: "POST" })
  .validator(jobInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const description = stripSensitive(data.description);
    if (description.length < 8) {
      throw new Error("Descreve o trabalho sem telefone nem email.");
    }
    const catLabel =
      data.category.charAt(0).toUpperCase() + data.category.slice(1);
    const urgency =
      URGENCY.find((u) => u.value === data.urgency)?.label ?? "Pedido";
    const title =
      stripSensitive(data.title ?? "") ||
      `${catLabel} em ${data.neighborhood} · ${urgency.toLowerCase()}`;
    const id = newId("job");
    const preferred = data.preferredWorkerId || null;
    await sql`
      insert into jobs (
        id, category, title, description, neighborhood, budget_min, budget_max, urgency, preferred_worker_id
      ) values (
        ${id}, ${data.category}, ${title}, ${description}, ${data.neighborhood},
        ${data.budgetMin ?? null}, ${data.budgetMax ?? null}, ${data.urgency}, ${preferred}
      )
    `;
    const workers = pickWorkers(
      data.category,
      data.neighborhood,
      preferred ?? undefined,
    );
    for (const worker of workers) {
      const p = proposalFor(worker, data.urgency, worker.id === preferred);
      await sql`
        insert into proposals (id, job_id, worker_id, amount, message, eta)
        values (
          ${newId("p")}, ${id}, ${worker.id}, ${p.amount}, ${p.message}, ${p.eta}
        )
      `;
    }
    const created = await sql<JobRow>`
      select id, category, title, description, neighborhood, budget_min, budget_max, urgency, preferred_worker_id, created_at::text as created_at
      from jobs where id = ${id} limit 1
    `;
    const proposals = await sql<ProposalRow>`
      select id, job_id, worker_id, amount, message, eta, created_at::text as created_at
      from proposals where job_id = ${id}
      order by amount asc
    `;
    return { job: created[0], proposals };
  });
