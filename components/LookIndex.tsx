"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { pad } from "./bits";

/**
 * Sticky 01–16 index for the runway page that follows your scroll. Plain numbers on the night
 * surface; the current look is marked by a short amber line (the rod) that slides to it.
 */
export function LookIndex({ count }: { count: number }) {
  const [current, setCurrent] = useState(1);
  const listRef = useRef<HTMLOListElement>(null);
  const [bar, setBar] = useState<{ x: number; w: number } | null>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-look]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(Number(e.target.getAttribute("data-look")));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Place the marker under the current number, and again whenever the strip changes size.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const place = () => {
      const el = list.querySelector<HTMLElement>(`[data-n="${current}"] a`);
      if (el) setBar({ x: el.offsetLeft + 10, w: el.offsetWidth - 20 });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(list);
    return () => ro.disconnect();
  }, [current]);

  // Keep the current number visible in the strip on small screens.
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-n="${current}"]`);
    if (!list || !el || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [current]);

  return (
    <nav aria-label="Looks" style={{ top: "var(--header-offset, 4rem)" }} className="sticky z-20 bg-night transition-[top] duration-500 ease-expo">
      <ol ref={listRef} className="no-scrollbar container-x relative flex overflow-x-auto py-1">
        {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
          <li key={n} data-n={n}>
            <a
              href={`#look-${n}`}
              aria-current={current === n ? "true" : undefined}
              className={`tabular grid min-h-11 min-w-11 place-items-center px-2.5 text-ui transition-colors duration-300 ${current === n ? "font-medium text-night-ink" : "muted hover:text-night-ink"}`}
            >
              {pad(n)}
            </a>
          </li>
        ))}
        {bar && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 left-0 h-0.5 bg-rod transition-[translate,width] duration-500 ease-expo"
            style={{ translate: `${bar.x}px 0`, width: bar.w }}
          />
        )}
      </ol>
    </nav>
  );
}
