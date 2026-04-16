"use client";

import { ToggleLeft, ToggleRight, CheckCircle, AlertCircle } from "lucide-react";

export const iCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:bg-white/[0.06] transition-all";
export const tCls = `${iCls} resize-none`;

export function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-body font-medium
      ${type === "success" ? "bg-accent text-white" : "bg-red-500 text-white"}`}>
      {type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

export function SectionCard({ title, desc, children, action }: {
  title: string; desc?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-white text-sm">{title}</h3>
          {desc && <p className="text-white/40 text-xs font-body mt-0.5">{desc}</p>}
        </div>
        {action}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-white/40 text-xs font-body font-medium uppercase tracking-wide">{label}</label>
        {hint && <span className="text-white/25 text-xs font-body">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function ToggleRow({ label, desc, value, onChange }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div>
        <p className="text-white text-sm font-body font-medium">{label}</p>
        {desc && <p className="text-white/40 text-xs font-body mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)} className="flex-shrink-0">
        {value ? <ToggleRight size={26} className="text-accent" /> : <ToggleLeft size={26} className="text-white/30" />}
      </button>
    </div>
  );
}
