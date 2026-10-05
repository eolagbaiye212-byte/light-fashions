"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, startTransition, useMemo, useOptimistic, ViewTransition, type ReactNode } from "react";
import { CATEGORY_LABEL, type Category } from "@/lib/catalog";
import type { ProductLite } from "@/lib/product-lite";
import { ProductTile } from "./ProductTile";

const SORTS = {
  newest: "Newest",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
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
    "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-ui font-medium transition-[box-shadow,background-color,color] duration-150";
  const off = "shadow-[inset_0_0_0_1px_var(--color-day-line)] hover:shadow-[inset_0_0_0_1px_var(--color-day-ink)]";
  const on = "bg-day-ink text-day";

  return (
    <div>
      <div className="flex flex-col gap-5 border-y border-day-line py-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Category" className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:flex-wrap lg:px-0">
          <button type="button" aria-pressed={!ui.category} onClick={() => set("category", null)} className={`${chip} shrink-0 ${!ui.category ? on : off}`}>
            Everything <span className="tabular opacity-60">{products.length}</span>
          </button>
          {(Object.keys(CATEGORY_LABEL) as Category[])
            .filter((c) => counts.get(c))
            .map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={ui.category === c}
                onClick={() => set("category", ui.category === c ? null : c)}
                className={`${chip} shrink-0 ${ui.category === c ? on : off}`}
              >
                {CATEGORY_LABEL[c]} <span className="tabular opacity-60">{counts.get(c)}</span>
              </button>
            ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-pressed={ui.onlyOnce} onClick={() => set("only", ui.onlyOnce ? null : "one-of-one")} className={`${chip} ${ui.onlyOnce ? on : off}`}>
            One of one
          </button>
          <button type="button" aria-pressed={ui.inStock} onClick={() => set("stock", ui.inStock ? null : "1")} className={`${chip} ${ui.inStock ? on : off}`}>
            In stock
          </button>
          <label className={`${chip} ${off} relative pr-9`}>
            <span className="sr-only">Sort by</span>
            <select
              value={ui.sort}
              onChange={(e) => set("sort", e.target.value === "newest" ? null : e.target.value)}
              className="appearance-none bg-transparent pr-1 outline-none"
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

      <p className="muted mt-6 text-ui" aria-live="polite">
        {visible.length} {visible.length === 1 ? "piece" : "pieces"}
        {filtered && (
          <button type="button" onClick={clear} className="link ml-4 text-day-ink">
            Clear filters
          </button>
        )}
      </p>

      {visible.length === 0 ? (
        <div className="py-24">
          <p className="display text-[clamp(2.5rem,2rem+2vw,4rem)]">Nothing matches those filters.</p>
          <button type="button" onClick={clear} className="btn btn-ink mt-6">
            Show everything
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
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

function readFilters(p: URLSearchParams) {
  const raw = p.get("sort") as Sort | null;
  return {
    category: (p.get("category") as Category | null) ?? null,
    onlyOnce: p.get("only") === "one-of-one",
    inStock: p.get("stock") === "1",
    sort: (raw && raw in SORTS ? raw : "newest") as Sort,
  };
}
