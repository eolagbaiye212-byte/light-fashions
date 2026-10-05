/** One sizes string for every product tile, so the product page can reuse the cached tile image for its morph. */
export const TILE_SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw";

/** Square packshots on white sit inside the tile (multiplied into it on day); portrait shots fill it. */
export function fit(img: { width: number; height: number }, tone: "day" | "night" = "day") {
  if (img.width / img.height <= 0.88) return "object-cover";
  return tone === "day" ? "packshot object-contain p-[7%]" : "object-contain";
}
