"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Project } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";
import PortfolioImage from "./PortfolioImage";
import { useInView } from "react-intersection-observer";

interface Props { project: Project; index?: number; }

function useLiveThumbnail(slug: string, fallback: string): string {
  const [thumb, setThumb] = useState(fallback);
  useEffect(() => {
    const stored = localStorage.getItem("admin_projects");
    if (!stored) return;
    try {
      const all: Project[] = JSON.parse(stored);
      const found = all.find((p) => p.slug === slug);
      if (found?.thumbnail) setThumb(found.thumbnail);
    } catch { /* ignore */ }
  }, [slug]);
  return thumb;
}

export default function ProjectCard({ project, index = 0 }: Props) {
  const thumbnail = useLiveThumbnail(project.slug, project.thumbnail);
  const { ref, inView } = useInView({ threshold: 0.08, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: (index % 4) * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link href={`/work/${project.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden rounded-xl mb-4 border border-white/[0.06] group-hover:border-white/[0.10] transition-colors duration-300">
          <PortfolioImage
            src={thumbnail}
            alt={project.title}
            fit="cover"
            aspect="aspect-[4/3]"
            sizes="(max-width: 768px) 100vw, 50vw"
            accentColor={project.accentColor}
            fallbackText={project.title.split(" ")[0]}
            className="group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="text-[10px] font-body font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm"
              style={{
                backgroundColor: `${project.accentColor}18`,
                color: project.accentColor,
                border: `1px solid ${project.accentColor}25`,
              }}>
              {project.category}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250 z-20">
            <span className="flex items-center gap-1.5 bg-accent text-white font-body font-medium text-sm px-4 py-2 rounded-lg translate-y-1.5 group-hover:translate-y-0 transition-transform duration-250">
              View Case Study <ArrowUpRight size={13} />
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display font-bold text-text-1 text-base leading-tight group-hover:text-accent transition-colors duration-200 truncate">
              {project.title}
            </h3>
            <p className="text-text-2 text-sm font-body mt-1 leading-relaxed line-clamp-2">
              {project.shortDescription}
            </p>
            {(project.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {(project.tags || []).slice(0, 3).map((tag) => (
                  <span key={tag}
                    className="text-[10px] font-body px-2 py-0.5 rounded-md bg-white/[0.04] text-text-3 border border-white/[0.06]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 w-7 h-7 rounded-lg border border-white/[0.08] flex items-center justify-center group-hover:border-accent group-hover:bg-accent transition-all duration-200 mt-0.5">
            <ArrowUpRight size={12} className="text-text-3 group-hover:text-white transition-colors duration-200" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
