import { Project } from "./types";

// ── Auth token (client-side only) ─────────────────────────────────────────────
const adminToken = (): string =>
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "")
    : "";

const authHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
  "x-admin-token": adminToken(),
});

// ── Generic fetch wrapper with structured error extraction ────────────────────
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
  status: "pending" | "uploading" | "done" | "error";
  result?: UploadResult;
  error?: string;
}

// ── Client-side validation ────────────────────────────────────────────────────
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];

function validateFile(file: File): void {
  if (!file || !(file instanceof File)) throw new Error("Invalid file object");
  if (file.size === 0)                  throw new Error("File is empty");
  if (file.size > MAX_SIZE)             throw new Error(`File too large (max 10 MB, got ${(file.size / 1024 / 1024).toFixed(1)} MB)`);
  if (!ALLOWED_MIME.includes(file.type)) throw new Error(`Unsupported type: ${file.type}`);
}

// ── Strategy A: Direct browser → Sanity upload (no body size limit) ───────────
// The server issues a signed upload URL; the browser POSTs directly to Sanity CDN.
async function uploadDirect(file: File, signal?: AbortSignal): Promise<UploadResult> {
  // 1. Get upload credentials from API
  const params = new URLSearchParams({
    filename: file.name,
    contentType: file.type,
  });

  let creds: {
    uploadUrl: string;
    token: string;
  };

  try {
    const res = await fetch(`/api/upload/?${params}`, {
      headers: {
        "x-admin-token": adminToken(),
      },
      signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));

      throw new Error(
        body.error || `Credential fetch failed: HTTP ${res.status}`
      );
    }

    creds = await res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Upload cancelled");
    }

    throw err;
  }

  // 2. Validate before upload
  console.log("Uploading file:", {
    name: file.name,
    type: file.type,
    sizeMB: (file.size / 1024 / 1024).toFixed(2),
  });

  // 3. Upload directly to Sanity
  let sanityRes: Response;

  try {
    sanityRes = await fetch(creds.uploadUrl, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${creds.token}`,
      },

      // IMPORTANT:
      // DO NOT manually set Content-Type
      // Browser automatically handles it correctly
      body: file,

      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Upload cancelled");
    }

    throw new Error(
      `Network error: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  // 4. Parse Sanity response safely
  let data: any = {};

  try {
    data = await sanityRes.json();
  } catch {
    throw new Error(
      `Sanity upload failed with HTTP ${sanityRes.status}`
    );
  }

  // 5. Handle Sanity errors
  if (!sanityRes.ok) {
    console.error("Sanity upload error:", data);

    throw new Error(
      data?.message ||
      data?.error ||
      `Sanity upload failed (${sanityRes.status})`
    );
  }

  const asset = data.document || data;

  if (!asset?.url) {
    console.error("Invalid Sanity response:", data);

    throw new Error("Sanity response missing asset URL");
  }

  return {
    url: asset.url,
    assetId: asset._id,
  };
}



// ── Strategy B: Proxy upload through our API route ────────────────────────────
// Fallback when direct upload is unavailable. Subject to Netlify's body size limit.
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

  if (!res.ok) {
    throw new Error((body.detail ?? body.error ?? `HTTP ${res.status}`) as string);
  }

  if (typeof body.url !== "string" || !body.url) {
    throw new Error("Upload succeeded but response missing URL");
  }

  return { url: body.url as string, assetId: body.assetId as string };
}

// ── Public upload function — tries direct first, falls back to proxy ──────────
export async function apiUploadImage(file: File, signal?: AbortSignal): Promise<UploadResult> {
  validateFile(file);

  // Try direct upload first (no body size limit, works on all serverless platforms)
  try {
    return await uploadDirect(file, signal);
  } catch (directErr) {
    const msg = directErr instanceof Error ? directErr.message : String(directErr);
    // Don't fall back on cancellation
    if (msg === "Upload cancelled") throw directErr;

    console.warn("[upload] Direct upload failed, falling back to proxy:", msg);

    // Fall back to proxy upload
    try {
      return await uploadProxy(file, signal);
    } catch (proxyErr) {
      const proxyMsg = proxyErr instanceof Error ? proxyErr.message : String(proxyErr);
      // Throw a combined error so the user knows both strategies failed
      throw new Error(`Upload failed. Direct: ${msg} | Proxy: ${proxyMsg}`);
    }
  }
}

// ── Batch upload with per-file isolation ─────────────────────────────────────
export async function apiUploadImages(
  files: File[],
  onProgress?: (results: UploadProgress[]) => void,
  signal?: AbortSignal,
): Promise<UploadProgress[]> {
  const results: UploadProgress[] = files.map((file) => ({ file, status: "pending" }));
  const notify = () => onProgress?.([...results]);
  notify();

  await Promise.all(
    files.map(async (file, i) => {
      results[i].status = "uploading";
      notify();
      try {
        results[i].result = await apiUploadImage(file, signal);
        results[i].status = "done";
      } catch (err) {
        results[i].status = "error";
        results[i].error  = err instanceof Error ? err.message : String(err);
        console.error(`[upload] "${file.name}" failed:`, results[i].error);
      }
      notify();
    }),
  );

  return results;
}
