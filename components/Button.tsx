"use client";

import Link from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline" | "subtle";
  size?: "sm" | "md" | "lg";
  className?: string;
  external?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function Button({
  children, href, onClick, variant = "primary", size = "md",
  className, external, type = "button", disabled,
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-body font-medium rounded-xl transition-all duration-150 cursor-pointer select-none";

  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover active:scale-[0.98]",
    ghost:   "bg-white/[0.05] text-text-1 hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.13]",
    outline: "bg-transparent text-accent border border-accent/40 hover:bg-accent hover:text-white hover:border-accent",
    subtle:  "bg-transparent text-text-2 hover:text-text-1",
  };

  const sizes = {
    sm: "text-xs px-3.5 py-1.5",
    md: "text-sm px-4.5 py-2",
    lg: "text-sm px-6 py-3",
  };

  const cls = clsx(base, variants[variant], sizes[size], disabled && "opacity-40 pointer-events-none", className);

  if (href) {
    return (
      <Link href={href} className={cls}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} type={type} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
