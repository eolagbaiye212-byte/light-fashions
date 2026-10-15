"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, ViewTransition, type CSSProperties } from "react";
import type { ProductImage } from "@/lib/shopify";
import { FadeImage } from "./FadeImage";
import { useStage } from "./ProductStage";

/**
 * One list, two layouts: a swipeable full-bleed strip with a 1/4 counter on phones, a vertical
 * stack on desktop. The first photo is where the grid's photo lands (shared element), so there is
 * only ever one element with that name. Choosing a colour moves that colour's photo to the front.
 * Any photo opens full screen.
 *
 * Every photo fills its frame. Desktop: each frame takes the photo's own proportions, so nothing is
 * cropped or padded. Phones: one frame shape for the whole strip (the first photo's, between 3:4 and
 * square) with every photo cropped to fill it.
 */
export function ProductGallery({ productId, images: all, name }: { productId: number; images: ProductImage[]; name: string }) {
  const strip = useRef<HTMLUListElement>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const { lead } = useStage();

  const phoneRatio = Math.min(Math.max(all[0] ? all[0].width / all[0].height : 0.75, 0.75), 1);

  const images = useMemo(() => {
    const first = all.find((img) => img.src === lead);
    return first ? [first, ...all.filter((img) => img !== first)] : all;
  }, [all, lead]);

  // A new colour: show its photo. Back to the start of the strip, and bring the gallery into view
  // if it has been scrolled away entirely.
  useEffect(() => {
    if (!lead) return;
    const el = strip.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: 0, behavior: reduce ? "auto" : "smooth" });
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header")) * 16 || 48;
    const firstPhoto = el.firstElementChild?.getBoundingClientRect();
    if (firstPhoto && firstPhoto.bottom < header + 80) {
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - header, behavior: reduce ? "auto" : "smooth" });
    }
  }, [lead]);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (zoom !== null && viewer.current && !viewer.current.open) viewer.current.showModal();
  }, [zoom]);

  return (
    <>
      <div className="relative">
        <ul
          ref={strip}
          aria-label={`${name}, photos`}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:flex-col md:gap-px md:overflow-visible md:bg-grey"
        >
          {images.map((img, i) => {
            const photo = (
              <div className="relative aspect-(--phone) bg-paper md:aspect-(--own)" style={{ "--phone": phoneRatio, "--own": `${img.width} / ${img.height}` } as CSSProperties}>
                <FadeImage
                  src={img.src}
                  alt={img.alt || `${name}, photo ${i + 1}`}
                  fill
                  sizes="(min-width: 768px) 58vw, 100vw"
                  preload={i === 0}
                  quality={80}
                  className="object-cover object-[50%_30%] md:object-center"
                />
              </div>
            );
            return (
              <li key={img.src} className="w-full shrink-0 snap-center">
                <button type="button" onClick={() => setZoom(i)} className="block w-full cursor-zoom-in" aria-label={`Open photo ${i + 1} of ${images.length} full screen`}>
                  {i === 0 ? (
                    <ViewTransition name={`product-${productId}`} share="morph" default="none">
                      {photo}
                    </ViewTransition>
                  ) : (
                    photo
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {images.length > 1 && (
          <p className="t-meta pointer-events-none absolute bottom-3 left-[var(--edge)] bg-paper px-1.5 md:hidden" aria-hidden="true">
            {index + 1}/{images.length}
          </p>
        )}
      </div>

      <dialog
        ref={viewer}
        onClose={() => setZoom(null)}
        className="menu"
        aria-label={`${name}, full screen photo`}
      >
        {zoom !== null && (
          <div className="flex h-full flex-col">
            <div className="px-edge flex h-[var(--header)] items-center justify-between border-b border-ink">
              <p className="t-meta">
                {zoom + 1}/{images.length}
              </p>
              <button type="button" autoFocus onClick={() => viewer.current?.close()} className="t-label -mr-2 px-2 py-3">
                Close
              </button>
            </div>
            <div className="relative flex-1">
              <Image key={zoom} src={images[zoom].src} alt={images[zoom].alt || name} fill sizes="100vw" quality={80} className="object-contain" />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-2 border-t border-ink">
                <button type="button" className="t-label min-h-12 border-r border-ink" onClick={() => setZoom((zoom - 1 + images.length) % images.length)}>
                  Previous
                </button>
                <button type="button" className="t-label min-h-12" onClick={() => setZoom((zoom + 1) % images.length)}>
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
