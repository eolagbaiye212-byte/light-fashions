"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Interpolated wheel scrolling for mouse and trackpad users, so scroll-linked moments (the light,
 * parallax, the header) move continuously instead of in 100px wheel steps. Touch devices keep their
 * native momentum; reduced-motion users keep native scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      wheelMultiplier: 0.95,
      anchors: true,
      stopInertiaOnNavigate: true,
      allowNestedScroll: true,
      prevent: (node) => node.nodeName === "DIALOG",
    });
    window.__lenis = lenis;

    // Freeze page scroll while any modal (bag, menu, photo viewer) is open.
    const sync = () => (document.querySelector("dialog[open]") ? lenis.stop() : lenis.start());
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });

    return () => {
      mo.disconnect();
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // New page: drop any leftover inertia and re-measure the document.
  useEffect(() => {
    const lenis = window.__lenis;
    if (!lenis) return;
    lenis.resize();
  }, [pathname]);

  return null;
}
