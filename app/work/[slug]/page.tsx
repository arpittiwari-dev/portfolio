import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import CaseStudyClient from "./CaseStudyClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = await getAllProjects();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.shortDescription,
    openGraph: {
      title: `${project.title} | Arpit Tiwari`,
      description: project.shortDescription,
      images: project.thumbnail ? [{ url: project.thumbnail, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Arpit Tiwari`,
      description: project.shortDescription,
      images: project.thumbnail ? [project.thumbnail] : [],
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return <CaseStudyClient project={project} />;
}
