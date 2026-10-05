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

/** Horizontal walk through the sixteen looks. Scroll-snap, arrow keys, buttons, and mouse drag. */
export function RunwayRail({ looks }: { looks: RailLook[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const step = useCallback(() => {
    const el = ref.current;
    const first = el?.querySelector("li");
    if (!el || !first) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    return first.getBoundingClientRect().width + gap;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const s = step();
        if (s) setIndex(Math.min(looks.length - 1, Math.round(el.scrollLeft / s)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [looks.length, step]);

  const go = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * step(), behavior: "smooth" });
  };

  const atEnd = index >= looks.length - 1;

  return (
    <div>
      <div className="container-x flex items-center justify-between gap-6">
        <p className="tabular text-ui" aria-live="polite">
          <span className="sr-only">Showing look </span>
          <span className="font-semibold">{pad(index + 1)}</span>
          <span className="muted"> of {looks.length}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            className="grid size-12 place-items-center rounded-full shadow-[inset_0_0_0_1px_currentColor] transition-opacity hover:shadow-[inset_0_0_0_2px_currentColor] disabled:opacity-30"
            aria-label="Previous look"
          >
            <Arrow dir={-1} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={atEnd}
            className="grid size-12 place-items-center rounded-full shadow-[inset_0_0_0_1px_currentColor] transition-opacity hover:shadow-[inset_0_0_0_2px_currentColor] disabled:opacity-30"
            aria-label="Next look"
          >
            <Arrow dir={1} />
          </button>
        </div>
      </div>

      <ol
        ref={ref}
        tabIndex={0}
        aria-label="The sixteen looks. Use the arrow keys to move between them."
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
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
          const s = step();
          const target = Math.round(el.scrollLeft / s) * s;
          el.scrollTo({ left: target, behavior: "smooth" });
          setTimeout(() => (el.style.scrollSnapType = ""), 400);
        }}
        onClickCapture={(e) => {
          // A drag that ends over a link shouldn't open it.
          if (ref.current?.style.scrollSnapType === "none") e.preventDefault();
        }}
        className="rail-fade no-scrollbar relative mt-8 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-[var(--gutter)] px-[var(--gutter)] pb-4 select-none active:cursor-grabbing sm:gap-6"
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
            <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-4">
              <span className="display tabular text-[2.75rem] text-night-muted" aria-hidden="true">
                {pad(look.n)}
              </span>
              <div className="min-w-0 pt-1">
                <div className="line-clamp-5">{look.verse}</div>
                {look.pieces.length > 0 && (
                  <p className="mt-4 text-ui">
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
          <Link href="/runway" className="display text-[3rem] hover:text-rod" draggable={false}>
            The whole show
          </Link>
        </li>
      </ol>
    </div>
  );
}

function Arrow({ dir }: { dir: 1 | -1 }) {
  return (
    <svg aria-hidden="true" width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }}>
      <path d="M0 7h16M10 1l6 6-6 6" />
    </svg>
  );
}
