"use client";

import { useState, useCallback } from "react";
import { useTheme } from "@/lib/ThemeContext";
import {
  DesignConfig, ThemeColors, ThemeEffects, ThemeAnimations,
  ThemeTypography, ThemeLayout, ThemeSections,
  THEME_PRESETS, applyPreset, defaultDesignConfig,
} from "@/lib/themeConfig";
import {
  Palette, Zap, Type, Layout, Eye, RotateCcw,
  Save, Monitor, Tablet, Smartphone, Check,
  Sliders, Layers, MousePointer, Sparkles,
} from "lucide-react";
import { iCls, SectionCard, Field, ToggleRow } from "@/components/AdminUI";

type DesignTab = "presets" | "colors" | "effects" | "animations" | "typography" | "layout" | "sections";

// ── Sub-components ────────────────────────────────────────────────────────────

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-white/40 text-[10px] font-body font-bold uppercase tracking-widest block">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <input type="color" value={value.startsWith("rgba") ? "#ffffff" : value}
            onChange={(e) => onChange(e.target.value)}
            className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer p-0.5 block" />
          <div className="absolute inset-0.5 rounded-md pointer-events-none" style={{ backgroundColor: value.startsWith("rgba") ? undefined : value }} />
        </div>
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className={`${iCls} flex-1 font-mono text-xs`} />
      </div>
    </div>
  );
}

function SliderRow({ label, min, max, step = 1, value, onChange, format }: {
  label: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-white/40 text-[10px] font-body font-bold uppercase tracking-widest">{label}</label>
        <span className="text-accent text-xs font-body font-bold tabular-nums">
          {format ? format(value) : value}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-accent cursor-pointer" />
    </div>
  );
}

function SegmentControl<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-white/40 text-[10px] font-body font-bold uppercase tracking-widest block">{label}</label>
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        {options.map((o) => (
          <button key={o.id} onClick={() => onChange(o.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
              value === o.id ? "bg-accent text-white" : "text-white/40 hover:text-white"
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tab panels ────────────────────────────────────────────────────────────────

function PresetsPanel({ config, onChange }: { config: DesignConfig; onChange: (c: DesignConfig) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-white/40 text-xs font-body">Click a preset to instantly apply it. Your current settings will be replaced.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEME_PRESETS.map((preset) => {
          const active = config.activePreset === preset.id;
          return (
            <button key={preset.id} onClick={() => onChange(applyPreset(config, preset))}
              className={`relative p-4 rounded-2xl border text-left transition-all group ${
                active ? "border-accent bg-accent/10" : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]"
              }`}>
              {active && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </span>
              )}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{preset.emoji}</span>
                <div>
                  <p className={`font-display font-bold text-sm ${active ? "text-accent" : "text-white"}`}>{preset.name}</p>
                  <p className="text-white/40 text-xs font-body">{preset.description}</p>
                </div>
              </div>
              <div className="flex gap-1.5 mt-3">
                {Object.values(preset.colors).filter((v) => v && !v.startsWith("rgba")).slice(0, 4).map((color, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorsPanel({ colors, onChange }: { colors: ThemeColors; onChange: (c: ThemeColors) => void }) {
  const set = (key: keyof ThemeColors, v: string) => onChange({ ...colors, [key]: v });
  return (
    <div className="space-y-5">
      <SectionCard title="Brand Colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorSwatch label="Accent" value={colors.accent} onChange={(v) => set("accent", v)} />
          <ColorSwatch label="Accent Hover" value={colors.accentHover} onChange={(v) => set("accentHover", v)} />
        </div>
      </SectionCard>
      <SectionCard title="Background">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorSwatch label="Background" value={colors.background} onChange={(v) => set("background", v)} />
          <ColorSwatch label="Surface" value={colors.surface} onChange={(v) => set("surface", v)} />
          <ColorSwatch label="Surface Subtle" value={colors.surfaceSubtle} onChange={(v) => set("surfaceSubtle", v)} />
        </div>
      </SectionCard>
      <SectionCard title="Text">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorSwatch label="Primary" value={colors.text1} onChange={(v) => set("text1", v)} />
          <ColorSwatch label="Secondary" value={colors.text2} onChange={(v) => set("text2", v)} />
          <ColorSwatch label="Muted" value={colors.text3} onChange={(v) => set("text3", v)} />
        </div>
      </SectionCard>
    </div>
  );
}

function EffectsPanel({ effects, onChange }: { effects: ThemeEffects; onChange: (e: ThemeEffects) => void }) {
  const set = <K extends keyof ThemeEffects>(key: K, v: ThemeEffects[K]) => onChange({ ...effects, [key]: v });
  return (
    <div className="space-y-5">
      <SectionCard title="Glow & Atmosphere">
        <SegmentControl label="Glow Intensity" value={String(effects.glowIntensity) as "0"|"1"|"2"|"3"}
          options={[{id:"0",label:"Off"},{id:"1",label:"Subtle"},{id:"2",label:"Medium"},{id:"3",label:"Strong"}]}
          onChange={(v) => set("glowIntensity", Number(v) as 0|1|2|3)} />
        <SegmentControl label="Glassmorphism" value={String(effects.glassmorphism) as "0"|"1"|"2"|"3"}
          options={[{id:"0",label:"Off"},{id:"1",label:"Subtle"},{id:"2",label:"Medium"},{id:"3",label:"Frosted"}]}
          onChange={(v) => set("glassmorphism", Number(v) as 0|1|2|3)} />
        <SliderRow label="Noise Texture Opacity" min={0} max={100} value={effects.noiseOpacity}
          onChange={(v) => set("noiseOpacity", v)} format={(v) => `${v}%`} />
      </SectionCard>
      <SectionCard title="Shape & Shadow">
        <SegmentControl label="Border Radius" value={effects.borderRadius}
          options={[{id:"sharp",label:"Sharp"},{id:"rounded",label:"Rounded"},{id:"pill",label:"Pill"}]}
          onChange={(v) => set("borderRadius", v)} />
        <SegmentControl label="Card Shadow" value={effects.cardShadow}
          options={[{id:"none",label:"None"},{id:"subtle",label:"Subtle"},{id:"medium",label:"Medium"},{id:"dramatic",label:"Dramatic"}]}
          onChange={(v) => set("cardShadow", v)} />
      </SectionCard>
      <SectionCard title="Hero Background">
        <ToggleRow label="Enable gradient overlay" desc="Adds a colored gradient behind the hero section"
          value={effects.heroGradient} onChange={(v) => set("heroGradient", v)} />
        {effects.heroGradient && (
          <Field label="Gradient CSS" hint="Any valid CSS gradient">
            <textarea value={effects.heroGradientValue}
              onChange={(e) => set("heroGradientValue", e.target.value)}
              rows={3} className={`${iCls} resize-none font-mono text-xs`}
              placeholder="radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.15) 0%, transparent 60%)" />
          </Field>
        )}
      </SectionCard>
    </div>
  );
}

function AnimationsPanel({ animations, onChange }: { animations: ThemeAnimations; onChange: (a: ThemeAnimations) => void }) {
  const set = <K extends keyof ThemeAnimations>(key: K, v: ThemeAnimations[K]) => onChange({ ...animations, [key]: v });
  return (
    <div className="space-y-5">
      <SectionCard title="Master Controls">
        <ToggleRow label="Enable all animations" desc="Master switch — disables all motion when off"
          value={animations.enabled} onChange={(v) => set("enabled", v)} />
        {animations.enabled && (
          <>
            <SliderRow label="Animation Speed" min={0.5} max={2} step={0.1} value={animations.speed}
              onChange={(v) => set("speed", v)} format={(v) => v === 1 ? "Normal" : v < 1 ? `${v}× Fast` : `${v}× Slow`} />
            <SegmentControl label="Motion Intensity" value={String(animations.intensity) as "0"|"1"|"2"|"3"}
              options={[{id:"0",label:"None"},{id:"1",label:"Subtle"},{id:"2",label:"Normal"},{id:"3",label:"Dramatic"}]}
              onChange={(v) => set("intensity", Number(v) as 0|1|2|3)} />
          </>
        )}
      </SectionCard>
      {animations.enabled && (
        <>
          <SectionCard title="Transition Styles">
            <SegmentControl label="Page Transition" value={animations.pageTransition}
              options={[{id:"none",label:"None"},{id:"fade",label:"Fade"},{id:"slide",label:"Slide"},{id:"scale",label:"Scale"}]}
              onChange={(v) => set("pageTransition", v)} />
            <SegmentControl label="Entrance Style" value={animations.entranceStyle}
              options={[{id:"fade",label:"Fade"},{id:"fadeUp",label:"Fade Up"},{id:"fadeScale",label:"Scale"},{id:"slide",label:"Slide"}]}
              onChange={(v) => set("entranceStyle", v)} />
          </SectionCard>
          <SectionCard title="Interaction Effects">
            <ToggleRow label="Card hover lift" desc="Cards rise on hover" value={animations.cardHover} onChange={(v) => set("cardHover", v)} />
            <ToggleRow label="Custom cursor" desc="Dot + ring cursor effect" value={animations.customCursor} onChange={(v) => set("customCursor", v)} />
            <ToggleRow label="Parallax hero" desc="Subtle depth on scroll" value={animations.parallax} onChange={(v) => set("parallax", v)} />
            <SliderRow label="Marquee Speed" min={0.3} max={3} step={0.1} value={animations.marqueeSpeed}
              onChange={(v) => set("marqueeSpeed", v)} format={(v) => `${v}×`} />
            <SliderRow label="Stagger Delay" min={50} max={300} step={10} value={animations.staggerDelay}
              onChange={(v) => set("staggerDelay", v)} format={(v) => `${v}ms`} />
          </SectionCard>
        </>
      )}
    </div>
  );
}

function TypographyPanel({ typography, onChange }: { typography: ThemeTypography; onChange: (t: ThemeTypography) => void }) {
  const set = <K extends keyof ThemeTypography>(key: K, v: ThemeTypography[K]) => onChange({ ...typography, [key]: v });
  const DISPLAY_FONTS = ["Clash Display", "Playfair Display", "Space Grotesk", "DM Serif Display", "Syne", "Cabinet Grotesk"];
  const BODY_FONTS    = ["Satoshi", "Inter", "DM Sans", "Plus Jakarta Sans", "Outfit", "Manrope"];
  return (
    <div className="space-y-5">
      <SectionCard title="Font Families" desc="Fonts must be loaded via Google Fonts or Fontshare">
        <Field label="Display / Heading Font">
          <select value={typography.fontDisplay} onChange={(e) => set("fontDisplay", e.target.value)} className={iCls}>
            {DISPLAY_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Body Font">
          <select value={typography.fontBody} onChange={(e) => set("fontBody", e.target.value)} className={iCls}>
            {BODY_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
      </SectionCard>
      <SectionCard title="Scale & Spacing">
        <SliderRow label="Type Scale" min={0.85} max={1.2} step={0.05} value={typography.scale}
          onChange={(v) => set("scale", v)} format={(v) => v === 1 ? "Default" : `${(v * 100).toFixed(0)}%`} />
        <SegmentControl label="Heading Letter Spacing" value={typography.headingTracking}
          options={[{id:"tight",label:"Tight"},{id:"normal",label:"Normal"},{id:"wide",label:"Wide"}]}
          onChange={(v) => set("headingTracking", v)} />
        <SegmentControl label="Body Line Height" value={typography.bodyLeading}
          options={[{id:"compact",label:"Compact"},{id:"normal",label:"Normal"},{id:"relaxed",label:"Relaxed"}]}
          onChange={(v) => set("bodyLeading", v)} />
      </SectionCard>
      <SectionCard title="Preview">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <p style={{ fontFamily: `'${typography.fontDisplay}', sans-serif`, letterSpacing: typography.headingTracking === "tight" ? "-0.03em" : typography.headingTracking === "wide" ? "0.02em" : "-0.01em" }}
            className="text-white font-bold text-2xl">Designing interfaces that convert.</p>
          <p style={{ fontFamily: `'${typography.fontBody}', sans-serif`, lineHeight: typography.bodyLeading === "compact" ? "1.4" : typography.bodyLeading === "relaxed" ? "1.8" : "1.6" }}
            className="text-white/50 text-sm">UI/UX Designer focused on mobile apps, e-commerce, and product UI. Every pixel has a purpose.</p>
        </div>
      </SectionCard>
    </div>
  );
}

function LayoutPanel({ layout, onChange }: { layout: ThemeLayout; onChange: (l: ThemeLayout) => void }) {
  const set = <K extends keyof ThemeLayout>(key: K, v: ThemeLayout[K]) => onChange({ ...layout, [key]: v });
  return (
    <div className="space-y-5">
      <SectionCard title="Page Structure">
        <SegmentControl label="Max Content Width" value={layout.maxWidth}
          options={[{id:"4xl",label:"4xl"},{id:"5xl",label:"5xl"},{id:"6xl",label:"6xl"},{id:"7xl",label:"7xl"},{id:"full",label:"Full"}]}
          onChange={(v) => set("maxWidth", v)} />
        <SegmentControl label="Page Padding" value={layout.pagePadding}
          options={[{id:"tight",label:"Tight"},{id:"normal",label:"Normal"},{id:"wide",label:"Wide"}]}
          onChange={(v) => set("pagePadding", v)} />
      </SectionCard>
      <SectionCard title="Navigation">
        <SegmentControl label="Navbar Style" value={layout.navStyle}
          options={[{id:"minimal",label:"Minimal"},{id:"bordered",label:"Bordered"},{id:"floating",label:"Floating"}]}
          onChange={(v) => set("navStyle", v)} />
      </SectionCard>
    </div>
  );
}

function SectionsPanel({ sections, onChange }: { sections: ThemeSections; onChange: (s: ThemeSections) => void }) {
  const set = <K extends keyof ThemeSections>(key: K, v: ThemeSections[K]) => onChange({ ...sections, [key]: v });
  return (
    <div className="space-y-5">
      <SectionCard title="Homepage Sections" desc="Toggle which sections appear on the homepage">
        <ToggleRow label="Availability Badge" desc="Green dot + availability text in hero" value={sections.showHeroAvailability} onChange={(v) => set("showHeroAvailability", v)} />
        <ToggleRow label="Stats Bar" desc="Numbers row (projects, screens, etc.)" value={sections.showStats} onChange={(v) => set("showStats", v)} />
        <ToggleRow label="Selected Work" desc="Featured projects grid" value={sections.showSelectedWork} onChange={(v) => set("showSelectedWork", v)} />
        <ToggleRow label="Skills Marquee" desc="Scrolling skills ticker" value={sections.showSkills} onChange={(v) => set("showSkills", v)} />
        <ToggleRow label="About Preview" desc="Mini about card + bio" value={sections.showAboutPreview} onChange={(v) => set("showAboutPreview", v)} />
        <ToggleRow label="CTA Section" desc="Contact call-to-action at bottom" value={sections.showCTA} onChange={(v) => set("showCTA", v)} />
      </SectionCard>
    </div>
  );
}

// ── Main DesignView ───────────────────────────────────────────────────────────

export default function DesignView({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const { config, setConfig, reset } = useTheme();
  const [activeTab, setActiveTab] = useState<DesignTab>("presets");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);

  const patch = useCallback(<K extends keyof DesignConfig>(key: K, value: DesignConfig[K]) => {
    setConfig({ ...config, [key]: value });
  }, [config, setConfig]);

  const handleReset = () => {
    if (!confirm("Reset all design settings to defaults?")) return;
    reset();
    showToast("Design reset to defaults");
  };

  const tabs: { id: DesignTab; label: string; icon: React.ElementType }[] = [
    { id: "presets",    label: "Presets",    icon: Sparkles },
    { id: "colors",     label: "Colors",     icon: Palette },
    { id: "effects",    label: "Effects",    icon: Layers },
    { id: "animations", label: "Motion",     icon: Zap },
    { id: "typography", label: "Typography", icon: Type },
    { id: "layout",     label: "Layout",     icon: Layout },
    { id: "sections",   label: "Sections",   icon: Sliders },
  ];

  const previewWidths = { desktop: "100%", tablet: "768px", mobile: "390px" };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-xl text-white">Design Studio</h1>
          <p className="text-white/40 text-sm font-body mt-0.5">
            Customize your portfolio appearance — changes apply instantly, no rebuild needed.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-body transition-all ${
              showPreview ? "border-accent bg-accent/10 text-accent" : "border-white/[0.07] text-white/50 hover:text-white"
            }`}>
            <Eye size={13} /> Preview
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.07] text-white/50 hover:text-white text-sm font-body transition-colors">
            <RotateCcw size={13} /> Reset
          </button>
          <button onClick={() => showToast("Design settings saved!")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-body font-bold hover:bg-accent/90 transition-colors">
            <Save size={13} /> Saved
          </button>
        </div>
      </div>

      {/* Live preview iframe */}
      {showPreview && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
            <p className="text-white/50 text-xs font-body font-bold uppercase tracking-widest">Live Preview</p>
            <div className="flex items-center gap-1">
              {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([id, Icon]) => (
                <button key={id} onClick={() => setPreviewDevice(id)}
                  className={`p-1.5 rounded-lg border transition-colors ${previewDevice === id ? "border-accent text-accent bg-accent/10" : "border-white/[0.07] text-white/30 hover:text-white"}`}>
                  <Icon size={13} />
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 flex justify-center bg-[#050506]">
            <div className="transition-all duration-300 overflow-hidden rounded-xl border border-white/[0.07]"
              style={{ width: previewWidths[previewDevice], maxWidth: "100%" }}>
              <iframe src="/" className="w-full h-[500px] border-0" title="Portfolio preview" />
            </div>
          </div>
        </div>
      )}

      {/* Active preset badge */}
      {config.activePreset !== "default" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20 w-fit">
          <Sparkles size={12} className="text-accent" />
          <span className="text-accent text-xs font-body font-bold">
            {THEME_PRESETS.find((p) => p.id === config.activePreset)?.emoji}{" "}
            {THEME_PRESETS.find((p) => p.id === config.activePreset)?.name} preset active
          </span>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-body font-medium transition-all ${
              activeTab === id ? "bg-accent text-white" : "text-white/40 hover:text-white hover:bg-white/[0.04]"
            }`}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "presets"    && <PresetsPanel    config={config} onChange={setConfig} />}
        {activeTab === "colors"     && <ColorsPanel     colors={config.colors} onChange={(v) => patch("colors", v)} />}
        {activeTab === "effects"    && <EffectsPanel    effects={config.effects} onChange={(v) => patch("effects", v)} />}
        {activeTab === "animations" && <AnimationsPanel animations={config.animations} onChange={(v) => patch("animations", v)} />}
        {activeTab === "typography" && <TypographyPanel typography={config.typography} onChange={(v) => patch("typography", v)} />}
        {activeTab === "layout"     && <LayoutPanel     layout={config.layout} onChange={(v) => patch("layout", v)} />}
        {activeTab === "sections"   && <SectionsPanel   sections={config.sections} onChange={(v) => patch("sections", v)} />}
      </div>

      {/* Color preview strip */}
      <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.05]">
          <p className="text-white/40 text-[10px] font-body font-bold uppercase tracking-widest">Current Palette</p>
        </div>
        <div className="flex h-10">
          {[config.colors.background, config.colors.surface, config.colors.surfaceSubtle, config.colors.accent, config.colors.accentHover, config.colors.text1, config.colors.text2, config.colors.text3].map((color, i) => (
            <div key={i} className="flex-1 transition-colors duration-300" style={{ backgroundColor: color }} title={color} />
          ))}
        </div>
      </div>
    </div>
  );
}
