"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, startTransition, useEffect, useMemo, useOptimistic, useRef, useState, ViewTransition, type ReactNode } from "react";
import { CATEGORY_LABEL, type Category } from "@/lib/catalog";
import type { ProductLite } from "@/lib/product-lite";
import { ProductTile } from "./ProductTile";

const SORTS = {
  newest: "Newest",
  "price-asc": "Price, low–high",
  "price-desc": "Price, high–low",
} as const;
type Sort = keyof typeof SORTS;

const ONCE = new Set(["one-of-one", "only-two", "sample", "first"]);

export function ShopBrowser({ products, bands }: { products: ProductLite[]; bands: ReactNode[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // The grid follows the committed URL (so it can animate); the controls follow an optimistic copy
  // so a tapped chip lights up instantly while the grid transitions.
  const committed = params.toString();
  const [pendingQs, setPendingQs] = useOptimistic(committed);
  const { category, onlyOnce, inStock, sort } = readFilters(new URLSearchParams(committed));
  const ui = readFilters(new URLSearchParams(pendingQs));

  const go = (qs: string) =>
    // Inside a transition, so tiles animate out, in and into their new places.
    startTransition(() => {
      setPendingQs(qs);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(pendingQs);
    if (value === null) next.delete(key);
    else next.set(key, value);
    go(next.toString());
  };
  const clear = () => go("");

  const counts = useMemo(() => {
    const c = new Map<Category, number>();
    for (const p of products) c.set(p.category, (c.get(p.category) ?? 0) + 1);
    return c;
  }, [products]);

  const visible = useMemo(() => {
    const list = products.filter(
      (p) =>
        (!category || p.category === category) &&
        (!onlyOnce || (p.scarcity && ONCE.has(p.scarcity))) &&
        (!inStock || p.available),
    );
    const byStock = (a: ProductLite, b: ProductLite) => Number(b.available) - Number(a.available);
    if (sort === "price-asc") list.sort((a, b) => byStock(a, b) || a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => byStock(a, b) || b.price - a.price);
    else list.sort((a, b) => byStock(a, b) || b.publishedAt.localeCompare(a.publishedAt));
    return list;
  }, [products, category, onlyOnce, inStock, sort]);

  const filtered = category || onlyOnce || inStock;
  const chip =
    "inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full px-4 text-ui font-medium whitespace-nowrap transition-[box-shadow,background-color,color] duration-150";
  const off = "shadow-[inset_0_0_0_1px_var(--color-day-edge)] hover:shadow-[inset_0_0_0_1px_var(--color-day-ink)]";
  const on = "bg-day-ink text-day";

  return (
    <div>
      <div className="flex flex-col gap-3 border-y border-day-line py-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8 lg:py-4">
        <CategoryRail active={ui.category}>
          <button type="button" aria-pressed={!ui.category} onClick={() => set("category", null)} className={`${chip} ${!ui.category ? on : off}`}>
            Everything <span className="tabular opacity-65">{products.length}</span>
          </button>
          {(Object.keys(CATEGORY_LABEL) as Category[])
            .filter((c) => counts.get(c))
            .map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={ui.category === c}
                onClick={() => set("category", ui.category === c ? null : c)}
                className={`${chip} ${ui.category === c ? on : off}`}
              >
                {CATEGORY_LABEL[c]} <span className="tabular opacity-65">{counts.get(c)}</span>
              </button>
            ))}
        </CategoryRail>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          <button type="button" aria-pressed={ui.onlyOnce} onClick={() => set("only", ui.onlyOnce ? null : "one-of-one")} className={`${chip} ${ui.onlyOnce ? on : off}`}>
            One of one
          </button>
          <button type="button" aria-pressed={ui.inStock} onClick={() => set("stock", ui.inStock ? null : "1")} className={`${chip} ${ui.inStock ? on : off}`}>
            In stock
          </button>
          <label className={`${chip} ${off} relative ml-auto pr-9 has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-2 has-[select:focus-visible]:outline-day-ink lg:ml-0`}>
            <span className="sr-only">Sort by</span>
            <select
              value={ui.sort}
              onChange={(e) => set("sort", e.target.value === "newest" ? null : e.target.value)}
              className="appearance-none bg-transparent pr-1 outline-none [field-sizing:content]"
            >
              {(Object.keys(SORTS) as Sort[]).map((s) => (
                <option key={s} value={s}>
                  {SORTS[s]}
                </option>
              ))}
            </select>
            <svg aria-hidden="true" className="pointer-events-none absolute right-4" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l4 4 4-4" />
            </svg>
          </label>
        </div>
      </div>

      <p className="muted mt-5 text-ui" aria-live="polite">
        {visible.length} {visible.length === 1 ? "piece" : "pieces"}
        {filtered && (
          <button type="button" onClick={clear} className="link ml-4 text-day-ink">
            Clear filters
          </button>
        )}
      </p>

      {visible.length === 0 ? (
        <div className="section-y">
          <p className="type-h2 max-w-[14ch]">Nothing matches those filters.</p>
          <button type="button" onClick={clear} className="btn btn-ink mt-[var(--space-md)]">
            Show everything
          </button>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:gap-y-12 xl:grid-cols-4">
          {visible.map((p, i) => {
            const band = !filtered && (i + 1) % 8 === 0 ? bands[(i + 1) / 8 - 1] : null;
            return (
              <Fragment key={p.id}>
                <ViewTransition enter="tile-in" exit="tile-out" update="tile-move" default="none">
                  <li>
                    <ProductTile product={p} priority={i < 4} />
                  </li>
                </ViewTransition>
                {band && (
                  <ViewTransition key={`band-${i}`} enter="tile-in" exit="tile-out" update="tile-move" default="none">
                    <li className="col-span-full">{band}</li>
                  </ViewTransition>
                )}
              </Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Categories on phones and tablets: one swipeable row that runs to the screen edge. The edge that
 * has more chips behind it fades out and carries a button that pages the row, so it's always clear
 * there's more and every chip can be reached by swipe or tap. The selected chip is kept in view.
 * From lg up the row simply wraps and nothing scrolls.
 */
function CategoryRail({ active, children }: { active: string | null; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ start: false, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = el.scrollWidth - el.clientWidth;
      const next = { start: el.scrollLeft > 4, end: max > 4 && el.scrollLeft < max - 4 };
      setMore((m) => (m.start === next.start && m.end === next.end ? m : next));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
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
  }, []);

  // Bring the selected chip into view (instantly on arrival, smoothly after a tap).
  const arrived = useRef(false);
  useEffect(() => {
    const el = ref.current;
    const chip = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!el || !chip || el.scrollWidth <= el.clientWidth) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const left = chip.offsetLeft - pad;
    const right = chip.offsetLeft + chip.offsetWidth + pad - el.clientWidth;
    const target = el.scrollLeft > left ? left : el.scrollLeft < right ? right : null;
    if (target !== null) el.scrollTo({ left: target, behavior: arrived.current && !reducedMotion() ? "smooth" : "auto" });
    arrived.current = true;
  }, [active]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  const edge =
    "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-day text-day-ink shadow-[0_0_0_1px_var(--color-day-edge),0_6px_16px_-8px_oklch(0.138_0.006_245/0.35)] transition-opacity duration-200 lg:hidden";

  return (
    <div className="relative -mx-[var(--gutter)] min-w-0 lg:mx-0">
      <div
        ref={ref}
        role="group"
        aria-label="Category"
        data-more-start={more.start || undefined}
        data-more-end={more.end || undefined}
        className="chip-rail no-scrollbar relative flex snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain scroll-px-[var(--gutter)] px-[var(--gutter)] lg:snap-none lg:flex-wrap lg:overflow-visible lg:px-0"
      >
        {children}
      </div>
      {/* Pointer shortcuts only: keyboard and screen-reader users move through the chips themselves. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => page(-1)}
        className={`${edge} left-2 ${more.start ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <Chevron dir={-1} />
      </button>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => page(1)}
        className={`${edge} right-2 ${more.end ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <Chevron dir={1} />
      </button>
    </div>
  );
}

function Chevron({ dir }: { dir: 1 | -1 }) {
  return (
    <svg aria-hidden="true" width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }}>
      <path d="M1.5 1l5 5-5 5" />
    </svg>
  );
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function readFilters(p: URLSearchParams) {
  const raw = p.get("sort") as Sort | null;
  return {
    category: (p.get("category") as Category | null) ?? null,
    onlyOnce: p.get("only") === "one-of-one",
    inStock: p.get("stock") === "1",
    sort: (raw && raw in SORTS ? raw : "newest") as Sort,
  };
}
