"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import SkillsMarquee from "@/components/SkillsMarquee";
import CountUp from "@/components/CountUp";
import Button from "@/components/Button";
import { useInView } from "react-intersection-observer";
import { getSiteContent } from "@/lib/siteContent";
import { defaultSiteContent, SiteContent, Project } from "@/lib/types";
import { useTheme } from "@/lib/ThemeContext";

function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.2, triggerOnce: true });
  const { config } = useTheme();
  const { sections, animations } = config;

  // Animation duration respects the speed multiplier from Design Studio
  const dur = (base: number) => base * animations.speed;

  useEffect(() => {
    setContent(getSiteContent());
    fetch("/api/projects/")
      .then((r) => r.json())
      .then((data: Project[]) => {
        const featured = data
          .filter((p) => p.featured && p.status === "published")
          .sort((a, b) => a.order - b.order);
        setProjects(featured);
      })
      .catch(() => {});
  }, []);

  const headlineLines = content.heroHeadline.split("\n");

  return (
    <>
      {/* HERO */}
      <section className="px-5 md:px-8 pt-24 pb-14 md:pt-32 md:pb-20 max-w-6xl mx-auto w-full">
        <div className="max-w-3xl">
          {/* Hero gradient overlay (from Design Studio) */}
          {config.effects.heroGradient && (
            <div className="hero-gradient-overlay" aria-hidden="true" />
          )}

          {sections.showHeroAvailability && content.heroAvailability && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur(0.4), delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-10 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.03]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent glow-pulse" />
              <span className="text-text-2 text-xs font-body">{content.heroAvailabilityText}</span>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur(0.8), delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold text-text-1 leading-[1.02] tracking-tight mb-6"
            style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
          >
            {headlineLines.map((line, i) => (
              <span key={i} className={
                i === 1 ? "text-accent block" :
                i === 2 ? "text-text-3 block" : "block"
              }>{line}</span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur(0.6), delay: 0.32 }}
            className="text-text-2 font-body text-lg max-w-md leading-relaxed mb-9"
          >
            {content.heroSubtext}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur(0.5), delay: 0.46 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button href="/work" size="lg">View Work <ArrowUpRight size={14} /></Button>
            <Button href="/about" variant="ghost" size="lg">About Me</Button>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      {sections.showStats && (
        <section ref={statsRef} className="border-y border-white/[0.06] py-10 md:py-14 px-5 md:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {content.stats.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: dur(0.5), delay: i * 0.07 * animations.speed }}
              >
                <div className="font-display font-bold text-text-1 mb-0.5"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}>
                  {statsInView ? <CountUp end={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
                </div>
                <div className="text-text-3 text-sm font-body">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* SELECTED WORK */}
      {sections.showSelectedWork && (
        <section className="py-14 md:py-24 px-5 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8 md:mb-12 gap-4">
              <Reveal>
                <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-3">Selected Work</p>
                <h2 className="font-display font-bold text-text-1 leading-tight"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}>
                  Projects that<br /><span className="text-text-3">made an impact.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1} className="hidden md:block flex-shrink-0">
                <Button href="/work" variant="ghost">All Projects <ArrowUpRight size={13} /></Button>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {projects.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}
            </div>
            <Reveal className="mt-6 md:hidden">
              <Button href="/work" variant="ghost" className="w-full justify-center">All Projects <ArrowUpRight size={13} /></Button>
            </Reveal>
          </div>
        </section>
      )}

      {/* SKILLS */}
      {sections.showSkills && (
        <section className="py-12 md:py-20 overflow-hidden border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-5 md:px-8 mb-8 md:mb-10">
            <Reveal>
              <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-3">Skills & Tools</p>
              <h2 className="font-display font-bold text-text-1" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}>
                What I bring to the table.
              </h2>
            </Reveal>
          </div>
          <SkillsMarquee />
        </section>
      )}

      {/* ABOUT PREVIEW */}
      {sections.showAboutPreview && (
        <section className="py-14 md:py-24 px-5 md:px-8 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
            <Reveal>
              <div className="rounded-2xl border border-white/[0.07] bg-surface aspect-[4/5] max-w-sm flex flex-col items-center justify-center gap-5 p-8">
                <div className="w-16 h-16 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="font-display font-bold text-xl text-accent">
                    {content.aboutName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-text-1 text-lg">{content.aboutName}</p>
                  <p className="text-text-2 text-sm font-body mt-1">{content.aboutRole} · {content.aboutLocation.split(",")[0]}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(content.aboutTags || []).map((t) => (
                    <span key={t} className="text-xs font-body px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-text-2">{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
            <div className="space-y-5">
              <Reveal>
                <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-3">About Me</p>
                <h2 className="font-display font-bold text-text-1 leading-tight" style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)" }}>
                  Design is how it works,<br /><span className="text-text-3">not just looks.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}><p className="text-text-2 font-body text-lg leading-relaxed">{content.aboutBio}</p></Reveal>
              <Reveal delay={0.16}><p className="text-text-3 font-body text-base leading-relaxed">{content.aboutBio3}</p></Reveal>
              <Reveal delay={0.22}><Button href="/about">More About Me <ArrowUpRight size={14} /></Button></Reveal>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {sections.showCTA && (
        <section className="py-14 md:py-24 px-5 md:px-8 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="rounded-2xl border border-white/[0.07] bg-surface px-6 md:px-16 py-12 md:py-20 text-center">
                <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-4">Let&apos;s Collaborate</p>
                <h2 className="font-display font-bold text-text-1 mb-4 leading-tight" style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)" }}>
                  Have a project in mind?
                </h2>
                <p className="text-text-2 font-body text-lg max-w-sm mx-auto mb-8 leading-relaxed">
                  {content.contactAvailabilityText}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button href="/contact" size="lg">Get In Touch <ArrowUpRight size={14} /></Button>
                  <Button href="/work" variant="ghost" size="lg">View My Work</Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
