"use client";

// Client-side wrappers for storage server functions
// These use the TanStack Start RPC mechanism to call server functions

import { validateImageFile } from '@/lib/validation';

export type UploadResult = {
  url: string;
  path: string;
} | { error: string };

export { validateImageFile };

// These functions will be replaced by the server function RPC calls at build time
// The actual implementation is in storage.server.ts
export async function uploadAvatar(file: File, entityId: string): Promise<UploadResult> {
  // This will be replaced by the server function call at build time
  throw new Error('Not implemented on client');
}

export async function uploadPortfolioImage(file: File, entityId: string): Promise<UploadResult> {
  // This will be replaced by the server function call at build time
  throw new Error('Not implemented on client');
}

export async function deleteFile(path: string): Promise<{ error?: string }> {
  // This will be replaced by the server function call at build time
  throw new Error('Not implemented on client');
}