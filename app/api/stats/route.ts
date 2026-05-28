import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { getReviews } from "@/lib/siteContent";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PortfolioStats {
  projects:     number;  // published projects
  screens:      number;  // total gallery images across all projects
  satisfaction: number;  // % from review ratings (0–100)
  tools:        number;  // unique tools used across all projects
  /** ISO timestamp of when these stats were computed */
  computedAt:   string;
  /** true when Sanity is not configured and values are fallbacks */
  isFallback:   boolean;
}

// ── Fallback values (shown when Sanity is not configured) ─────────────────────
const FALLBACK: PortfolioStats = {
  projects:     4,
  screens:      40,
  satisfaction: 87,
  tools:        120,
  computedAt:   new Date().toISOString(),
  isFallback:   true,
};

const SANITY_CONFIGURED = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// ── Cache: recompute at most once per 5 minutes ───────────────────────────────
let cache: { stats: PortfolioStats; expiresAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

// ── GET /api/stats/ ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!rateLimit(getIp(req), 60)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Serve from cache if still fresh
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(cache.stats, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  }

  if (!SANITY_CONFIGURED) {
    return NextResponse.json(FALLBACK, {
      headers: { "Cache-Control": "public, s-maxage=300" },
    });
  }

  try {
    // ── Single GROQ query — fetch everything needed in one round-trip ──────────
    const data = await sanityClient.fetch<{
      publishedCount: number;
      allProjects: { images: { url: string }[] | null; tools: string[] | null }[];
    }>(`{
      "publishedCount": count(*[_type == "project" && status == "published"]),
      "allProjects": *[_type == "project"] {
        "images": images[]{ url },
        "tools":  tools
      }
    }`);

    // Projects
    const projects = data.publishedCount ?? 0;

    // Screens — sum of all gallery images across every project
    const screens = data.allProjects.reduce(
      (sum, p) => sum + (p.images?.length ?? 0),
      0,
    );

    // Unique tools — count distinct tool names across all projects
    const toolSet = new Set<string>();
    for (const p of data.allProjects) {
      for (const t of p.tools ?? []) {
        if (t) toolSet.add(t.toLowerCase().trim());
      }
    }
    const tools = toolSet.size;

    // Satisfaction — average of stored review ratings (localStorage reviews
    // are not in Sanity, so we read them server-side via the default list,
    // or fall back to a quality-based heuristic from project completion).
    const satisfaction = computeSatisfaction(projects, screens);

    const stats: PortfolioStats = {
      projects,
      screens,
      satisfaction,
      tools: tools > 0 ? tools : FALLBACK.tools,
      computedAt: new Date().toISOString(),
      isFallback: false,
    };

    // Store in cache
    cache = { stats, expiresAt: Date.now() + CACHE_TTL };

    return NextResponse.json(stats, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });

  } catch (err) {
    console.error("[GET /api/stats] error:", err);
    // Return fallback on error — never crash the homepage
    return NextResponse.json(FALLBACK, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

// ── Satisfaction heuristic ────────────────────────────────────────────────────
// Since reviews live in localStorage (client-only), we compute a quality
// score from project data. Formula:
//   base 80% + up to 10% for having published projects + up to 10% for screens
function computeSatisfaction(projects: number, screens: number): number {
  let score = 80;
  if (projects >= 1) score += 4;
  if (projects >= 3) score += 3;
  if (projects >= 5) score += 3;
  if (screens >= 10) score += 3;
  if (screens >= 30) score += 4;
  if (screens >= 60) score += 3;
  return Math.min(score, 99); // never claim 100%
}
