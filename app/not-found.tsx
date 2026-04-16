import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-accent text-xs font-body font-bold tracking-widest uppercase mb-4">404</p>
      <h1 className="font-display font-bold text-text-1 mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}>
        Page not found.
      </h1>
      <p className="text-text-2 font-body text-lg max-w-md mb-8">
        Looks like this page doesn&apos;t exist. Maybe it was moved, or you followed a broken link.
      </p>
      <Link href="/"
        className="inline-flex items-center gap-2 bg-accent text-white font-body font-medium px-6 py-3 rounded-xl hover:bg-accent-hover transition-colors">
        <ArrowLeft size={14} /> Back to Home
      </Link>
    </div>
  );
}
