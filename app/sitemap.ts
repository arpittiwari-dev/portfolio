import { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://arpittiwari.design";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,               lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/work`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE_URL}/about`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`,  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.7 },
  ];

  const allProjects = await getAllProjects();
  const projectRoutes: MetadataRoute.Sitemap = allProjects
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${BASE_URL}/work/${p.slug}`,
      lastModified: new Date(p.updatedAt || Date.now()),
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [...staticRoutes, ...projectRoutes];
}
