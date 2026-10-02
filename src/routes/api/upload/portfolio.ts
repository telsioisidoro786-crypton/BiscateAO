import { createFileRoute } from "@tanstack/react-router";
import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'BiscateAO';

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey);
}

export const Route = createFileRoute("/api/upload/portfolio")({
  server: { handlers: {
    POST: async ({ request }: { request: Request }) => {
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const entityId = formData.get('entityId') as string;

        if (!file || !entityId) {
          return Response.json({ error: 'file e entityId são obrigatórios' }, { status: 400 });
        }

        const supabase = getSupabase();
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `portfolio/${entityId}-${Date.now()}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, buffer, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type,
          });

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data.path);

        return Response.json({ url: publicUrl, path: data.path });
      } catch (err) {
        return Response.json({ error: err instanceof Error ? err.message : 'Erro no upload' }, { status: 500 });
      }
    },
  } },
});