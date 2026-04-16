import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background:       "#080809",
        surface:          "#0f0f12",
        "surface-subtle": "#141418",
        accent:           "#6C63FF",
        "accent-hover":   "#8880FF",
        "text-1":         "#EEECEA",
        "text-2":         "#7A7A8A",
        "text-3":         "#44445A",
        "text-primary":   "#EEECEA",
        "text-secondary": "#7A7A8A",
        "project-purple": "#7C3AED",
        "project-teal":   "#0D9488",
        "project-blue":   "#2563EB",
      },
      fontFamily: {
        display: ["Clash Display", "sans-serif"],
        body:    ["Satoshi", "sans-serif"],
      },
      fontSize: {
        hero:    ["clamp(3rem,8vw,6.5rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        section: ["clamp(2rem,4vw,3.5rem)",  { lineHeight: "1.08", letterSpacing: "-0.02em" }],
      },
      borderColor: {
        DEFAULT: "rgba(255,255,255,0.06)",
      },
      boxShadow: {
        card:         "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
        "card-hover": "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)",
        accent:       "0 0 20px rgba(108,99,255,0.25)",
        glow:         "0 0 40px rgba(108,99,255,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
