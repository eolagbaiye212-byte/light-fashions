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
    image: p.images[0]?.src ?? "",
    single: p.single,
  };
}

/** True when the only choice is size (or nothing), so a size chip can add straight to the bag. */
export function isQuickAddable(p: ProductLite) {
  return p.options.length <= 1;
}
