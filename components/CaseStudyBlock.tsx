"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { ReactNode } from "react";

interface TextBlockProps {
  label: string;
  children: ReactNode;
  accentColor?: string;
}

export function TextBlock({ label, children, accentColor = "#C8FA64" }: TextBlockProps) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="space-y-4"
    >
      <motion.span
        variants={fadeUp}
        className="inline-block text-xs font-body font-bold tracking-widest uppercase"
        style={{ color: accentColor }}
      >
        {label}
      </motion.span>
      <motion.div variants={fadeUp} className="text-text-secondary font-body text-lg leading-relaxed">
        {children}
      </motion.div>
    </motion.div>
  );
}

interface StatBlockProps {
  metrics: { label: string; value: string }[];
  accentColor?: string;
}

export function StatBlock({ metrics, accentColor = "#C8FA64" }: StatBlockProps) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="grid grid-cols-2 md:grid-cols-4 gap-6"
    >
      {metrics.map((m, i) => (
        <motion.div key={i} variants={fadeUp} className="text-center">
          <div
            className="font-display font-bold text-4xl md:text-5xl mb-2"
            style={{ color: accentColor }}
          >
            {m.value}
          </div>
          <div className="text-text-secondary text-sm font-body">{m.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface QuoteBlockProps {
  quote: string;
  accentColor?: string;
}

export function QuoteBlock({ quote, accentColor = "#C8FA64" }: QuoteBlockProps) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <motion.blockquote
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="border-l-2 pl-6 py-2"
      style={{ borderColor: accentColor }}
    >
      <p className="font-display text-2xl md:text-3xl font-bold text-white leading-snug">
        &ldquo;{quote}&rdquo;
      </p>
    </motion.blockquote>
  );
}
