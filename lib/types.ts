export type ProjectStatus = "draft" | "published";
export type GalleryLayout = "grid" | "masonry" | "fullwidth";

export interface Project {
  _id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  shortDescription: string;
  accentColor: string;
  thumbnail: string;
  featured: boolean;
  status: ProjectStatus;
  role: string;
  timeline: string;
  client?: string;
  tools: string[];
  prototypeLink?: string;
  overview: string;
  problem: string;
  goal: string;
  outcome: string;
  researchInsights: string;
  keyDecisions: string;
  results: string;
  learnings: string;
  metrics: Metric[];
  images: ProjectImage[];
  galleryLayout: GalleryLayout;
  showWireframes: boolean;
  showResearch: boolean;
  showPrototype: boolean;
  seoTitle?: string;
  seoDescription?: string;
  order: number;
  updatedAt: string;
}

export interface Metric {
  label: string;
  value: string;
}

export interface ProjectImage {
  url: string;
  alt: string;
  caption?: string;
  isCover?: boolean;
}

// ── Skill ─────────────────────────────────────────────────────────────────────
export interface Skill {
  id: string;
  name: string;
  category: "ui" | "ux" | "tools" | "other";
  level: number; // 0–100
  primary: boolean;
}

// ── Review / Testimonial ──────────────────────────────────────────────────────
export interface Review {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  text: string;
  rating: number; // 1–5
  featured: boolean;
  date: string;
}

// ── Site content (about, hero, etc.) ─────────────────────────────────────────
export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description: string;
}

export interface SiteContent {
  // Hero
  heroHeadline: string;
  heroSubtext: string;
  heroAvailability: boolean;
  heroAvailabilityText: string;
  // About
  aboutName: string;
  aboutRole: string;
  aboutLocation: string;
  aboutBio: string;
  aboutBio2: string;
  aboutBio3: string;
  aboutTags: string[];
  // Education
  education: Education[];
  // Stats
  stats: { label: string; value: number; suffix: string }[];
  // Social
  linkedinUrl: string;
  behanceUrl: string;
  dribbbleUrl: string;
  twitterUrl: string;
  // Contact
  contactEmail: string;
  contactAvailabilityText: string;
  // Skills marquee (row 1 & 2)
  skillsRow1: string[];
  skillsRow2: string[];
}

export const defaultSiteContent: SiteContent = {
  heroHeadline: "Designing\ninterfaces\nthat convert.",
  heroSubtext: "I design mobile apps and e-commerce UIs in Figma — clean, conversion-focused, and delivered fast. Based in Surat, available worldwide.",
  heroAvailability: true,
  heroAvailabilityText: "Available for work",
  aboutName: "Arpit Tiwari",
  aboutRole: "UI/UX Designer",
  aboutLocation: "Surat, Gujarat, India",
  aboutBio: "I'm Arpit Tiwari, a UI/UX Designer passionate about creating digital experiences that are both beautiful and functional.",
  aboutBio2: "My approach is rooted in structured thinking — great design starts with understanding the problem deeply before touching Figma.",
  aboutBio3: "I design with empathy, validate with data, and deliver with precision.",
  aboutTags: ["Figma", "Mobile", "E-commerce", "SaaS"],
  education: [
    { id: "1", degree: "MCA — Master of Computer Applications", institution: "Bhagwan Mahavir University, Surat", year: "2025–2027 (In progress)", description: "Deepening technical understanding alongside design expertise." },
    { id: "2", degree: "BCA — Bachelor of Computer Applications", institution: "Gujarat University", year: "2022–2025", description: "Foundation in computer science and software development. Discovered passion for UI/UX during final year projects." },
  ],
  stats: [
    { label: "Projects", value: 5, suffix: "+" },
    { label: "Screens", value: 50, suffix: "+" },
    { label: "Satisfaction", value: 87, suffix: "%" },
    { label: "Components", value: 50, suffix: "+" },
  ],
  linkedinUrl: "https://www.linkedin.com/in/arpittiwari-ui",
  behanceUrl: "",
  dribbbleUrl: "",
  twitterUrl: "",
  contactEmail: "tarpit771@gmail.com",
  contactAvailabilityText: "I take on freelance redesign projects for mobile apps, e-commerce stores, and SaaS products. Typically 1–2 week turnaround.",
  skillsRow1: ["UI Design", "UX Research", "Figma", "Design Systems", "Mobile Apps", "E-commerce", "SaaS", "Prototyping", "User Flows", "Wireframing", "8pt Grid", "Component Architecture", "Usability Testing", "Information Architecture", "Visual Design", "Interaction Design"],
  skillsRow2: ["Conversion Design", "Brand Identity", "Typography", "Color Theory", "Auto Layout", "Variants", "FigJam", "Maze", "Hotjar", "Notion", "Webflow", "Lottie", "After Effects", "Spline", "Accessibility", "Responsive Design"],
};
