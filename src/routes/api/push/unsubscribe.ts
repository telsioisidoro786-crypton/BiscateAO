import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

export const Route = createFileRoute("/api/push/unsubscribe")({
  server: { handlers: { POST: async ({ request }) => {
    assertSameSiteRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = z.object({ endpoint: z.string().url().max(2000) }).safeParse(await request.json().catch(() => null));
    if (!body.success) return Response.json({ error: "Subscrição inválida" }, { status: 400 });
    const sql = await getSql();
    await sql`delete from push_subscriptions where user_id = ${session.user.id} and endpoint = ${body.data.endpoint}`;
    return Response.json({ ok: true });
  } } },
});
