import Link from "next/link";
import { VIDEO } from "@/lib/media";
import { LoopVideo } from "./LoopVideo";

// Marks the opening as seen before the hero paints, so repeat visits in a session skip it.
const OPENED = `try{if(sessionStorage.getItem("light.opened"))document.documentElement.classList.add("opened");sessionStorage.setItem("light.opened","1")}catch(e){}`;

export function HeroRunway({ count }: { count: number }) {
  return (
    <section
      data-surface="night"
      aria-labelledby="hero-title"
      className="hero-open relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      <script dangerouslySetInnerHTML={{ __html: OPENED }} />

      <div className="hero-reveal absolute inset-0">
        <LoopVideo
          src={VIDEO.runway.src}
          poster={VIDEO.runway.poster}
          label="Runway film from the Light Fashion Experience"
          delay={600}
          className="absolute inset-0 h-full w-full object-cover"
          controlClassName="absolute right-[var(--gutter)] bottom-6 z-10 bg-night/70 text-night-ink hover:bg-night/90"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-night)_0%,oklch(0.138_0.006_245/0.82)_28%,oklch(0.138_0.006_245/0.15)_62%,oklch(0.138_0.006_245/0.55)_100%)]"
        />
      </div>

      <div aria-hidden="true" className="hero-rod rod absolute top-0 left-1/2 h-full w-[3px] -translate-x-1/2 opacity-0 [.hero-open_&]:opacity-100" />

      {/* In normal flow with header clearance: on short screens the hero grows rather than sliding under the logo. */}
      <div className="hero-copy container-x relative pt-[calc(var(--header-h)+var(--space-xl))] pb-[max(4.5rem,9svh)]">
        <p className="text-ui font-medium text-night-ink/85">New York, September 13, 2026</p>
        <h1 id="hero-title" className="type-hero mt-3 max-w-[11ch]">
          Light Fashion Experience
        </h1>
        <p className="mt-5 max-w-[44ch] text-lead text-night-ink/90">
          LIGHT&apos;s first solo show. Sixteen looks, each built around a line of scripture. The collection is in the shop now.
        </p>
        <div className="mt-[var(--space-lg)] flex flex-wrap gap-3">
          <Link href="/shop" className="btn btn-light">
            Shop the collection ({count})
          </Link>
          <Link href="#looks" className="btn btn-ghost">
            See the sixteen looks
          </Link>
        </div>
      </div>
    </section>
  );
}
