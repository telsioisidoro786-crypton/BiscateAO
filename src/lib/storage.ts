import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'BiscateAO';

export type UploadResult = {
  url: string;
  path: string;
} | { error: string };

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `avatars/${userId}-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return { url: publicUrl, path: data.path };
}

export async function uploadPortfolioImage(
  file: File,
  professionalId: string
): Promise<UploadResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `portfolio/${professionalId}-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return { url: publicUrl, path: data.path };
}

export async function deleteFile(path: string): Promise<{ error?: string }> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) return { error: error.message };
  return {};
}

export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

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