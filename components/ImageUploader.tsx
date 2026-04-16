"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, X, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { ProjectImage } from "@/lib/types";
import { saveImage, getImage, deleteImage, isIdbKey, makeKey } from "@/lib/imageStore";
import { apiUploadImage } from "@/lib/api";

const SANITY_CONFIGURED = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// ── Resolve a URL or IDB key to a displayable src ────────────────────────────
function useResolvedSrc(value: string): string {
  const [src, setSrc] = useState(() => (isIdbKey(value) ? "" : value));
  useEffect(() => {
    if (!value) { setSrc(""); return; }
    if (!isIdbKey(value)) { setSrc(value); return; }
    getImage(value).then((v) => setSrc(v ?? ""));
  }, [value]);
  return src;
}

// ── Save a File — to Sanity CDN if configured, else IndexedDB ────────────────
async function storeFile(file: File, existingKey?: string): Promise<string> {
  if (SANITY_CONFIGURED) {
    const { url } = await apiUploadImage(file);
    return url;
  }
  const key = existingKey && isIdbKey(existingKey) ? existingKey : makeKey();
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
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
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const src = useResolvedSrc(value);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setLoading(true);
    try {
      const key = await storeFile(file, value);
      onChange(key);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (value && isIdbKey(value)) await deleteImage(value).catch(() => {});
    onClear();
  };

  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-xs font-body font-medium uppercase tracking-wide block">{label}</label>
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
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
            dragging ? "border-accent/70 bg-accent/5" : "border-white/10 hover:border-accent/40"
          }`}
        >
          <Upload size={24} className={`transition-colors ${dragging ? "text-accent" : "text-text-secondary"}`} />
          <div className="text-center">
            <p className="text-text-secondary text-sm font-body">{loading ? "Uploading…" : dragging ? "Drop to upload" : "Click or drag to upload"}</p>
            {hint && <p className="text-text-secondary/50 text-xs font-body mt-1">{hint}</p>}
          </div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ── Multi image uploader ──────────────────────────────────────────────────────
interface MultiUploaderProps {
  label: string;
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
}

// Resolved preview for a single gallery item
function GalleryThumb({ url, alt }: { url: string; alt: string }) {
  const src = useResolvedSrc(url);
  if (!src) return <div className="absolute inset-0 bg-white/5 animate-pulse rounded-lg" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover object-center" />;
}

export function MultiImageUploader({ label, images, onChange }: MultiUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!fileArray.length) return;
    setLoading(true);
    try {
      const newImages = await Promise.all(
        fileArray.map(async (file) => {
          const key = await storeFile(file);
          return {
            url: key,
            alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
            caption: "",
          } as ProjectImage;
        })
      );
      onChange([...images, ...newImages]);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (i: number) => {
    const img = images[i];
    if (img.url && isIdbKey(img.url)) await deleteImage(img.url).catch(() => {});
    onChange(images.filter((_, j) => j !== i));
  };

  const updateAlt     = (i: number, alt: string)     => { const u = [...images]; u[i] = { ...u[i], alt };     onChange(u); };
  const updateCaption = (i: number, caption: string) => { const u = [...images]; u[i] = { ...u[i], caption }; onChange(u); };
  const moveUp   = (i: number) => { if (i === 0) return; const u = [...images]; [u[i-1], u[i]] = [u[i], u[i-1]]; onChange(u); };
  const moveDown = (i: number) => { if (i === images.length - 1) return; const u = [...images]; [u[i], u[i+1]] = [u[i+1], u[i]]; onChange(u); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-text-secondary text-xs font-body font-medium uppercase tracking-wide">
          {label} <span className="text-accent">({images.length} image{images.length !== 1 ? "s" : ""})</span>
        </label>
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-accent text-xs font-body hover:text-accent/80 transition-colors">
          <Upload size={12} /> Add Images
        </button>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all ${
          dragging ? "border-accent/70 bg-accent/5 scale-[1.01]" : "border-white/10 hover:border-accent/40"
        }`}
      >
        <Upload size={20} className={`transition-colors ${dragging ? "text-accent" : "text-text-secondary"}`} />
        <p className="text-text-secondary text-xs font-body">
          {loading ? "Uploading…" : dragging ? "Drop images here" : "Click or drag multiple images here"}
        </p>
        <p className="text-text-secondary/40 text-xs font-body">PNG, JPG, WebP · Stored in browser · First image = cover</p>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((img, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
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

              <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/5 relative">
                <GalleryThumb url={img.url} alt={img.alt} />
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-1.5">
                  {i === 0 && (
                    <span className="text-xs font-body font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full flex-shrink-0">Cover</span>
                  )}
                  <span className="text-white/20 text-xs font-body flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <input value={img.alt} onChange={(e) => updateAlt(i, e.target.value)}
                    placeholder="Image title / alt text"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-body text-xs focus:outline-none focus:border-accent/50 transition-all min-w-0" />
                </div>
                <input value={img.caption || ""} onChange={(e) => updateCaption(i, e.target.value)}
                  placeholder="Caption (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-text-secondary font-body text-xs focus:outline-none focus:border-accent/50 transition-all" />
              </div>

              <button type="button" onClick={() => remove(i)}
                className="flex-shrink-0 self-center p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
