import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { sendPushNotification, notificationTemplates } from "@/lib/push/webpush";

export const Route = createFileRoute("/api/cron/reminder-24h-push")({
  server: { handlers: {
    GET: async ({ request }: { request: Request }) => {
      const cronSecret = request.headers.get("x-cron-secret") || new URL(request.url).searchParams.get("secret");
      const expectedSecret = process.env.CRON_SECRET;
      
      if (!expectedSecret || cronSecret !== expectedSecret) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      try {
        const sql = await getSql();
        
        const jobs = await sql<{
          id: string;
          title: string;
          category: string;
          neighborhood: string;
          user_id: string;
          created_at: string;
        }>`
          select j.id, j.title, j.category, j.neighborhood, j.user_id, j.created_at
          from jobs j
          where j.status = 'aberto'
            and j.created_at < now() - interval '24 hours'
            and not exists (select 1 from proposals p where p.job_id = j.id)
            and not exists (
              select 1 from job_reminders r 
              where r.job_id = j.id 
              and r.sent_at > now() - interval '24 hours'
            )
          limit 50
        `;

        if (jobs.length === 0) {
          return Response.json({ 
            success: true, 
            message: "No jobs needing reminders",
            sent: 0 
          });
        }

        let sent = 0;
        let failed = 0;

        for (const job of jobs) {
          try {
            const prefs = await sql<{ notify_reminders: boolean }>`
              select notify_reminders from account_settings where user_id = ${job.user_id} limit 1
            `;
            
            if (!prefs[0]?.notify_reminders) continue;

            const subscriptions = await sql<{ endpoint: string; subscription: any }>`
              select endpoint, subscription from push_subscriptions where user_id = ${job.user_id}
            `;

            if (subscriptions.length === 0) continue;

            const url = `${process.env.BETTER_AUTH_URL ?? "https://biscate-ao-seven.vercel.app"}/pedidos/${job.id}`;
            const payload = notificationTemplates.reminder(job.title, url);
            
            const results = await Promise.allSettled(
              subscriptions.map(s => sendPushNotification(s.subscription, payload))
            );

            results.forEach((result) => {
              if (result.status === 'fulfilled' && result.value.success) {
                sent++;
              } else {
                failed++;
              }
            });

            if (sent > 0) {
              await sql`
                insert into job_reminders (id, job_id, sent_at)
                values (${`rem-${crypto.randomUUID()}`}, ${job.id}, now())
                on conflict (job_id) do update set sent_at = now()
              `;
            }

          } catch (error) {
            failed++;
            console.error('[Cron Push] Error processing job:', job.id, error);
          }
        }

        return Response.json({ 
          success: true, 
          sent, 
          failed,
          total: jobs.length
        });
      } catch (error: any) {
        console.error('[Cron Push] Reminder 24h error:', error);
        return Response.json({ 
          success: false, 
          error: error.message 
        }, { status: 500 });
      }
    },
  } },
});