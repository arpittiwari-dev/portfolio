/**
 * lib/imageCompressor.ts
 *
 * Browser-based image compression using the Canvas API.
 * Zero dependencies. Works in all modern browsers.
 *
 * Strategy:
 *  - SVG / GIF: pass through unchanged (can't meaningfully compress)
 *  - Small files (< COMPRESS_THRESHOLD): pass through unchanged
 *  - Large files: decode → resize if oversized → re-encode as JPEG/WebP
 *
 * Quality targets keep images visually indistinguishable from originals
 * at typical portfolio display sizes (1x–2x retina).
 */

// ── Tuneable constants ────────────────────────────────────────────────────────

/** Files below this size are uploaded as-is (no compression needed) */
const COMPRESS_THRESHOLD = 2 * 1024 * 1024; // 2 MB

/** Maximum dimension (width or height) after resize */
const MAX_DIMENSION = 3840; // 4K — enough for any display

/** JPEG quality for photos / complex images */
const JPEG_QUALITY = 0.88;

/** WebP quality (slightly higher — better codec) */
const WEBP_QUALITY = 0.90;

/** Absolute hard cap sent to Sanity — anything above this is always compressed */
const HARD_CAP = 20 * 1024 * 1024; // 20 MB

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // 0–1, lower = more compressed
  wasCompressed: boolean;
  originalDimensions?: { width: number; height: number };
  finalDimensions?: { width: number; height: number };
  durationMs: number;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compress an image file if it exceeds the threshold.
 * Always resolves — never throws. On failure returns the original file.
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const start = performance.now();
  const originalSize = file.size;

  // Pass-through: SVG and GIF can't be canvas-compressed
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return passThrough(file, start);
  }

  // Pass-through: small files don't need compression
  if (file.size < COMPRESS_THRESHOLD) {
    return passThrough(file, start);
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width: origW, height: origH } = bitmap;

    // Calculate target dimensions
    const { width, height } = scaleDimensions(origW, origH, MAX_DIMENSION);

    // Draw onto canvas
    const canvas = document.createElement("canvas");
    canvas.width  = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return passThrough(file, start);
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    // Choose output format: prefer WebP, fall back to JPEG
    const outputType = supportsWebP() ? "image/webp" : "image/jpeg";
    const quality    = outputType === "image/webp" ? WEBP_QUALITY : JPEG_QUALITY;

    const blob = await canvasToBlob(canvas, outputType, quality);

    // Only use compressed version if it's actually smaller
    // (sometimes PNG→JPEG is larger for simple graphics)
    if (blob.size >= file.size && file.size <= HARD_CAP) {
      return passThrough(file, start, { width: origW, height: origH });
    }

    const ext      = outputType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const compressed = new File([blob], `${baseName}.${ext}`, {
      type:         outputType,
      lastModified: Date.now(),
    });

    const ratio = compressed.size / originalSize;

    console.info(
      `[compress] ${file.name}` +
      ` | ${fmt(originalSize)} → ${fmt(compressed.size)}` +
      ` | ${(ratio * 100).toFixed(0)}% of original` +
      ` | ${origW}×${origH} → ${width}×${height}` +
      ` | ${(performance.now() - start).toFixed(0)}ms`
    );

    return {
      file:              compressed,
      originalSize,
      compressedSize:    compressed.size,
      compressionRatio:  ratio,
      wasCompressed:     true,
      originalDimensions: { width: origW, height: origH },
      finalDimensions:    { width, height },
      durationMs:        performance.now() - start,
    };

  } catch (err) {
    // Never crash the upload — fall back to original
    console.warn("[compress] Compression failed, using original:", err);
    return passThrough(file, start);
  }
}

/**
 * Compress multiple files concurrently (max 3 at a time to avoid OOM).
 */
export async function compressImages(files: File[]): Promise<CompressionResult[]> {
  const CONCURRENCY = 3;
  const results: CompressionResult[] = new Array(files.length);

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(compressImage));
    batchResults.forEach((r, j) => { results[i + j] = r; });
  }

  return results;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function passThrough(
  file: File,
  start: number,
  dims?: { width: number; height: number },
): CompressionResult {
  return {
    file,
    originalSize:      file.size,
    compressedSize:    file.size,
    compressionRatio:  1,
    wasCompressed:     false,
    originalDimensions: dims,
    finalDimensions:    dims,
    durationMs:        performance.now() - start,
  };
}

function scaleDimensions(
  w: number,
  h: number,
  max: number,
): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = Math.min(max / w, max / h);
  return {
    width:  Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("canvas.toBlob returned null"));
      },
      type,
      quality,
    );
  });
}

let _webpSupport: boolean | null = null;
function supportsWebP(): boolean {
  if (_webpSupport !== null) return _webpSupport;
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    _webpSupport = c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    _webpSupport = false;
  }
  return _webpSupport;
}

function fmt(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}
