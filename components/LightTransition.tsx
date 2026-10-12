"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * The signature moment, staged on the runway set itself (photographic plates generated with
 * Higgsfield from the real show set; see DESIGN.md, Generated imagery). As you scroll:
 *   1. Dark: the black ribbed wall comes up faintly around the single amber bar.
 *   2. Warm: the bar swells and dissolves into its own light, which warms the ribs. The verse reads
 *      over this, light on a soft pool of shade, then fades.
 *   3. Revealed: the light finds a figure standing in it, the campaign image.
 *   4. White: the light keeps opening from the bar, soft-edged, until the figure dissolves into white
 *      and the store rises into it.
 * Layers, bottom to top: night, the dark and warm grades of the set (same pixels, so they line up),
 * the campaign figure (cropped so its bar sits where the set's does), the rod, a feathered beam
 * (amber glow + white) blended with `screen`, then the verse.
 *
 * Runs from the scroll timeline where supported (see .light-* in globals.css); elsewhere a rAF
 * fallback writes the same curves into custom properties. JS flips the section's surface for the
 * header once it's white. Reduced motion gets stills: the warm set behind the verse, then the figure.
 */
export function LightTransition() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.static = "true";
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
        // The same phases and curves as the keyframes in globals.css.
        const phase = (from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));
        const inOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
        const out = (t: number) => 1 - Math.pow(1 - t, 3);
        const set = (name: string, v: number) => el.style.setProperty(name, v.toFixed(4));
        set("--plate", out(phase(0, 0.08)));
        set("--warm", inOut(phase(0.05, 0.24)));
        set("--figure", inOut(phase(0.28, 0.42)));
        set("--figure-scale", 1.04 - 0.04 * out(phase(0.28, 0.5)));
        set("--verse", 1 - inOut(phase(0.22, 0.28)));
        set("--beam", 0.002 + inOut(phase(0.5, 0.88)) * 1.998);
        set("--white", inOut(phase(0.54, 0.86)));
        const rod = out(phase(0.04, 0.22));
        set("--rod", 1 - rod);
        set("--rod-scale", 1 + rod * 7);
        set("--halo-scale", 1 + out(phase(0.03, 0.26)) * 2);
      }
      // White by 86%, so the header turns light just before.
      const surface = p > 0.8 ? "day" : "night";
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

  /** A portrait crop for phones and a wide one for larger screens, the bar centred in both. */
  const art = (name: string, alt = "") => (
    <>
      <Image src={`/media/light/${name}-tall.webp`} alt={alt} fill sizes="100vw" quality={80} className="object-cover md:hidden" />
      <Image src={`/media/light/${name}-wide.webp`} alt={alt} fill sizes="100vw" quality={80} className="hidden object-cover md:block" />
    </>
  );
  const figureAlt = "A model in an oversized hood and wide trousers, standing in the light of the amber bar on the runway set";

  return (
    <>
      <section ref={ref} data-surface="night" aria-labelledby="light-verse" className="light group/light relative h-[360vh] data-[static=true]:h-auto">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-night group-data-[static=true]/light:relative group-data-[static=true]/light:h-auto group-data-[static=true]/light:min-h-[80svh]">
          <div aria-hidden="true" className="light-plate absolute inset-0 group-data-[static=true]/light:hidden">
            {art("set-dark")}
          </div>
          <div aria-hidden="true" className="light-warm absolute inset-0">
            {art("set-warm")}
          </div>
          <figure className="light-figure absolute inset-0 m-0 group-data-[static=true]/light:hidden">{art("campaign-figure", figureAlt)}</figure>
          {/* The set melts into the night above and below it. */}
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-night)_0%,transparent_16%,transparent_84%,var(--color-night)_100%)] group-data-[static=true]/light:bg-[linear-gradient(to_bottom,var(--color-night)_0%,transparent_22%,transparent_78%,var(--color-night)_100%)]" />

          <div aria-hidden="true" className="light-halo absolute inset-y-0 left-1/2 w-48 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,oklch(0.792_0.121_78/0.22)_45%,oklch(0.792_0.121_78/0.22)_55%,transparent)] group-data-[static=true]/light:hidden" />
          <div aria-hidden="true" className="light-rod rod absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 group-data-[static=true]/light:hidden" />
          <div aria-hidden="true" className="light-beam absolute inset-0 origin-center group-data-[static=true]/light:hidden">
            <div className="light-glow absolute inset-0 bg-[linear-gradient(90deg,oklch(0.792_0.121_78/0)_0%,var(--color-rod)_22%,var(--color-rod-hot)_50%,var(--color-rod)_78%,oklch(0.792_0.121_78/0)_100%)]" />
            <div className="light-white absolute inset-0 bg-day" />
          </div>

          <div className="light-verse relative grid h-full place-items-center px-[var(--gutter)] py-[var(--space-section)] text-night-ink group-data-[static=true]/light:min-h-[80svh]">
            {/* A soft pool of shade behind the words while the set is dark or amber. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_30%_at_50%_50%,oklch(0.138_0.006_245/0.66),transparent_100%)] md:bg-[radial-gradient(ellipse_34%_30%_at_50%_50%,oklch(0.138_0.006_245/0.62),transparent_100%)]" />
            <figure className="relative text-center">
              <blockquote id="light-verse" className="quote-xl mx-auto max-w-[20ch]">
                For you were once darkness, but now you are light in the Lord. Walk as children of light.
              </blockquote>
              <figcaption className="type-h3 mt-5">Ephesians 5:8</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Reduced motion: the campaign figure as a still, between the verse and the store. */}
      <figure data-surface="night" className="light-figure-still relative m-0 hidden aspect-[4/5] overflow-hidden bg-night md:aspect-[16/9]">
        {art("campaign-figure", figureAlt)}
      </figure>
    </>
  );
}
