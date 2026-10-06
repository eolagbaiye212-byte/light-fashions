import Link from "next/link";
import { ViewTransition } from "react";
import type { ProductLite } from "@/lib/product-lite";
import { Price, Status } from "./bits";
import { FadeImage } from "./FadeImage";
import { QuickAdd } from "./QuickAdd";
import { TILE_SIZES, fit } from "@/lib/tile";

export function ProductTile({
  product,
  priority,
  tone = "day",
  morph = true,
}: {
  product: ProductLite;
  priority?: boolean;
  tone?: "day" | "night";
  /** Name the photo for the tile → product page morph. Only one tile per product on a page. */
  morph?: boolean;
}) {
  const [first, second] = product.images;
  const sizeValues = product.options[0]?.values ?? [];
  const inStock = sizeValues.filter((v) => product.variants.some((x) => x.available && x.options.includes(v)));
  const detail =
    product.color ??
    (product.options.length === 1 && inStock.length > 1 ? `${inStock[0]}–${inStock[inStock.length - 1]}` : inStock[0]);

  const photo = (
    <div className={`relative aspect-[4/5] overflow-hidden ${tone === "day" ? "bg-tile" : "bg-night-2"}`}>
      <div className={`absolute inset-0 transition-[opacity,scale] duration-700 ease-expo ${second ? "can-hover:group-hover:opacity-0" : "can-hover:group-hover:scale-[1.03]"} ${!product.available ? "opacity-60" : ""}`}>
        {first && <FadeImage src={first.src} alt="" fill sizes={TILE_SIZES} priority={priority} quality={80} className={fit(first, tone)} />}
      </div>
      {second && (
        <div className="absolute inset-0 scale-[1.04] opacity-0 transition-[opacity,scale] duration-700 ease-expo can-hover:group-hover:scale-100 can-hover:group-hover:opacity-100">
          <FadeImage src={second.src} alt="" fill sizes={TILE_SIZES} quality={80} className={fit(second, tone)} />
        </div>
      )}
    </div>
  );

  return (
    <article className="group relative">
      <div className="relative">
        {morph ? (
          <ViewTransition name={`product-${product.id}`} share="morph" default="none">
            {photo}
          </ViewTransition>
        ) : (
          photo
        )}
        {product.available && <QuickAdd product={product} />}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="text-ui leading-snug font-medium">
          <Link
            href={`/shop/${product.slug}`}
            transitionTypes={["nav-forward"]}
            className="after:absolute after:inset-0 after:content-[''] hover:underline hover:underline-offset-[0.2em]"
          >
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAt={product.compareAt} className="shrink-0 text-ui font-semibold" />
      </div>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-fine">
        {detail && product.available && <span className="muted">{detail}</span>}
        <Status scarcity={product.scarcity} available={product.available} onSale={!!product.compareAt} />
      </p>
    </article>
  );
}
