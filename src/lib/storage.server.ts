import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";

const BUCKET_NAME = 'BiscateAO';

export type UploadResult = {
  url: string;
  path: string;
} | { error: string };

async function uploadFile(
  file: File,
  folder: string,
  entityId: string
): Promise<UploadResult> {
  // Import Supabase client dynamically inside the handler to avoid client bundling
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${folder}/${entityId}-${Date.now()}.${ext}`;

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, buffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return { url: publicUrl, path: data.path };
}

// Create server functions with proper naming to avoid client bundling
export const uploadAvatar = createServerFn({ method: "POST" })
  .validator(z.object({ 
    file: z.instanceof(File),
    entityId: z.string(),
  }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    return uploadFile(data.file, 'avatars', data.entityId);
  });

export const uploadPortfolioImage = createServerFn({ method: "POST" })
  .validator(z.object({ 
    file: z.instanceof(File),
    entityId: z.string(),
  }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    return uploadFile(data.file, 'portfolio', data.entityId);
  });

export const deleteFile = createServerFn({ method: "POST" })
  .validator(z.object({ path: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.storage
      .from('BiscateAO')
      .remove([data.path]);

    if (error) return { error: error.message };
    return {};
  });

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Formato inválido. Use JPEG, PNG, WebP ou GIF.' };
  }
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, error: 'Arquivo muito grande. Máximo 50MB.' };
  }
  return { valid: true };
}