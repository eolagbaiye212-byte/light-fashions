"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { bag, useBag } from "@/lib/bag";
import { lineFor, type ProductLite } from "@/lib/product-lite";
import { money } from "@/lib/shop-config";

type Selection = Record<string, string>;

export function AddToBag({ product, sizeGuide }: { product: ProductLite; sizeGuide?: boolean }) {
  const id = useId();
  const state = useBag();
  const firstMissing = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [barVisible, setBarVisible] = useState(false);

  // Mobile: a slim bar takes over whenever the main button is off screen.
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    // Visible while the main button is off screen, and out of the way once the footer arrives.
    const seen = new Map<Element, boolean>();
    const footer = document.querySelector("footer");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target, e.isIntersecting));
        setBarVisible(!seen.get(el) && !(footer && seen.get(footer)));
      },
      { rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    if (footer) io.observe(footer);
    return () => io.disconnect();
  }, []);

  // Preselect any option with a single value, and the only in-stock variant when there is just one.
  const [selected, setSelected] = useState<Selection>(() => {
    const s: Selection = {};
    product.options.forEach((o) => {
      if (o.values.length === 1) s[o.name] = o.values[0];
    });
    const inStock = product.variants.filter((v) => v.available);
    if (inStock.length === 1) product.options.forEach((o, i) => (s[o.name] = inStock[0].options[i]));
    return s;
  });
  const [status, setStatus] = useState<"idle" | "missing" | "added">("idle");
  // Counts attempts to add without a size, so every attempt (not just the first) leads back to the picker.
  const [attempt, setAttempt] = useState(0);

  // Glide back to the choice that was skipped, then focus it for keyboard and screen-reader users.
  useEffect(() => {
    if (!attempt) return;
    const target = pickerRef.current;
    if (target) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
    firstMissing.current?.focus({ preventScroll: true });
  }, [attempt]);

  useEffect(() => {
    if (status !== "added") return;
    const t = setTimeout(() => setStatus("idle"), 2200);
    return () => clearTimeout(t);
  }, [status]);

  const variant = useMemo(() => {
    if (product.options.length === 0) return product.variants[0];
    if (product.options.some((o) => !selected[o.name])) return undefined;
    return product.variants.find((v) => product.options.every((o, i) => v.options[i] === selected[o.name]));
  }, [product, selected]);

  /** Some variant with this value is in stock (whatever else is chosen). Anything else is sold out. */
  const isPossible = (optIndex: number, value: string) =>
    product.variants.some((v) => v.available && v.options[optIndex] === value);

  /** In stock together with the other choices already made. */
  const isAvailable = (optIndex: number, value: string) =>
    product.variants.some(
      (v) =>
        v.available &&
        v.options[optIndex] === value &&
        product.options.every((o, i) => i === optIndex || !selected[o.name] || v.options[i] === selected[o.name]),
    );

  const inBag = variant ? state.lines.some((l) => l.variantId === variant.id) : false;
  const singleInBag = product.single && inBag;
  const missing = product.options.filter((o) => !selected[o.name]).map((o) => o.name.toLowerCase());

  const add = () => {
    if (!variant) {
      setStatus("missing");
      setAttempt((n) => n + 1);
      return;
    }
    if (!variant.available || singleInBag) return;
    if (bag.add(lineFor(product, variant))) setStatus("added");
  };

  let label: string;
  if (!product.available) label = "Sold out";
  else if (variant && !variant.available) label = "Sold out in this size";
  else if (singleInBag) label = "In your bag";
  else if (status === "added") label = "Added";
  else label = "Add to bag";

  const disabled = !product.available || (!!variant && !variant.available) || singleInBag;

  return (
    <div ref={pickerRef}>
      {product.options.map((option, oi) => {
        const groupId = `${id}-${oi}`;
        const isMissing = status === "missing" && !selected[option.name];
        const isSize = /size/i.test(option.name);
        return (
          <fieldset key={option.name} className="mt-6 first:mt-0" aria-describedby={isMissing ? `${groupId}-err` : undefined}>
            <div className="flex items-baseline justify-between">
              <legend className="t-meta">
                {option.name}
                {selected[option.name] && <span className="text-grey">: {selected[option.name]}</span>}
              </legend>
              {sizeGuide && isSize && (
                <a href="#size-guide" onClick={() => document.getElementById("size-guide")?.setAttribute("open", "")} className="t-meta link">
                  Size guide
                </a>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {option.values.map((value, vi) => {
                const ok = isPossible(oi, value);
                const fits = isAvailable(oi, value);
                const checked = selected[option.name] === value;
                const inputId = `${groupId}-${vi}`;
                return (
                  <span key={value}>
                    <input
                      ref={isMissing && vi === option.values.findIndex((v) => isPossible(oi, v)) ? firstMissing : undefined}
                      id={inputId}
                      type="radio"
                      name={groupId}
                      value={value}
                      checked={checked}
                      disabled={!ok}
                      onChange={() => {
                        // Picking a value that doesn't exist with the other choice clears that choice,
                        // so no combination of picks can lock a shopper out.
                        setSelected((s) => {
                          const next: Selection = { ...s, [option.name]: value };
                          product.options.forEach((o, j) => {
                            if (j === oi || !next[o.name]) return;
                            const exists = product.variants.some((v) => v.available && v.options[oi] === value && v.options[j] === next[o.name]);
                            if (!exists) delete next[o.name];
                          });
                          return next;
                        });
                        if (status === "missing") setStatus("idle");
                      }}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={inputId}
                      className={[
                        "t-meta grid min-h-12 min-w-12 place-items-center border px-3",
                        "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
                        checked
                          ? "border-ink bg-ink text-paper"
                          : !ok
                            ? "cursor-not-allowed border-grey text-grey line-through"
                            : fits
                              ? "cursor-pointer border-grey hover:border-ink"
                              : "cursor-pointer border-grey text-grey hover:border-ink",
                      ].join(" ")}
                    >
                      {value}
                      {!ok ? <span className="sr-only">, sold out</span> : !fits && <span className="sr-only">, not available in your other choice</span>}
                    </label>
                  </span>
                );
              })}
            </div>
            {isMissing && (
              <p id={`${groupId}-err`} role="alert" className="t-meta mt-3 text-alert">
                Select a {option.name.toLowerCase()}
              </p>
            )}
          </fieldset>
        );
      })}

      <div ref={mainRef} className="mt-6 flex flex-col gap-2">
        <button type="button" onClick={add} disabled={disabled} aria-describedby={`${id}-note`} className="btn btn-ink w-full">
          {label}
        </button>
        {(status === "added" || singleInBag) && (
          <button type="button" onClick={() => bag.open()} className="btn btn-line w-full">
            View bag
          </button>
        )}
        <p id={`${id}-note`} className="t-meta mt-1 text-grey">
          {product.single ? "Only one exists. Final sale." : "Final sale. No returns or exchanges."}
        </p>
      </div>

      {/* Phones: a slim bar takes over while the main button is off screen. */}
      <div
        aria-hidden={!barVisible}
        inert={!barVisible}
        className={[
          "fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-ink bg-paper px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden",
          "transition-opacity duration-200",
          barVisible && product.available ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div className="min-w-0 flex-1">
          <p className="t-label truncate">{product.name}</p>
          <p className="t-meta text-grey">
            {money(variant?.price ?? product.price)}
            {product.options.map((o) => selected[o.name]).filter(Boolean).length > 0 &&
              `, ${product.options.map((o) => selected[o.name]).filter(Boolean).join(" / ")}`}
          </p>
        </div>
        <button type="button" onClick={add} disabled={disabled} className="btn btn-ink shrink-0 px-5">
          {singleInBag ? "In your bag" : status === "added" ? "Added" : variant ? "Add to bag" : `Select ${missing[0] ?? "size"}`}
        </button>
      </div>
    </div>
  );
}
