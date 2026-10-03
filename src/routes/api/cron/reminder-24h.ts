import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getSql } from "@/lib/db";
import { sendReminder24hEmail } from "@/lib/email/resend";

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, etc.)
// Schedule: every hour or every 30 minutes
// Security: Validate CRON_SECRET to prevent unauthorized calls

export const APIRoute = createAPIFileRoute("/api/cron/reminder-24h")({
  GET: async ({ request }) => {
    // Verify cron secret
    const cronSecret = request.headers.get("x-cron-secret") || new URL(request.url).searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET;
    
    if (!expectedSecret || cronSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    try {
      const sql = await getSql();
      
      // Find jobs that:
      // 1. Are open (status = 'aberto')
      // 2. Were created more than 24 hours ago
      // 3. Have no proposals yet
      // 4. Haven't had a reminder sent in the last 24h (we'll track this)
      
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
        return new Response(JSON.stringify({ 
          success: true, 
          message: "No jobs needing reminders",
          sent: 0 
        }), { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        });
      }

      let sent = 0;
      let failed = 0;

      for (const job of jobs) {
        try {
          // Check user notification preferences
          const user = await sql<{ email: string; name: string }>`
            select email, name from "user" where id = ${job.user_id} limit 1
          `;
          
          if (!user[0]?.email) continue;

          const prefs = await sql<{ notify_reminders: boolean; notify_email: boolean }>`
            select notify_reminders, notify_email from account_settings where user_id = ${job.user_id} limit 1
          `;
          
          if (!prefs[0]?.notify_reminders || !prefs[0]?.notify_email) continue;

          const jobUrl = `${process.env.BETTER_AUTH_URL ?? "https://biscate-ao-seven.vercel.app"}/pedidos/${job.id}`;
          
          const result = await sendReminder24hEmail({
            clientEmail: user[0].email,
            clientName: user[0].name || "",
            jobTitle: job.title,
            jobNeighborhood: job.neighborhood,
            jobUrl,
            jobCategory: job.category,
          });

          if (result.success) {
            sent++;
            // Record that we sent a reminder
            await sql`
              insert into job_reminders (id, job_id, sent_at)
              values (${`rem-${crypto.randomUUID()}`}, ${job.id}, now())
              on conflict (job_id) do update set sent_at = now()
            `;
          } else {
            failed++;
            console.error('[Cron] Reminder email failed for job:', job.id, result.error);
          }
        } catch (error) {
          failed++;
          console.error('[Cron] Error processing job:', job.id, error);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        sent, 
        failed,
        total: jobs.length
      }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    } catch (error: any) {
      console.error('[Cron] Reminder 24h error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      });
    }
  },
});