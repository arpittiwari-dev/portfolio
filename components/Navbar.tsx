"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/work",  label: "Work" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-2xl border-b border-white/[0.05]" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="font-display font-bold text-xs text-white">AT</span>
            </span>
            <span className="font-display font-semibold text-text-1 text-sm">Arpit Tiwari</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-body font-medium transition-colors duration-150 ${
                    active
                      ? "text-text-1 bg-white/[0.06]"
                      : "text-text-2 hover:text-text-1 hover:bg-white/[0.04]"
                  }`}>
                  {label}
                </Link>
              );
            })}
            <Link href="/contact"
              className="ml-3 px-4 py-1.5 rounded-lg bg-accent text-white text-sm font-body font-medium hover:bg-accent-hover transition-colors duration-150">
              Hire Me
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu">
            <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
              className="w-5 h-px bg-text-1 block origin-center transition-all" />
            <motion.span animate={{ opacity: open ? 0 : 1 }}
              className="w-5 h-px bg-text-1 block" />
            <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
              className="w-5 h-px bg-text-1 block origin-center transition-all" />
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-2 md:hidden"
          >
            {links.map(({ href, label }, i) => (
              <motion.div key={href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <Link href={href}
                  className="block text-3xl font-display font-bold text-text-1 py-3 hover:text-accent transition-colors">
                  {label}
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Link href="/contact"
                className="mt-4 inline-block px-8 py-3 rounded-xl bg-accent text-white font-body font-semibold text-lg hover:bg-accent-hover transition-colors">
                Hire Me
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
