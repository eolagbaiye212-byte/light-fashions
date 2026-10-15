import type { CSSProperties } from "react";
import type { ProductImage } from "./shopify";

/** `sizes` for a product cell at each grid density (columns on phones / desktop). */
export function cellSizes(cols: { mobile: 1 | 2; desktop: 2 | 4 }) {
  const desk = cols.desktop === 4 ? "25vw" : "50vw";
  const mob = cols.mobile === 1 ? "100vw" : "50vw";
  return `(min-width: 768px) ${desk}, ${mob}`;
}

/** The default grid, also used by product strips and "Wear it with". */
export const CELL_SIZES = cellSizes({ mobile: 2, desktop: 4 });

/**
 * Every photo fills its 3:4 frame: portraits are cropped to it; packshots are shown whole on white
 * (off-white backdrops lifted to pure white) or on their own backdrop colour, so no photo ever sits
 * in a box of a different white.
 */
export function frame(img: Pick<ProductImage, "fit" | "backdrop" | "whiten">): { className: string; style?: CSSProperties } {
  const style: CSSProperties = {
    ...(img.fit === "contain" && img.backdrop && { background: img.backdrop }),
    ...(img.whiten && { filter: `brightness(${img.whiten})` }),
  };
  return { className: img.fit === "cover" ? "object-cover" : "object-contain", style: Object.keys(style).length ? style : undefined };
}
