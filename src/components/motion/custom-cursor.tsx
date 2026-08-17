import { useEffect, useState } from "react";

/**
 * Small dot cursor that scales up over interactive elements.
 * Desktop (fine pointer) only, and skipped for prefers-reduced-motion.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);
    document.documentElement.classList.add("has-custom-cursor");

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const loop = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      dot.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (event: MouseEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      setVisible(true);
      const target = event.target as HTMLElement | null;
      setActive(
        Boolean(
          target?.closest(
            'a, button, [role="button"], input, select, textarea, [data-cursor="hover"]',
          ),
        ),
      );
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
      dot.remove();
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = document.querySelector<HTMLElement>(".cursor-dot");
    if (!dot) return;
    dot.dataset["active"] = active ? "true" : "false";
    dot.style.opacity = visible ? "1" : "0";
  }, [enabled, active, visible]);

  return null;
}
