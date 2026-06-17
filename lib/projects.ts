import { Project } from "./types";
import { sanityClient } from "./sanity";
import { fromSanityProject } from "./sanityTransform";

export const staticProjects: Project[] = [
  {
    _id: "static-1",
    title: "University ERP Mobile App",
    slug: "university-erp-mobile-app",
    category: "Mobile UI",
    tags: ["Mobile UI", "Figma"],
    shortDescription: "6 modules, 5 user flows, 50+ components — a full ERP experience for students and faculty.",
    accentColor: "#6C63FF",
    thumbnail: "",
    featured: true,
    status: "published",
    role: "UI/UX Designer",
    timeline: "8 weeks",
    client: "",
    tools: ["Figma"],
    prototypeLink: "#",
    overview: "A comprehensive mobile ERP app covering 6 modules and 5 distinct user flows with 50+ reusable components.",
    problem: "Students and faculty lacked a unified mobile interface for campus operations.",
    goal: "Design an intuitive, modular ERP app with clear navigation and consistent components.",
    outcome: "50+ components delivered across 6 modules with full Figma handoff.",
    researchInsights: "",
    keyDecisions: "",
    results: "",
    learnings: "",
    metrics: [],
    images: [],
    galleryLayout: "grid",
    showWireframes: false,
    showResearch: false,
    showPrototype: true,
    order: 1,
    updatedAt: "",
  },
  {
    _id: "static-2",
    title: "AquaLeaf E-commerce Homepage",
    slug: "aqualeaf-ecommerce-homepage",
    category: "E-commerce",
    tags: ["E-commerce", "UI Design"],
    shortDescription: "Wireframe to high-fidelity e-commerce homepage for a plant care brand.",
    accentColor: "#22C55E",
    thumbnail: "",
    featured: true,
    status: "published",
    role: "UI/UX Designer",
    timeline: "2 weeks",
    client: "",
    tools: ["Figma"],
    prototypeLink: "#",
    overview: "Full design process from wireframes to high-fidelity UI for an e-commerce homepage.",
    problem: "The brand needed a conversion-focused homepage that matched their natural aesthetic.",
    goal: "Create a clean, high-fidelity homepage ready for developer handoff.",
    outcome: "Completed high-fidelity Figma file with component library.",
    researchInsights: "",
    keyDecisions: "",
    results: "",
    learnings: "",
    metrics: [],
    images: [],
    galleryLayout: "grid",
    showWireframes: true,
    showResearch: false,
    showPrototype: true,
    order: 2,
    updatedAt: "",
  },
  {
    _id: "static-3",
    title: "Syn SaaS Landing Page",
    slug: "syn-saas-landing-page",
    category: "SaaS",
    tags: ["SaaS", "Landing Page"],
    shortDescription: "A clean, conversion-focused landing page for a B2B SaaS product.",
    accentColor: "#3B82F6",
    thumbnail: "",
    featured: true,
    status: "published",
    role: "UI/UX Designer",
    timeline: "1 week",
    client: "",
    tools: ["Figma"],
    prototypeLink: "#",
    overview: "Designed a modern SaaS landing page focused on clarity, hierarchy, and conversion.",
    problem: "The product needed a landing page that communicated value quickly to B2B buyers.",
    goal: "Ship a clean, structured landing page with strong visual hierarchy.",
    outcome: "Fully designed Figma file with annotated sections.",
    researchInsights: "",
    keyDecisions: "",
    results: "",
    learnings: "",
    metrics: [],
    images: [],
    galleryLayout: "grid",
    showWireframes: false,
    showResearch: false,
    showPrototype: true,
    order: 3,
    updatedAt: "",
  },
  {
    _id: "static-4",
    title: "Air Jordan Product Page UI Concept",
    slug: "air-jordan-product-page",
    category: "Product UI",
    tags: ["Product UI", "E-commerce"],
    shortDescription: "A bold product page concept for the Air Jordan brand — immersive, detail-first.",
    accentColor: "#EF4444",
    thumbnail: "",
    featured: true,
    status: "published",
    role: "UI/UX Designer",
    timeline: "3 days",
    client: "",
    tools: ["Figma"],
    prototypeLink: "#",
    overview: "A conceptual product page redesign for Air Jordan, focusing on visual impact and product detail.",
    problem: "Existing product pages lack the visual drama the brand commands.",
    goal: "Design a bold, high-contrast product page that puts the shoe first.",
    outcome: "High-fidelity concept delivered in Figma.",
    researchInsights: "",
    keyDecisions: "",
    results: "",
    learnings: "",
    metrics: [],
    images: [],
    galleryLayout: "fullwidth",
    showWireframes: false,
    showResearch: false,
    showPrototype: true,
    order: 4,
    updatedAt: "",
  },
  {
    _id: "static-5",
    title: "AI-Thed Landing Page",
    slug: "ai-thed-landing-page",
    category: "Landing Page",
    tags: ["Landing Page", "Dark UI"],
    shortDescription: "Dark-themed landing page for an AI-powered embroidery platform.",
    accentColor: "#A855F7",
    thumbnail: "",
    featured: true,
    status: "published",
    role: "UI/UX Designer",
    timeline: "1 week",
    client: "",
    tools: ["Figma"],
    prototypeLink: "#",
    overview: "Designed a dark, editorial landing page for an AI embroidery platform that bridges tech and craft.",
    problem: "The platform needed a landing page that felt premium, modern, and unlike typical AI product sites.",
    goal: "Create a dark-themed, visually striking landing page with strong brand identity.",
    outcome: "Dark UI system with full landing page Figma file.",
    researchInsights: "",
    keyDecisions: "",
    results: "",
    learnings: "",
    metrics: [],
    images: [],
    galleryLayout: "grid",
    showWireframes: false,
    showResearch: false,
    showPrototype: true,
    order: 5,
    updatedAt: "",
  },
];

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
