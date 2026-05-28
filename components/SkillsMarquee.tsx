"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/siteContent";
import { defaultSiteContent } from "@/lib/types";
import { useTheme } from "@/lib/ThemeContext";

function MarqueeRow({ items, reverse = false, speed = 1 }: { items: string[]; reverse?: boolean; speed?: number }) {
  const doubled = [...items, ...items];
  // speed > 1 = slower (longer duration), speed < 1 = faster
  const duration = `${28 / speed}s`;
  return (
    <div className="overflow-hidden py-1.5">
      <div
        className={`flex gap-3 ${reverse ? "animate-marquee-reverse" : "animate-marquee"} whitespace-nowrap`}
        style={{ animationDuration: duration }}
      >
        {doubled.map((skill, i) => (
          <span key={i}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.07] bg-white/[0.03] text-text-2 text-sm font-body font-medium flex-shrink-0 hover:border-accent/40 hover:text-accent hover:bg-accent/[0.05] transition-all duration-200 cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-accent opacity-50 flex-shrink-0" />
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SkillsMarquee() {
  const [row1, setRow1] = useState(defaultSiteContent.skillsRow1);
  const [row2, setRow2] = useState(defaultSiteContent.skillsRow2);
  const { config } = useTheme();
  const speed = config.animations.enabled ? config.animations.marqueeSpeed : 0.01;

  useEffect(() => {
    const c = getSiteContent();
    if (c.skillsRow1?.length) setRow1(c.skillsRow1);
    if (c.skillsRow2?.length) setRow2(c.skillsRow2);
  }, []);

  return (
    <div className="space-y-3 py-4">
      <MarqueeRow items={row1} speed={speed} />
      <MarqueeRow items={row2} reverse speed={speed} />
    </div>
  );
}
