/**
 * lib/themeConfig.ts
 *
 * Central type definitions, defaults, and persistence for the
 * design control system. All values map directly to CSS custom
 * properties injected at runtime — no rebuild required.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ThemeColors {
  accent:      string;
  accentHover: string;
  background:  string;
  surface:     string;
  surfaceSubtle: string;
  text1:       string;
  text2:       string;
  text3:       string;
  border:      string;
  borderMid:   string;
}

export interface ThemeTypography {
  fontDisplay: string;
  fontBody:    string;
  /** Scale multiplier 0.8–1.2 */
  scale:       number;
  /** Letter spacing for headings: "tight" | "normal" | "wide" */
  headingTracking: "tight" | "normal" | "wide";
  /** Line height for body: "compact" | "normal" | "relaxed" */
  bodyLeading: "compact" | "normal" | "relaxed";
}

export interface ThemeEffects {
  /** 0 = off, 1 = subtle, 2 = medium, 3 = strong */
  glowIntensity:       0 | 1 | 2 | 3;
  /** 0 = off, 1 = subtle, 2 = medium, 3 = frosted */
  glassmorphism:       0 | 1 | 2 | 3;
  /** Noise overlay opacity 0–100 */
  noiseOpacity:        number;
  /** Border radius scale: "sharp" | "rounded" | "pill" */
  borderRadius:        "sharp" | "rounded" | "pill";
  /** Card shadow style */
  cardShadow:          "none" | "subtle" | "medium" | "dramatic";
  /** Show animated gradient background on hero */
  heroGradient:        boolean;
  /** Custom gradient string (CSS) */
  heroGradientValue:   string;
}

export interface ThemeAnimations {
  /** Master enable/disable */
  enabled:             boolean;
  /** 0.5 = fast, 1 = normal, 1.5 = slow, 2 = very slow */
  speed:               number;
  /** 0 = none, 1 = subtle, 2 = normal, 3 = dramatic */
  intensity:           0 | 1 | 2 | 3;
  /** Page transition style */
  pageTransition:      "none" | "fade" | "slide" | "scale";
  /** Entrance animation style */
  entranceStyle:       "fade" | "fadeUp" | "fadeScale" | "slide";
  /** Hover lift on cards */
  cardHover:           boolean;
  /** Parallax on hero */
  parallax:            boolean;
  /** Custom cursor */
  customCursor:        boolean;
  /** Marquee speed multiplier */
  marqueeSpeed:        number;
  /** Stagger delay between children (ms) */
  staggerDelay:        number;
}

export interface ThemeSections {
  showHeroAvailability: boolean;
  showStats:            boolean;
  showSelectedWork:     boolean;
  showSkills:           boolean;
  showAboutPreview:     boolean;
  showCTA:              boolean;
  /** Order of homepage sections */
  sectionOrder:         string[];
}

export interface ThemeLayout {
  /** Max content width */
  maxWidth:    "4xl" | "5xl" | "6xl" | "7xl" | "full";
  /** Horizontal padding scale */
  pagePadding: "tight" | "normal" | "wide";
  /** Navbar style */
  navStyle:    "minimal" | "bordered" | "floating";
  /** Footer style */
  footerStyle: "minimal" | "full";
}

export interface DesignConfig {
  colors:     ThemeColors;
  typography: ThemeTypography;
  effects:    ThemeEffects;
  animations: ThemeAnimations;
  sections:   ThemeSections;
  layout:     ThemeLayout;
  /** Preset name if a preset was applied */
  activePreset: string;
  updatedAt:  string;
}

// ── Presets ───────────────────────────────────────────────────────────────────

export interface ThemePreset {
  id:          string;
  name:        string;
  description: string;
  emoji:       string;
  colors:      Partial<ThemeColors>;
  effects:     Partial<ThemeEffects>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Midnight Purple",
    description: "The original dark theme with purple accent",
    emoji: "🌙",
    colors: {
      accent:      "#6C63FF",
      accentHover: "#8880FF",
      background:  "#080809",
      surface:     "#0f0f12",
    },
    effects: { glowIntensity: 1, glassmorphism: 1, heroGradient: false },
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    description: "Cool teal and cyan tones",
    emoji: "🌊",
    colors: {
      accent:      "#06B6D4",
      accentHover: "#22D3EE",
      background:  "#060B0F",
      surface:     "#0A1520",
    },
    effects: { glowIntensity: 2, glassmorphism: 2, heroGradient: true, heroGradientValue: "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.12) 0%, transparent 60%)" },
  },
  {
    id: "ember",
    name: "Ember",
    description: "Warm orange and red energy",
    emoji: "🔥",
    colors: {
      accent:      "#F97316",
      accentHover: "#FB923C",
      background:  "#0C0804",
      surface:     "#150E08",
    },
    effects: { glowIntensity: 2, glassmorphism: 1, heroGradient: true, heroGradientValue: "radial-gradient(ellipse at 80% 20%, rgba(249,115,22,0.10) 0%, transparent 60%)" },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Earthy greens and nature tones",
    emoji: "🌿",
    colors: {
      accent:      "#10B981",
      accentHover: "#34D399",
      background:  "#060C09",
      surface:     "#0A1510",
    },
    effects: { glowIntensity: 1, glassmorphism: 1, heroGradient: false },
  },
  {
    id: "rose",
    name: "Rose Gold",
    description: "Elegant pink and rose tones",
    emoji: "🌸",
    colors: {
      accent:      "#F43F5E",
      accentHover: "#FB7185",
      background:  "#0C0608",
      surface:     "#160A0D",
    },
    effects: { glowIntensity: 2, glassmorphism: 2, heroGradient: true, heroGradientValue: "radial-gradient(ellipse at 50% 0%, rgba(244,63,94,0.10) 0%, transparent 60%)" },
  },
  {
    id: "mono",
    name: "Monochrome",
    description: "Pure black and white minimal",
    emoji: "⬛",
    colors: {
      accent:      "#FFFFFF",
      accentHover: "#E5E5E5",
      background:  "#000000",
      surface:     "#0A0A0A",
    },
    effects: { glowIntensity: 0, glassmorphism: 0, heroGradient: false },
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Vibrant gradient aurora effect",
    emoji: "🌌",
    colors: {
      accent:      "#A855F7",
      accentHover: "#C084FC",
      background:  "#07050F",
      surface:     "#0E0A1A",
    },
    effects: { glowIntensity: 3, glassmorphism: 2, heroGradient: true, heroGradientValue: "radial-gradient(ellipse at 30% 40%, rgba(168,85,247,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.08) 0%, transparent 50%)" },
  },
];

// ── Defaults ──────────────────────────────────────────────────────────────────

export const defaultDesignConfig: DesignConfig = {
  colors: {
    accent:        "#6C63FF",
    accentHover:   "#8880FF",
    background:    "#080809",
    surface:       "#0f0f12",
    surfaceSubtle: "#141418",
    text1:         "#EEECEA",
    text2:         "#7A7A8A",
    text3:         "#44445A",
    border:        "rgba(255,255,255,0.06)",
    borderMid:     "rgba(255,255,255,0.10)",
  },
  typography: {
    fontDisplay:     "Clash Display",
    fontBody:        "Satoshi",
    scale:           1,
    headingTracking: "tight",
    bodyLeading:     "normal",
  },
  effects: {
    glowIntensity:     1,
    glassmorphism:     1,
    noiseOpacity:      40,
    borderRadius:      "rounded",
    cardShadow:        "subtle",
    heroGradient:      false,
    heroGradientValue: "",
  },
  animations: {
    enabled:        true,
    speed:          1,
    intensity:      2,
    pageTransition: "fade",
    entranceStyle:  "fadeUp",
    cardHover:      true,
    parallax:       false,
    customCursor:   true,
    marqueeSpeed:   1,
    staggerDelay:   120,
  },
  sections: {
    showHeroAvailability: true,
    showStats:            true,
    showSelectedWork:     true,
    showSkills:           true,
    showAboutPreview:     true,
    showCTA:              true,
    sectionOrder:         ["hero", "stats", "work", "skills", "about", "cta"],
  },
  layout: {
    maxWidth:    "6xl",
    pagePadding: "normal",
    navStyle:    "minimal",
    footerStyle: "minimal",
  },
  activePreset: "default",
  updatedAt:    new Date().toISOString(),
};

// ── Persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "portfolio_design_config";

export function getDesignConfig(): DesignConfig {
  if (typeof window === "undefined") return defaultDesignConfig;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Deep merge with defaults to handle new fields added after initial save
      return {
        ...defaultDesignConfig,
        ...parsed,
        colors:     { ...defaultDesignConfig.colors,     ...parsed.colors },
        typography: { ...defaultDesignConfig.typography, ...parsed.typography },
        effects:    { ...defaultDesignConfig.effects,    ...parsed.effects },
        animations: { ...defaultDesignConfig.animations, ...parsed.animations },
        sections:   { ...defaultDesignConfig.sections,   ...parsed.sections },
        layout:     { ...defaultDesignConfig.layout,     ...parsed.layout },
      };
    }
  } catch { /* ignore */ }
  return defaultDesignConfig;
}

export function saveDesignConfig(config: DesignConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...config, updatedAt: new Date().toISOString() }));
}

export function applyPreset(config: DesignConfig, preset: ThemePreset): DesignConfig {
  return {
    ...config,
    colors:  { ...config.colors,  ...preset.colors },
    effects: { ...config.effects, ...preset.effects },
    activePreset: preset.id,
  };
}

// ── CSS variable mapping ──────────────────────────────────────────────────────

/** Convert a DesignConfig into a flat map of CSS custom property values */
export function configToCssVars(config: DesignConfig): Record<string, string> {
  const { colors, effects, animations, typography } = config;

  // Glow values by intensity
  const glowMap = {
    0: { pulse: "none", shadow: "none", soft: "none" },
    1: { pulse: `0 0 20px ${colors.accent}40`, shadow: `0 0 40px ${colors.accent}26`, soft: `${colors.accent}1A` },
    2: { pulse: `0 0 30px ${colors.accent}60`, shadow: `0 0 60px ${colors.accent}40`, soft: `${colors.accent}26` },
    3: { pulse: `0 0 50px ${colors.accent}80`, shadow: `0 0 80px ${colors.accent}60`, soft: `${colors.accent}33` },
  };
  const glow = glowMap[effects.glowIntensity];

  // Glassmorphism values
  const glassMap = {
    0: { bg: "rgba(0,0,0,0)",    blur: "0px",   border: "rgba(255,255,255,0.04)" },
    1: { bg: "rgba(255,255,255,0.02)", blur: "8px",  border: "rgba(255,255,255,0.06)" },
    2: { bg: "rgba(255,255,255,0.04)", blur: "16px", border: "rgba(255,255,255,0.10)" },
    3: { bg: "rgba(255,255,255,0.08)", blur: "24px", border: "rgba(255,255,255,0.15)" },
  };
  const glass = glassMap[effects.glassmorphism];

  // Border radius
  const radiusMap = {
    sharp:   { sm: "4px",  md: "8px",  lg: "12px", xl: "16px", "2xl": "20px" },
    rounded: { sm: "6px",  md: "12px", lg: "16px", xl: "20px", "2xl": "24px" },
    pill:    { sm: "999px", md: "999px", lg: "24px", xl: "28px", "2xl": "32px" },
  };
  const radius = radiusMap[effects.borderRadius];

  // Card shadow
  const shadowMap = {
    none:     "none",
    subtle:   `0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
    medium:   `0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)`,
    dramatic: `0 8px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.10), 0 0 40px ${colors.accent}15`,
  };

  // Animation speed (duration multiplier → CSS transition duration)
  const dur = (base: number) => `${(base * animations.speed).toFixed(2)}s`;

  // Typography tracking
  const trackingMap = { tight: "-0.03em", normal: "-0.01em", wide: "0.02em" };
  const leadingMap  = { compact: "1.4", normal: "1.6", relaxed: "1.8" };

  // Font scale
  const fs = typography.scale;

  return {
    // Colors
    "--accent":           colors.accent,
    "--accent-hover":     colors.accentHover,
    "--accent-soft":      `${colors.accent}1A`,
    "--accent-mid":       `${colors.accent}38`,
    "--bg":               colors.background,
    "--bg-elevated":      colors.surface,
    "--bg-subtle":        colors.surfaceSubtle,
    "--text-1":           colors.text1,
    "--text-2":           colors.text2,
    "--text-3":           colors.text3,
    "--border":           colors.border,
    "--border-mid":       colors.borderMid,

    // Glow
    "--glow-pulse":       glow.pulse,
    "--glow-shadow":      glow.shadow,
    "--glow-soft":        glow.soft,

    // Glass
    "--glass-bg":         glass.bg,
    "--glass-blur":       glass.blur,
    "--glass-border":     glass.border,

    // Radius
    "--radius-sm":        radius.sm,
    "--radius-md":        radius.md,
    "--radius-lg":        radius.lg,
    "--radius-xl":        radius.xl,
    "--radius-2xl":       radius["2xl"],

    // Shadow
    "--shadow-card":      shadowMap[effects.cardShadow],

    // Noise
    "--noise-opacity":    `${effects.noiseOpacity / 100}`,

    // Animation
    "--anim-dur-fast":    dur(0.2),
    "--anim-dur-base":    dur(0.4),
    "--anim-dur-slow":    dur(0.7),
    "--anim-dur-slower":  dur(1.0),
    "--anim-stagger":     `${animations.staggerDelay * animations.speed}ms`,

    // Typography
    "--font-display":     `'${typography.fontDisplay}', sans-serif`,
    "--font-body":        `'${typography.fontBody}', sans-serif`,
    "--heading-tracking": trackingMap[typography.headingTracking],
    "--body-leading":     leadingMap[typography.bodyLeading],
    "--type-scale":       String(fs),

    // Hero gradient
    "--hero-gradient":    effects.heroGradient ? effects.heroGradientValue : "none",
  };
}
