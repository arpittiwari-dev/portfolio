import { Project } from "./types";
import { sanityClient } from "./sanity";
import { fromSanityProject } from "./sanityTransform";

// ── Static fallback (used when Sanity is not configured) ─────────────────────
export const staticProjects: Project[] = [];

const SANITY_CONFIGURED = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// ── Fetch all projects (server-side) ─────────────────────────────────────────
export async function getAllProjects(): Promise<Project[]> {
  if (!SANITY_CONFIGURED) return staticProjects;
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
        "images": images[]{ url, alt, caption }
      }
    `);
    return docs.map(fromSanityProject);
  } catch (e) {
    console.error("Sanity fetch failed, using static data:", e);
    return staticProjects;
  }
}

// ── Fetch a single project by slug ───────────────────────────────────────────
export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  if (!SANITY_CONFIGURED) return staticProjects.find((p) => p.slug === slug);
  try {
    const doc = await sanityClient.fetch(`
      *[_type == "project" && slug.current == $slug][0] {
        _id, title, "slug": slug.current, status, featured, order,
        category, tags, accentColor, shortDescription,
        thumbnail,
        role, timeline, client, tools, prototypeLink,
        overview, problem, goal, outcome,
        researchInsights, keyDecisions, results, learnings,
        metrics, galleryLayout, showResearch, showWireframes, showPrototype,
        seoTitle, seoDescription, _updatedAt,
        "images": images[]{ url, alt, caption }
      }
    `, { slug });
    return doc ? fromSanityProject(doc) : undefined;
  } catch (e) {
    console.error("Sanity fetch failed:", e);
    return staticProjects.find((p) => p.slug === slug);
  }
}

// ── Sync helpers (kept for backward compat) ───────────────────────────────────
export const projects = staticProjects;

export function getFeaturedProjects(): Project[] {
  return staticProjects.filter((p) => p.featured && p.status === "published")
    .sort((a, b) => a.order - b.order);
}
