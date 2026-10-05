"use client";

import { FadeImage } from "./FadeImage";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bag, bagCount, bagSubtotal, useBag, type BagLine } from "@/lib/bag";
import { checkoutUrl, money } from "@/lib/shop-config";

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
      <div data-surface="day" className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-day-line px-5">
          <h2 id="bag-title" className="text-lead font-semibold">
            Your bag <span className="muted tabular font-normal">({count})</span>
          </h2>
          <button type="button" onClick={() => bag.close()} className="min-h-11 rounded-full px-3 text-ui font-medium">
            Close
          </button>
        </div>

        {state.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-5 px-5 pb-24">
            <p className="display text-[3.25rem] text-day-ink">Nothing here yet.</p>
            <p className="muted max-w-[32ch]">
              The show collection, one-of-one runway pieces and Light4eva essentials are all in the shop.
            </p>
            <Link href="/shop" onClick={() => bag.close()} className="btn btn-ink">
              Go to the shop
            </Link>
          </div>
        ) : (
          <>
            <ul data-lenis-prevent className="flex-1 divide-y divide-day-line overflow-y-auto overscroll-contain px-5">
              {state.lines.map((line) => (
                <Line key={line.variantId} line={line} />
              ))}
            </ul>

            <div className="shrink-0 border-t border-day-line px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Subtotal</span>
                <span className="tabular text-lead font-semibold">{money(subtotal)}</span>
              </div>
              <p className="muted mt-1 text-fine">
                Shipping and tax are added at checkout. Every sale is final, so check your size before you pay.
              </p>
              <a
                href={checkoutUrl(state.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })))}
                onClick={() => setLeaving(true)}
                aria-busy={leaving}
                className="btn btn-ink mt-4 w-full text-body"
              >
                {leaving ? "Opening secure checkout…" : `Check out, ${money(subtotal)}`}
              </a>
              <p className="muted mt-3 text-center text-fine">Payment is handled by Shopify, including Shop Pay.</p>
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
    <li className="flex gap-4 py-4">
      <Link
        href={`/shop/${line.slug}`}
        onClick={() => bag.close()}
        className="relative block aspect-[4/5] w-20 shrink-0 overflow-hidden bg-tile"
      >
        <FadeImage src={line.image} alt="" fill sizes="80px" className="packshot object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/shop/${line.slug}`} onClick={() => bag.close()} className="font-semibold leading-snug hover:underline">
            {line.name}
          </Link>
          <span className="tabular shrink-0 font-semibold">{money(line.price * line.quantity)}</span>
        </div>
        {label && <p className="muted text-ui">{label}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          {line.single ? (
            <span className="text-fine font-semibold signal">Only one exists</span>
          ) : (
            <div className="inline-flex items-center rounded-full shadow-[inset_0_0_0_1px_var(--color-day-line)]">
              <button
                type="button"
                onClick={() => bag.setQuantity(line.variantId, line.quantity - 1)}
                className="grid size-10 place-items-center rounded-full text-lead"
                aria-label={`Remove one ${line.name}`}
              >
                −
              </button>
              <span className="tabular w-6 text-center text-ui font-semibold" aria-live="polite">
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={() => bag.setQuantity(line.variantId, line.quantity + 1)}
                disabled={line.quantity >= 10}
                className="grid size-10 place-items-center rounded-full text-lead disabled:opacity-40"
                aria-label={`Add one more ${line.name}`}
              >
                +
              </button>
            </div>
          )}
          <button type="button" onClick={() => bag.remove(line.variantId)} className="link muted min-h-10 text-ui">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
