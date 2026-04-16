"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ZoomIn } from "lucide-react";
import { isIdbKey, getImage } from "@/lib/imageStore";

export type ImageFit = "cover" | "contain";

interface PortfolioImageProps {
  src: string;
  alt: string;
  fit?: ImageFit;
  aspect?: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  priority?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  accentColor?: string;
  fallbackText?: string;
}

/** Resolves an idb: key to a data URL, or passes through normal URLs */
function useResolvedSrc(src: string): string {
  const [resolved, setResolved] = useState(() => (isIdbKey(src) ? "" : src));
  useEffect(() => {
    if (!src) { setResolved(""); return; }
    if (!isIdbKey(src)) { setResolved(src); return; }
    getImage(src).then((v) => setResolved(v ?? ""));
  }, [src]);
  return resolved;
}
export default function PortfolioImage({
  src,
  alt,
  fit = "cover",
  aspect = "aspect-[4/3]",
  width,
  height,
  className = "",
  containerClassName = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  hoverable = false,
  onClick,
  accentColor = "#C8FA64",
  fallbackText,
}: PortfolioImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const resolvedSrc = useResolvedSrc(src);
  const isUnoptimized = !resolvedSrc || resolvedSrc.startsWith("data:") || resolvedSrc.startsWith("/");
  const showImage = !!resolvedSrc && !error;

  // ── CONTAIN mode: natural dimensions, no cropping ──────────────────────────
  if (fit === "contain") {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden ${containerClassName}`}
        onClick={onClick}
        style={{ cursor: onClick ? "zoom-in" : undefined }}
      >
        {showImage ? (
          <Image
            src={resolvedSrc}
            alt={alt}
            width={width || 1200}
            height={height || 900}
            className={`w-full h-auto object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
            sizes={sizes}
            priority={priority}
            unoptimized={isUnoptimized}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        ) : (
          <ImagePlaceholder accentColor={accentColor} fallbackText={fallbackText} />
        )}
        {/* Blur-up shimmer while loading */}
        {!loaded && showImage && (
          <div className="absolute inset-0 img-shimmer" />
        )}
      </div>
    );
  }

  // ── COVER mode: fills container, crops to fit ──────────────────────────────
  // Special case: aspect-auto in cover mode = use contain behavior (natural height)
  if (fit === "cover" && aspect === "aspect-auto" && !containerClassName.includes("h-full")) {
    return (
      <div
        className={`relative overflow-hidden ${containerClassName} ${hoverable || onClick ? "cursor-zoom-in" : ""}`}
        onClick={onClick}
      >
        {showImage ? (
          <>
            <Image
              src={resolvedSrc}
              alt={alt}
              width={width || 1200}
              height={height || 900}
              className={`w-full h-auto object-cover transition-all duration-500
                ${loaded ? "opacity-100" : "opacity-0"}
                ${hoverable ? "group-hover:scale-[1.04]" : ""}
                ${className}`}
              sizes={sizes}
              priority={priority}
              unoptimized={isUnoptimized}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
            {!loaded && <div className="absolute inset-0 img-shimmer" />}
            {hoverable && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <ZoomIn size={13} className="text-white" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="aspect-[4/3]"><ImagePlaceholder accentColor={accentColor} fallbackText={fallbackText} /></div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${aspect === "aspect-auto" ? "w-full h-full" : aspect} ${containerClassName} ${hoverable || onClick ? "cursor-zoom-in" : ""}`}
      onClick={onClick}
    >
      {showImage ? (
        <>
          <Image
            src={resolvedSrc}
            alt={alt}
            fill
            className={`object-cover object-center transition-all duration-500
              ${loaded ? "opacity-100" : "opacity-0"}
              ${hoverable ? "group-hover:scale-[1.04]" : ""}
              ${className}`}
            sizes={sizes}
            priority={priority}
            unoptimized={isUnoptimized}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
          {/* Shimmer while loading */}
          {!loaded && <div className="absolute inset-0 img-shimmer" />}
          {/* Hover zoom indicator */}
          {hoverable && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <ZoomIn size={13} className="text-white" />
              </div>
            </div>
          )}
        </>
      ) : (
        <ImagePlaceholder accentColor={accentColor} fallbackText={fallbackText} />
      )}
    </div>
  );
}

// ── Placeholder ───────────────────────────────────────────────────────────────
function ImagePlaceholder({ accentColor, fallbackText }: { accentColor?: string; fallbackText?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center"
      style={{ background: `radial-gradient(ellipse at 40% 40%, ${accentColor}18 0%, transparent 70%)` }}>
      {fallbackText && (
        <span className="font-display font-bold select-none pointer-events-none"
          style={{ fontSize: "clamp(2rem, 8vw, 5rem)", color: accentColor, opacity: 0.08 }}>
          {fallbackText}
        </span>
      )}
    </div>
  );
}
