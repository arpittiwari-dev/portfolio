import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { toSanityProject, fromSanityProject } from "@/lib/sanityTransform";
import { rateLimit, getIp } from "@/lib/rateLimit";

function isAuthed(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  return token === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
}

// PATCH /api/projects/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!rateLimit(getIp(req), 10)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const patch = toSanityProject(body);

    // Check if this is a real Sanity ID or a locally-generated one
    // Sanity IDs contain letters; local ones are pure numeric timestamps
    const isSanityId = /[a-zA-Z]/.test(id);

    let doc;
    if (isSanityId) {
      // Real Sanity document — patch it
      doc = await sanityClient.patch(id).set(patch).commit();
    } else {
      // Locally-generated ID — create a new document in Sanity instead
      doc = await sanityClient.create({ ...patch, _type: "project" });
    }

    return NextResponse.json(fromSanityProject(doc));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!rateLimit(getIp(req), 10)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await sanityClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
