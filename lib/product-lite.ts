import type { Product } from "./shopify";

/** The slice of a product that client components need (no descriptions, at most a few images). */
export type ProductLite = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "color"
  | "category"
  | "drop"
  | "scarcity"
  | "looks"
  | "price"
  | "priceMax"
  | "compareAt"
  | "available"
  | "single"
  | "variants"
  | "options"
  | "publishedAt"
> & { images: Product["images"] };

export function toLite(p: Product, imageCount = 2): ProductLite {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    color: p.color,
    category: p.category,
    drop: p.drop,
    scarcity: p.scarcity,
    looks: p.looks,
    price: p.price,
    priceMax: p.priceMax,
    compareAt: p.compareAt,
    available: p.available,
    single: p.single,
    variants: p.variants,
    options: p.options,
    publishedAt: p.publishedAt,
    images: p.images.slice(0, imageCount),
  };
}

/** A colour as it appears in a product URL: …?color=off-white-tee-and-pink-chrome */
export function colorSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A product page link, opened on one colour when the product comes in that colour. */
export function productHref(p: Pick<ProductLite, "slug" | "options">, color?: string) {
  const wanted = color && colorSlug(color);
  const has = wanted && p.options.some((o) => /colou?r/i.test(o.name) && o.values.some((v) => colorSlug(v) === wanted));
  return has ? `/shop/${p.slug}?color=${wanted}` : `/shop/${p.slug}`;
}

export function displayName(p: { name: string; color?: string }) {
  return p.color ? `${p.name}, ${p.color}` : p.name;
}

/** What a bag line needs to know about the piece being added. */
export function lineFor(p: ProductLite, variant: ProductLite["variants"][number]) {
  return {
    variantId: variant.id,
    productId: p.id,
    slug: p.slug,
    name: p.name,
    color: p.color,
    variantLabel: variant.options.join(" / "),
    price: variant.price,
    image: variant.image ?? p.images[0]?.src ?? "",
    single: p.single,
  };
}

/** True when the only choice is size (or nothing), so a size chip can add straight to the bag. */
export function isQuickAddable(p: ProductLite) {
  return p.options.length <= 1;
}
