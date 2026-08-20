"use client";

import { useEffect, useRef } from "react";

/**
 * Ultra-high-performance Ambient Glow Cursor.
 * Uses hardware-accelerated translate3d without hiding the native OS cursor,
 * giving the stunning luxury aesthetic with ZERO mouse input lag.
 */
export function AmbientCursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on fine-pointer devices (desktops/laptops with real mouse)
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const dot = dotRef.current;
    if (!dot) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.opacity = "1";
    };

    const onMouseLeave = () => {
      dot.style.opacity = "0";
    };

    const render = () => {
      // Smooth lerp (0.18 gives snappy but fluid trailing)
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      dot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-40 -ml-4 -mt-4 h-8 w-8 rounded-full bg-primary/20 blur-md transition-opacity duration-300 will-change-transform opacity-0"
    />
  );
}
