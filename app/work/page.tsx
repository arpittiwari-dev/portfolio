"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/lib/types";
import { useInView } from "react-intersection-observer";

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default function WorkPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [active, setActive] = useState("All");

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.ok ? r.json() : [])
      .then((data: Project[]) => setAllProjects(data))
      .catch(() => {});
  }, []);

  // Derive categories from actual projects
  const published = allProjects.filter((p) => p.status === "published");
  const categories = ["All", ...Array.from(new Set(published.map((p) => p.category).filter(Boolean)))];
  const filtered = active === "All" ? published : published.filter((p) => p.category === active);

  return (
    <>
      <section className="pt-24 md:pt-32 pb-10 md:pb-14 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
            <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-4">Selected Work</p>
            <h1 className="font-display font-bold text-text-1 leading-tight mb-4"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}>
              Projects built with<br /><span className="text-text-3">purpose & precision.</span>
            </h1>
            <p className="text-text-2 font-body text-lg max-w-lg leading-relaxed">
              Each project is a deep dive into user problems, design decisions, and measurable outcomes.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-14 md:pb-24 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-10">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActive(cat)}
                  className={`text-sm font-body font-medium px-4 py-1.5 rounded-full border transition-all duration-150 ${
                    active === cat
                      ? "bg-accent text-white border-accent"
                      : "border-white/[0.08] text-text-2 hover:border-white/[0.15] hover:text-text-1"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div key={active}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                {filtered.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
                <p className="text-text-2 font-body">No projects in this category yet.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
