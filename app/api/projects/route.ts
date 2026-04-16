import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { toSanityProject, fromSanityProject } from "@/lib/sanityTransform";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { staticProjects } from "@/lib/projects";

const SANITY_CONFIGURED = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

function isAuthed(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  return token === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
}

// GET /api/projects
export async function GET(req: NextRequest) {
  if (!rateLimit(getIp(req), 60)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!SANITY_CONFIGURED) {
    return NextResponse.json(staticProjects);
  }
  try {
    const docs = await sanityClient.fetch(`
      *[_type == "project"] | order(order asc) {
        _id, title, "slug": slug.current, status, featured, order,
        category, tags, accentColor, shortDescription,
        thumbnail,
        role, timeline, client, tools, prototypeLink,
        overview, problem, goal, outcome,
        researchInsights, keyDecisions, results, learnings,
        metrics, galleryLayout, showResearch, showWireframes, showPrototype,
        seoTitle, seoDescription, _updatedAt,
        "images": images[]{
          url, alt, caption
        }
      }
    `);
    return NextResponse.json(docs.map(fromSanityProject));
  } catch (err) {
    console.error(err);
    return NextResponse.json(staticProjects);
  }
}

// POST /api/projects — create a project
export async function POST(req: NextRequest) {
  if (!rateLimit(getIp(req), 10)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const doc = await sanityClient.create(toSanityProject(body));
    return NextResponse.json(fromSanityProject(doc), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
