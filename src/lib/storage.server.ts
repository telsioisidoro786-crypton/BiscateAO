import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";

// This file is kept for other server functions that don't involve File uploads
// File uploads are now handled via API routes in src/routes/api/upload/

export type UploadResult = {
  url: string;
  path: string;
} | { error: string };

// Placeholder - upload functions moved to API routes
// See src/routes/api/upload/avatar.ts, portfolio.ts, delete.ts