"use client";

import { useEffect, useRef, useState } from "react";
import { pad } from "./bits";

/** Sticky 01–16 index for the runway page that follows your scroll. */
export function LookIndex({ count }: { count: number }) {
  const [current, setCurrent] = useState(1);
  const listRef = useRef<HTMLOListElement>(null);

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

  // Keep the active number visible in the strip on small screens.
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-n="${current}"]`);
    if (!list || !el || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [current]);

  return (
    <nav
      aria-label="Looks"
      style={{ top: "var(--header-offset, 4rem)" }}
      className="sticky z-20 border-y border-night-line bg-night/95 transition-[top] duration-500 ease-expo"
    >
      <ol ref={listRef} className="no-scrollbar container-x relative flex gap-1 overflow-x-auto py-2">
        {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
          <li key={n} data-n={n}>
            <a
              href={`#look-${n}`}
              aria-current={current === n ? "true" : undefined}
              className={`tabular grid min-h-10 min-w-11 place-items-center rounded-full px-2 text-ui font-semibold transition-colors ${current === n ? "bg-night-ink text-night" : "muted hover:text-night-ink"}`}
            >
              {pad(n)}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
