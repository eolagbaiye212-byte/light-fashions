"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bag, bagCount, bagSubtotal, useBag, type BagLine } from "@/lib/bag";
import { checkoutUrl, money } from "@/lib/shop-config";
import { FadeImage } from "./FadeImage";

/** The bag: a white drawer from the right. Lines, quantities, subtotal, then Shopify's checkout. */
export function BagDrawer() {
  const state = useBag();
  const ref = useRef<HTMLDialogElement>(null);
  const [leaving, setLeaving] = useState(false);
  const count = bagCount(state);
  const subtotal = bagSubtotal(state);

  // Coming back from checkout with the browser's back button restores this page from cache.
  useEffect(() => {
    const reset = () => setLeaving(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (state.open && !d.open) d.showModal();
    if (!state.open && d.open) d.close();
  }, [state.open]);

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="bag-title"
      onClose={() => bag.close()}
      onClick={(e) => {
        if (e.target === e.currentTarget) bag.close();
      }}
    >
      <div className="flex h-full flex-col md:border-l md:border-ink">
        <div className="flex h-[var(--header)] shrink-0 items-center justify-between border-b border-ink px-4">
          <h2 id="bag-title" className="t-label">
            Bag <span className="t-meta text-[0.75rem]">({count})</span>
          </h2>
          <button type="button" onClick={() => bag.close()} className="t-label -mr-2 px-2 py-3">
            Close
          </button>
        </div>

        {state.lines.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center gap-6 px-4 pb-24">
            <p className="t-label">Your bag is empty</p>
            <Link href="/shop" onClick={() => bag.close()} className="btn btn-ink self-start">
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-grey overflow-y-auto overscroll-contain">
              {state.lines.map((line) => (
                <Line key={line.variantId} line={line} />
              ))}
            </ul>

            <div className="shrink-0 border-t border-ink px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between">
                <span className="t-label">Subtotal</span>
                <span className="t-price text-[0.875rem]">{money(subtotal)}</span>
              </div>
              <p className="t-meta mt-2 text-grey">Shipping and tax are added at checkout. All sales are final.</p>
              <a
                href={checkoutUrl(state.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })))}
                onClick={() => setLeaving(true)}
                aria-busy={leaving}
                className="btn btn-ink mt-4 w-full"
              >
                {leaving ? "Opening checkout…" : "Checkout"}
              </a>
              <p className="t-meta mt-3 text-center text-grey">Payment by Shopify, including Shop Pay</p>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

function Line({ line }: { line: BagLine }) {
  const label = [line.color, line.variantLabel].filter(Boolean).join(" / ");
  return (
    <li className="flex gap-4 p-4">
      <Link href={`/shop/${line.slug}`} onClick={() => bag.close()} className="relative block aspect-[3/4] w-20 shrink-0 overflow-hidden" tabIndex={-1} aria-hidden="true">
        <FadeImage src={line.image} alt="" fill sizes="80px" className="object-contain" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/shop/${line.slug}`} onClick={() => bag.close()} className="t-label hover:underline">
            {line.name}
          </Link>
          <span className="t-price shrink-0">{money(line.price * line.quantity)}</span>
        </div>
        {label && <p className="t-meta mt-1 text-grey">{label}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          {line.single ? (
            <span className="t-meta">Only one exists</span>
          ) : (
            <div className="flex items-center border border-grey">
              <button
                type="button"
                onClick={() => bag.setQuantity(line.variantId, line.quantity - 1)}
                className="t-meta grid size-10 place-items-center text-[0.875rem]"
                aria-label={`Remove one ${line.name}`}
              >
                −
              </button>
              <span className="t-meta w-6 text-center" aria-live="polite">
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={() => bag.setQuantity(line.variantId, line.quantity + 1)}
                disabled={line.quantity >= 10}
                className="t-meta grid size-10 place-items-center text-[0.875rem] disabled:text-grey"
                aria-label={`Add one more ${line.name}`}
              >
                +
              </button>
            </div>
          )}
          <button type="button" onClick={() => bag.remove(line.variantId)} className="t-meta link min-h-10 text-grey hover:text-ink">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
