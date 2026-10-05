"use client";

import Image from "next/image";
import { useEffect, useRef, useState, ViewTransition } from "react";
import type { ProductImage } from "@/lib/shopify";
import { FadeImage } from "./FadeImage";
import { TILE_SIZES, fit } from "@/lib/tile";

/**
 * One list, two layouts: a swipeable strip on phones, a two-column stack on desktop.
 * The first photo is the landing spot for the tile → product morph. Underneath it sits the
 * tile-sized image (already cached from the grid), so the morph lands on a real picture and the
 * full-size one fades in over it.
 */
export function ProductGallery({ productId, images, name }: { productId: number; images: ProductImage[]; name: string }) {
  const strip = useRef<HTMLUListElement>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);

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

  const wide = (i: number) => i === 0 || (images.length % 2 === 0 && i === images.length - 1 && images.length > 2);

  return (
    <>
      <div className="relative">
        <ul
          ref={strip}
          aria-label={`${name} photos`}
          className="no-scrollbar relative flex snap-x snap-mandatory overflow-x-auto bg-tile lg:grid lg:snap-none lg:grid-cols-2 lg:gap-2 lg:overflow-visible lg:bg-transparent"
        >
          {images.map((img, i) => {
            const tile = (
              <div className="relative aspect-[4/5] bg-tile">
                {i === 0 && <Image src={img.src} alt="" fill sizes={TILE_SIZES} quality={80} priority className={fit(img)} aria-hidden="true" />}
                <FadeImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={wide(i) ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 29vw, 100vw"}
                  priority={i === 0}
                  quality={80}
                  className={fit(img)}
                />
              </div>
            );
            return (
              <li key={img.src} className={`w-full shrink-0 snap-center lg:w-auto ${wide(i) ? "lg:col-span-2" : ""}`}>
                <button
                  type="button"
                  onClick={() => setZoom(i)}
                  className="block w-full cursor-zoom-in"
                  aria-label={`Open photo ${i + 1} of ${images.length} full screen`}
                >
                  {i === 0 ? (
                    <ViewTransition name={`product-${productId}`} share="morph" default="none">
                      {tile}
                    </ViewTransition>
                  ) : (
                    tile
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {images.length > 1 && (
          <p className="tabular absolute right-3 bottom-3 rounded-full bg-day/90 px-3 py-1 text-fine font-semibold lg:hidden" aria-hidden="true">
            {index + 1} / {images.length}
          </p>
        )}
      </div>

      <dialog
        ref={viewer}
        onClose={() => setZoom(null)}
        onClick={() => viewer.current?.close()}
        className="m-0 h-dvh max-h-dvh w-screen max-w-[100vw] bg-day p-0 backdrop:bg-night/80"
        aria-label={`${name}, full screen photo`}
      >
        {zoom !== null && (
          <div className="relative h-full w-full">
            <FadeImage key={zoom} src={images[zoom].src} alt={images[zoom].alt} fill sizes="100vw" quality={80} className="object-contain" />
            <button type="button" autoFocus onClick={() => viewer.current?.close()} className="btn absolute top-4 right-4 bg-day-ink text-day">
              Close
            </button>
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="btn bg-day-ink text-day" onClick={() => setZoom((zoom - 1 + images.length) % images.length)}>
                  Previous
                </button>
                <button type="button" className="btn bg-day-ink text-day" onClick={() => setZoom((zoom + 1) % images.length)}>
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
