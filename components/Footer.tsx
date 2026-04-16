"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/siteContent";
import { defaultSiteContent, SiteContent } from "@/lib/types";

export default function Footer() {
  const year = new Date().getFullYear();
  const [c, setC] = useState<SiteContent>(defaultSiteContent);
  useEffect(() => { setC(getSiteContent()); }, []);

  const initials = c.aboutName.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <footer className="border-t border-white/[0.06] mt-auto">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="font-display font-bold text-[10px] text-white">{initials}</span>
          </span>
          <span className="font-display font-semibold text-text-2 text-sm">{c.aboutName}</span>
        </Link>

        <nav className="flex items-center gap-5">
          {[
            { href: "/work",    label: "Work" },
            { href: "/about",   label: "About" },
            { href: "/contact", label: "Contact" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-text-3 text-sm font-body hover:text-text-1 transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {c.linkedinUrl && (
            <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer"
              className="text-text-3 text-sm font-body hover:text-text-1 transition-colors flex items-center gap-1">
              LinkedIn <ArrowUpRight size={11} />
            </a>
          )}
          {c.behanceUrl && (
            <a href={c.behanceUrl} target="_blank" rel="noopener noreferrer"
              className="text-text-3 text-sm font-body hover:text-text-1 transition-colors flex items-center gap-1">
              Behance <ArrowUpRight size={11} />
            </a>
          )}
          {c.dribbbleUrl && (
            <a href={c.dribbbleUrl} target="_blank" rel="noopener noreferrer"
              className="text-text-3 text-sm font-body hover:text-text-1 transition-colors flex items-center gap-1">
              Dribbble <ArrowUpRight size={11} />
            </a>
          )}
          <a href={`mailto:${c.contactEmail}`}
            className="text-text-3 text-sm font-body hover:text-text-1 transition-colors">
            Email
          </a>
          <span className="text-text-3 text-xs font-body">© {year}</span>
        </div>
      </div>
    </footer>
  );
}
