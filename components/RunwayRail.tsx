"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { pad } from "./bits";

export type RailLook = {
  n: number;
  image: ReactNode;
  verse: ReactNode;
  pieces: { slug: string; name: string }[];
};

/**
 * Horizontal walk through the sixteen looks. Native scrolling with snap points, so touch, trackpads,
 * shift-wheel and the keyboard (arrow keys on the focused rail) all work; mouse users can also drag.
 * Two small paging arrows sit under the rail at the right, as on the I.STORYTELL carousels. They're a
 * pointer shortcut and hidden from assistive tech, which already has the arrow keys.
 */
export function RunwayRail({ looks }: { looks: RailLook[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // A pixel of slack: scrollLeft is fractional under zoom and on high-DPI screens.
    const max = el.scrollWidth - el.clientWidth;
    const next = { start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 };
    setEdge((e) => (e.start === next.start && e.end === next.end ? e : next));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener("scroll", schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", schedule);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [measure]);

  /** Scroll to an item's own offset, never a raw distance, so a step always lands on a look's edge. */
  const stops = () => {
    const el = ref.current;
    const items = el ? ([...el.children] as HTMLElement[]) : [];
    const origin = items[0]?.offsetLeft ?? 0;
    return items.map((item) => item.offsetLeft - origin);
  };

  const move = (direction: 1 | -1, byPage: boolean) => {
    const el = ref.current;
    if (!el) return;
    const s = stops();
    if (!s.length) return;
    const stride = s[1] ?? el.clientWidth;
    const step = byPage ? Math.max(1, Math.floor(el.clientWidth / stride)) : 1;
    const current = s.findIndex((stop) => stop >= el.scrollLeft - 1);
    const from = current === -1 ? s.length - 1 : current;
    const target = Math.min(Math.max(from + direction * step, 0), s.length - 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: s[target], behavior: reduce ? "auto" : "smooth" });
  };

  const fits = edge.start && edge.end;

  return (
    <div>
      <ol
        ref={ref}
        tabIndex={0}
        aria-label="The sixteen looks. Use the arrow keys to move between them."
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1, false);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1, false);
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const el = ref.current;
          if (!d || !el) return;
          const dx = e.clientX - d.x;
          if (!d.moved && Math.abs(dx) > 6) {
            d.moved = true;
            el.style.scrollSnapType = "none";
            el.setPointerCapture(e.pointerId);
          }
          if (d.moved) el.scrollLeft = d.left - dx;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          const el = ref.current;
          drag.current = null;
          if (!d?.moved || !el) return;
          el.releasePointerCapture(e.pointerId);
          const s = stops();
          const nearest = s.reduce((best, stop) => (Math.abs(stop - el.scrollLeft) < Math.abs(best - el.scrollLeft) ? stop : best), 0);
          el.scrollTo({ left: nearest, behavior: "smooth" });
          setTimeout(() => (el.style.scrollSnapType = ""), 400);
        }}
        onClickCapture={(e) => {
          // A drag that ends over a link shouldn't open it.
          if (ref.current?.style.scrollSnapType === "none") e.preventDefault();
        }}
        className="rail-fade no-scrollbar relative flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-[var(--gutter)] px-[var(--gutter)] select-none active:cursor-grabbing sm:gap-6"
      >
        {looks.map((look) => (
          <li key={look.n} className="w-[80vw] shrink-0 snap-start xs:w-[68vw] sm:w-[44vw] lg:w-[30vw] xl:w-[24vw]">
            <Link href={`/runway#look-${look.n}`} className="group block" draggable={false}>
              <div className="relative aspect-[1584/2048] overflow-hidden bg-night-2">
                <div className="absolute inset-0 transition-transform duration-700 ease-expo group-hover:scale-[1.03]">
                  {look.image}
                </div>
              </div>
              <span className="sr-only">Look {look.n}: open on the runway page</span>
            </Link>
            {/* The number is set at the verse's own size and leading, so the two share one line and one baseline. */}
            <div className="mt-4 grid grid-cols-[auto_1fr] items-baseline gap-x-3">
              <span className="tabular text-[1.1875rem] leading-[1.38] font-medium text-night-muted" aria-hidden="true">
                {pad(look.n)}
              </span>
              <div className="min-w-0">
                <div className="line-clamp-5">{look.verse}</div>
                {look.pieces.length > 0 && (
                  <p className="mt-3 text-ui">
                    <span className="muted">Worn: </span>
                    {look.pieces.map((p, i) => (
                      <span key={p.slug}>
                        {i > 0 && ", "}
                        <Link href={`/shop/${p.slug}`} className="link" draggable={false}>
                          {p.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
        <li className="flex w-[60vw] shrink-0 snap-start items-center sm:w-[32vw] lg:w-[20vw]">
          <Link href="/runway" className="type-h3 hover:text-rod" draggable={false}>
            The whole show
          </Link>
        </li>
      </ol>

      {!fits && (
        <div aria-hidden="true" className="container-x mt-3 flex justify-end gap-2">
          <RailButton onClick={() => move(-1, true)} disabled={edge.start} label="Previous looks">
            <path d="M15 5 8 12l7 7" />
          </RailButton>
          <RailButton onClick={() => move(1, true)} disabled={edge.end} label="Next looks">
            <path d="m9 5 7 7-7 7" />
          </RailButton>
        </div>
      )}
    </div>
  );
}

function RailButton({ onClick, disabled, label, children }: { onClick: () => void; disabled: boolean; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      tabIndex={-1}
      title={label}
      className="grid size-10 place-items-center rounded-full border border-night-muted/45 text-night-ink transition-[opacity,background-color,color] duration-200 hover:bg-night-ink hover:text-night disabled:pointer-events-none disabled:opacity-30"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {children}
        </g>
      </svg>
    </button>
  );
}
