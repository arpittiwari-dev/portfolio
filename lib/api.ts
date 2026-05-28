import { Project } from "./types";
import { compressImage, compressImages } from "./imageCompressor";

// ── Auth token (client-side only) ─────────────────────────────────────────────
const adminToken = (): string =>
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "")
    : "";

const authHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
  "x-admin-token": adminToken(),
});

// ── Generic fetch wrapper ─────────────────────────────────────────────────────
async function apiFetch<T>(url: string, options?: RequestInit, retries = 0): Promise<T> {
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        let detail = "";
        try {
          const body = await res.clone().json();
          detail = body.detail ?? body.error ?? "";
        } catch {
          try { detail = await res.clone().text(); } catch { /* ignore */ }
        }
        const msg = detail ? `HTTP ${res.status}: ${detail}` : `HTTP ${res.status} on ${url}`;
        if (res.status >= 400 && res.status < 500) throw new Error(msg);
        lastError = new Error(msg);
        if (attempt < retries) { await sleep(300 * (attempt + 1)); continue; }
        throw lastError;
      }
      return res.json() as Promise<T>;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) { await sleep(300 * (attempt + 1)); continue; }
    }
  }
  throw lastError;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Projects API ──────────────────────────────────────────────────────────────
export async function apiGetProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/api/projects/");
}

export async function apiCreateProject(project: Project): Promise<Project> {
  return apiFetch<Project>("/api/projects/", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(project),
  });
}

export async function apiUpdateProject(project: Project): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${project._id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(project),
  });
}

export async function apiDeleteProject(id: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/api/projects/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

// ── Upload types ──────────────────────────────────────────────────────────────
export interface UploadResult {
  url: string;
  assetId: string;
}

export interface UploadProgress {
  file: File;
  /** The file that will actually be sent (may be compressed) */
  processedFile?: File;
  status: "pending" | "compressing" | "uploading" | "done" | "error";
  result?: UploadResult;
  error?: string;
  /** Compression info for developer logging */
  compressionRatio?: number;
  originalSizeMB?: number;
  finalSizeMB?: number;
}

// ── Validation ────────────────────────────────────────────────────────────────
/** Hard cap — anything above this is rejected even after compression */
const HARD_CAP_MB  = 50;
const HARD_CAP     = HARD_CAP_MB * 1024 * 1024;
const ALLOWED_MIME = [
  "image/jpeg", "image/png", "image/webp",
  "image/gif",  "image/svg+xml", "image/avif",
];

function validateFile(file: File): void {
  if (!file || !(file instanceof File)) throw new Error("Invalid file object");
  if (file.size === 0)                  throw new Error("File is empty");
  if (file.size > HARD_CAP)            throw new Error(`File too large (max ${HARD_CAP_MB} MB, got ${(file.size / 1024 / 1024).toFixed(1)} MB)`);
  if (!ALLOWED_MIME.includes(file.type)) throw new Error(`Unsupported type: ${file.type}`);
}

// ── Strategy A: Direct browser → Sanity (bypasses all serverless body limits) ─
async function uploadDirect(file: File, signal?: AbortSignal): Promise<UploadResult> {
  // 1. Get upload credentials from our server
  const params = new URLSearchParams({ filename: file.name, contentType: file.type });
  let creds: { uploadUrl: string; token: string };

  try {
    const res = await fetch(`/api/upload/?${params}`, {
      headers: { "x-admin-token": adminToken() },
      signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Credential fetch failed: HTTP ${res.status}`);
    }
    creds = await res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw new Error("Upload cancelled");
    throw err;
  }

  // 2. POST file directly to Sanity CDN from the browser
  let sanityRes: Response;
  try {
    sanityRes = await fetch(creds.uploadUrl, {
      method:  "POST",
      headers: { Authorization: `Bearer ${creds.token}` },
      body:    file,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw new Error("Upload cancelled");
    throw new Error(`Network error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = {};
  try { data = await sanityRes.json(); } catch {
    throw new Error(`Sanity upload failed with HTTP ${sanityRes.status}`);
  }

  if (!sanityRes.ok) {
    throw new Error(data?.message ?? data?.error ?? `Sanity upload failed (${sanityRes.status})`);
  }

  const asset = data.document ?? data;
  if (!asset?.url) throw new Error("Sanity response missing asset URL");

  return { url: asset.url, assetId: asset._id };
}

// ── Strategy B: Proxy through our API route (fallback) ───────────────────────
async function uploadProxy(file: File, signal?: AbortSignal): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);

  let res: Response;
  try {
    res = await fetch("/api/upload/", {
      method:  "POST",
      headers: { "x-admin-token": adminToken() },
      body:    form,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw new Error("Upload cancelled");
    throw new Error(`Network error: ${err instanceof Error ? err.message : String(err)}`);
  }

  let body: Record<string, unknown> = {};
  try { body = await res.json(); } catch {
    throw new Error(`Upload failed with HTTP ${res.status} (non-JSON response)`);
  }

  if (!res.ok) throw new Error((body.detail ?? body.error ?? `HTTP ${res.status}`) as string);
  if (typeof body.url !== "string" || !body.url) throw new Error("Upload succeeded but response missing URL");

  return { url: body.url as string, assetId: body.assetId as string };
}

// ── Core upload: compress → direct → proxy fallback ──────────────────────────
/**
 * Upload a single image.
 * Flow: validate → compress (if needed) → direct upload → proxy fallback
 */
export async function apiUploadImage(
  file: File,
  signal?: AbortSignal,
): Promise<UploadResult> {
  // 1. Validate original file (hard cap only — compression handles the rest)
  validateFile(file);

  const t0 = performance.now();

  // 2. Compress
  const compression = await compressImage(file);
  const toUpload    = compression.file;

  if (compression.wasCompressed) {
    console.info(
      `[upload] Compressed "${file.name}": ` +
      `${(compression.originalSize / 1024 / 1024).toFixed(1)} MB → ` +
      `${(compression.compressedSize / 1024 / 1024).toFixed(1)} MB ` +
      `(${(compression.compressionRatio * 100).toFixed(0)}%) ` +
      `in ${compression.durationMs.toFixed(0)}ms`
    );
  }

  // 3. Try direct upload first (no serverless body limit)
  try {
    const result = await uploadDirect(toUpload, signal);
    console.info(`[upload] Done "${file.name}" in ${(performance.now() - t0).toFixed(0)}ms (direct)`);
    return result;
  } catch (directErr) {
    const msg = directErr instanceof Error ? directErr.message : String(directErr);
    if (msg === "Upload cancelled") throw directErr;
    console.warn(`[upload] Direct failed for "${file.name}", trying proxy:`, msg);
  }

  // 4. Proxy fallback
  try {
    const result = await uploadProxy(toUpload, signal);
    console.info(`[upload] Done "${file.name}" in ${(performance.now() - t0).toFixed(0)}ms (proxy)`);
    return result;
  } catch (proxyErr) {
    const proxyMsg = proxyErr instanceof Error ? proxyErr.message : String(proxyErr);
    throw new Error(`Upload failed for "${file.name}": ${proxyMsg}`);
  }
}

// ── Batch upload with per-file compression + progress ────────────────────────
/**
 * Upload multiple images.
 * Compresses all files first (concurrently), then uploads with per-file
 * error isolation — one failure never blocks the others.
 */
export async function apiUploadImages(
  files: File[],
  onProgress?: (results: UploadProgress[]) => void,
  signal?: AbortSignal,
): Promise<UploadProgress[]> {
  const results: UploadProgress[] = files.map((file) => ({
    file,
    status: "pending",
    originalSizeMB: parseFloat((file.size / 1024 / 1024).toFixed(2)),
  }));

  const notify = () => onProgress?.([...results]);
  notify();

  // Phase 1: compress all files concurrently
  results.forEach((r, i) => { results[i].status = "compressing"; });
  notify();

  const compressions = await compressImages(files);

  compressions.forEach((c, i) => {
    results[i].processedFile    = c.file;
    results[i].compressionRatio = c.compressionRatio;
    results[i].finalSizeMB      = parseFloat((c.compressedSize / 1024 / 1024).toFixed(2));
  });

  // Phase 2: upload all (concurrently, with per-file isolation)
  await Promise.all(
    compressions.map(async (compression, i) => {
      results[i].status = "uploading";
      notify();

      try {
        // Validate the compressed file (catches edge cases like SVG > 50 MB)
        validateFile(compression.file);

        const result = await uploadDirect(compression.file, signal)
          .catch(async (directErr) => {
            const msg = directErr instanceof Error ? directErr.message : String(directErr);
            if (msg === "Upload cancelled") throw directErr;
            console.warn(`[batch] Direct failed for "${files[i].name}", trying proxy:`, msg);
            return uploadProxy(compression.file, signal);
          });

        results[i].status = "done";
        results[i].result = result;
      } catch (err) {
        results[i].status = "error";
        results[i].error  = err instanceof Error ? err.message : String(err);
        console.error(`[batch] "${files[i].name}" failed:`, results[i].error);
      }

      notify();
    }),
  );

  // Summary log
  const done   = results.filter((r) => r.status === "done").length;
  const failed = results.filter((r) => r.status === "error").length;
  console.info(`[batch] Complete: ${done} uploaded, ${failed} failed`);

  return results;
}
