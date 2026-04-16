"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Grid3x3, AlignJustify } from "lucide-react";
import { ProjectImage, GalleryLayout } from "@/lib/types";
import { useInView } from "react-intersection-observer";
import { isIdbKey, getImage } from "@/lib/imageStore";

function useResolvedSrc(src: string): string {
  const [resolved, setResolved] = useState(() => (isIdbKey(src) ? "" : src));
  useEffect(() => {
    if (!src) { setResolved(""); return; }
    if (!isIdbKey(src)) { setResolved(src); return; }
    getImage(src).then((v) => setResolved(v ?? ""));
  }, [src]);
  return resolved;
}

function ResolvedImg({ url, alt, className }: { url: string; alt: string; className?: string }) {
  const src = useResolvedSrc(url);
  if (!src) return <div className={`bg-white/5 animate-pulse ${className ?? ""}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}

function LightboxImage({ img, style }: { img: ProjectImage; style?: React.CSSProperties }) {
  const src = useResolvedSrc(img.url);
  if (!src) return <div className="w-full h-64 bg-white/5 animate-pulse rounded-xl" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={img.alt} className="max-w-full max-h-[calc(100vh-200px)] w-auto h-auto object-contain rounded-xl block mx-auto" style={style} />;
}

function ThumbImage({ img }: { img: ProjectImage }) {
  const src = useResolvedSrc(img.url);
  if (!src) return <div className="w-14 h-10 bg-white/5 animate-pulse" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={img.alt} className="w-14 h-10 object-cover object-center block" />;
}

interface ImageGalleryProps {
  images: ProjectImage[];
  layout?: GalleryLayout;
  accentColor?: string;
  previewCount?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────────────────────────────────────
function Lightbox({
  images, startIndex, onClose, accentColor,
}: {
  images: ProjectImage[]; startIndex: number; onClose: () => void; accentColor: string;
}) {
  const [current, setCurrent] = useState(startIndex);
  const total = images.length;
  const img = images[current];
  const thumbsRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, next, prev]);

  // Scroll active thumb into view
  useEffect(() => {
    const el = thumbsRef.current?.querySelector(`[data-index="${current}"]`) as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [current]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[300] flex flex-col bg-black/98 backdrop-blur-2xl"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 md:px-8 py-4 border-b border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="text-white text-sm font-body font-semibold truncate">{img.alt}</p>
          {img.caption && (
            <p className="text-white/40 text-xs font-body mt-0.5 truncate">{img.caption}</p>
          )}
        </div>
        <div className="flex items-center gap-5 flex-shrink-0 ml-4">
          <span className="text-white/30 text-sm font-body tabular-nums hidden sm:block">
            {current + 1} <span className="text-white/15">/</span> {total}
          </span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-white/70" />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div
        className="flex-1 flex items-center justify-center px-4 md:px-20 min-h-0 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative max-w-5xl w-full flex items-center justify-center"
          >
            <LightboxImage img={img} style={{ boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)` }} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all hover:scale-105"
          >
            <ChevronLeft size={20} className="text-white/70" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all hover:scale-105"
          >
            <ChevronRight size={20} className="text-white/70" />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {total > 1 && (
        <div
          className="flex-shrink-0 border-t border-white/[0.06] py-3 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={thumbsRef}
            className="flex gap-2 overflow-x-auto justify-center scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {images.map((t, i) => (
              <button
                key={i}
                data-index={i}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                  i === current
                    ? "opacity-100 scale-105"
                    : "opacity-30 hover:opacity-60 border-transparent"
                }`}
                style={i === current ? { borderColor: accentColor } : {}}
              >
                <ThumbImage img={t} />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen card — used in grid
// ─────────────────────────────────────────────────────────────────────────────
function ScreenCard({
  img, index, accentColor, onClick,
}: {
  img: ProjectImage; index: number; accentColor: string;
  onClick: () => void;
}) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 6) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative rounded-2xl overflow-hidden cursor-zoom-in bg-white/[0.02] border border-white/[0.06]"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
      onClick={onClick}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
    >
      {/* Fixed aspect ratio — all cards same height, image fills and crops to fit */}
      <div className="aspect-[4/3] w-full overflow-hidden">
        <ResolvedImg url={img.url} alt={img.alt} className="w-full h-full object-cover object-top" />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4">
        <div className="flex justify-end">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20"
            style={{ backgroundColor: `${accentColor}25` }}
          >
            <ZoomIn size={13} style={{ color: accentColor }} />
          </div>
        </div>
        <div>
          <p className="text-white text-sm font-body font-semibold leading-tight">{img.alt}</p>
          {img.caption && (
            <p className="text-white/55 text-xs font-body mt-1 line-clamp-2">{img.caption}</p>
          )}
        </div>
      </div>

      {/* Index badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[10px] font-body font-bold text-white/40 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1.5px ${accentColor}30` }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout toggle button
// ─────────────────────────────────────────────────────────────────────────────
function LayoutToggle({
  active, onChange, accentColor,
}: {
  active: "grid" | "showcase"; onChange: (v: "grid" | "showcase") => void; accentColor: string;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
      {([
        { id: "showcase", icon: AlignJustify, label: "2-up" },
        { id: "grid", icon: Grid3x3, label: "Grid" },
      ] as { id: "grid" | "showcase"; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          title={label}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
            active === id ? "text-background" : "text-white/40 hover:text-white/70"
          }`}
          style={active === id ? { backgroundColor: accentColor } : {}}
        >
          <Icon size={13} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export default function ImageGallery({
  images,
  layout = "grid",
  accentColor = "#C8FA64",
  previewCount = 0,
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(previewCount === 0);
  const [viewMode, setViewMode] = useState<"grid" | "showcase">(
    layout === "fullwidth" ? "showcase" : "grid"
  );

  const visible = showAll ? images : images.slice(0, previewCount || images.length);
  const hasMore = !showAll && previewCount > 0 && images.length > previewCount;

  if (images.length === 0) return null;

  // ── SHOWCASE mode: 2-up pairs, all uniform cards ──────────────────────────
  const renderShowcase = () => {
    const items: React.ReactNode[] = [];
    let i = 0;

    while (i < visible.length) {
      if (i + 1 < visible.length) {
        items.push(
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            <ScreenCard img={visible[i]} index={i} accentColor={accentColor} onClick={() => setLightboxIndex(i)} />
            <ScreenCard img={visible[i + 1]} index={i + 1} accentColor={accentColor} onClick={() => setLightboxIndex(i + 1)} />
          </div>
        );
        i += 2;
      } else {
        items.push(
          <ScreenCard key={i} img={visible[i]} index={i} accentColor={accentColor} onClick={() => setLightboxIndex(i)} />
        );
        i++;
      }
    }

    return <div className="space-y-4 md:space-y-5">{items}</div>;
  };

  // ── GRID mode ──────────────────────────────────────────────────────────────
  const renderGrid = () => {
    if (layout === "masonry") {
      return (
        <div className="masonry-grid">
          {visible.map((img, i) => (
            <div key={i} className="masonry-item">
              <ScreenCard
                img={img}
                index={i}
                accentColor={accentColor}
                onClick={() => setLightboxIndex(i)}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {visible.map((img, i) => (
          <ScreenCard
            key={i}
            img={img}
            index={i}
            accentColor={accentColor}
            onClick={() => setLightboxIndex(i)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            accentColor={accentColor}
          />
        )}
      </AnimatePresence>

      {/* Controls row */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-white/25 text-xs font-body tabular-nums">
            {images.length} screen{images.length !== 1 ? "s" : ""}
          </span>
          {/* Accent dot */}
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-white/25 text-xs font-body capitalize">{layout} layout</span>
        </div>
        <LayoutToggle active={viewMode} onChange={setViewMode} accentColor={accentColor} />
      </div>

      {/* Gallery */}
      {viewMode === "showcase" ? renderShowcase() : renderGrid()}

      {/* Show more */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 flex items-center justify-center"
        >
          <button
            onClick={() => setShowAll(true)}
            className="group flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 hover:border-white/25 text-white/50 hover:text-white text-sm font-body font-medium transition-all"
          >
            <span>Show {images.length - (previewCount || 0)} more screens</span>
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              +
            </span>
          </button>
        </motion.div>
      )}

      {/* Open slideshow */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setLightboxIndex(0)}
          className="inline-flex items-center gap-2 text-xs font-body font-bold tracking-[0.12em] uppercase transition-colors"
          style={{ color: `${accentColor}70` }}
          onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = `${accentColor}70`)}
        >
          <ZoomIn size={12} />
          Open full slideshow
        </button>
      </div>
    </>
  );
}
