"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A horizontal strip: native scrolling with snap points, so touch, trackpads and shift-wheel all
 * work. On pointer devices, ← → buttons sit on the left and right edges at the middle of the images
 * and page by whole items; they step aside at either end. Keyboard users scroll the focused region
 * with the arrow keys, so the buttons are hidden from assistive tech.
 */
export function Carousel({
  label,
  children,
  itemClass,
  arrowTop,
}: {
  label: string;
  children: ReactNode[];
  /** Width classes for each item, e.g. "w-[46vw] md:w-[25vw]". */
  itemClass: string;
  /** Vertical centre of the images, as a CSS length (the items' image height ÷ 2). */
  arrowTop: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = { start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 };
    setEdge((e) => (e.start === next.start && e.end === next.end ? e : next));
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const items = [...(el.firstElementChild?.children ?? [])] as HTMLElement[];
    if (!items.length) return;
    const origin = items[0].offsetLeft;
    const stops = items.map((i) => i.offsetLeft - origin);
    const stride = stops[1] ?? el.clientWidth;
    const perPage = Math.max(1, Math.floor(el.clientWidth / stride));
    const current = stops.findIndex((s) => s >= el.scrollLeft - 1);
    const from = current === -1 ? items.length - 1 : current;
    const target = Math.min(Math.max(from + dir * perPage, 0), items.length - 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: stops[target], behavior: reduce ? "auto" : "smooth" });
  };

  const arrow =
    "t-label absolute z-10 hidden size-11 -translate-y-1/2 place-items-center bg-paper text-[0.875rem] transition-opacity duration-200 can-hover:grid";

  return (
    <div className="relative">
      <div ref={track} role="region" aria-label={label} tabIndex={0} className="no-scrollbar snap-x snap-mandatory overflow-x-auto border-y border-grey">
        <ul className="flex">
          {children.map((child, i) => (
            <li key={i} className={`shrink-0 snap-start border-r border-grey last:border-r-0 ${itemClass}`}>
              {child}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => page(-1)}
        style={{ top: arrowTop }}
        className={`${arrow} left-0 border-y border-r border-grey ${edge.start ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        ←
      </button>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => page(1)}
        style={{ top: arrowTop }}
        className={`${arrow} right-0 border-y border-l border-grey ${edge.end ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        →
      </button>
    </div>
  );
}
