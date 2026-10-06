"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useOptimistic, useRef, useState, ViewTransition, type ReactNode } from "react";
import { CATEGORY_LABEL, type Category } from "@/lib/catalog";
import type { ProductLite } from "@/lib/product-lite";
import { ProductTile } from "./ProductTile";

const SORTS = {
  newest: "Newest",
  "price-asc": "Lowest price",
  "price-desc": "Highest price",
} as const;
type Sort = keyof typeof SORTS;

const ONCE = new Set(["one-of-one", "only-two", "sample", "first"]);

/** The square-edged control used for filters and sort: a thin outline, darkening on hover. */
const boxShape = "inline-flex min-h-11 items-center gap-2.5 rounded-[4px] px-3.5 text-ui transition-shadow duration-150";
const boxEdge = "shadow-[inset_0_0_0_1px_var(--color-day-edge)] hover:shadow-[inset_0_0_0_1px_var(--color-day-ink)]";
const box = `${boxShape} ${boxEdge}`;

export function ShopBrowser({ products }: { products: ProductLite[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sheet = useRef<HTMLDialogElement>(null);

  // The grid follows the committed URL (so it can animate); the controls follow an optimistic copy
  // so a tapped control responds instantly while the grid transitions.
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

  const categories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return (Object.keys(CATEGORY_LABEL) as Category[]).filter((c) => present.has(c));
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
  const activeFilters = Number(ui.onlyOnce) + Number(ui.inStock);
  const toggles = [
    { key: "only", label: "One of one", on: ui.onlyOnce, value: "one-of-one" },
    { key: "stock", label: "In stock", on: ui.inStock, value: "1" },
  ];
  const count = `${visible.length} ${visible.length === 1 ? "piece" : "pieces"}`;

  return (
    <div>
      <CategoryTabs active={ui.category}>
        <Tab on={!ui.category} onClick={() => set("category", null)}>
          Everything
        </Tab>
        {categories.map((c) => (
          <Tab key={c} on={ui.category === c} onClick={() => set("category", ui.category === c ? null : c)}>
            {CATEGORY_LABEL[c]}
          </Tab>
        ))}
      </CategoryTabs>

      <div className="mt-3 flex flex-wrap items-center gap-2 md:mt-4">
        {/* Phones: one Filter button that opens a sheet. */}
        <button
          type="button"
          onClick={() => sheet.current?.showModal()}
          aria-haspopup="dialog"
          className={`${box} flex-1 justify-between md:hidden`}
        >
          <span>
            Filter{activeFilters > 0 && <span className="font-semibold"> ({activeFilters})</span>}
          </span>
          <SlidersIcon />
        </button>

        {/* Larger screens: the toggles sit in the bar. */}
        <div role="group" aria-label="Filter" className="hidden gap-2 md:flex">
          {toggles.map((t) => (
            <Toggle key={t.key} label={t.label} on={t.on} onChange={() => set(t.key, t.on ? null : t.value)} className={boxShape} />
          ))}
        </div>

        <p className="order-last w-full pt-2 text-ui md:order-none md:ml-auto md:w-auto md:pt-0 md:pr-2" aria-live="polite">
          <span className="muted">{count}</span>
          {filtered && (
            <button type="button" onClick={clear} className="link ml-3">
              Clear filters
            </button>
          )}
        </p>

        <label className={`${box} relative flex-1 pr-10 has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-2 has-[select:focus-visible]:outline-day-ink md:flex-none`}>
          <span className="sr-only">Sort by</span>
          <select
            value={ui.sort}
            onChange={(e) => set("sort", e.target.value === "newest" ? null : e.target.value)}
            className="w-full appearance-none bg-transparent outline-none md:w-auto md:[field-sizing:content]"
          >
            {(Object.keys(SORTS) as Sort[]).map((s) => (
              <option key={s} value={s}>
                {SORTS[s]}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" className="pointer-events-none absolute right-3.5" width="12" height="7" viewBox="0 0 12 7" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l5 5 5-5" />
          </svg>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="section-y">
          <p className="type-h2 max-w-[18ch]">Nothing matches those filters.</p>
          <button type="button" onClick={clear} className="btn btn-ink mt-[var(--space-md)]">
            Show everything
          </button>
        </div>
      ) : (
        <ul className="mt-[var(--space-md)] grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:gap-y-11 xl:grid-cols-4">
          {visible.map((p, i) => (
            <ViewTransition key={p.id} enter="tile-in" exit="tile-out" update="tile-move" default="none">
              <li>
                <ProductTile product={p} priority={i < 4} />
              </li>
            </ViewTransition>
          ))}
        </ul>
      )}

      {/* The phone filter sheet. Filters apply as you tap, so the button just shows the result. */}
      <dialog
        ref={sheet}
        className="sheet"
        aria-labelledby="filter-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) sheet.current?.close();
        }}
      >
        <div data-surface="day" className="px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <h2 id="filter-title" className="text-lead font-medium">
              Filter
            </h2>
            <button type="button" onClick={() => sheet.current?.close()} className="min-h-11 rounded-full px-3 text-ui font-medium">
              Close
            </button>
          </div>
          <div role="group" aria-label="Filter" className="mt-3 grid gap-2">
            {toggles.map((t) => (
              <Toggle key={t.key} label={t.label} on={t.on} onChange={() => set(t.key, t.on ? null : t.value)} className={`${boxShape} min-h-12 w-full`} />
            ))}
          </div>
          <div className="mt-5 flex items-center gap-4">
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(pendingQs);
                  next.delete("only");
                  next.delete("stock");
                  go(next.toString());
                }}
                className="link text-ui"
              >
                Clear
              </button>
            )}
            <button type="button" onClick={() => sheet.current?.close()} className="btn btn-ink ml-auto flex-1">
              Show {count}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

/** A filter that's on or off: an outlined box with a check square. A real checkbox underneath. */
function Toggle({ label, on, onChange, className }: { label: string; on: boolean; onChange: () => void; className: string }) {
  return (
    <label
      className={`${className} cursor-pointer select-none has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-day-ink ${on ? "shadow-[inset_0_0_0_1px_var(--color-day-ink)]" : boxEdge}`}
    >
      <input type="checkbox" checked={on} onChange={onChange} className="sr-only" />
      <span
        aria-hidden="true"
        className={`grid size-[1.125rem] shrink-0 place-items-center rounded-[3px] border-[1.5px] border-day-ink transition-colors duration-150 ${on ? "bg-day-ink text-day" : "text-transparent"}`}
      >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M1 4l2.6 2.6L9 1" />
        </svg>
      </span>
      {label}
    </label>
  );
}

function Tab({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={[
        "relative inline-flex min-h-11 shrink-0 snap-start items-center text-ui whitespace-nowrap",
        "after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:origin-left after:bg-day-ink after:transition-transform after:duration-300 after:ease-quint",
        on ? "font-medium after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100 hover:after:h-px",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/**
 * Categories as a row of text tabs. On phones and tablets the row scrolls and runs to the screen
 * edge; whichever edge has more tabs behind it fades and carries a button that pages the row, and
 * the selected tab is kept in view. From lg up everything fits on one line.
 */
function CategoryTabs({ active, children }: { active: string | null; children: ReactNode }) {
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

  // Bring the selected tab into view (instantly on arrival, smoothly after a tap).
  const arrived = useRef(false);
  useEffect(() => {
    const el = ref.current;
    const tab = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!el || !tab || el.scrollWidth <= el.clientWidth) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const left = tab.offsetLeft - pad;
    const right = tab.offsetLeft + tab.offsetWidth + pad - el.clientWidth;
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
        className="tab-rail no-scrollbar relative flex snap-x snap-proximity gap-6 overflow-x-auto overscroll-x-contain scroll-px-[var(--gutter)] px-[var(--gutter)] lg:snap-none lg:flex-wrap lg:gap-x-7 lg:overflow-visible lg:px-0"
      >
        {children}
      </div>
      {/* Pointer shortcuts only: keyboard and screen-reader users move through the tabs themselves. */}
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

function SlidersIcon() {
  return (
    <svg aria-hidden="true" width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 3h9M14 3h3M1 11h3M8 11h9" />
      <circle cx="12" cy="3" r="2" />
      <circle cx="6" cy="11" r="2" />
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
