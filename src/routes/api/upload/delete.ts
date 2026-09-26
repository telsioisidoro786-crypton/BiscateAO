import { createFileRoute } from "@tanstack/react-router";
import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'BiscateAO';

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey);
}

export const Route = createFileRoute("/api/upload/delete")({
  server: { handlers: {
    POST: async ({ request }: { request: Request }) => {
      try {
        const formData = await request.formData();
        const path = formData.get('path') as string;

        if (!path) {
          return Response.json({ error: 'path é obrigatório' }, { status: 400 });
        }

        const supabase = getSupabase();

        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([path]);

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({ success: true });
      } catch (err) {
        return Response.json({ error: err instanceof Error ? err.message : 'Erro ao deletar' }, { status: 500 });
      }
    },
  } },
});