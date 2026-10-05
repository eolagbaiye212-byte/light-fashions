"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bag } from "@/lib/bag";
import { isQuickAddable, lineFor, type ProductLite } from "@/lib/product-lite";

/** Size chips over the tile image on hover/focus (mouse devices only); touch users open the product. */
export function QuickAdd({ product }: { product: ProductLite }) {
  const [added, setAdded] = useState<number | null>(null);

  useEffect(() => {
    if (added === null) return;
    const t = setTimeout(() => setAdded(null), 1800);
    return () => clearTimeout(t);
  }, [added]);

  const wrap =
    "absolute inset-x-2 bottom-2 z-10 hidden translate-y-1 opacity-0 transition-[opacity,translate] duration-300 ease-quint can-hover:flex can-hover:group-hover:translate-y-0 can-hover:group-hover:opacity-100 can-hover:group-focus-within:translate-y-0 can-hover:group-focus-within:opacity-100";
  const panel = "flex w-full flex-wrap items-center gap-1 rounded-[1.25rem] bg-day/95 p-1.5 text-day-ink shadow-[0_8px_24px_-12px_oklch(0.138_0.006_245/0.5)]";

  if (!isQuickAddable(product)) {
    return (
      <div className={wrap}>
        <Link href={`/shop/${product.slug}`} className={`${panel} justify-center py-2.5 text-fine font-semibold hover:underline`}>
          Choose {product.options.map((o) => o.name.toLowerCase()).join(" and ")}
        </Link>
      </div>
    );
  }

  const add = (variant: ProductLite["variants"][number]) => {
    // A 1 of 1 that's already in the bag can't be added twice; show the bag instead.
    if (bag.add(lineFor(product, variant))) setAdded(variant.id);
    else bag.open();
  };

  if (product.options.length === 0 || product.variants.length === 1) {
    const v = product.variants[0];
    return (
      <div className={wrap}>
        <div className={panel}>
          <button
            type="button"
            onClick={() => add(v)}
            className="min-h-9 flex-1 rounded-full text-fine font-semibold hover:bg-tile"
            aria-label={`Add ${product.name}${v.options.length ? `, ${v.options.join(" ")}` : ""} to bag`}
          >
            {added ? "Added to bag" : v.options.length ? `Add size ${v.options.join(" ")}` : "Add to bag"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={wrap}>
      <div className={panel} role="group" aria-label={`Quick add ${product.name}`}>
        <span className="sr-only" aria-live="polite">
          {added ? "Added to bag" : ""}
        </span>
        {product.options[0].values.map((value) => {
          const v = product.variants.find((x) => x.options[0] === value);
          const ok = !!v?.available;
          const isAdded = v && added === v.id;
          return (
            <button
              key={value}
              type="button"
              disabled={!ok}
              onClick={() => v && add(v)}
              aria-label={ok ? `Add size ${value} to bag` : `Size ${value}, sold out`}
              className={[
                "tabular min-h-9 min-w-10 flex-1 rounded-full px-2 text-fine font-semibold transition-colors",
                ok ? "hover:bg-day-ink hover:text-day" : "muted line-through decoration-1",
                isAdded ? "bg-day-ink text-day" : "",
              ].join(" ")}
            >
              {isAdded ? "Added" : value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
