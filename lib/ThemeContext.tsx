"use client";

/**
 * lib/ThemeContext.tsx
 *
 * Provides the design config to the entire app and injects
 * CSS custom properties into <html> whenever the config changes.
 * No rebuild required — changes are instant.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  DesignConfig,
  defaultDesignConfig,
  getDesignConfig,
  saveDesignConfig,
  configToCssVars,
} from "./themeConfig";

// ── Context ───────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  config:    DesignConfig;
  setConfig: (config: DesignConfig) => void;
  /** Update a subset of the config and persist immediately */
  patch:     (partial: Partial<DesignConfig>) => void;
  /** Reset to factory defaults */
  reset:     () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  config:    defaultDesignConfig,
  setConfig: () => {},
  patch:     () => {},
  reset:     () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<DesignConfig>(defaultDesignConfig);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getDesignConfig();
    setConfigState(stored);
    applyVars(stored);
  }, []);

  const setConfig = useCallback((next: DesignConfig) => {
    setConfigState(next);
    saveDesignConfig(next);
    applyVars(next);
  }, []);

  const patch = useCallback((partial: Partial<DesignConfig>) => {
    setConfigState((prev) => {
      const next: DesignConfig = {
        ...prev,
        ...partial,
        colors:     { ...prev.colors,     ...(partial.colors     ?? {}) },
        typography: { ...prev.typography, ...(partial.typography ?? {}) },
        effects:    { ...prev.effects,    ...(partial.effects    ?? {}) },
        animations: { ...prev.animations, ...(partial.animations ?? {}) },
        sections:   { ...prev.sections,   ...(partial.sections   ?? {}) },
        layout:     { ...prev.layout,     ...(partial.layout     ?? {}) },
      };
      saveDesignConfig(next);
      applyVars(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setConfig(defaultDesignConfig);
  }, [setConfig]);

  return (
    <ThemeContext.Provider value={{ config, setConfig, patch, reset }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme() {
  return useContext(ThemeContext);
}

// ── CSS injection ─────────────────────────────────────────────────────────────

function applyVars(config: DesignConfig) {
  if (typeof document === "undefined") return;
  const vars = configToCssVars(config);
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(vars)) {
    root.style.setProperty(prop, value);
  }

  // Apply animation-disabled class
  if (!config.animations.enabled) {
    root.classList.add("no-animations");
  } else {
    root.classList.remove("no-animations");
  }

  // Apply cursor class
  if (!config.animations.customCursor) {
    root.classList.add("default-cursor");
  } else {
    root.classList.remove("default-cursor");
  }
}
