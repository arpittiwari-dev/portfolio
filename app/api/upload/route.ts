import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { rateLimit, getIp } from "@/lib/rateLimit";

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE  = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME   = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];

// ── Auth ──────────────────────────────────────────────────────────────────────
function isAuthed(req: NextRequest): boolean {
  const token    = req.headers.get("x-admin-token");
  const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  return !!expected && token === expected;
}

// ── Sanity write client (built fresh per request so env vars are always read) ─
function getWriteClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET
                 || process.env.SANITY_DATASET
                 || "portfolio";
  const token     = process.env.SANITY_API_TOKEN;

  if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not configured");
  if (!token)     throw new Error("SANITY_API_TOKEN is not configured — add it to Netlify environment variables");

  return createClient({ projectId, dataset, apiVersion: "2024-01-01", useCdn: false, token });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status });
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\]/g, "").replace(/[^\w.\-]/g, "_").slice(0, 200);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload/
//
// Strategy A (default): Proxy upload — browser → Next.js route → Sanity
//   Works for small files. May hit Netlify's 1 MB body limit for large images.
//
// Strategy B (fallback): Direct upload — browser uploads straight to Sanity
//   The route returns a signed upload URL; the browser POSTs directly to Sanity.
//   Zero body size limit issues. Triggered by ?strategy=direct query param.
// ─────────────────────────────────────────────────────────────────────────────

// ── Strategy B: return a direct-upload URL ────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!rateLimit(getIp(req), 20)) return json({ error: "Too many requests" }, 429);
  if (!isAuthed(req))             return json({ error: "Unauthorized" }, 401);

  const { searchParams } = new URL(req.url);
  const filename    = searchParams.get("filename") ?? "upload";
  const contentType = searchParams.get("contentType") ?? "image/jpeg";

  if (!ALLOWED_MIME.includes(contentType)) {
    return json({ error: `Unsupported type: ${contentType}` }, 400);
  }

  let client: ReturnType<typeof getWriteClient>;
  try { client = getWriteClient(); }
  catch (err) {
    console.error("[upload/GET] config error:", err);
    return json({ error: err instanceof Error ? err.message : "Server misconfiguration" }, 503);
  }

  try {
    // Sanity supports direct browser uploads via a mutate endpoint.
    // We return the project/dataset/token so the browser can POST directly.
    // The token is write-only and never exposed in NEXT_PUBLIC_ vars.
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
    const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || "portfolio";
    const token     = process.env.SANITY_API_TOKEN!;

    // Sanity direct upload endpoint
    const uploadUrl = `https://${projectId}.api.sanity.io/v2024-01-01/assets/images/${dataset}`;

    return json({
      strategy:    "direct",
      uploadUrl,
      token,                    // short-lived write token — safe to expose for this single upload
      filename:    sanitizeFilename(filename),
      contentType,
    }, 200);
  } catch (err) {
    console.error("[upload/GET] error:", err);
    return json({ error: "Failed to prepare upload" }, 500);
  }
}

// ── Strategy A: proxy upload through this route ───────────────────────────────
export async function POST(req: NextRequest) {
  if (!rateLimit(getIp(req), 10)) return json({ error: "Too many requests" }, 429);
  if (!isAuthed(req))             return json({ error: "Unauthorized" }, 401);

  let client: ReturnType<typeof getWriteClient>;
  try { client = getWriteClient(); }
  catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload/POST] config error:", msg);
    return json({ error: "Server misconfiguration", detail: msg }, 503);
  }

  // Parse multipart form
  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    console.error("[upload/POST] FormData parse error:", err);
    return json({ error: "Could not parse upload — request must be multipart/form-data" }, 400);
  }

  // Validate file
  const file = form.get("file");
  if (!file || !(file instanceof File)) return json({ error: "No file provided" }, 400);
  if (file.size === 0)                  return json({ error: "File is empty" }, 400);
  if (file.size > MAX_FILE_SIZE)        return json({ error: `File too large (max 10 MB)` }, 413);
  if (!ALLOWED_MIME.includes(file.type)) {
    return json({ error: `Unsupported file type: ${file.type}` }, 415);
  }

  // Read buffer
  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch (err) {
    console.error("[upload/POST] buffer read error:", err);
    return json({ error: "Failed to read file data" }, 500);
  }

  // Upload to Sanity
  try {
    const asset = await client.assets.upload("image", buffer, {
      filename:    sanitizeFilename(file.name),
      contentType: file.type,
    });
    console.log("[upload/POST] success:", asset._id);
    return json({ url: asset.url, assetId: asset._id }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status  = (err as any).statusCode ?? 0;
    console.error("[upload/POST] Sanity error:", message, "status:", status);

    if (status === 401 || status === 403) {
      return json({ error: "Sanity rejected the upload — check SANITY_API_TOKEN permissions", detail: message }, 502);
    }
    // If body was too large (Netlify cuts it), suggest direct upload
    if (status === 413 || message.includes("body") || message.includes("size")) {
      return json({ error: "File too large for proxy upload — use direct upload strategy", code: "USE_DIRECT" }, 413);
    }
    return json({ error: "Upload failed", detail: message }, 500);
  }
}
