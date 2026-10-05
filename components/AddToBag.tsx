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

  // Glide back to the choice that was skipped, then focus it for keyboard and screen-reader users.
  useEffect(() => {
    if (status !== "missing") return;
    const target = pickerRef.current;
    if (target) {
      const lenis = window.__lenis;
      if (lenis) lenis.scrollTo(target, { offset: -120, duration: 0.9 });
      else target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    firstMissing.current?.focus({ preventScroll: true });
  }, [status]);

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
      return;
    }
    if (!variant.available || singleInBag) return;
    if (bag.add(lineFor(product, variant))) setStatus("added");
  };

  let label: string;
  if (!product.available) label = "Sold out";
  else if (variant && !variant.available) label = "Sold out in this size";
  else if (singleInBag) label = "In your bag";
  else if (status === "added") label = "Added to your bag";
  else label = `Add to bag${variant ? `, ${money(variant.price)}` : ""}`;

  const disabled = !product.available || (!!variant && !variant.available) || singleInBag;

  return (
    <div ref={pickerRef}>
      {product.options.map((option, oi) => {
        const groupId = `${id}-${oi}`;
        const isMissing = status === "missing" && !selected[option.name];
        return (
          <fieldset key={option.name} className="mt-7 first:mt-0" aria-describedby={isMissing ? `${groupId}-err` : undefined}>
            <div className="flex items-baseline justify-between">
              <legend className="text-ui font-semibold">
                {option.name}
                {selected[option.name] && <span className="muted font-normal">: {selected[option.name]}</span>}
              </legend>
              {sizeGuide && /size/i.test(option.name) && (
                <a
                  href="#size-guide"
                  onClick={() => document.getElementById("size-guide")?.setAttribute("open", "")}
                  className="link muted text-fine"
                >
                  Size guide
                </a>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {option.values.map((value, vi) => {
                const ok = isAvailable(oi, value);
                const checked = selected[option.name] === value;
                const inputId = `${groupId}-${vi}`;
                return (
                  <span key={value}>
                    <input
                      ref={isMissing && vi === option.values.findIndex((v) => isAvailable(oi, v)) ? firstMissing : undefined}
                      id={inputId}
                      type="radio"
                      name={groupId}
                      value={value}
                      checked={checked}
                      disabled={!ok}
                      onChange={() => {
                        setSelected((s) => ({ ...s, [option.name]: value }));
                        if (status === "missing") setStatus("idle");
                      }}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={inputId}
                      className={[
                        "tabular inline-flex min-h-11 min-w-12 items-center justify-center rounded-full px-4 text-ui font-medium transition-[box-shadow,background-color,color] duration-150",
                        "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-day-ink",
                        checked
                          ? "bg-day-ink text-day"
                          : ok
                            ? "cursor-pointer shadow-[inset_0_0_0_1px_var(--color-day-line)] hover:shadow-[inset_0_0_0_1px_var(--color-day-ink)]"
                            : "muted cursor-not-allowed line-through shadow-[inset_0_0_0_1px_var(--color-day-line)]",
                      ].join(" ")}
                    >
                      {value}
                      {!ok && <span className="sr-only">, sold out</span>}
                    </label>
                  </span>
                );
              })}
            </div>
            {isMissing && (
              <p id={`${groupId}-err`} className="signal mt-2 text-ui font-medium">
                Choose a {option.name.toLowerCase()} first.
              </p>
            )}
          </fieldset>
        );
      })}

      <div ref={mainRef} className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={add}
          disabled={disabled}
          aria-describedby={`${id}-note`}
          className="btn btn-ink w-full text-body"
        >
          {status === "added" && (
            <svg aria-hidden="true" width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 6l5 5L15 1" />
            </svg>
          )}
          {label}
        </button>
        {(status === "added" || singleInBag) && (
          <button type="button" onClick={() => bag.open()} className="btn btn-ghost w-full">
            View bag and check out
          </button>
        )}
        <p id={`${id}-note`} className="muted text-fine" aria-live="polite">
          {status === "missing" && missing.length
            ? `Choose a ${missing.join(" and ")} to add this to your bag.`
            : product.single
              ? "Only one exists. Final sale."
              : "Final sale. No returns or exchanges, so check the size guide."}
        </p>
      </div>

      {/* Mobile buy bar */}
      <div
        aria-hidden={!barVisible}
        inert={!barVisible}
        className={[
          "fixed inset-x-0 bottom-0 z-20 border-t border-day-line bg-day px-4 pt-3 shadow-[0_-12px_32px_-20px_oklch(0.138_0.006_245/0.35)] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-day-ink lg:hidden",
          "transition-[translate,opacity] duration-500 ease-expo",
          barVisible && product.available ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-ui font-semibold">{product.name}</p>
            <p className="muted tabular text-fine">
              {money(variant?.price ?? product.price)}
              {product.options.map((o) => selected[o.name]).filter(Boolean).length > 0 &&
                `, ${product.options.map((o) => selected[o.name]).filter(Boolean).join(" / ")}`}
            </p>
          </div>
          <button type="button" onClick={add} disabled={disabled} className="btn btn-ink shrink-0 px-5">
            {singleInBag ? "In your bag" : status === "added" ? "Added" : variant ? "Add to bag" : `Choose ${missing[0] ?? "size"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
