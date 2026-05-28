"use client";

/**
 * lib/useStats.ts
 *
 * React hook that fetches live portfolio stats from /api/stats/.
 * Falls back to the static values from siteContent if the API fails.
 * Memoises the result for the lifetime of the component tree.
 */

import { useState, useEffect, useRef } from "react";
import type { PortfolioStats } from "@/app/api/stats/route";
import { getSiteContent } from "./siteContent";

export type { PortfolioStats };

export interface UseStatsResult {
  stats:   PortfolioStats | null;
  loading: boolean;
  error:   string | null;
}

// Module-level cache so multiple components share one fetch per page load
let _cached: PortfolioStats | null = null;
let _promise: Promise<PortfolioStats> | null = null;

function fetchStats(): Promise<PortfolioStats> {
  if (_cached) return Promise.resolve(_cached);
  if (_promise) return _promise;

  _promise = fetch("/api/stats/", { next: { revalidate: 300 } })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<PortfolioStats>;
    })
    .then((data) => {
      _cached = data;
      return data;
    })
    .catch((err) => {
      _promise = null; // allow retry on next mount
      throw err;
    });

  return _promise;
}

/** Build a fallback from the static siteContent stats array */
function buildFallback(): PortfolioStats {
  const content = getSiteContent();
  const s = content.stats;
  const find = (label: string, def: number) =>
    s.find((x) => x.label.toLowerCase().includes(label))?.value ?? def;

  return {
    projects:     find("project", 4),
    screens:      find("screen", 40),
    satisfaction: find("satisfaction", 87),
    tools:        find("component", 120),
    computedAt:   new Date().toISOString(),
    isFallback:   true,
  };
}

export function useStats(): UseStatsResult {
  const [stats,   setStats]   = useState<PortfolioStats | null>(_cached);
  const [loading, setLoading] = useState(!_cached);
  const [error,   setError]   = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (_cached) {
      setStats(_cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchStats()
      .then((data) => {
        if (!mounted.current) return;
        setStats(data);
        setError(null);
      })
      .catch((err) => {
        if (!mounted.current) return;
        console.warn("[useStats] API failed, using fallback:", err.message);
        setStats(buildFallback());
        setError(err.message);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });

    return () => { mounted.current = false; };
  }, []);

  return { stats, loading, error };
}
