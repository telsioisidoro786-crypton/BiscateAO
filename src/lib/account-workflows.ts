import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const professionalInput = z.object({ name: z.string().trim().min(3).max(80), category: z.string().min(2).max(40), neighborhood: z.string().min(2).max(40), bio: z.string().trim().min(20).max(500), whatsapp: z.string().trim().min(8).max(30), rateMin: z.number().int().min(0), rateMax: z.number().int().min(0), skills: z.array(z.string().trim().min(2).max(30)).min(1).max(6) });

export const getOwnedProfessional = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => { const sql = await getSql(); const rows = await sql<{ id: string; name: string; category: string; neighborhood: string; bio: string; whatsapp: string; rate_min: number; rate_max: number; skills: string[]; available_today: boolean }>`select id, name, category, neighborhood, bio, whatsapp, rate_min, rate_max, skills, available_today from professionals where owner_user_id = ${context.userId} limit 1`; return rows[0] ?? null; });

export const getOwnedProfessionalOptional = createServerFn({ method: "GET" }).handler(async ({ context }) => { 
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  if (!user) return null;
  const sql = await getSql();
  const rows = await sql<{ id: string; name: string; category: string; neighborhood: string; bio: string; whatsapp: string; rate_min: number; rate_max: number; skills: string[]; available_today: boolean }>`select id, name, category, neighborhood, bio, whatsapp, rate_min, rate_max, skills, available_today from professionals where owner_user_id = ${user.id} limit 1`; 
  return rows[0] ?? null; });

export const updateOwnedProfessional = createServerFn({ method: "POST" }).validator(professionalInput.extend({ availableToday: z.boolean() })).middleware([authMiddleware]).handler(async ({ data, context }) => { if (data.rateMax < data.rateMin) throw new Error("O preço máximo deve ser superior ao mínimo."); const sql = await getSql(); const rows = await sql<{ id: string }>`update professionals set name = ${data.name}, category = ${data.category}, neighborhood = ${data.neighborhood}, bio = ${data.bio}, whatsapp = ${data.whatsapp}, rate_min = ${data.rateMin}, rate_max = ${data.rateMax}, skills = ${data.skills}, available_today = ${data.availableToday}, updated_at = now() where owner_user_id = ${context.userId} returning id`; if (!rows[0]) throw new Error("Perfil profissional não encontrado."); return { id: rows[0].id }; });

export const getAccountProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => { const sql = await getSql(); const user = (await sql<{ name: string; email: string; image: string | null; email_verified: boolean }>`select "name", "email", "image", "emailVerified" as email_verified from "user" where "id" = ${context.userId} limit 1`)[0]; if (!user) return null; try { const settings = (await sql<{ default_neighborhood: string | null }>`select default_neighborhood from account_settings where user_id = ${context.userId} limit 1`)[0]; return { ...user, default_neighborhood: settings?.default_neighborhood ?? null }; } catch (error) { const code = (error as { code?: string }).code; if (code === "42P01" || /account_settings/i.test(error instanceof Error ? error.message : "")) return { ...user, default_neighborhood: null }; throw error; } });

export const getAccountProfileOptional = createServerFn({ method: "GET" }).handler(async ({ context }) => { 
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  if (!user) return null;
  const sql = await getSql();
  const dbUser = (await sql<{ name: string; email: string; image: string | null; email_verified: boolean }>`select "name", "email", "image", "emailVerified" as email_verified from "user" where "id" = ${user.id} limit 1`)[0];
  if (!dbUser) return null;
  try { 
    const settings = (await sql<{ default_neighborhood: string | null; theme: string | null }>`select default_neighborhood, theme from account_settings where user_id = ${user.id} limit 1`)[0];
    return { ...dbUser, default_neighborhood: settings?.default_neighborhood ?? null, theme: settings?.theme ?? 'system' }; 
  } catch (error) { 
    const code = (error as { code?: string }).code; 
    if (code === "42P01" || /account_settings/i.test(error instanceof Error ? error.message : "")) return { ...dbUser, default_neighborhood: null, theme: 'system' }; 
    throw error; 
  } 
});

export const updateAccountProfile = createServerFn({ method: "POST" }).validator(z.object({ name: z.string().trim().min(2).max(80), image: z.string().url().max(500).nullable(), neighborhood: z.string().trim().min(2).max(40), theme: z.enum(['light', 'dark', 'system']).optional() })).middleware([authMiddleware]).handler(async ({ data, context }) => { const sql = await getSql(); await sql`update "user" set "name" = ${data.name}, "image" = ${data.image}, "updatedAt" = now() where "id" = ${context.userId}`; await sql`insert into account_settings (user_id, default_neighborhood, theme) values (${context.userId}, ${data.neighborhood}, ${data.theme ?? 'system'}) on conflict (user_id) do update set default_neighborhood = excluded.default_neighborhood, theme = excluded.theme, updated_at = now()`; return { ok: true }; });

export const updateAvatar = createServerFn({ method: "POST" }).validator(z.object({ imageUrl: z.string().url().max(500) })).middleware([authMiddleware]).handler(async ({ data, context }) => { const sql = await getSql(); await sql`update "user" set "image" = ${data.imageUrl}, "updatedAt" = now() where "id" = ${context.userId}`; return { ok: true, url: data.imageUrl }; });

export const updateAvatarOptional = createServerFn({ method: "POST" }).validator(z.object({ imageUrl: z.string().url().max(500) })).handler(async ({ data, context }) => { 
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  if (!user) throw new Error("Não autenticado");
  const sql = await getSql();
  await sql`update "user" set "image" = ${data.imageUrl}, "updatedAt" = now() where "id" = ${user.id}`;
  return { ok: true, url: data.imageUrl };
});

export const updateProfessionalImages = createServerFn({ method: "POST" }).validator(z.object({ portfolioImages: z.array(z.object({ url: z.string().url(), path: z.string() })).max(6) })).middleware([authMiddleware]).handler(async ({ data, context }) => { const sql = await getSql(); const prof = (await sql<{ id: string }>`select id from professionals where owner_user_id = ${context.userId} limit 1`)[0]; if (!prof) throw new Error("Perfil profissional não encontrado"); return { ok: true, images: data.portfolioImages }; });

export const updateProfessionalImagesOptional = createServerFn({ method: "POST" }).validator(z.object({ portfolioImages: z.array(z.object({ url: z.string().url(), path: z.string() })).max(6) })).handler(async ({ data, context }) => { 
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  if (!user) throw new Error("Não autenticado");
  const sql = await getSql();
  const prof = (await sql<{ id: string }>`select id from professionals where owner_user_id = ${user.id} limit 1`)[0];
  if (!prof) throw new Error("Perfil profissional não encontrado");
  return { ok: true, images: data.portfolioImages };
});

export const getNotificationPreferences = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => { const sql = await getSql(); try { const rows = await sql<{ proposals: boolean; messages: boolean; job_updates: boolean; reminders: boolean; email: boolean }>`select notify_proposals as proposals, notify_messages as messages, notify_job_updates as job_updates, notify_reminders as reminders, notify_email as email from account_settings where user_id = ${context.userId} limit 1`; return rows[0] ?? { proposals: true, messages: true, job_updates: true, reminders: true, email: true }; } catch { return { proposals: true, messages: true, job_updates: true, reminders: true, email: true }; } });

export const updateNotificationPreferences = createServerFn({ method: "POST" }).validator(z.object({ proposals: z.boolean(), messages: z.boolean(), jobUpdates: z.boolean(), reminders: z.boolean(), email: z.boolean() })).middleware([authMiddleware]).handler(async ({ data, context }) => { const sql = await getSql(); await sql`insert into account_settings (user_id, notify_proposals, notify_messages, notify_job_updates, notify_reminders, notify_email) values (${context.userId}, ${data.proposals}, ${data.messages}, ${data.jobUpdates}, ${data.reminders}, ${data.email}) on conflict (user_id) do update set notify_proposals = excluded.notify_proposals, notify_messages = excluded.notify_messages, notify_job_updates = excluded.notify_job_updates, notify_reminders = excluded.notify_reminders, notify_email = excluded.notify_email, updated_at = now()`; return { ok: true }; });

export const getNotificationPreferencesOptional = createServerFn({ method: "GET" }).handler(async ({ context }): Promise<{ proposals: boolean; messages: boolean; job_updates: boolean; reminders: boolean; email: boolean }> => { 
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  if (!user) return { proposals: true, messages: true, job_updates: true, reminders: true, email: true };
  const sql = await getSql();
  try { 
    const rows = await sql<{ proposals: boolean; messages: boolean; job_updates: boolean; reminders: boolean; email: boolean }>`select notify_proposals as proposals, notify_messages as messages, notify_job_updates as job_updates, notify_reminders as reminders, notify_email as email from account_settings where user_id = ${user.id} limit 1`;
    return rows[0] ?? { proposals: true, messages: true, job_updates: true, reminders: true, email: true };
  } catch { return { proposals: true, messages: true, job_updates: true, reminders: true, email: true }; }
});

export const updateNotificationPreferencesOptional = createServerFn({ method: "POST" }).validator(z.object({ proposals: z.boolean(), messages: z.boolean(), jobUpdates: z.boolean(), reminders: z.boolean(), email: z.boolean() })).handler(async ({ data, context }) => { 
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  if (!user) throw new Error("Não autenticado");
  const sql = await getSql();
  await sql`insert into account_settings (user_id, notify_proposals, notify_messages, notify_job_updates, notify_reminders, notify_email) values (${user.id}, ${data.proposals}, ${data.messages}, ${data.jobUpdates}, ${data.reminders}, ${data.email}) on conflict (user_id) do update set notify_proposals = excluded.notify_proposals, notify_messages = excluded.notify_messages, notify_job_updates = excluded.notify_job_updates, notify_reminders = excluded.notify_reminders, notify_email = excluded.notify_email, updated_at = now()`;
  return { ok: true };
});

export const listSavedProfessionals = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: string }>`select professional_id as id from saved_professionals where user_id = ${context.userId} order by created_at desc`;
  });

export const listSavedProfessionalsOptional = createServerFn({ method: "GET" }).handler(async ({ context }) => { 
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  if (!user) return [];
  const sql = await getSql();
  return sql<{ id: string }>`select professional_id as id from saved_professionals where user_id = ${user.id} order by created_at desc`;
});

export const toggleSavedProfessional = createServerFn({ method: "POST" })
  .validator(z.object({ professionalId: z.string().min(1).max(100) }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const existing = await sql<{ id: string }>`select professional_id as id from saved_professionals where user_id = ${context.userId} and professional_id = ${data.professionalId}`;
    if (existing[0]) {
      await sql`delete from saved_professionals where user_id = ${context.userId} and professional_id = ${data.professionalId}`;
      return { saved: false };
    }
    await sql`insert into saved_professionals (user_id, professional_id) values (${context.userId}, ${data.professionalId})`;
    return { saved: true };
  });

export const registerProfessional = createServerFn({ method: "POST" })
  .validator(professionalInput)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    if (data.rateMax < data.rateMin) throw new Error("O preço máximo deve ser superior ao mínimo.");
    const sql = await getSql();
    const existing = await sql<{ id: string }>`select id from professionals where owner_user_id = ${context.userId} limit 1`;
    if (existing[0]) throw new Error("Já tens um perfil profissional.");
    const professionalId = id("pro");
    await sql`insert into professionals (id, owner_user_id, name, category, neighborhood, years, rate_min, rate_max, rating, jobs_count, available_today, bio, skills, response_mins, whatsapp, verified, profile_status) values (${professionalId}, ${context.userId}, ${data.name}, ${data.category}, ${data.neighborhood}, 0, ${data.rateMin}, ${data.rateMax}, 0, 0, false, ${data.bio}, ${data.skills}, 60, ${data.whatsapp}, false, 'ativo')`;
    return { id: professionalId };
  });