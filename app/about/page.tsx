"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { ArrowUpRight } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { getSiteContent, getSkills, defaultSkills } from "@/lib/siteContent";
import { defaultSiteContent, SiteContent, Skill } from "@/lib/types";

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

export default function AboutPage() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [skills, setSkills]   = useState<Skill[]>(defaultSkills);

  useEffect(() => {
    setContent(getSiteContent());
    setSkills(getSkills());
  }, []);

  const initials = content.aboutName.split(" ").map((n) => n[0]).join("").slice(0, 2);

  const skillsByCategory: Record<string, Skill[]> = {
    "UI Design":      skills.filter((s) => s.category === "ui"),
    "UX Design":      skills.filter((s) => s.category === "ux"),
    "Design Systems": skills.filter((s) => s.category === "other"),
    "Specializations":skills.filter((s) => s.category === "tools" && !s.primary),
  };
  const toolSkills = skills.filter((s) => s.category === "tools");

  return (
    <>
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-10 md:pb-14 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} className="max-w-3xl">
            <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-4">About Me</p>
            <h1 className="font-display font-bold text-text-1 leading-tight mb-4"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}>
              Designing with<br /><span className="text-text-3">empathy & intent.</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Bio */}
      <section className="pb-14 md:pb-20 px-5 md:px-8 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto pt-10 md:pt-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-start">
            <Reveal>
              <div className="rounded-2xl border border-white/[0.07] bg-surface aspect-square max-w-sm flex flex-col items-center justify-center gap-5">
                <div className="w-20 h-20 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="font-display font-bold text-2xl text-accent">{initials}</span>
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-text-1 text-lg">{content.aboutName}</p>
                  <p className="text-text-2 text-sm font-body mt-1">{content.aboutRole}</p>
                  <p className="text-text-3 text-xs font-body mt-0.5">{content.aboutLocation}</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl border border-white/[0.07] bg-surface space-y-3">
                <a href={`mailto:${content.contactEmail}`}
                  className="flex items-center gap-3 text-text-2 hover:text-text-1 transition-colors text-sm font-body group">
                  <span className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-xs flex-shrink-0">✉</span>
                  {content.contactEmail}
                  <ArrowUpRight size={11} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <div className="flex items-center gap-3 text-text-3 text-sm font-body">
                  <span className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-xs flex-shrink-0">📍</span>
                  {content.aboutLocation}
                </div>
                {content.linkedinUrl && (
                  <a href={content.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-text-2 hover:text-text-1 transition-colors text-sm font-body group">
                    <span className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-[10px] font-bold flex-shrink-0">in</span>
                    LinkedIn
                    <ArrowUpRight size={11} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                {content.behanceUrl && (
                  <a href={content.behanceUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-text-2 hover:text-text-1 transition-colors text-sm font-body group">
                    <span className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-[10px] font-bold flex-shrink-0">Be</span>
                    Behance
                    <ArrowUpRight size={11} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>
            </Reveal>

            <div className="space-y-5 pt-2">
              <Reveal><p className="text-text-1 font-body text-xl leading-relaxed">{content.aboutBio}</p></Reveal>
              <Reveal delay={0.08}><p className="text-text-2 font-body text-lg leading-relaxed">{content.aboutBio2}</p></Reveal>
              <Reveal delay={0.14}><p className="text-text-3 font-body text-base leading-relaxed">{content.aboutBio3}</p></Reveal>
              <Reveal delay={0.2}>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button href="/work">View My Work <ArrowUpRight size={14} /></Button>
                  <Button href="/contact" variant="ghost">Get In Touch</Button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      {skills.length > 0 && (
        <section className="py-14 md:py-20 px-5 md:px-8 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8 md:mb-12">
              <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-3">Skills</p>
              <h2 className="font-display font-bold text-text-1" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}>What I&apos;m good at.</h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Object.entries(skillsByCategory).map(([cat, items]) => items.length > 0 && (
                <Reveal key={cat}>
                  <h3 className="font-display font-bold text-text-1 text-sm mb-4">{cat}</h3>
                  <ul className="space-y-2">
                    {items.map((s) => (
                      <li key={s.id} className="flex items-center gap-2 text-text-2 text-sm font-body">
                        <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0 opacity-60" />
                        {s.name}
                        {s.primary && <span className="text-[9px] text-accent font-bold ml-auto">PRIMARY</span>}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tools */}
      {toolSkills.length > 0 && (
        <section className="py-14 md:py-20 px-5 md:px-8 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8 md:mb-12">
              <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-3">Tools</p>
              <h2 className="font-display font-bold text-text-1" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}>My toolkit.</h2>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-xl">
              {toolSkills.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.04}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`font-body font-medium text-sm ${t.primary ? "text-text-1" : "text-text-2"}`}>
                        {t.name}
                        {t.primary && <span className="ml-2 text-[9px] text-accent font-bold tracking-wide">PRIMARY</span>}
                      </span>
                      <span className="text-text-3 text-xs font-body tabular-nums">{t.level}%</span>
                    </div>
                    <div className="h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ backgroundColor: t.primary ? "#6C63FF" : "rgba(255,255,255,0.18)" }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${t.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education */}
      {content.education.length > 0 && (
        <section className="py-14 md:py-20 px-5 md:px-8 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8 md:mb-12">
              <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-3">Education</p>
              <h2 className="font-display font-bold text-text-1" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}>Academic background.</h2>
            </Reveal>
            <div className="space-y-3 max-w-xl">
              {content.education.map((e, i) => (
                <Reveal key={e.id} delay={i * 0.07}>
                  <div className="p-5 rounded-xl border border-white/[0.07] bg-surface hover:border-white/[0.12] transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-display font-bold text-text-1 text-sm leading-tight">{e.degree}</h3>
                      <span className="text-accent text-xs font-body font-bold flex-shrink-0 tabular-nums">{e.year}</span>
                    </div>
                    <p className="text-text-2 text-sm font-body font-medium mb-1.5">{e.institution}</p>
                    <p className="text-text-3 text-sm font-body leading-relaxed">{e.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials placeholder */}
      <section className="py-14 md:py-20 px-5 md:px-8 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-3">Testimonials</p>
            <p className="text-text-2 font-body text-lg leading-relaxed">
              Currently completing my first client projects — see my work above.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
