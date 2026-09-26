"use client";

import { useState, useCallback, useRef } from 'react';
import { Image, Upload, X, Loader2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadAvatar, uploadPortfolioImage, deleteFile, type UploadResult } from '@/lib/storage.client';
import { validateImageFile } from '@/lib/validation';
import { toast } from "sonner";

interface ImageUploadProps {
  type: 'avatar' | 'portfolio';
  entityId: string; // userId ou professionalId
  currentUrl?: string;
  currentPath?: string;
  onUploadSuccess?: (url: string, path: string) => void;
  onDelete?: () => void;
  multiple?: boolean; // para portfolio
  maxFiles?: number;
  existingImages?: Array<{ url: string; path?: string }>;
  onImagesChange?: (images: Array<{ url: string; path?: string }>) => void;
}

export function ImageUpload({
  type,
  entityId,
  currentUrl,
  currentPath,
  onUploadSuccess,
  onDelete,
  multiple = false,
  maxFiles = 6,
  existingImages = [],
  onImagesChange,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [previews, setPreviews] = useState<Array<{ url: string; path?: string; file?: File }>>(
    existingImages.map(img => ({ url: img.url, path: img.path }))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Arquivo inválido');
      return;
    }

    if (multiple) {
      if (previews.length >= maxFiles) {
        setError(`Máximo de ${maxFiles} imagens`);
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviews(prev => [...prev, { url, file }]);
      if (onImagesChange) {
        onImagesChange([...previews, { url, file }].map(p => ({ url: p.url, path: p.path })));
      }
    } else {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }, [multiple, maxFiles, previews, onImagesChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      let result: UploadResult;
      if (type === 'avatar') {
        result = await uploadAvatar({ file, entityId });
      } else {
        result = await uploadPortfolioImage({ file, entityId });
      }

      if ('error' in result) throw new Error(result.error);

      if (onUploadSuccess) onUploadSuccess(result.url, result.path);
      if (multiple) {
        setPreviews(prev => prev.map(p => p.file === file ? { ...p, url: result.url, path: result.path } : p));
      } else {
        setPreview(result.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setUploading(false);
    }
  }, [type, entityId, onUploadSuccess, multiple]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (multiple) {
      const files = previews.filter(p => p.file && !p.path);
      for (const p of files) {
        if (p.file) await upload(p.file);
      }
    } else if (preview && !currentUrl) {
      // Get the file from the input
      if (inputRef.current?.files?.[0]) {
        await upload(inputRef.current.files[0]);
      }
    }
  }, [multiple, previews, upload, currentUrl]);

  const removeImage = useCallback(async (index: number, path?: string) => {
    if (path) {
      await deleteFile({ path });
    }
    if (multiple) {
      setPreviews(prev => prev.filter((_, i) => i !== index));
      if (onImagesChange) {
        onImagesChange(previews.filter((_, i) => i !== index).map(p => ({ url: p.url, path: p.path })));
      }
    } else {
      setPreview(null);
      if (onDelete) onDelete();
    }
  }, [multiple, previews, onImagesChange, onDelete]);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  if (multiple) {
    return (
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-6 text-center transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => e.target.files && Array.from(e.target.files).forEach(handleFileSelect)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading || previews.length >= maxFiles}
          />
          <Upload className="mx-auto size-10 text-muted" strokeWidth={1.5} />
          <p className="mt-2 text-sm text-muted">
            {previews.length >= maxFiles
              ? `Limite de ${maxFiles} imagens atingido`
              : `Arraste e solte ou clique para adicionar (máx. ${maxFiles})`}
          </p>
          <p className="text-xs text-faint mt-1">JPEG, PNG, WebP, GIF • Máx. 50MB</p>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {previews.map((p, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-border bg-surface">
                <div className="aspect-square relative">
                  <img
                    src={p.url}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {p.path && !p.file && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-red-400"
                        onClick={() => removeImage(i, p.path)}
                      >
                        <Trash2 className="size-4" strokeWidth={2} />
                      </Button>
                    )}
                  </div>
                  {p.file && !p.path && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="size-6 text-white animate-spin" strokeWidth={2} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-muted text-center">
          {previews.length}/{maxFiles} imagens
        </p>
      </div>
    );
  }

  // Single avatar upload
  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative w-28 h-28 mx-auto rounded-full border-2 border-dashed overflow-hidden transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <Image className="mx-auto my-6 size-10 text-muted" strokeWidth={1.5} />
            <p className="text-xs text-center text-muted">Clique ou arraste</p>
          </>
        )}
        {currentPath && !uploading && (
          <button
            onClick={e => { e.stopPropagation(); removeImage(0, currentPath); }}
            className="absolute bottom-1 right-1 rounded-full bg-red-500/90 text-white p-1 hover:bg-red-600 transition-colors"
            aria-label="Remover foto"
          >
            <Trash2 className="size-3.5" strokeWidth={2} />
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="size-6 text-white animate-spin" strokeWidth={2} />
          </div>
        )}
      </div>

      {error && (
        <p className="text-center text-sm text-red-500" role="alert">{error}</p>
      )}

      <p className="text-center text-xs text-muted">
        JPEG, PNG, WebP, GIF • Máx. 50MB
      </p>
    </div>
  );
}