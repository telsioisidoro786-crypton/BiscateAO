"use client";

// Client-side storage functions using API routes (fetch)
// Server functions with File validators don't work with TanStack Start RPC

import { validateImageFile } from '@/lib/validation';

export type UploadResult = {
  url: string;
  path: string;
} | { error: string };

export { validateImageFile };

const API_BASE = '/api/upload';

async function uploadFile(endpoint: string, file: File, entityId: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityId', entityId);

  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: data.error || 'Erro no upload' };
  }

  return { url: data.url, path: data.path };
}

export async function uploadAvatar(input: { file: File; entityId: string }): Promise<UploadResult> {
  return uploadFile('avatar', input.file, input.entityId);
}

export async function uploadPortfolioImage(input: { file: File; entityId: string }): Promise<UploadResult> {
  return uploadFile('portfolio', input.file, input.entityId);
}

export async function deleteFile(input: { path: string }): Promise<{ error?: string }> {
  const formData = new FormData();
  formData.append('path', input.path);

  const response = await fetch(`${API_BASE}/delete`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: data.error || 'Erro ao deletar' };
  }

  return {};
}