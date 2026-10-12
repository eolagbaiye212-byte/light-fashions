/** `sizes` for a product cell at each grid density (columns on phones / desktop). */
export function cellSizes(cols: { mobile: 1 | 2; desktop: 2 | 4 }) {
  const desk = cols.desktop === 4 ? "25vw" : "50vw";
  const mob = cols.mobile === 1 ? "100vw" : "50vw";
  return `(min-width: 1024px) ${desk}, (min-width: 768px) 33vw, ${mob}`;
}

/** The default grid, also used by product strips and "Wear it with". */
export const CELL_SIZES = cellSizes({ mobile: 2, desktop: 4 });

/**
 * Square packshots on white sit inside the 3:4 cell with breathing room; portrait photographs fill it.
 */
export function fit(img: { width: number; height: number }) {
  return img.width / img.height <= 0.88 ? "object-cover" : "object-contain p-[9%]";
}
