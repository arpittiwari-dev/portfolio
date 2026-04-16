"use client";
import { SiteContent, defaultSiteContent, Review, Skill } from "./types";

const CONTENT_KEY = "site_content";
const REVIEWS_KEY = "site_reviews";
const SKILLS_KEY  = "site_skills";

// ── Site Content ──────────────────────────────────────────────────────────────
export function getSiteContent(): SiteContent {
  if (typeof window === "undefined") return defaultSiteContent;
  try {
    const stored = localStorage.getItem(CONTENT_KEY);
    if (stored) return { ...defaultSiteContent, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultSiteContent;
}

export function saveSiteContent(content: SiteContent): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export const defaultReviews: Review[] = [
  {
    id: "1",
    name: "Rahul Mehta",
    role: "Product Manager",
    company: "TechCorp",
    text: "Arpit delivered an exceptional UI design that exceeded our expectations. The attention to detail and user-centric approach was outstanding.",
    rating: 5,
    featured: true,
    date: "2024-01-15",
  },
  {
    id: "2",
    name: "Priya Sharma",
    role: "Founder",
    company: "StartupXYZ",
    text: "Working with Arpit was a great experience. He understood our brand vision perfectly and translated it into a beautiful, functional design.",
    rating: 5,
    featured: true,
    date: "2024-02-20",
  },
];

export function getReviews(): Review[] {
  if (typeof window === "undefined") return defaultReviews;
  try {
    const stored = localStorage.getItem(REVIEWS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return defaultReviews;
}

export function saveReviews(reviews: Review[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

// ── Skills ────────────────────────────────────────────────────────────────────
export const defaultSkills: Skill[] = [
  { id: "1", name: "Figma",          category: "tools", level: 95, primary: true },
  { id: "2", name: "FigJam",         category: "tools", level: 85, primary: true },
  { id: "3", name: "Maze",           category: "tools", level: 75, primary: false },
  { id: "4", name: "Hotjar",         category: "tools", level: 70, primary: false },
  { id: "5", name: "Notion",         category: "tools", level: 90, primary: false },
  { id: "6", name: "Webflow",        category: "tools", level: 65, primary: false },
  { id: "7", name: "Visual Design",  category: "ui",    level: 90, primary: true },
  { id: "8", name: "Typography",     category: "ui",    level: 88, primary: false },
  { id: "9", name: "User Research",  category: "ux",    level: 80, primary: false },
  { id: "10", name: "Prototyping",   category: "ux",    level: 85, primary: false },
];

export function getSkills(): Skill[] {
  if (typeof window === "undefined") return defaultSkills;
  try {
    const stored = localStorage.getItem(SKILLS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return defaultSkills;
}

export function saveSkills(skills: Skill[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
}
