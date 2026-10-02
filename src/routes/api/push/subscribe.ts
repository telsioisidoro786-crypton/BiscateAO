import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2000),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export const Route = createFileRoute("/api/push/subscribe")({
  server: { handlers: { POST: async ({ request }) => {
    assertSameSiteRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const parsed = subscriptionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Subscrição inválida" }, { status: 400 });
    const sql = await getSql();
    await sql`insert into push_subscriptions (id, user_id, endpoint, subscription) values (${`push-${crypto.randomUUID()}`}, ${session.user.id}, ${parsed.data.endpoint}, ${JSON.stringify(parsed.data)}) on conflict (endpoint) do update set user_id = excluded.user_id, subscription = excluded.subscription, updated_at = now()`;
    return Response.json({ ok: true });
  } } },
});
