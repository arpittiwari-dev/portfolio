"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const { config } = useTheme();
  const enabled = config.animations.customCursor && config.animations.enabled;

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring || !enabled) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top  = `${mouseY}px`;
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = `${ringX}px`;
      ring.style.top  = `${ringY}px`;
      animId = requestAnimationFrame(animate);
    };

    const onEnter = () => { dot.classList.add("hovered");  ring.classList.add("hovered"); };
    const onLeave = () => { dot.classList.remove("hovered"); ring.classList.remove("hovered"); };

    document.addEventListener("mousemove", onMouseMove);
    animId = requestAnimationFrame(animate);

    const addListeners = () => {
      document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef}  className="cursor-dot  hidden md:block" />
      <div ref={ringRef} className="cursor-ring hidden md:block" />
    </>
  );
}
