"use client";

// Client-side wrappers for storage server functions
// These use the TanStack Start RPC mechanism to call server functions
// The actual implementation is in storage.server.ts and gets replaced at build time

import { validateImageFile } from '@/lib/validation';

export type UploadResult = {
  url: string;
  path: string;
} | { error: string };

export { validateImageFile };

// These functions will be replaced by the server function RPC calls at build time
// They must have the same input/output types as the server functions
export async function uploadAvatar(input: { file: File; entityId: string }): Promise<UploadResult> {
  // This will be replaced by the server function call at build time
  throw new Error('Not implemented on client - should be replaced by RPC');
}

export async function uploadPortfolioImage(input: { file: File; entityId: string }): Promise<UploadResult> {
  // This will be replaced by the server function call at build time
  throw new Error('Not implemented on client - should be replaced by RPC');
}

export async function deleteFile(input: { path: string }): Promise<{ error?: string }> {
  // This will be replaced by the server function call at build time
  throw new Error('Not implemented on client - should be replaced by RPC');
}