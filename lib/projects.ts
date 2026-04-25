import { Project } from "./types";
import { sanityClient } from "./sanity";
import { fromSanityProject } from "./sanityTransform";

export const staticProjects: Project[] = [];

const SANITY_CONFIGURED = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

const GROQ = `
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
`;

export async function getAllProjects(): Promise<Project[]> {
  if (!SANITY_CONFIGURED) return staticProjects;
  try {
    const docs = await sanityClient.fetch(GROQ);
    return docs.map(fromSanityProject);
  } catch (e) {
    console.error("Sanity fetch failed:", e);
    return staticProjects;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  if (!SANITY_CONFIGURED) return undefined;
  const fields = `
    _id, title, "slug": slug.current, status, featured, order,
    category, tags, accentColor, shortDescription,
    thumbnail,
    role, timeline, client, tools, prototypeLink,
    overview, problem, goal, outcome,
    researchInsights, keyDecisions, results, learnings,
    metrics, galleryLayout, showResearch, showWireframes, showPrototype,
    seoTitle, seoDescription, _updatedAt,
    "images": images[]{ url, alt, caption }
  `;
  try {
    // Primary: exact slug match
    const doc = await sanityClient.fetch(
      `*[_type == "project" && slug.current == $slug][0] { ${fields} }`,
      { slug }
    );
    if (doc) return fromSanityProject(doc);

    // Fallback: case-insensitive match (handles slug casing issues)
    const all = await sanityClient.fetch(
      `*[_type == "project"] { ${fields} }`
    );
    const match = all.find(
      (d: { slug: string }) =>
        (d.slug ?? "").toLowerCase().trim() === slug.toLowerCase().trim()
    );
    return match ? fromSanityProject(match) : undefined;
  } catch (e) {
    console.error("Sanity fetch failed:", e);
    return undefined;
  }
}

export function getFeaturedProjects(): Project[] {
  return [];
}

export const projects = staticProjects;
