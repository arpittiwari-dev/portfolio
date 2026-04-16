
"use client";

import { useState } from "react";
import { Project, ProjectStatus, GalleryLayout } from "@/lib/types";
import { SingleImageUploader, MultiImageUploader } from "@/components/ImageUploader";
import {
  ArrowLeft, Save, Globe, Eye, FileText, Monitor, Tablet, Smartphone,
  Plus, X, Link as LinkIcon, ToggleLeft, ToggleRight, Grid, AlignJustify, Maximize2,
  Tag, ChevronRight,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["Mobile App", "E-commerce", "Product UI", "SaaS / Landing Page", "Branding", "Web App", "Other"];
const TOOL_SUGGESTIONS = ["Figma", "FigJam", "Adobe XD", "Sketch", "Maze", "Hotjar", "Notion", "Webflow", "Lottie", "After Effects", "Spline", "Framer"];

type Tab = "basic" | "images" | "content" | "metrics" | "seo";

interface Props {
  project: Project;
  isNew: boolean;
  onSave: (project: Project, andPublish?: boolean) => void;
  onBack: () => void;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-text-secondary text-xs font-body font-medium uppercase tracking-wide">{label}</label>
        {hint && <span className="text-text-secondary/50 text-xs font-body">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-body text-sm placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 focus:bg-white/[0.07] transition-all";
const textareaCls = `${inputCls} resize-none`;

export default function ProjectEditor({ project: initial, isNew, onSave, onBack }: Props) {
  const [p, setP] = useState<Project>(initial);
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [tagInput, setTagInput] = useState("");
  const [toolInput, setToolInput] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field: keyof Project, value: unknown) => setP((prev) => ({ ...prev, [field]: value }));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || (p.tags || []).includes(t)) return;
    set("tags", [...(p.tags || []), t]);
    setTagInput("");
  };

  const addTool = (tool: string) => {
    if ((p.tools || []).includes(tool)) return;
    set("tools", [...(p.tools || []), tool]);
    setToolInput("");
  };

  const doSave = (andPublish = false) => {
    setSaving(true);
    setTimeout(() => { onSave(p, andPublish); setSaving(false); }, 300);
  };

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "basic", label: "Info", emoji: "📋" },
    { id: "images", label: "Images", emoji: "🖼️" },
    { id: "content", label: "Case Study", emoji: "📝" },
    { id: "metrics", label: "Metrics", emoji: "📊" },
    { id: "seo", label: "SEO & Publish", emoji: "🚀" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#0d0d0e] sticky top-0 z-40 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="p-2 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:border-white/30 transition-colors flex-shrink-0">
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <p className="font-display font-bold text-white text-sm truncate">{p.title || (isNew ? "New Project" : "Untitled")}</p>
            <p className="text-text-secondary text-xs font-body">{isNew ? "Creating new project" : "Editing project"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {p.slug && (
            <Link href={`/work/${p.slug}`} target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-text-secondary hover:text-white text-xs font-body transition-colors">
              <Eye size={13} /> Preview
            </Link>
          )}
          <button onClick={() => doSave(false)} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white text-sm font-body font-medium hover:bg-white/5 transition-colors disabled:opacity-50">
            <Save size={14} /> {saving ? "Saving…" : "Save Draft"}
          </button>
          <button onClick={() => doSave(true)} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-background text-sm font-body font-bold hover:bg-accent/90 transition-colors disabled:opacity-50">
            <Globe size={14} /> Publish
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Tab sidebar */}
        <nav className="w-14 md:w-48 flex-shrink-0 border-r border-white/5 bg-[#0d0d0e] flex flex-col pt-4 gap-1 px-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all text-left ${
                activeTab === t.id ? "bg-accent/10 text-accent" : "text-text-secondary hover:text-white hover:bg-white/5"
              }`}>
              <span className="text-base flex-shrink-0">{t.emoji}</span>
              <span className="hidden md:block whitespace-nowrap">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* ── BASIC INFO ── */}
            {activeTab === "basic" && (
              <>
                <SectionCard title="Project Details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Title">
                      <input value={p.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. University ERP App" className={inputCls} />
                    </Field>
                    <Field label="URL Slug" hint="auto-fill from title">
                      <input value={p.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                        placeholder="university-erp-app" className={inputCls} />
                    </Field>
                    <Field label="Category">
                      <select value={p.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                        <option value="">Select category</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Accent Color">
                      <div className="flex gap-2">
                        <input type="color" value={p.accentColor} onChange={(e) => set("accentColor", e.target.value)}
                          className="w-11 h-11 rounded-xl border border-white/10 bg-transparent cursor-pointer flex-shrink-0 p-1" />
                        <input value={p.accentColor} onChange={(e) => set("accentColor", e.target.value)} className={inputCls} />
                      </div>
                    </Field>
                    <Field label="Your Role">
                      <input value={p.role} onChange={(e) => set("role", e.target.value)} placeholder="UI/UX Designer" className={inputCls} />
                    </Field>
                    <Field label="Timeline">
                      <input value={p.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="6 Weeks" className={inputCls} />
                    </Field>
                    <Field label="Client" hint="optional">
                      <input value={p.client || ""} onChange={(e) => set("client", e.target.value)} placeholder="Client name" className={inputCls} />
                    </Field>
                    <Field label="Prototype Link" hint="optional">
                      <div className="relative">
                        <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input value={p.prototypeLink || ""} onChange={(e) => set("prototypeLink", e.target.value)}
                          placeholder="https://figma.com/proto/..." className={`${inputCls} pl-9`} />
                      </div>
                    </Field>
                  </div>
                  <Field label="Short Description">
                    <textarea value={p.shortDescription} onChange={(e) => set("shortDescription", e.target.value)}
                      rows={2} placeholder="One-line summary shown on project cards" className={textareaCls} />
                  </Field>
                </SectionCard>

                <SectionCard title="Tags">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(p.tags || []).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white">
                        <Tag size={10} className="text-accent" /> {tag}
                        <button onClick={() => set("tags", p.tags.filter((t) => t !== tag))} className="text-text-secondary hover:text-red-400 transition-colors ml-0.5">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add tag and press Enter" className={`${inputCls} flex-1`} />
                    <button onClick={addTag} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white text-sm font-body transition-colors">
                      Add
                    </button>
                  </div>
                </SectionCard>

                <SectionCard title="Tools Used">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(p.tools || []).map((tool) => (
                      <span key={tool} className="inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                        {tool}
                        <button onClick={() => set("tools", p.tools.filter((t) => t !== tool))} className="hover:text-red-400 transition-colors">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {TOOL_SUGGESTIONS.filter((t) => !(p.tools || []).includes(t)).map((tool) => (
                      <button key={tool} onClick={() => addTool(tool)}
                        className="text-xs font-body px-3 py-1.5 rounded-full border border-white/10 text-text-secondary hover:border-accent/40 hover:text-accent transition-colors">
                        + {tool}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={toolInput} onChange={(e) => setToolInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), toolInput.trim() && addTool(toolInput.trim()))}
                      placeholder="Custom tool name" className={`${inputCls} flex-1`} />
                    <button onClick={() => toolInput.trim() && addTool(toolInput.trim())}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white text-sm font-body transition-colors">
                      Add
                    </button>
                  </div>
                </SectionCard>

                <SectionCard title="Settings">
                  <div className="space-y-3">
                    <ToggleRow label="Featured on homepage" desc="Show this project in the homepage selected work section"
                      value={p.featured} onChange={(v) => set("featured", v)} />
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── IMAGES ── */}
            {activeTab === "images" && (
              <>
                <SectionCard title="Cover / Thumbnail" desc="Shown on project cards and as the hero image in the case study.">
                  <SingleImageUploader label="Cover Image" value={p.thumbnail}
                    onChange={(b64) => set("thumbnail", b64)} onClear={() => set("thumbnail", "")}
                    hint="Recommended: 1200×900px, 16:9 or 4:3 ratio" />
                </SectionCard>

                <SectionCard title="Gallery Layout" desc="Choose how your design screens are displayed in the case study.">
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: "grid", label: "Grid", icon: Grid, desc: "3-column uniform grid" },
                      { id: "masonry", label: "Masonry", icon: AlignJustify, desc: "Pinterest-style flow" },
                      { id: "fullwidth", label: "Full Width", icon: Maximize2, desc: "One image per row" },
                    ] as { id: GalleryLayout; label: string; icon: React.ElementType; desc: string }[]).map(({ id, label, icon: Icon, desc }) => (
                      <button key={id} onClick={() => set("galleryLayout", id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                          p.galleryLayout === id ? "border-accent bg-accent/10 text-accent" : "border-white/10 text-text-secondary hover:border-white/30 hover:text-white"
                        }`}>
                        <Icon size={20} />
                        <span className="text-xs font-body font-bold">{label}</span>
                        <span className="text-xs font-body opacity-60 hidden sm:block">{desc}</span>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Design Screens" desc="Upload all your design screens. First image = cover. Drag to reorder.">
                  <MultiImageUploader label="Design Screens" images={p.images || []}
                    onChange={(imgs) => set("images", imgs)} />
                </SectionCard>

                {/* Preview device switcher */}
                {(p.images || []).length > 0 && (
                  <SectionCard title="Gallery Preview">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-text-secondary text-xs font-body">Preview as:</span>
                      {([
                        { id: "desktop", icon: Monitor },
                        { id: "tablet", icon: Tablet },
                        { id: "mobile", icon: Smartphone },
                      ] as { id: "desktop" | "tablet" | "mobile"; icon: React.ElementType }[]).map(({ id, icon: Icon }) => (
                        <button key={id} onClick={() => setPreviewDevice(id)}
                          className={`p-2 rounded-lg border transition-colors ${previewDevice === id ? "border-accent text-accent bg-accent/10" : "border-white/10 text-text-secondary hover:text-white"}`}>
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                    <div className={`mx-auto transition-all duration-300 ${
                      previewDevice === "desktop" ? "max-w-full" : previewDevice === "tablet" ? "max-w-lg" : "max-w-xs"
                    }`}>
                      <div className="grid grid-cols-2 gap-3">
                        {(p.images || []).slice(0, 6).map((img, i) => (
                          <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-white/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt={img.alt} className="absolute inset-0 w-full h-full object-cover object-center" />
                            {i === 0 && <span className="absolute top-2 left-2 text-xs font-body font-bold text-background bg-accent px-2 py-0.5 rounded-full">Cover</span>}
                          </div>
                        ))}
                      </div>
                      {(p.images || []).length > 6 && (
                        <p className="text-text-secondary text-xs font-body text-center mt-3">+{(p.images || []).length - 6} more screens</p>
                      )}
                    </div>
                  </SectionCard>
                )}
              </>
            )}

            {/* ── CASE STUDY CONTENT ── */}
            {activeTab === "content" && (
              <>
                <SectionCard title="Project Story">
                  {([
                    { key: "overview", label: "Overview", rows: 4, placeholder: "Describe the project scope and context..." },
                    { key: "problem", label: "Problem Statement", rows: 3, placeholder: "What problem were you solving?" },
                    { key: "goal", label: "Goal", rows: 3, placeholder: "What were you trying to achieve?" },
                    { key: "outcome", label: "Outcome", rows: 3, placeholder: "What was the result?" },
                  ] as { key: keyof Project; label: string; rows: number; placeholder: string }[]).map((f) => (
                    <Field key={f.key} label={f.label}>
                      <textarea value={String(p[f.key] || "")} onChange={(e) => set(f.key, e.target.value)}
                        rows={f.rows} placeholder={f.placeholder} className={textareaCls} />
                    </Field>
                  ))}
                </SectionCard>

                <SectionCard title="Research & Design Process">
                  <Field label="Research Insights">
                    <textarea value={p.researchInsights} onChange={(e) => set("researchInsights", e.target.value)}
                      rows={4} placeholder="What did you learn from research?" className={textareaCls} />
                  </Field>
                  <Field label="Key Decisions" hint="Shown as a pull quote">
                    <textarea value={p.keyDecisions} onChange={(e) => set("keyDecisions", e.target.value)}
                      rows={3} placeholder="What were the pivotal design decisions?" className={textareaCls} />
                  </Field>
                </SectionCard>

                <SectionCard title="Results & Learnings">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Results">
                      <textarea value={p.results} onChange={(e) => set("results", e.target.value)}
                        rows={4} placeholder="Measurable outcomes..." className={textareaCls} />
                    </Field>
                    <Field label="Learnings">
                      <textarea value={p.learnings} onChange={(e) => set("learnings", e.target.value)}
                        rows={4} placeholder="What did you learn?" className={textareaCls} />
                    </Field>
                  </div>
                </SectionCard>

                <SectionCard title="Section Visibility" desc="Toggle which sections appear in the public case study.">
                  <div className="space-y-3">
                    <ToggleRow label="Show Research Section" desc="Display research insights and process" value={p.showResearch} onChange={(v) => set("showResearch", v)} />
                    <ToggleRow label="Show Wireframes Section" desc="Display wireframe images and notes" value={p.showWireframes} onChange={(v) => set("showWireframes", v)} />
                    <ToggleRow label="Show Prototype Link" desc="Display the prototype link button" value={p.showPrototype} onChange={(v) => set("showPrototype", v)} />
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── METRICS ── */}
            {activeTab === "metrics" && (
              <SectionCard title="Impact Metrics" desc="Shown as large numbers in the Results section of the case study.">
                <div className="space-y-3">
                  {(p.metrics || []).map((m, i) => (
                    <div key={i} className="flex gap-3 items-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-bold font-display flex-shrink-0">{i + 1}</div>
                      <input placeholder="Value (e.g. 87%)" value={m.value}
                        onChange={(e) => { const u = [...(p.metrics || [])]; u[i] = { ...m, value: e.target.value }; set("metrics", u); }}
                        className="w-28 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-body text-sm focus:outline-none focus:border-accent/50 transition-all" />
                      <input placeholder="Label (e.g. User Satisfaction)" value={m.label}
                        onChange={(e) => { const u = [...(p.metrics || [])]; u[i] = { ...m, label: e.target.value }; set("metrics", u); }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-body text-sm focus:outline-none focus:border-accent/50 transition-all" />
                      <button onClick={() => set("metrics", (p.metrics || []).filter((_, j) => j !== i))}
                        className="text-text-secondary hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(p.metrics || []).length === 0 && (
                    <div className="text-center py-8 text-text-secondary text-sm font-body">No metrics yet. Add some below.</div>
                  )}
                </div>
                <button onClick={() => set("metrics", [...(p.metrics || []), { label: "", value: "" }])}
                  className="mt-4 flex items-center gap-2 text-accent text-sm font-body hover:text-accent/80 transition-colors">
                  <Plus size={14} /> Add Metric
                </button>
              </SectionCard>
            )}

            {/* ── SEO & PUBLISH ── */}
            {activeTab === "seo" && (
              <>
                <SectionCard title="Publishing">
                  <div className="grid grid-cols-2 gap-3">
                    {(["draft", "published"] as ProjectStatus[]).map((s) => (
                      <button key={s} onClick={() => set("status", s)}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                          p.status === s ? "border-accent bg-accent/10" : "border-white/10 hover:border-white/30"
                        }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.status === s ? "bg-accent/20" : "bg-white/5"}`}>
                          {s === "published" ? <Globe size={15} className={p.status === s ? "text-accent" : "text-text-secondary"} />
                            : <FileText size={15} className={p.status === s ? "text-accent" : "text-text-secondary"} />}
                        </div>
                        <div>
                          <p className={`text-sm font-body font-bold capitalize ${p.status === s ? "text-accent" : "text-white"}`}>{s}</p>
                          <p className="text-text-secondary text-xs font-body">{s === "published" ? "Visible to everyone" : "Only you can see"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="SEO Settings" desc="Controls how this project appears in search engines and social shares.">
                  <Field label="SEO Title" hint="Defaults to project title">
                    <input value={p.seoTitle || ""} onChange={(e) => set("seoTitle", e.target.value)}
                      placeholder={p.title || "SEO title"} className={inputCls} />
                  </Field>
                  <Field label="Meta Description" hint="150–160 chars recommended">
                    <textarea value={p.seoDescription || ""} onChange={(e) => set("seoDescription", e.target.value)}
                      rows={3} placeholder={p.shortDescription || "Brief description for search engines..."} className={textareaCls} />
                    <p className="text-text-secondary/50 text-xs font-body mt-1">{(p.seoDescription || "").length} / 160</p>
                  </Field>
                  <Field label="Canonical Slug">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
                      <span className="text-text-secondary text-sm font-body">/work/</span>
                      <span className="text-white text-sm font-body">{p.slug || "your-project-slug"}</span>
                    </div>
                  </Field>
                </SectionCard>

                <SectionCard title="Visibility">
                  <ToggleRow label="Featured on homepage" desc="Show in the homepage selected work section" value={p.featured} onChange={(v) => set("featured", v)} />
                </SectionCard>

                {/* Save actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button onClick={() => doSave(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-white text-sm font-body font-medium hover:bg-white/5 transition-colors">
                    <Save size={15} /> Save as Draft
                  </button>
                  <button onClick={() => doSave(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-background text-sm font-body font-bold hover:bg-accent/90 transition-colors">
                    <Globe size={15} /> Publish Now
                  </button>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="font-display font-bold text-white text-base">{title}</h3>
        {desc && <p className="text-text-secondary text-xs font-body mt-0.5">{desc}</p>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-white text-sm font-body font-medium">{label}</p>
        <p className="text-text-secondary text-xs font-body mt-0.5">{desc}</p>
      </div>
      <button onClick={() => onChange(!value)} className="flex-shrink-0 transition-colors">
        {value
          ? <ToggleRight size={28} className="text-accent" />
          : <ToggleLeft size={28} className="text-text-secondary" />
        }
      </button>
    </div>
  );
}
