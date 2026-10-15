"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { VIDEO } from "@/lib/media";

/**
 * The runway film, filling the first screen under the header, with a caption bar below it rather
 * than text on the film. The poster is a real (prioritised) image so it paints first; the film only
 * starts downloading once the page has loaded, so it never competes with the poster, and fades in
 * over it once playing. Muted and looping, paused off screen, never autoplayed for reduced motion,
 * and always pausable (WCAG 2.2.2).
 */
/** Gives the film its source the first time it's needed, then plays it. */
function start(v: HTMLVideoElement) {
  if (!v.getAttribute("src")) v.src = VIDEO.runway.src;
  return v.play();
}

export function HeroFilm({ title, detail }: { title: string; detail: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let io: IntersectionObserver | undefined;
    let timer: number | undefined;
    const begin = () => {
      start(v).catch(() => setPlaying(false));
      io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) v.pause();
        else if (v.dataset.userPaused !== "1") v.play().catch(() => {});
      });
      io.observe(v);
    };
    const onLoad = () => (timer = window.setTimeout(begin, 250));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(timer);
      io?.disconnect();
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.dataset.userPaused = "0";
      start(v).catch(() => {});
    } else {
      v.dataset.userPaused = "1";
      v.pause();
    }
  };

  return (
    <section aria-labelledby="hero-title" className="flex h-[calc(100svh-var(--header))] min-h-[28rem] flex-col">
      <div className="relative flex-1 overflow-hidden bg-ink">
        <Image src={VIDEO.runway.poster} alt="" fill preload sizes="100vw" quality={70} className="object-cover" />
        <video
          ref={ref}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
          muted
          loop
          playsInline
          preload="none"
          aria-label="Runway film from the Light Fashion Experience"
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>
      <div className="px-edge grid min-h-12 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-ink py-2 md:grid-cols-[1fr_auto_auto] md:gap-x-8">
        <h1 id="hero-title" className="t-label col-span-2 md:col-span-1">
          {title}
          <span className="hidden sm:inline"> — {detail}</span>
        </h1>
        <button type="button" onClick={toggle} className="t-meta -my-2 justify-self-start py-2 text-grey hover:text-ink md:order-none" aria-label={playing ? "Pause the runway film" : "Play the runway film"}>
          {playing ? "Pause" : "Play"}
        </button>
        <Link href="/shop" className="t-label link justify-self-end">
          Shop the collection
        </Link>
      </div>
    </section>
  );
}
