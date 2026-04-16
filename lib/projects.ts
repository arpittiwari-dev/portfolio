import { Project } from "./types";
import { sanityClient } from "./sanity";
import { fromSanityProject } from "./sanityTransform";

// ── Static fallback (used when Sanity is not configured) ─────────────────────
export const staticProjects: Project[] = [
  {
    _id: "1",
    title: "University ERP App",
    tags: ["Mobile", "ERP", "Education"],
    status: "published", client: "", prototypeLink: "",
    galleryLayout: "grid", showWireframes: true, showResearch: true, showPrototype: false,
    seoTitle: "", seoDescription: "", updatedAt: "2024-01-01",
    slug: "university-erp-app", category: "Mobile App",
    shortDescription: "A comprehensive mobile ERP system for university students and faculty — built around clarity, speed, and structured information hierarchy.",
    accentColor: "#7C3AED", thumbnail: "/images/erp-thumb.jpg", featured: true,
    role: "UI/UX Designer", timeline: "8 Weeks", tools: ["Figma", "FigJam", "Maze"],
    overview: "Designed a full-featured university ERP mobile application covering attendance, grades, timetable, fee management, and faculty communication.",
    problem: "The existing university portal was desktop-only, had poor information architecture, and required 6–8 taps to access critical data.",
    goal: "Reduce task completion time by 60%, improve information discoverability, and create a design system that scales across 40+ screens.",
    outcome: "Delivered a complete 40-screen Figma prototype with a custom design system, reducing average task completion from 8 steps to 3.",
    researchInsights: "Conducted 12 user interviews and a survey of 80 students. Key pain points: buried navigation, no push notifications.",
    keyDecisions: "Chose a bottom tab navigation over hamburger menu for faster access. Used card-based layouts for scannable data.",
    results: "87% user satisfaction in usability testing. Task completion time reduced by 62%.",
    learnings: "Information architecture is the foundation. No amount of visual polish fixes broken navigation.",
    metrics: [
      { label: "Screens Designed", value: "40+" },
      { label: "Task Time Reduction", value: "62%" },
      { label: "User Satisfaction", value: "87%" },
      { label: "Design System Components", value: "120+" },
    ],
    images: [
      { url: "/images/erp-1.jpg", alt: "ERP Dashboard", caption: "Main dashboard with quick access modules" },
      { url: "/images/erp-2.jpg", alt: "Attendance Screen", caption: "Attendance tracking with visual indicators" },
    ],
    order: 1,
  },
];

const SANITY_CONFIGURED = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// ── Fetch all projects (server-side) ─────────────────────────────────────────
export async function getAllProjects(): Promise<Project[]> {
  if (!SANITY_CONFIGURED) return staticProjects;
  try {
    const docs = await sanityClient.fetch(`
      *[_type == "project"] | order(order asc) {
        _id, title, "slug": slug.current, status, featured, order,
        category, tags, accentColor, shortDescription,
        "thumbnail": thumbnail.asset->url,
        role, timeline, client, tools, prototypeLink,
        overview, problem, goal, outcome,
        researchInsights, keyDecisions, results, learnings,
        metrics, galleryLayout, showResearch, showWireframes, showPrototype,
        seoTitle, seoDescription, _updatedAt,
        "images": images[]{ "url": image.asset->url, alt, caption }
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
        "thumbnail": thumbnail.asset->url,
        role, timeline, client, tools, prototypeLink,
        overview, problem, goal, outcome,
        researchInsights, keyDecisions, results, learnings,
        metrics, galleryLayout, showResearch, showWireframes, showPrototype,
        seoTitle, seoDescription, _updatedAt,
        "images": images[]{ "url": image.asset->url, alt, caption }
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
