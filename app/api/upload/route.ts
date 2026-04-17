import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { rateLimit, getIp } from "@/lib/rateLimit";

function isAuthed(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  return token === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!rateLimit(getIp(req), 10)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await sanityClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json({ url: asset.url, assetId: asset._id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[upload] Sanity asset upload failed:", message);
    return NextResponse.json({ error: "Upload failed", detail: message }, { status: 500 });
  }
}
