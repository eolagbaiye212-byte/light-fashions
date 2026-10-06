"use client";

import { useEffect, useRef } from "react";

/**
 * The signature moment: the amber rod from the runway set widens into white light as you scroll
 * from the show into the shop. The verse is blended with `difference`, so each letter inverts as
 * the light passes behind it.
 *
 * Where the browser supports scroll-driven animations the whole effect runs on the compositor
 * (see .light-* in globals.css). Elsewhere a rAF fallback writes the same progress into
 * --beam / --white. Either way JS also flips the section's surface for the header once it's white.
 */
export function LightTransition() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.static = "true";
      el.dataset.surface = "day";
      return;
    }
    const native = CSS.supports("animation-timeline: view()");
    if (!native) el.dataset.fallback = "true";

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height - window.innerHeight)));
      if (!native) {
        const t = Math.min(1, Math.max(0, (p - 0.12) / 0.66));
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        el.style.setProperty("--beam", String(eased));
        el.style.setProperty("--white", String(Math.min(1, Math.max(0, (eased - 0.18) / 0.5))));
      }
      const surface = p > 0.74 ? "day" : "night";
      if (el.dataset.surface !== surface) {
        el.dataset.surface = surface;
        window.dispatchEvent(new Event("surfacechange"));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={ref} data-surface="night" aria-labelledby="light-verse" className="light group/light relative h-[260vh] data-[static=true]:h-auto">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-night group-data-[static=true]/light:relative group-data-[static=true]/light:h-auto group-data-[static=true]/light:py-[var(--space-section)] group-data-[static=true]/light:bg-day">
        <div aria-hidden="true" className="light-halo absolute inset-y-0 left-1/2 w-48 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,oklch(0.792_0.121_78/0.22)_45%,oklch(0.792_0.121_78/0.22)_55%,transparent)] group-data-[static=true]/light:hidden" />
        <div aria-hidden="true" className="light-rod rod absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 group-data-[static=true]/light:hidden" />
        <div aria-hidden="true" className="light-beam absolute inset-0 origin-center group-data-[static=true]/light:hidden">
          <div className="light-amber absolute inset-0 bg-[linear-gradient(90deg,oklch(0.792_0.121_78/0)_0%,var(--color-rod)_18%,var(--color-rod-hot)_50%,var(--color-rod)_82%,oklch(0.792_0.121_78/0)_100%)]" />
          <div className="light-white absolute inset-0 bg-day" />
        </div>

        <div className="relative grid h-full place-items-center px-[var(--gutter)] text-white mix-blend-difference group-data-[static=true]/light:text-day-ink group-data-[static=true]/light:mix-blend-normal">
          <figure className="text-center">
            <blockquote id="light-verse" className="quote-xl mx-auto max-w-[20ch]">
              For you were once darkness, but now you are light in the Lord. Walk as children of light.
            </blockquote>
            <figcaption className="type-h3 mt-5">Ephesians 5:8</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
