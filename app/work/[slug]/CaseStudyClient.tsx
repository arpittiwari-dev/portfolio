"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, ChevronUp } from "lucide-react";
import { Project } from "@/lib/types";
import ImageGallery from "@/components/ImageGallery";
import PortfolioImage from "@/components/PortfolioImage";
import { useInView } from "react-intersection-observer";

interface Props { project: Project; }

function useLiveProject(slug: string, fallback: Project): { project: Project; allProjects: Project[] } {
  const [project, setProject] = useState<Project>(fallback);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  useEffect(() => {
    fetch(`/api/projects/`)
      .then((r) => r.ok ? r.json() : [])
      .then((all: Project[]) => {
        setAllProjects(all);
        const found = all.find((p) => p.slug === slug);
        if (found) setProject({ ...fallback, ...found });
      })
      .catch(() => {});
  }, [slug, fallback]);
  return { project, allProjects };
}

function ScrollProgress({ accentColor }: { accentColor: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
      style={{ scaleX, backgroundColor: accentColor }} />
  );
}

function Reveal({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function Label({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-body font-bold tracking-[0.18em] uppercase mb-3 block"
      style={{ color }}>
      <span className="w-4 h-px inline-block" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

function Divider() {
  return <div className="w-full h-px bg-white/[0.06]" />;
}

// Shared section padding — tight on mobile, comfortable on desktop
const S = "py-12 md:py-20 px-5 md:px-8 lg:px-12";
const SW = "max-w-6xl mx-auto";

export default function CaseStudyClient({ project: fallback }: Props) {
  const { project, allProjects } = useLiveProject(fallback.slug, fallback);
  const [backVisible, setBackVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const published = allProjects.filter((p) => p.status === "published");
  const currentIndex = published.findIndex((p) => p.slug === project.slug);
  const prevProject = currentIndex > 0 ? published[currentIndex - 1] : null;
  const nextProject = currentIndex < published.length - 1 ? published[currentIndex + 1] : null;

  const images = project.images || [];
  const hasImages = images.length > 0;
  const ac = project.accentColor || "#6C63FF";

  useEffect(() => {
    const onScroll = () => setBackVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <ScrollProgress accentColor={ac} />

      {/* HERO */}
      <section ref={heroRef} className="pt-20 md:pt-28 pb-10 md:pb-14 px-5 md:px-8 lg:px-12">
        <div className={SW}>
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }} className="mb-8">
            <Link href="/work"
              className="inline-flex items-center gap-2 text-text-2 hover:text-text-1 text-sm font-body transition-colors group">
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              All Projects
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }} className="mb-4">
            <span className="inline-flex items-center text-xs font-body font-bold tracking-widest uppercase px-3 py-1 rounded-lg border"
              style={{ color: ac, borderColor: `${ac}35`, backgroundColor: `${ac}0e` }}>
              {project.category}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold text-text-1 leading-[1.02] tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}>
            {project.title}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-text-2 font-body text-base md:text-lg max-w-2xl leading-relaxed mb-8">
            {project.shortDescription}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.46 }}
            className="flex flex-wrap gap-x-6 gap-y-3 pt-5 border-t border-white/[0.06]">
            {[
              { label: "Role",     value: project.role },
              { label: "Timeline", value: project.timeline },
              ...(project.client ? [{ label: "Client", value: project.client }] : []),
              { label: "Tools",    value: (project.tools || []).join(", ") },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] font-body font-bold tracking-[0.15em] uppercase mb-0.5" style={{ color: ac }}>
                  {item.label}
                </p>
                <p className="text-text-1 font-body font-medium text-sm">{item.value}</p>
              </div>
            ))}
            {project.prototypeLink && project.showPrototype && (
              <div>
                <p className="text-[10px] font-body font-bold tracking-[0.15em] uppercase mb-0.5" style={{ color: ac }}>Prototype</p>
                <a href={project.prototypeLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-text-1 font-body font-medium text-sm hover:text-accent transition-colors">
                  View <ExternalLink size={11} />
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className={S}>
        <div className={SW}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-4">
              <Reveal>
                <Label color={ac}>Overview</Label>
                <h2 className="font-display font-bold text-text-1 leading-tight"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>The full picture.</h2>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <Reveal delay={0.1}>
                <p className="text-text-2 font-body text-base md:text-lg leading-relaxed">{project.overview}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* PROBLEM / GOAL / OUTCOME */}
      <section className={S}>
        <div className={SW}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-12">
            {[
              { label: "Problem", text: project.problem, n: "01" },
              { label: "Goal",    text: project.goal,    n: "02" },
              { label: "Outcome", text: project.outcome, n: "03" },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 0.1}>
                <div className="relative">
                  <span className="font-display font-bold text-[4rem] leading-none select-none pointer-events-none absolute -top-3 -left-1 opacity-[0.04] text-white">
                    {item.n}
                  </span>
                  <Label color={ac}>{item.label}</Label>
                  <p className="text-text-2 font-body text-sm md:text-base leading-relaxed">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COVER IMAGE */}
      {project.thumbnail && (
        <Reveal>
          <div className="w-full overflow-hidden" style={{ borderTop: `1px solid ${ac}15`, borderBottom: `1px solid ${ac}15` }}>
            <PortfolioImage src={project.thumbnail} alt={`${project.title} — full view`}
              fit="cover" aspect="aspect-[16/9] md:aspect-[21/9]" sizes="100vw"
              accentColor={ac} fallbackText={project.title.split(" ")[0]} containerClassName="w-full" />
          </div>
        </Reveal>
      )}

      {/* DESIGN GALLERY */}
      {hasImages && (
        <section className={`${S} relative overflow-hidden`}>
          <div className={SW}>
            <Reveal className="mb-8">
              <Label color={ac}>UI Design</Label>
              <h2 className="font-display font-bold text-text-1 leading-tight"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 3rem)" }}>High-fidelity screens.</h2>
            </Reveal>
            <ImageGallery images={images} layout={project.galleryLayout || "grid"} accentColor={ac} previewCount={0} />
          </div>
        </section>
      )}

      <Divider />

      {/* RESEARCH */}
      {project.showResearch && project.researchInsights && (
        <>
          <section className={S}>
            <div className={SW}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                <div className="lg:col-span-4">
                  <Reveal>
                    <Label color={ac}>Research</Label>
                    <h2 className="font-display font-bold text-text-1 leading-tight"
                      style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>What the data said.</h2>
                  </Reveal>
                </div>
                <div className="lg:col-span-8">
                  <Reveal delay={0.1}>
                    <p className="text-text-2 font-body text-base md:text-lg leading-relaxed">{project.researchInsights}</p>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>
          <Divider />
        </>
      )}

      {/* KEY DECISION QUOTE */}
      {project.keyDecisions && (
        <>
          <section className={`${S} relative overflow-hidden`}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 50% 50%, ${ac}08 0%, transparent 70%)` }} />
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <Reveal>
                <span className="font-display text-[4rem] md:text-[6rem] leading-none select-none opacity-[0.06] text-white block">
                  &ldquo;
                </span>
                <blockquote className="font-display font-bold text-text-1 leading-snug -mt-6"
                  style={{ fontSize: "clamp(1.3rem, 3vw, 2.25rem)" }}>
                  {project.keyDecisions}
                </blockquote>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="h-px w-10" style={{ backgroundColor: ac }} />
                  <span className="text-xs font-body font-bold tracking-widest uppercase" style={{ color: ac }}>Key Decision</span>
                  <div className="h-px w-10" style={{ backgroundColor: ac }} />
                </div>
              </Reveal>
            </div>
          </section>
          <Divider />
        </>
      )}

      {/* METRICS */}
      {(project.metrics || []).length > 0 && (
        <>
          <section className={S}>
            <div className={SW}>
              <Reveal className="mb-8 md:mb-12">
                <Label color={ac}>Results & Impact</Label>
                <h2 className="font-display font-bold text-text-1 leading-tight"
                  style={{ fontSize: "clamp(1.5rem, 3.5vw, 3rem)" }}>Numbers that matter.</h2>
              </Reveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {(project.metrics || []).map((m, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    <div className="group relative p-4 md:p-6 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-colors bg-white/[0.02]">
                      <div className="font-display font-bold mb-1 leading-none"
                        style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: ac }}>
                        {m.value}
                      </div>
                      <div className="text-text-2 text-xs md:text-sm font-body leading-snug">{m.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
          <Divider />
        </>
      )}

      {/* RESULTS + LEARNINGS */}
      {(project.results || project.learnings) && (
        <section className={S}>
          <div className={SW}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
              {project.results && (
                <Reveal>
                  <Label color={ac}>Results</Label>
                  <p className="text-text-2 font-body text-base md:text-lg leading-relaxed">{project.results}</p>
                </Reveal>
              )}
              {project.learnings && (
                <Reveal delay={0.1}>
                  <Label color={ac}>Learnings</Label>
                  <p className="text-text-2 font-body text-base md:text-lg leading-relaxed">{project.learnings}</p>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAGS */}
      {(project.tags || []).length > 0 && (
        <>
          <Divider />
          <section className="py-8 px-5 md:px-8 lg:px-12">
            <div className={`${SW} flex flex-wrap gap-2`}>
              {(project.tags || []).map((tag) => (
                <span key={tag}
                  className="text-xs font-body font-medium px-3 py-1.5 rounded-full border border-white/[0.08] text-text-3 hover:text-text-2 hover:border-white/[0.14] transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      {/* NEXT / PREV */}
      <Divider />
      <section className="py-10 md:py-14 px-5 md:px-8 lg:px-12">
        <div className={`${SW} flex flex-col sm:flex-row items-stretch justify-between gap-3`}>
          {prevProject ? (
            <Link href={`/work/${prevProject.slug}`}
              className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02] transition-all flex-1">
              <div className="w-9 h-9 rounded-full border border-white/[0.08] flex items-center justify-center group-hover:border-white/25 transition-colors flex-shrink-0">
                <ArrowLeft size={14} className="text-text-3 group-hover:text-text-1 transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-text-3 text-xs font-body mb-0.5">Previous</p>
                <p className="font-display font-bold text-text-1 text-sm truncate group-hover:text-accent transition-colors">{prevProject.title}</p>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {nextProject ? (
            <Link href={`/work/${nextProject.slug}`}
              className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02] transition-all flex-1 justify-end text-right">
              <div className="min-w-0">
                <p className="text-text-3 text-xs font-body mb-0.5">Next</p>
                <p className="font-display font-bold text-text-1 text-sm truncate group-hover:text-accent transition-colors">{nextProject.title}</p>
              </div>
              <div className="w-9 h-9 rounded-full border border-white/[0.08] flex items-center justify-center group-hover:border-white/25 transition-colors flex-shrink-0">
                <ArrowRight size={14} className="text-text-3 group-hover:text-text-1 transition-colors" />
              </div>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </section>

      {/* BACK TO TOP */}
      <AnimatePresence>
        {backVisible && (
          <motion.button
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full border border-white/[0.1] bg-background/80 backdrop-blur-sm flex items-center justify-center hover:border-white/25 transition-all"
            aria-label="Back to top">
            <ChevronUp size={15} className="text-text-2" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
