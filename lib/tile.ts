import type { CSSProperties } from "react";
import type { ProductImage } from "./shopify";

/** `sizes` for a product cell at each grid density (columns on phones / desktop). */
export function cellSizes(cols: { mobile: 1 | 2; desktop: 2 | 4 }) {
  const desk = cols.desktop === 4 ? "25vw" : "50vw";
  const mob = cols.mobile === 1 ? "100vw" : "50vw";
  return `(min-width: 1024px) ${desk}, (min-width: 768px) 33vw, ${mob}`;
}

/** The default grid, also used by product strips and "Wear it with". */
export const CELL_SIZES = cellSizes({ mobile: 2, desktop: 4 });

/**
 * Every photo fills its 3:4 frame: portraits are cropped to it; packshots are shown whole and their
 * own backdrop colour fills the rest, so no photo ever sits in a box of different white.
 */
export function frame(img: Pick<ProductImage, "fit" | "backdrop">): { className: string; style?: CSSProperties } {
  return img.fit === "cover"
    ? { className: "object-cover" }
    : { className: "object-contain", style: img.backdrop ? { background: img.backdrop } : undefined };
}
