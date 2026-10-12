"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Several photographs of one thing (a runway look's angles) in a full-bleed swipeable strip, with a
 * 1/4 counter. On pointer devices ← → buttons sit on the left and right edges at the middle of the
 * image. The frames themselves are server-rendered and passed in.
 */
export function Frames({ label, frames, className = "" }: { label: string; frames: ReactNode[]; className?: string }) {
  const strip = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (dir: 1 | -1) => {
    const el = strip.current;
    if (!el) return;
    const next = Math.min(Math.max(index + dir, 0), frames.length - 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  const arrow =
    "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center bg-paper text-[0.875rem] transition-opacity duration-200 can-hover:grid";

  return (
    <div className={`relative ${className}`}>
      <ul ref={strip} role="region" aria-label={label} tabIndex={0} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto">
        {frames.map((frame, i) => (
          <li key={i} className="relative h-full w-full shrink-0 snap-center" aria-hidden={i !== index || undefined}>
            {frame}
          </li>
        ))}
      </ul>
      {frames.length > 1 && (
        <>
          <p className="t-meta pointer-events-none absolute bottom-3 left-[var(--edge)] bg-paper px-1.5" aria-hidden="true">
            {index + 1}/{frames.length}
          </p>
          <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => go(-1)} className={`${arrow} left-0 ${index === 0 ? "pointer-events-none opacity-0" : ""}`}>
            ←
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => go(1)}
            className={`${arrow} right-0 ${index === frames.length - 1 ? "pointer-events-none opacity-0" : ""}`}
          >
            →
          </button>
        </>
      )}
    </div>
  );
}
