import { useEffect } from "react";

/**
 * Lenis inertia scrolling. Client-only, disabled for prefers-reduced-motion
 * and for touch devices (native momentum is better there).
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !fine) return;

    let raf = 0;
    let destroyed = false;
    let instance: { raf: (t: number) => void; destroy: () => void } | null = null;

    void (async () => {
      const { default: Lenis } = await import("lenis");
      if (destroyed) return;
      const lenis = new Lenis({
        duration: 1.1,
        lerp: 0.09,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      });
      instance = lenis as unknown as { raf: (t: number) => void; destroy: () => void };
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    })();

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      instance?.destroy();
    };
  }, []);

  return null;
}
