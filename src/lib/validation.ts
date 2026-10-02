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