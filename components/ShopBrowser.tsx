"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useOptimistic, useRef, useState, ViewTransition } from "react";
import { CATEGORY_LABEL, type Category } from "@/lib/catalog";
import type { ProductLite } from "@/lib/product-lite";
import { cellSizes } from "@/lib/tile";
import { ProductCell } from "./ProductCell";

const SORTS = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;
type Sort = keyof typeof SORTS;

/** Scarcity values that count as "one of one" in the filter (unchanged from the previous build). */
const ONCE = new Set(["one-of-one", "only-two", "sample", "first"]);
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "4XL"];

type Density = { mobile: 1 | 2; desktop: 2 | 4 };
const DENSITY_KEY = "light.grid.v1";

export function ShopBrowser({ products }: { products: ProductLite[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sheet = useRef<HTMLDialogElement>(null);

  // The grid follows the committed URL (so it can animate); the controls follow an optimistic copy
  // so a tap responds at once while the grid transitions.
  const committed = params.toString();
  const [pendingQs, setPendingQs] = useOptimistic(committed);
  const f = readFilters(new URLSearchParams(committed));
  const ui = readFilters(new URLSearchParams(pendingQs));

  const go = (qs: string) =>
    startTransition(() => {
      setPendingQs(qs);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(pendingQs);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    go(next.toString());
  };

  // Grid density is a viewing preference, kept per browser.
  const [density, setDensity] = useState<Density>({ mobile: 2, desktop: 4 });
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DENSITY_KEY) ?? "null") as Density | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a saved preference after hydration
      if (saved && [1, 2].includes(saved.mobile) && [2, 4].includes(saved.desktop)) setDensity(saved);
    } catch {}
  }, []);
  const setView = (d: Density) => {
    setDensity(d);
    try {
      localStorage.setItem(DENSITY_KEY, JSON.stringify(d));
    } catch {}
  };

  const categories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return (Object.keys(CATEGORY_LABEL) as Category[]).filter((c) => present.has(c));
  }, [products]);

  const sizes = useMemo(() => {
    const all = new Set<string>();
    for (const p of products) {
      const i = p.options.findIndex((o) => /size/i.test(o.name));
      if (i >= 0) p.options[i].values.forEach((v) => all.add(v));
    }
    const rank = (v: string) => {
      const k = SIZE_ORDER.indexOf(v.toUpperCase());
      return k >= 0 ? k : /^\d/.test(v) ? 100 + parseFloat(v) : 1000;
    };
    return [...all].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  }, [products]);

  const visible = useMemo(() => {
    const list = products.filter((p) => {
      if (f.category && p.category !== f.category) return false;
      if (f.onlyOnce && !(p.scarcity && ONCE.has(p.scarcity))) return false;
      if (f.inStock && !p.available) return false;
      if (f.size) {
        const i = p.options.findIndex((o) => /size/i.test(o.name));
        if (i < 0 || !p.variants.some((v) => v.available && v.options[i] === f.size)) return false;
      }
      return true;
    });
    const byStock = (a: ProductLite, b: ProductLite) => Number(b.available) - Number(a.available);
    if (f.sort === "price-asc") list.sort((a, b) => byStock(a, b) || a.price - b.price);
    else if (f.sort === "price-desc") list.sort((a, b) => byStock(a, b) || b.price - a.price);
    else list.sort((a, b) => byStock(a, b) || b.publishedAt.localeCompare(a.publishedAt));
    return list;
  }, [products, f.category, f.onlyOnce, f.inStock, f.size, f.sort]);

  const filtered = Boolean(f.category || f.onlyOnce || f.inStock || f.size);
  const sheetFilters = Number(Boolean(ui.size)) + Number(ui.inStock);
  const count = `${visible.length} ${visible.length === 1 ? "item" : "items"}`;

  const tabs = (
    <div role="group" aria-label="Category" className="flex flex-wrap gap-x-5 gap-y-1">
      <Tab on={!ui.category && !ui.onlyOnce} onClick={() => update({ category: null, only: null })}>
        Everything
      </Tab>
      {categories.map((c) => (
        <Tab key={c} on={ui.category === c} onClick={() => update({ category: ui.category === c ? null : c, only: null })}>
          {CATEGORY_LABEL[c]}
        </Tab>
      ))}
      <Tab on={ui.onlyOnce} onClick={() => update({ only: ui.onlyOnce ? null : "one-of-one", category: null })}>
        One of one
      </Tab>
    </div>
  );

  const sort = (
    <label className="t-label relative flex min-h-11 items-center gap-2">
      <span className="sr-only">Sort by</span>
      <select
        value={ui.sort}
        onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })}
        className="t-label cursor-pointer appearance-none bg-transparent pr-5 [field-sizing:content] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {(Object.keys(SORTS) as Sort[]).map((s) => (
          <option key={s} value={s}>
            {s === "newest" ? "Sort: Newest" : `Sort: ${SORTS[s]}`}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-0">
        ↓
      </span>
    </label>
  );

  const view = (which: "mobile" | "desktop", options: number[], className: string) => (
    <div role="group" aria-label="Columns" className={`t-meta items-center gap-2 ${className}`}>
      <span className="text-grey" aria-hidden="true">
        View
      </span>
      {options.map((n) => (
        <button
          key={n}
          type="button"
          aria-pressed={density[which] === n}
          aria-label={`${n} ${n === 1 ? "column" : "columns"}`}
          onClick={() => setView({ ...density, [which]: n } as Density)}
          className="min-h-11 min-w-6 aria-pressed:underline aria-pressed:decoration-2 aria-pressed:underline-offset-4"
        >
          {n}
        </button>
      ))}
    </div>
  );

  const mobileCols = density.mobile === 1 ? "grid-cols-1" : "grid-cols-2";
  const desktopCols = density.desktop === 2 ? "md:grid-cols-2" : "md:grid-cols-3 lg:grid-cols-4";

  return (
    <div>
      {/* Phones: categories wrap above the sticky bar, every one visible. */}
      <div className="px-edge pb-3 md:hidden">{tabs}</div>

      <div className="sticky top-header z-20 border-y border-ink bg-paper">
        <div className="px-edge flex min-h-12 flex-wrap items-center gap-x-6">
          <div className="hidden flex-1 md:block">{tabs}</div>

          {/* Phones: one FILTER button opens a sheet with size and stock. */}
          <button type="button" onClick={() => sheet.current?.showModal()} aria-haspopup="dialog" className="t-label min-h-11 md:hidden">
            Filter{sheetFilters > 0 && ` (${sheetFilters})`}
          </button>

          {/* Desktop: size and stock sit in the bar. */}
          <label className="t-label relative hidden min-h-11 items-center md:flex">
            <span className="sr-only">Size</span>
            <select
              value={ui.size ?? ""}
              onChange={(e) => update({ size: e.target.value || null })}
              className="t-label cursor-pointer appearance-none bg-transparent pr-5 [field-sizing:content] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <option value="">Size: All</option>
              {sizes.map((s) => (
                <option key={s} value={s}>
                  Size: {s}
                </option>
              ))}
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute right-0">
              ↓
            </span>
          </label>
          <Check label="In stock" on={ui.inStock} onChange={() => update({ stock: ui.inStock ? null : "1" })} className="hidden md:flex" />

          <div className="ml-auto flex items-center gap-6 md:ml-0">
            {sort}
            {view("mobile", [1, 2], "flex md:hidden")}
            {view("desktop", [2, 4], "hidden md:flex")}
          </div>
        </div>
      </div>

      <div className="px-edge flex min-h-11 items-center gap-5">
        <p className="t-meta" aria-live="polite">
          {count}
        </p>
        {filtered && (
          <button type="button" onClick={() => go(ui.sort !== "newest" ? `sort=${ui.sort}` : "")} className="t-meta link">
            Clear filters
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="px-edge border-t border-grey py-24">
          <p className="t-label">Nothing matches these filters.</p>
          <button type="button" onClick={() => go("")} className="btn btn-ink mt-6">
            Show everything
          </button>
        </div>
      ) : (
        <div className="overflow-hidden border-t border-grey">
          <h2 className="sr-only">Products</h2>
          <ul className={`-mr-px grid ${mobileCols} ${desktopCols}`}>
            {visible.map((p, i) => (
              <ViewTransition key={p.id} enter="cell-in" exit="cell-out" update="cell-move" default="none">
                <li className="border-r border-b border-grey">
                  <ProductCell product={p} priority={i < 4} sizes={cellSizes(density)} />
                </li>
              </ViewTransition>
            ))}
          </ul>
        </div>
      )}

      {/* The phone filter sheet. Filters apply as you tap; the button shows the result. */}
      <dialog
        ref={sheet}
        className="sheet"
        aria-labelledby="filter-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) sheet.current?.close();
        }}
      >
        <div className="flex items-center justify-between border-b border-ink px-4">
          <h2 id="filter-title" className="t-label py-4">
            Filter
          </h2>
          <button type="button" onClick={() => sheet.current?.close()} className="t-label -mr-2 px-2 py-4">
            Close
          </button>
        </div>
        <div className="px-4 py-5">
          <h3 className="t-meta text-grey">Size</h3>
          <div role="group" aria-label="Size" className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={ui.size === s}
                onClick={() => update({ size: ui.size === s ? null : s })}
                className="t-meta grid min-h-12 min-w-12 place-items-center border border-grey px-3 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
              >
                {s}
              </button>
            ))}
          </div>
          <h3 className="t-meta mt-6 text-grey">Availability</h3>
          <Check label="In stock only" on={ui.inStock} onChange={() => update({ stock: ui.inStock ? null : "1" })} className="mt-1 flex" />
        </div>
        <div className="flex gap-2 border-t border-ink p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {sheetFilters > 0 && (
            <button type="button" onClick={() => update({ size: null, stock: null })} className="btn btn-line">
              Clear
            </button>
          )}
          <button type="button" onClick={() => sheet.current?.close()} className="btn btn-ink flex-1">
            Show {count}
          </button>
        </div>
      </dialog>
    </div>
  );
}

function Tab({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="t-label min-h-10 whitespace-nowrap underline-offset-[5px] md:min-h-11 hover:underline aria-pressed:underline aria-pressed:decoration-2"
    >
      {children}
    </button>
  );
}

/** A real checkbox, drawn as a square. */
function Check({ label, on, onChange, className }: { label: string; on: boolean; onChange: () => void; className: string }) {
  return (
    <label className={`t-label min-h-11 cursor-pointer items-center gap-2 select-none has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ink ${className}`}>
      <input type="checkbox" checked={on} onChange={onChange} className="sr-only" />
      <span aria-hidden="true" className={`grid size-3.5 place-items-center border border-ink ${on ? "bg-ink" : ""}`}>
        {on && <span className="block size-1.5 bg-paper" />}
      </span>
      {label}
    </label>
  );
}

/** Reads the URL, ignoring anything that isn't a real option (e.g. ?sort=toString). */
function readFilters(p: URLSearchParams) {
  const raw = p.get("sort");
  const cat = p.get("category");
  return {
    category: cat && Object.hasOwn(CATEGORY_LABEL, cat) ? (cat as Category) : null,
    onlyOnce: p.get("only") === "one-of-one",
    inStock: p.get("stock") === "1",
    size: p.get("size"),
    sort: (raw && Object.hasOwn(SORTS, raw) ? raw : "newest") as Sort,
  };
}
