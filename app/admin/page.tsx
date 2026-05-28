
"use client";

import { useState, useEffect, useCallback } from "react";
import { Project, ProjectStatus, SiteContent, defaultSiteContent, Review, Skill } from "@/lib/types";
import { apiGetProjects, apiCreateProject, apiUpdateProject, apiDeleteProject } from "@/lib/api";
import { getSiteContent, saveSiteContent, getReviews, saveReviews, getSkills, saveSkills, defaultReviews, defaultSkills } from "@/lib/siteContent";
import {
  LayoutDashboard, FolderOpen, Plus, Edit2, Trash2, Save,
  Eye, Image as ImageIcon, Search, ExternalLink, Globe, FileText,
  Grid, AlignJustify, Settings, Star, AlertCircle,
  Zap, MessageSquare, Palette, BarChart2, Wand2,
  X, Link as LinkIcon, Menu,
} from "lucide-react";
import Link from "next/link";
import ProjectEditor from "./ProjectEditor";
import DesignView from "./DesignView";
import { iCls, tCls, Toast, SectionCard, Field, ToggleRow } from "@/components/AdminUI";
import { ChevronDown } from "lucide-react";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "arpit2024";

// ── Data hook ─────────────────────────────────────────────────────────────────
function useProjects() {
  const [data, setData] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiGetProjects().then(setData).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const save = useCallback(async (updated: Project[], changedProject?: Project, isNew?: boolean, deletedId?: string) => {
    setData(updated);
    if (deletedId) await apiDeleteProject(deletedId);
    else if (changedProject) {
      if (isNew) await apiCreateProject(changedProject);
      else await apiUpdateProject(changedProject);
    }
  }, []);

  return { data, save, loaded };
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-body font-bold px-2 py-0.5 rounded-full ${
      status === "published" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"
    }`}>
      {status === "published" ? <Globe size={9} /> : <FileText size={9} />}
      {status === "published" ? "Live" : "Draft"}
    </span>
  );
}

type AdminView = "dashboard" | "projects" | "skills" | "reviews" | "content" | "design" | "settings";

const NAV_ITEMS: { id: AdminView; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "dashboard", label: "Dashboard",     icon: LayoutDashboard },
  { id: "projects",  label: "Projects",      icon: FolderOpen },
  { id: "content",   label: "Site Content",  icon: Palette },
  { id: "design",    label: "Design Studio", icon: Wand2 },
  { id: "skills",    label: "Skills",        icon: BarChart2 },
  { id: "reviews",   label: "Reviews",       icon: MessageSquare },
  { id: "settings",  label: "Settings",      icon: Settings },
];

// ── Main AdminPage ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed]     = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);
  const [view, setView]         = useState<AdminView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]     = useState("");
  const [toast, setToast]       = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [editing, setEditing]   = useState<Project | null>(null);
  const [isNew, setIsNew]       = useState(false);

  const { data: projects, save, loaded } = useProjects();

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_PASSWORD) { setAuthError(true); return; }
    if (password === ADMIN_PASSWORD) { setAuthed(true); setAuthError(false); }
    else setAuthError(true);
  };

  const handleEdit = (project: Project) => {
    setEditing({ ...project, images: project.images || [], metrics: project.metrics || [], tags: project.tags || [] });
    setIsNew(false);
  };

  const handleNew = () => {
    setEditing({
      _id: Date.now().toString(), title: "", slug: "", category: "", tags: [],
      shortDescription: "", accentColor: "#6C63FF", thumbnail: "", featured: false,
      status: "draft", role: "UI/UX Designer", timeline: "", client: "", tools: [],
      prototypeLink: "", overview: "", problem: "", goal: "", outcome: "",
      researchInsights: "", keyDecisions: "", results: "", learnings: "",
      metrics: [], images: [], galleryLayout: "grid", showWireframes: true,
      showResearch: true, showPrototype: false, seoTitle: "", seoDescription: "",
      order: projects.length + 1, updatedAt: new Date().toISOString(),
    });
    setIsNew(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    const updated = projects.filter((p) => p._id !== id);
    save(updated, undefined, false, id)
      .then(() => showToast("Project deleted"))
      .catch(() => showToast("Delete failed", "error"));
  };

  const handleSave = (updated: Project, andPublish = false) => {
    const final = { ...updated, status: andPublish ? "published" as ProjectStatus : updated.status, updatedAt: new Date().toISOString() };
    const creating = !projects.find((p) => p._id === final._id);
    const newList = creating ? [...projects, final] : projects.map((p) => (p._id === final._id ? final : p));
    save(newList, final, creating)
      .then(() => { showToast(andPublish ? "Published!" : "Saved as draft"); setEditing(null); })
      .catch(() => showToast("Save failed", "error"));
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: projects.length,
    published: projects.filter((p) => p.status === "published").length,
    drafts: projects.filter((p) => p.status === "draft").length,
    images: projects.reduce((acc, p) => acc + (p.images || []).length, 0),
  };

  // ── LOGIN ──
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
              <Zap size={22} className="text-accent" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Portfolio Admin</h1>
            <p className="text-white/40 text-sm font-body mt-1">Sign in to manage your portfolio</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password" autoFocus
              className={`${iCls} py-3.5`} />
            {authError && (
              <div className="flex items-center gap-2 text-red-400 text-sm font-body bg-red-400/10 px-3 py-2.5 rounded-xl">
                <AlertCircle size={14} /> Incorrect password
              </div>
            )}
            <button type="submit" className="w-full bg-accent text-white font-body font-bold py-3.5 rounded-xl hover:bg-accent-hover transition-colors">
              Sign In
            </button>
          </form>
          <p className="text-center mt-5">
            <Link href="/" className="text-white/30 text-xs font-body hover:text-white transition-colors">← Back to portfolio</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── EDITOR ──
  if (editing) {
    return <ProjectEditor project={editing} isNew={isNew} onSave={handleSave} onBack={() => setEditing(null)} />;
  }

  // ── MAIN SHELL ──
  return (
    <div className="min-h-screen bg-[#080809] flex text-white">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-[#0a0a0c] border-r border-white/[0.05] transition-all duration-300
        ${sidebarOpen ? "w-60 translate-x-0" : "w-60 -translate-x-full lg:translate-x-0 lg:w-60"}`}>

        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-white/[0.05] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-sm">Portfolio OS</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-white/25 text-[10px] font-body font-bold tracking-widest uppercase px-3 py-2">Menu</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setView(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all text-left ${
                view === id
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              }`}>
              <Icon size={15} className="flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.05] space-y-0.5">
          <Link href="/" target="_blank"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">
            <ExternalLink size={14} /> View Live Site
          </Link>
          <button onClick={() => setAuthed(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/40 hover:text-red-400 hover:bg-red-400/[0.06] transition-all">
            <X size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-60">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.05] bg-[#080809]/95 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors">
              <Menu size={16} />
            </button>
            <div className="flex items-center gap-2">
              <Search size={14} className="text-white/30 flex-shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..."
                className="bg-transparent text-white font-body text-sm placeholder:text-white/20 focus:outline-none w-40 md:w-56" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-white/50 text-xs font-body">{stats.published} live</span>
            </div>
            <button onClick={handleNew}
              className="flex items-center gap-2 bg-accent text-white font-body font-semibold text-sm px-3 md:px-4 py-2 rounded-xl hover:bg-accent-hover transition-colors">
              <Plus size={14} /> <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {view === "dashboard" && <DashboardView stats={stats} projects={projects} onEdit={handleEdit} onNew={handleNew} setView={setView} />}
          {view === "projects"  && <ProjectsView  projects={filtered} loaded={loaded} onEdit={handleEdit} onDelete={handleDelete} onNew={handleNew} />}
          {view === "content"   && <ContentView   showToast={showToast} />}
          {view === "design"    && <DesignView     showToast={showToast} />}
          {view === "skills"    && <SkillsView    showToast={showToast} />}
          {view === "reviews"   && <ReviewsView   showToast={showToast} />}
          {view === "settings"  && <SettingsView  showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}

// ── Dashboard View ────────────────────────────────────────────────────────────
function DashboardView({ stats, projects, onEdit, onNew, setView }: {
  stats: { total: number; published: number; drafts: number; images: number };
  projects: Project[];
  onEdit: (p: Project) => void;
  onNew: () => void;
  setView: (v: AdminView) => void;
}) {
  const recent = [...projects].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()).slice(0, 4);

  // Live stats from API
  const [liveStats, setLiveStats] = useState<{ projects: number; screens: number; satisfaction: number; tools: number } | null>(null);
  useEffect(() => {
    fetch("/api/stats/").then((r) => r.json()).then(setLiveStats).catch(() => {});
  }, []);

  const statCards = [
    { label: "Total Projects", value: stats.total,     color: "#6C63FF", icon: FolderOpen },
    { label: "Published",      value: stats.published, color: "#22c55e", icon: Globe },
    { label: "Drafts",         value: stats.drafts,    color: "#f59e0b", icon: FileText },
    { label: "Total Screens",  value: stats.images,    color: "#8b5cf6", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-xl text-white">Dashboard</h1>
        <p className="text-white/40 text-sm font-body mt-0.5">Your portfolio at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-xs font-body uppercase tracking-wide">{s.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}18` }}>
                <s.icon size={13} style={{ color: s.color }} />
              </div>
            </div>
            <p className="font-display font-bold text-2xl text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent projects */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
            <h2 className="font-display font-bold text-white text-sm">Recent Projects</h2>
            <button onClick={() => setView("projects")} className="text-accent text-xs font-body hover:underline">View all</button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recent.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-white/30 text-sm font-body mb-3">No projects yet</p>
                <button onClick={onNew} className="text-accent text-sm font-body hover:underline">Create your first →</button>
              </div>
            ) : recent.map((p) => (
              <div key={p._id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors group">
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.07] relative" style={{ backgroundColor: `${p.accentColor}15` }}>
                  {p.thumbnail
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.thumbnail} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><span className="font-display font-bold text-xs" style={{ color: p.accentColor }}>{p.title[0]}</span></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-white text-sm truncate">{p.title}</p>
                  <p className="text-white/30 text-xs font-body">{p.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status || "draft"} />
                  <button onClick={() => onEdit(p)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-all">
                    <Edit2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h2 className="font-display font-bold text-white text-sm mb-3">Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                { label: "New Project",    icon: Plus,         action: onNew,                        accent: true },
                { label: "Edit Content",   icon: Palette,      action: () => setView("content"),     accent: false },
                { label: "Manage Skills",  icon: BarChart2,    action: () => setView("skills"),      accent: false },
                { label: "Reviews",        icon: MessageSquare,action: () => setView("reviews"),     accent: false },
                { label: "View Live Site", icon: ExternalLink, action: () => window.open("/", "_blank"), accent: false },
              ].map((item) => (
                <button key={item.label} onClick={item.action}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-sm font-body font-medium transition-colors ${
                    item.accent ? "bg-accent/10 hover:bg-accent/20 text-accent" : "bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white"
                  }`}>
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h2 className="font-display font-bold text-white text-sm mb-3">Portfolio Health</h2>
            <div className="space-y-2.5">
              {[
                { label: "Projects live",    ok: stats.published > 0,  val: `${stats.published}/${stats.total}` },
                { label: "Has reviews",      ok: true,                  val: "Active" },
                { label: "Skills updated",   ok: true,                  val: "Active" },
                { label: "Contact email set",ok: !!process.env.NEXT_PUBLIC_CONTACT_EMAIL, val: process.env.NEXT_PUBLIC_CONTACT_EMAIL ? "Set" : "Missing" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-white/40 text-xs font-body">{item.label}</span>
                  <span className={`text-xs font-body font-bold ${item.ok ? "text-green-400" : "text-yellow-400"}`}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live stats from API */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-white text-sm">Live Stats</h2>
              {liveStats && (
                <span className="text-[10px] font-body text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Live</span>
              )}
            </div>
            {!liveStats ? (
              <div className="space-y-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-3 w-20 rounded bg-white/[0.06] animate-pulse" />
                    <div className="h-3 w-8 rounded bg-white/[0.06] animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: "Published projects", val: liveStats.projects },
                  { label: "Total screens",       val: liveStats.screens },
                  { label: "Satisfaction",        val: `${liveStats.satisfaction}%` },
                  { label: "Unique tools",        val: liveStats.tools },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-white/40 text-xs font-body">{item.label}</span>
                    <span className="text-accent text-xs font-body font-bold tabular-nums">{item.val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Projects View ─────────────────────────────────────────────────────────────
function ProjectsView({ projects, loaded, onEdit, onDelete, onNew }: {
  projects: Project[]; loaded: boolean;
  onEdit: (p: Project) => void; onDelete: (id: string) => void; onNew: () => void;
}) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-white">Projects</h1>
          <p className="text-white/40 text-sm font-body mt-0.5">{projects.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 p-1 rounded-lg bg-white/[0.04] border border-white/[0.07]">
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white"}`}><AlignJustify size={13} /></button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/30 hover:text-white"}`}><Grid size={13} /></button>
          </div>
          <button onClick={onNew} className="flex items-center gap-2 bg-accent text-white font-body font-semibold text-sm px-4 py-2 rounded-xl hover:bg-accent-hover transition-colors">
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      {!loaded ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] py-20 text-center">
          <FolderOpen size={36} className="text-white/10 mx-auto mb-3" />
          <p className="font-display font-bold text-white text-base mb-1.5">No projects found</p>
          <p className="text-white/30 text-sm font-body mb-5">Create your first project to get started</p>
          <button onClick={onNew} className="inline-flex items-center gap-2 bg-accent text-white font-body font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-accent-hover transition-colors">
            <Plus size={14} /> Create Project
          </button>
        </div>
      ) : viewMode === "list" ? (
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/[0.05]">
            {["Cover","Project","Screens","Status","Actions"].map((h) => (
              <span key={h} className="text-white/30 text-[10px] font-body font-bold uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-white/[0.04]">
            {projects.map((p) => (
              <div key={p._id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className="w-11 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.07] relative" style={{ backgroundColor: `${p.accentColor}15` }}>
                  {p.thumbnail
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.thumbnail} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={12} className="text-white/20" /></div>
                  }
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-body font-medium text-white text-sm truncate">{p.title}</p>
                    {p.featured && <span className="text-[10px] font-body font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full flex-shrink-0">Featured</span>}
                  </div>
                  <p className="text-white/30 text-xs font-body mt-0.5 truncate">{p.category} · /{p.slug}</p>
                </div>
                <span className="text-white/30 text-xs font-body">{(p.images || []).length}</span>
                <StatusBadge status={p.status || "draft"} />
                <div className="flex items-center gap-1">
                  <Link href={`/work/${p.slug}`} target="_blank" className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-colors"><Eye size={13} /></Link>
                  <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => onDelete(p._id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p) => (
            <div key={p._id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-colors overflow-hidden group">
              <div className="relative aspect-video" style={{ backgroundColor: `${p.accentColor}10` }}>
                {p.thumbnail
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={p.thumbnail} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center"><span className="font-display font-bold text-4xl opacity-10" style={{ color: p.accentColor }}>{p.title[0]}</span></div>
                }
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link href={`/work/${p.slug}`} target="_blank" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"><Eye size={13} /></Link>
                  <button onClick={() => onEdit(p)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => onDelete(p._id)} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="p-3.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-body font-medium text-white text-sm truncate">{p.title}</p>
                  <p className="text-white/30 text-xs font-body mt-0.5">{p.category}</p>
                </div>
                <StatusBadge status={p.status || "draft"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Content View — edit hero, about, stats, social ────────────────────────────
function ContentView({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setContent(getSiteContent()); }, []);

  const set = (key: keyof SiteContent, value: unknown) =>
    setContent((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSaving(true);
    saveSiteContent(content);
    setTimeout(() => { setSaving(false); showToast("Content saved! Refresh the site to see changes."); }, 400);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-white">Site Content</h1>
          <p className="text-white/40 text-sm font-body mt-0.5">Edit hero, about, stats, and social links</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-accent text-white font-body font-semibold text-sm px-4 py-2 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50">
          <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Hero */}
      <SectionCard title="Hero Section" desc="What visitors see first">
        <Field label="Headline" hint="Use \\n for line breaks">
          <textarea value={content.heroHeadline} onChange={(e) => set("heroHeadline", e.target.value)}
            rows={3} className={tCls} />
        </Field>
        <Field label="Subtext">
          <textarea value={content.heroSubtext} onChange={(e) => set("heroSubtext", e.target.value)}
            rows={2} className={tCls} />
        </Field>
        <ToggleRow label="Show availability badge" value={content.heroAvailability} onChange={(v) => set("heroAvailability", v)} />
        {content.heroAvailability && (
          <Field label="Availability text">
            <input value={content.heroAvailabilityText} onChange={(e) => set("heroAvailabilityText", e.target.value)} className={iCls} />
          </Field>
        )}
      </SectionCard>

      {/* About */}
      <SectionCard title="About Section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name"><input value={content.aboutName} onChange={(e) => set("aboutName", e.target.value)} className={iCls} /></Field>
          <Field label="Role"><input value={content.aboutRole} onChange={(e) => set("aboutRole", e.target.value)} className={iCls} /></Field>
          <Field label="Location"><input value={content.aboutLocation} onChange={(e) => set("aboutLocation", e.target.value)} className={iCls} /></Field>
          <Field label="Contact Email"><input value={content.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className={iCls} /></Field>
        </div>
        <Field label="Bio paragraph 1">
          <textarea value={content.aboutBio} onChange={(e) => set("aboutBio", e.target.value)} rows={2} className={tCls} />
        </Field>
        <Field label="Bio paragraph 2">
          <textarea value={content.aboutBio2} onChange={(e) => set("aboutBio2", e.target.value)} rows={2} className={tCls} />
        </Field>
        <Field label="Bio paragraph 3 (subtle)">
          <textarea value={content.aboutBio3} onChange={(e) => set("aboutBio3", e.target.value)} rows={2} className={tCls} />
        </Field>
        <Field label="Availability text (contact page)">
          <input value={content.contactAvailabilityText} onChange={(e) => set("contactAvailabilityText", e.target.value)} className={iCls} />
        </Field>
      </SectionCard>

      {/* Stats */}
      <SectionCard title="Stats / Numbers" desc="Shown in the homepage stats bar"
        action={
          <button onClick={() => set("stats", [...content.stats, { label: "New Stat", value: 0, suffix: "+" }])}
            className="flex items-center gap-1.5 text-accent text-xs font-body hover:text-accent-hover transition-colors">
            <Plus size={12} /> Add
          </button>
        }>
        <div className="space-y-2">
          {content.stats.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={s.value} type="number" onChange={(e) => {
                const u = [...content.stats]; u[i] = { ...s, value: Number(e.target.value) }; set("stats", u);
              }} className={`${iCls} w-20`} />
              <input value={s.suffix} onChange={(e) => {
                const u = [...content.stats]; u[i] = { ...s, suffix: e.target.value }; set("stats", u);
              }} placeholder="+" className={`${iCls} w-16`} />
              <input value={s.label} onChange={(e) => {
                const u = [...content.stats]; u[i] = { ...s, label: e.target.value }; set("stats", u);
              }} placeholder="Label" className={`${iCls} flex-1`} />
              <button onClick={() => set("stats", content.stats.filter((_, j) => j !== i))}
                className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* About Tags */}
      <SectionCard title="About Card Tags" desc="Tags shown on the profile card (homepage & about page)"
        action={
          <button onClick={() => set("aboutTags", [...(content.aboutTags || []), ""])}
            className="flex items-center gap-1.5 text-accent text-xs font-body hover:text-accent-hover transition-colors">
            <Plus size={12} /> Add
          </button>
        }>
        <div className="flex flex-wrap gap-2">
          {(content.aboutTags || []).map((tag, i) => (
            <div key={i} className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1">
              <input value={tag}
                onChange={(e) => { const u = [...(content.aboutTags || [])]; u[i] = e.target.value; set("aboutTags", u); }}
                className="bg-transparent text-white text-xs font-body focus:outline-none w-20" />
              <button onClick={() => set("aboutTags", (content.aboutTags || []).filter((_, j) => j !== i))}
                className="text-white/30 hover:text-red-400 transition-colors">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Education */}
      <SectionCard title="Education" desc="Shown on the About page"
        action={
          <button onClick={() => set("education", [...(content.education || []), { id: Date.now().toString(), degree: "", institution: "", year: "", description: "" }])}
            className="flex items-center gap-1.5 text-accent text-xs font-body hover:text-accent-hover transition-colors">
            <Plus size={12} /> Add
          </button>
        }>
        <div className="space-y-4">
          {(content.education || []).map((e, i) => (
            <div key={e.id} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/40 text-xs font-body font-bold uppercase tracking-wide">Entry {i + 1}</span>
                <button onClick={() => set("education", (content.education || []).filter((_, j) => j !== i))}
                  className="p-1 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Degree / Title">
                  <input value={e.degree} onChange={(ev) => { const u = [...(content.education || [])]; u[i] = { ...e, degree: ev.target.value }; set("education", u); }}
                    placeholder="BCA — Bachelor of Computer Applications" className={iCls} />
                </Field>
                <Field label="Year">
                  <input value={e.year} onChange={(ev) => { const u = [...(content.education || [])]; u[i] = { ...e, year: ev.target.value }; set("education", u); }}
                    placeholder="2022–2025" className={iCls} />
                </Field>
              </div>
              <Field label="Institution">
                <input value={e.institution} onChange={(ev) => { const u = [...(content.education || [])]; u[i] = { ...e, institution: ev.target.value }; set("education", u); }}
                  placeholder="Gujarat University" className={iCls} />
              </Field>
              <Field label="Description">
                <textarea value={e.description} onChange={(ev) => { const u = [...(content.education || [])]; u[i] = { ...e, description: ev.target.value }; set("education", u); }}
                  rows={2} placeholder="Brief description..." className={tCls} />
              </Field>
            </div>
          ))}
          {(content.education || []).length === 0 && (
            <p className="text-white/30 text-sm font-body text-center py-4">No education entries yet. Click Add to create one.</p>
          )}
        </div>
      </SectionCard>

     {/* Social */}
<SectionCard title="Social Links">
  {(
    [
      { key: "linkedinUrl", label: "LinkedIn URL" },
      { key: "behanceUrl", label: "Behance URL" },
      { key: "dribbbleUrl", label: "Dribbble URL" },
      { key: "twitterUrl", label: "Twitter / X URL" },
    ] as { key: keyof SiteContent; label: string }[]
  ).map(({ key, label }) => (
    <Field key={key} label={label}>
      <div className="relative">
        <LinkIcon
          size={13}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
        />
        <input
          value={(content[key] as string) || ""}
          onChange={(e) => set(key, e.target.value)}
          placeholder="https://"
          className={`${iCls} pl-9`}
        />
      </div>
    </Field>
  ))}
</SectionCard>

      {/* Skills marquee */}
      <SectionCard title="Skills Marquee" desc="Comma-separated skills shown in the scrolling marquee">
        <Field label="Row 1">
          <textarea value={content.skillsRow1.join(", ")}
            onChange={(e) => set("skillsRow1", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            rows={3} className={tCls} />
        </Field>
        <Field label="Row 2">
          <textarea value={content.skillsRow2.join(", ")}
            onChange={(e) => set("skillsRow2", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            rows={3} className={tCls} />
        </Field>
      </SectionCard>
    </div>
  );
}

// ── Skills View ───────────────────────────────────────────────────────────────
function SkillsView({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [skills, setSkills] = useState<Skill[]>(defaultSkills);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<Skill["category"]>("tools");

  useEffect(() => { setSkills(getSkills()); }, []);

  const handleSave = () => {
    saveSkills(skills);
    showToast("Skills saved!");
  };

  const addSkill = () => {
    if (!newName.trim()) return;
    setSkills((prev) => [...prev, { id: Date.now().toString(), name: newName.trim(), category: newCat, level: 80, primary: false }]);
    setNewName("");
  };

  const update = (id: string, patch: Partial<Skill>) =>
    setSkills((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));

  const remove = (id: string) => setSkills((prev) => prev.filter((s) => s.id !== id));

  const categories: { id: Skill["category"]; label: string }[] = [
    { id: "ui",    label: "UI Design" },
    { id: "ux",    label: "UX Design" },
    { id: "tools", label: "Tools" },
    { id: "other", label: "Other" },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-white">Skills</h1>
          <p className="text-white/40 text-sm font-body mt-0.5">Manage your skills and proficiency levels</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 bg-accent text-white font-body font-semibold text-sm px-4 py-2 rounded-xl hover:bg-accent-hover transition-colors">
          <Save size={14} /> Save
        </button>
      </div>

      {/* Add new */}
      <SectionCard title="Add Skill">
        <div className="flex gap-2 flex-wrap">
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="Skill name" className={`${iCls} flex-1 min-w-32`} />
          <select value={newCat} onChange={(e) => setNewCat(e.target.value as Skill["category"])} className={`${iCls} w-36`}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <button onClick={addSkill}
            className="flex items-center gap-2 bg-accent text-white font-body font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-accent-hover transition-colors flex-shrink-0">
            <Plus size={14} /> Add
          </button>
        </div>
      </SectionCard>

      {/* Skills by category */}
      {categories.map((cat) => {
        const catSkills = skills.filter((s) => s.category === cat.id);
        if (catSkills.length === 0) return null;
        return (
          <SectionCard key={cat.id} title={cat.label} desc={`${catSkills.length} skills`}>
            <div className="space-y-3">
              {catSkills.map((skill) => (
                <div key={skill.id} className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <input value={skill.name} onChange={(e) => update(skill.id, { name: e.target.value })}
                      className={`${iCls} flex-1`} />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-white/30 text-xs font-body w-8 text-right tabular-nums">{skill.level}%</span>
                      <button onClick={() => update(skill.id, { primary: !skill.primary })}
                        className={`text-xs font-body px-2 py-1 rounded-lg border transition-colors ${
                          skill.primary ? "border-accent/40 text-accent bg-accent/10" : "border-white/[0.07] text-white/30 hover:text-white"
                        }`}>
                        {skill.primary ? "Primary" : "Set Primary"}
                      </button>
                      <button onClick={() => remove(skill.id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  <input type="range" min={0} max={100} value={skill.level}
                    onChange={(e) => update(skill.id, { level: Number(e.target.value) })}
                    className="w-full h-1 accent-accent cursor-pointer" />
                </div>
              ))}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}

// ── Reviews View ──────────────────────────────────────────────────────────────
function ReviewsView({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [reviews, setReviews] = useState<Review[]>(defaultReviews);
  const [editing, setEditing] = useState<Review | null>(null);

  useEffect(() => { setReviews(getReviews()); }, []);

  const handleSave = () => { saveReviews(reviews); showToast("Reviews saved!"); };

  const blank = (): Review => ({
    id: Date.now().toString(), name: "", role: "", company: "",
    text: "", rating: 5, featured: false, date: new Date().toISOString().split("T")[0],
  });

  const save = (r: Review) => {
    setReviews((prev) => prev.find((x) => x.id === r.id) ? prev.map((x) => x.id === r.id ? r : x) : [...prev, r]);
    setEditing(null);
  };

  const remove = (id: string) => setReviews((prev) => prev.filter((r) => r.id !== id));

  if (editing) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="p-2 rounded-xl border border-white/[0.07] text-white/40 hover:text-white transition-colors">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <h1 className="font-display font-bold text-xl text-white">{editing.id && reviews.find((r) => r.id === editing.id) ? "Edit Review" : "New Review"}</h1>
        </div>
        <SectionCard title="Review Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={iCls} /></Field>
            <Field label="Role"><input value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className={iCls} /></Field>
            <Field label="Company"><input value={editing.company} onChange={(e) => setEditing({ ...editing, company: e.target.value })} className={iCls} /></Field>
            <Field label="Date"><input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className={iCls} /></Field>
          </div>
          <Field label="Review Text">
            <textarea value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} rows={4} className={tCls} />
          </Field>
          <div className="flex items-center gap-4">
            <Field label="Rating">
              <div className="flex gap-1">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setEditing({ ...editing, rating: n })}>
                    <Star size={20} className={n <= editing.rating ? "text-yellow-400 fill-yellow-400" : "text-white/20"} />
                  </button>
                ))}
              </div>
            </Field>
            <ToggleRow label="Featured" value={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} />
          </div>
        </SectionCard>
        <div className="flex gap-3">
          <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-white/50 text-sm font-body hover:text-white transition-colors">Cancel</button>
          <button onClick={() => save(editing)} className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-semibold hover:bg-accent-hover transition-colors">Save Review</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-white">Reviews</h1>
          <p className="text-white/40 text-sm font-body mt-0.5">{reviews.length} testimonials</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex items-center gap-2 border border-white/[0.07] text-white/60 hover:text-white font-body text-sm px-4 py-2 rounded-xl transition-colors">
            <Save size={14} /> Save
          </button>
          <button onClick={() => setEditing(blank())} className="flex items-center gap-2 bg-accent text-white font-body font-semibold text-sm px-4 py-2 rounded-xl hover:bg-accent-hover transition-colors">
            <Plus size={14} /> Add Review
          </button>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] py-16 text-center">
          <MessageSquare size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm font-body mb-4">No reviews yet</p>
          <button onClick={() => setEditing(blank())} className="text-accent text-sm font-body hover:underline">Add your first review →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.10] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-body font-semibold text-white text-sm">{r.name || "Unnamed"}</p>
                    {r.featured && <span className="text-[10px] font-body font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">Featured</span>}
                  </div>
                  <p className="text-white/40 text-xs font-body">{r.role}{r.company ? ` · ${r.company}` : ""}</p>
                  <div className="flex gap-0.5 mt-1.5">
                    {[1,2,3,4,5].map((n) => <Star key={n} size={11} className={n <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-white/15"} />)}
                  </div>
                  <p className="text-white/50 text-sm font-body mt-2 leading-relaxed line-clamp-2">{r.text}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditing({ ...r })} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Settings View ─────────────────────────────────────────────────────────────
function SettingsView({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const handleClearCache = () => {
    if (!confirm("This will clear all locally stored data. Are you sure?")) return;
    localStorage.clear();
    showToast("Cache cleared. Refresh the page.");
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-xl text-white">Settings</h1>
        <p className="text-white/40 text-sm font-body mt-0.5">Admin configuration and utilities</p>
      </div>

      <SectionCard title="Environment" desc="Current configuration status">
        <div className="space-y-2.5">
          {[
            { label: "Sanity CMS",     ok: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,           val: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? "Connected" : "Not configured" },
            { label: "Admin Password", ok: !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD,              val: process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? "Set" : "Using default (insecure)" },
            { label: "EmailJS",        ok: !!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,          val: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? "Configured" : "Not configured" },
            { label: "Contact Email",  ok: !!process.env.NEXT_PUBLIC_CONTACT_EMAIL,               val: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "Not set" },
            { label: "Site URL",       ok: !!process.env.NEXT_PUBLIC_SITE_URL,                    val: process.env.NEXT_PUBLIC_SITE_URL || "Not set" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
              <span className="text-white/50 text-sm font-body">{item.label}</span>
              <span className={`text-xs font-body font-semibold ${item.ok ? "text-green-400" : "text-yellow-400"}`}>{item.val}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Quick Links" desc="Navigate to key pages">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Homepage",     href: "/" },
            { label: "Work Page",    href: "/work" },
            { label: "About Page",   href: "/about" },
            { label: "Contact Page", href: "/contact" },
          ].map((l) => (
            <Link key={l.href} href={l.href} target="_blank"
              className="flex items-center gap-2 p-3 rounded-xl border border-white/[0.07] text-white/50 hover:text-white hover:border-white/[0.12] text-sm font-body transition-colors">
              <ExternalLink size={13} /> {l.label}
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Data Management">
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/20">
            <p className="text-white text-sm font-body font-medium mb-1">Clear Local Cache</p>
            <p className="text-white/40 text-xs font-body mb-3">Removes all locally stored projects, skills, reviews, and content. This cannot be undone.</p>
            <button onClick={handleClearCache}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-body font-medium px-4 py-2 rounded-xl transition-colors">
              <Trash2 size={13} /> Clear All Data
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
