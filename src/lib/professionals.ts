import { getSql } from "@/lib/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Professional = {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  years: number;
  rateMin: number;
  rateMax: number;
  rating: number;
  jobsCount: number;
  availableToday: boolean;
  bio: string;
  skills: string[];
  responseMins: number;
  whatsapp: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  professionalId: string;
  author: string;
  neighborhood: string;
  rating: number;
  text: string;
  ago: string;
  createdAt: string;
};

export type ProfessionalWithReviews = Professional & { reviews: Review[] };

function mapProfessional(row: Record<string, unknown>): Professional {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    neighborhood: row.neighborhood as string,
    years: Number(row.years),
    rateMin: Number(row.rate_min),
    rateMax: Number(row.rate_max),
    rating: Number(row.rating),
    jobsCount: Number(row.jobs_count),
    availableToday: row.available_today as boolean,
    bio: row.bio as string,
    skills: (row.skills as string[]) ?? [],
    responseMins: Number(row.response_mins),
    whatsapp: row.whatsapp as string,
    verified: row.verified as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    professionalId: row.professional_id as string,
    author: row.author as string,
    neighborhood: row.neighborhood as string,
    rating: Number(row.rating),
    text: row.text as string,
    ago: row.ago as string,
    createdAt: row.created_at as string,
  };
}

/** List all professionals, optionally filtered by category and/or neighborhood */
export async function listProfessionals(filters?: {
  category?: string;
  neighborhood?: string;
  availableToday?: boolean;
  verified?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Professional[]> {
  const sql = await getSql();
  let query = `
    select id, name, category, neighborhood, years, rate_min, rate_max, rating,
           jobs_count, available_today, bio, skills, response_mins, whatsapp,
           verified, created_at, updated_at
    from professionals
    where 1=1
  `;
  const params: unknown[] = [];
  let paramIdx = 0;

  if (filters?.category) {
    paramIdx++;
    query += ` and category = $${paramIdx}`;
    params.push(filters.category);
  }
  if (filters?.neighborhood) {
    paramIdx++;
    query += ` and neighborhood = $${paramIdx}`;
    params.push(filters.neighborhood);
  }
  if (filters?.availableToday) {
    query += ` and available_today = true`;
  }
  if (filters?.verified) {
    query += ` and verified = true`;
  }

  query += ` order by rating desc, jobs_count desc`;

  if (filters?.limit) {
    paramIdx++;
    query += ` limit $${paramIdx}`;
    params.push(filters.limit);
  }
  if (filters?.offset) {
    paramIdx++;
    query += ` offset $${paramIdx}`;
    params.push(filters.offset);
  }

  const rows = await sql.query<Record<string, unknown>>(query, params);
  return rows.map(mapProfessional);
}

/** Get a single professional by ID with their reviews */
export async function getProfessional(id: string): Promise<ProfessionalWithReviews | null> {
  const sql = await getSql();
  const profRows = await sql.query<Record<string, unknown>>(
    `select id, name, category, neighborhood, years, rate_min, rate_max, rating,
            jobs_count, available_today, bio, skills, response_mins, whatsapp,
            verified, created_at, updated_at
     from professionals where id = $1 limit 1`,
    [id],
  );
  if (profRows.length === 0) return null;

  const reviewRows = await sql.query<Record<string, unknown>>(
    `select id, professional_id, author, neighborhood, rating, text, ago, created_at
     from professional_reviews where professional_id = $1 order by created_at desc`,
    [id],
  );

  return {
    ...mapProfessional(profRows[0]),
    reviews: reviewRows.map(mapReview),
  };
}

/** Client-safe server boundary for a professional profile and its reviews. */
export const loadProfessional = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1).max(100) }))
  .handler(async ({ data }) => getProfessional(data.id));

/** Search professionals by query string (name, bio, skills, category, neighborhood) */
export async function searchProfessionals(
  query: string,
  neighborhood?: string,
  limit = 20,
): Promise<Professional[]> {
  const sql = await getSql();
  const q = `%${query.trim().toLowerCase()}%`;

  let sqlQuery = `
    select id, name, category, neighborhood, years, rate_min, rate_max, rating,
           jobs_count, available_today, bio, skills, response_mins, whatsapp,
           verified, created_at, updated_at
    from professionals
    where (
      lower(name) like $1
      or lower(bio) like $1
      or lower(category) like $1
      or exists (
        select 1 from unnest(skills) as s(skill) where lower(s.skill) like $1
      )
    )
  `;
  const params: unknown[] = [q];
  let paramIdx = 1;

  if (neighborhood) {
    paramIdx++;
    sqlQuery += ` and neighborhood = $${paramIdx}`;
    params.push(neighborhood);
  }

  sqlQuery += ` order by
    case when neighborhood = $${neighborhood ? 2 : 1} then 0 else 1 end,
    rating desc, jobs_count desc
    limit $${paramIdx + 1}`;
  params.push(limit);

  const rows = await sql.query<Record<string, unknown>>(sqlQuery, params);
  return rows.map(mapProfessional);
}

/** Get professionals near a neighborhood (same neighborhood first, then others) */
export async function nearbyProfessionals(
  neighborhood: string,
  limit = 6,
): Promise<Professional[]> {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select id, name, category, neighborhood, years, rate_min, rate_max, rating,
            jobs_count, available_today, bio, skills, response_mins, whatsapp,
            verified, created_at, updated_at
     from professionals
     order by
       case when neighborhood = $1 then 0 else 1 end,
       rating desc, jobs_count desc
     limit $2`,
    [neighborhood, limit],
  );
  return rows.map(mapProfessional);
}

/** Get professionals by category */
export async function professionalsByCategory(
  category: string,
  limit = 20,
): Promise<Professional[]> {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select id, name, category, neighborhood, years, rate_min, rate_max, rating,
            jobs_count, available_today, bio, skills, response_mins, whatsapp,
            verified, created_at, updated_at
     from professionals
     where category = $1
     order by rating desc, jobs_count desc
     limit $2`,
    [category, limit],
  );
  return rows.map(mapProfessional);
}

/** Get categories with professional counts */
export async function getCategoriesWithCounts(): Promise<
  Array<{ slug: string; name: string; count: number }>
> {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select category as slug, count(*) as count
     from professionals
     group by category
     order by count desc`,
  );
  return rows.map((r) => ({
    slug: r.slug as string,
    name: r.slug as string, // will be enriched by catalog.ts
    count: Number(r.count),
  }));
}

/** Client-safe server boundary for the public oficio directory. */
export const loadCategoriesWithCounts = createServerFn({ method: "GET" })
  .handler(async () => getCategoriesWithCounts());

/** Client-safe server boundary for category results. */
export const loadProfessionalsByCategory = createServerFn({ method: "GET" })
  .validator(z.object({ category: z.string().min(1).max(40), limit: z.number().int().min(1).max(100).optional() }))
  .handler(async ({ data }) => professionalsByCategory(data.category, data.limit ?? 100));

/** Client-safe server boundary for the home-page professional search. */
export const loadProfessionalSearch = createServerFn({ method: "GET" })
  .validator(z.object({ query: z.string().min(1).max(80), neighborhood: z.string().max(40).optional(), limit: z.number().int().min(1).max(50).optional() }))
  .handler(async ({ data }) => searchProfessionals(data.query, data.neighborhood, data.limit ?? 20));
