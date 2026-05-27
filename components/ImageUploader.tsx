"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Upload, X, GripVertical, ChevronUp, ChevronDown, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { ProjectImage } from "@/lib/types";
import { saveImage, getImage, deleteImage, isIdbKey, makeKey } from "@/lib/imageStore";
import { apiUploadImage, apiUploadImages, UploadProgress } from "@/lib/api";

const SANITY_CONFIGURED = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// ── Resolve a URL or IDB key to a displayable src ────────────────────────────
function useResolvedSrc(value: string): string {
  const [src, setSrc] = useState(() => (isIdbKey(value) ? "" : value));
  useEffect(() => {
    if (!value) { setSrc(""); return; }
    if (!isIdbKey(value)) { setSrc(value); return; }
    getImage(value).then((v) => setSrc(v ?? "")).catch(() => setSrc(""));
  }, [value]);
  return src;
}

// ── Store a file: Sanity CDN if configured, else IndexedDB ───────────────────
async function storeFile(file: File, existingKey?: string): Promise<string> {
  if (SANITY_CONFIGURED) {
    const { url } = await apiUploadImage(file);
    return url;
  }
  const key = existingKey && isIdbKey(existingKey) ? existingKey : makeKey();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
  await saveImage(key, dataUrl);
  return key;
}

// ── Single image uploader ─────────────────────────────────────────────────────
interface SingleUploaderProps {
  label: string;
  value: string;
  onChange: (key: string) => void;
  onClear: () => void;
  hint?: string;
}

export function SingleImageUploader({ label, value, onChange, onClear, hint }: SingleUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const src = useResolvedSrc(value);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const key = await storeFile(file, value);
      onChange(key);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      console.error("[SingleImageUploader]", msg);
    } finally {
      setLoading(false);
    }
  }, [value, onChange]);

  const handleClear = async () => {
    if (value && isIdbKey(value)) await deleteImage(value).catch(() => {});
    setError(null);
    onClear();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-xs font-body font-medium uppercase tracking-wide block">
        {label}
      </label>

      {src ? (
        <div className="relative rounded-xl overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} className="w-full h-auto object-cover max-h-64 rounded-xl" />
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-body px-3 py-1.5 rounded-lg transition-colors">
              Replace
            </button>
            <button type="button" onClick={handleClear}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-body px-3 py-1.5 rounded-lg transition-colors">
              Remove
            </button>
          </div>
          {loading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Loader2 size={24} className="text-accent animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !loading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors
            ${loading ? "cursor-wait opacity-60" : "cursor-pointer"}
            ${dragging ? "border-accent/70 bg-accent/5" : "border-white/10 hover:border-accent/40"}`}
        >
          {loading
            ? <Loader2 size={24} className="text-accent animate-spin" />
            : <Upload size={24} className={`transition-colors ${dragging ? "text-accent" : "text-text-secondary"}`} />
          }
          <div className="text-center">
            <p className="text-text-secondary text-sm font-body">
              {loading ? "Uploading…" : dragging ? "Drop to upload" : "Click or drag to upload"}
            </p>
            {hint && <p className="text-text-secondary/50 text-xs font-body mt-1">{hint}</p>}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs font-body bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          <AlertCircle size={13} className="flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">
            <X size={12} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}

// ── Multi image uploader ──────────────────────────────────────────────────────
interface MultiUploaderProps {
  label: string;
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
}

function GalleryThumb({ url, alt }: { url: string; alt: string }) {
  const src = useResolvedSrc(url);
  if (!src) return <div className="absolute inset-0 bg-white/5 animate-pulse rounded-lg" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover object-center" />;
}

export function MultiImageUploader({ label, images, onChange }: MultiUploaderProps) {
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [dragging, setDragging]     = useState(false);
  const [progress, setProgress]     = useState<UploadProgress[]>([]);
  const abortRef                    = useRef<AbortController | null>(null);

  const isUploading = progress.some((p) => p.status === "uploading" || p.status === "pending");

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!fileArray.length) return;

    // Cancel any in-flight upload
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (SANITY_CONFIGURED) {
      // Use batch uploader with per-file progress and error isolation
      const results = await apiUploadImages(
        fileArray,
        (updated) => setProgress([...updated]),
        controller.signal,
      );

      const succeeded = results.filter((r) => r.status === "done" && r.result);
      const failed    = results.filter((r) => r.status === "error");

      if (failed.length > 0) {
        console.warn(`[MultiImageUploader] ${failed.length} file(s) failed:`,
          failed.map((f) => `${f.file.name}: ${f.error}`).join(", "));
      }

      if (succeeded.length > 0) {
        const newImages: ProjectImage[] = succeeded.map((r) => ({
          url:     r.result!.url,
          alt:     r.file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          caption: "",
        }));
        onChange([...images, ...newImages]);
      }

      // Clear progress after a short delay so user can see final state
      setTimeout(() => setProgress([]), 2500);

    } else {
      // IndexedDB fallback — sequential to avoid memory spikes
      setProgress(fileArray.map((f) => ({ file: f, status: "uploading" as const })));
      const newImages: ProjectImage[] = [];
      for (const file of fileArray) {
        try {
          const key = await storeFile(file);
          newImages.push({
            url:     key,
            alt:     file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
            caption: "",
          });
        } catch (err) {
          console.error("[MultiImageUploader] IDB store failed:", err);
        }
      }
      if (newImages.length) onChange([...images, ...newImages]);
      setTimeout(() => setProgress([]), 1000);
    }
  }, [images, onChange]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const remove = async (i: number) => {
    const img = images[i];
    if (img.url && isIdbKey(img.url)) await deleteImage(img.url).catch(() => {});
    onChange(images.filter((_, j) => j !== i));
  };

  const updateAlt     = (i: number, alt: string)     => { const u = [...images]; u[i] = { ...u[i], alt };     onChange(u); };
  const updateCaption = (i: number, caption: string) => { const u = [...images]; u[i] = { ...u[i], caption }; onChange(u); };
  const moveUp        = (i: number) => { if (i === 0) return; const u = [...images]; [u[i-1], u[i]] = [u[i], u[i-1]]; onChange(u); };
  const moveDown      = (i: number) => { if (i === images.length - 1) return; const u = [...images]; [u[i], u[i+1]] = [u[i+1], u[i]]; onChange(u); };

  // Summarise upload progress for the drop zone label
  const progressLabel = (() => {
    if (!progress.length) return null;
    const done  = progress.filter((p) => p.status === "done").length;
    const total = progress.length;
    const errs  = progress.filter((p) => p.status === "error").length;
    if (errs > 0 && done + errs === total) return `${done}/${total} uploaded (${errs} failed)`;
    if (done === total) return `${total} uploaded`;
    return `Uploading ${done}/${total}…`;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-text-secondary text-xs font-body font-medium uppercase tracking-wide">
          {label}{" "}
          <span className="text-accent">
            ({images.length} image{images.length !== 1 ? "s" : ""})
          </span>
        </label>
        <button
          type="button"
          onClick={() => !isUploading && inputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-accent text-xs font-body hover:text-accent/80 transition-colors disabled:opacity-40"
        >
          {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Add Images
        </button>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (!isUploading) handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-all
          ${isUploading ? "cursor-wait opacity-70" : "cursor-pointer"}
          ${dragging ? "border-accent/70 bg-accent/5 scale-[1.01]" : "border-white/10 hover:border-accent/40"}`}
      >
        {isUploading
          ? <Loader2 size={20} className="text-accent animate-spin" />
          : <Upload size={20} className={`transition-colors ${dragging ? "text-accent" : "text-text-secondary"}`} />
        }
        <p className="text-text-secondary text-xs font-body">
          {progressLabel ?? (dragging ? "Drop images here" : "Click or drag multiple images here")}
        </p>
        <p className="text-text-secondary/40 text-xs font-body">
          PNG, JPG, WebP · Max 10 MB each · First image = cover
        </p>
      </div>

      {/* Per-file upload status */}
      {progress.length > 0 && (
        <div className="space-y-1.5">
          {progress.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-body px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
              {p.status === "uploading" || p.status === "pending"
                ? <Loader2 size={12} className="text-accent animate-spin flex-shrink-0" />
                : p.status === "done"
                  ? <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                  : <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
              }
              <span className="text-text-secondary truncate flex-1">{p.file.name}</span>
              {p.status === "error" && (
                <span className="text-red-400 truncate max-w-[200px]">{p.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image list */}
      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((img, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
              {/* Reorder controls */}
              <div className="flex flex-col gap-0.5 justify-center flex-shrink-0">
                <button type="button" onClick={() => moveUp(i)} disabled={i === 0}
                  className="p-1 rounded text-text-secondary hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                  <ChevronUp size={14} />
                </button>
                <GripVertical size={14} className="text-white/20 mx-auto" />
                <button type="button" onClick={() => moveDown(i)} disabled={i === images.length - 1}
                  className="p-1 rounded text-text-secondary hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/5 relative">
                <GalleryThumb url={img.url} alt={img.alt} />
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-1.5">
                  {i === 0 && (
                    <span className="text-xs font-body font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      Cover
                    </span>
                  )}
                  <span className="text-white/20 text-xs font-body flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <input
                    value={img.alt}
                    onChange={(e) => updateAlt(i, e.target.value)}
                    placeholder="Image title / alt text"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-body text-xs focus:outline-none focus:border-accent/50 transition-all min-w-0"
                  />
                </div>
                <input
                  value={img.caption || ""}
                  onChange={(e) => updateCaption(i, e.target.value)}
                  placeholder="Caption (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-text-secondary font-body text-xs focus:outline-none focus:border-accent/50 transition-all"
                />
              </div>

              {/* Remove */}
              <button type="button" onClick={() => remove(i)}
                className="flex-shrink-0 self-center p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}
