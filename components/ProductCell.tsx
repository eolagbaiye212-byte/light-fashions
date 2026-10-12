import Link from "next/link";
import { ViewTransition } from "react";
import type { ProductLite } from "@/lib/product-lite";
import { CELL_SIZES, fit } from "@/lib/tile";
import { Price, Tag } from "./bits";
import { FadeImage } from "./FadeImage";

/**
 * One product in a grid or strip: a 3:4 image (the second image on hover, pointer devices only),
 * then name, price and a mono tag for scarcity or stock. The whole cell is the link.
 */
export function ProductCell({
  product,
  sizes = CELL_SIZES,
  priority,
  morph = true,
}: {
  product: ProductLite;
  sizes?: string;
  priority?: boolean;
  /** Name the photo for the grid → product page morph. Only one cell per product on a page. */
  morph?: boolean;
}) {
  const [first, second] = product.images;
  const photo = (
    <div className={`relative aspect-[3/4] overflow-hidden ${product.available ? "" : "opacity-50"}`}>
      {first && (
        <FadeImage
          src={first.src}
          alt={first.alt || product.name}
          fill
          sizes={sizes}
          preload={priority}
          quality={80}
          className={`${fit(first)} ${second ? "transition-opacity duration-300 can-hover:group-hover:!opacity-0" : ""}`}
        />
      )}
      {second && (
        <FadeImage
          src={second.src}
          alt=""
          fill
          sizes={sizes}
          quality={80}
          className={`${fit(second)} !opacity-0 transition-opacity duration-300 can-hover:group-hover:!opacity-100`}
        />
      )}
    </div>
  );

  return (
    <Link href={`/shop/${product.slug}`} transitionTypes={["nav-forward"]} className="group block h-full">
      {morph ? (
        <ViewTransition name={`product-${product.id}`} share="morph" default="none">
          {photo}
        </ViewTransition>
      ) : (
        photo
      )}
      <div className="px-edge flex flex-col gap-1 pt-3 pb-5 md:px-3">
        <h3 className="t-label group-hover:underline group-hover:underline-offset-[3px]">{product.name}</h3>
        {product.color && <span className="t-meta text-grey">{product.color}</span>}
        <Price price={product.price} compareAt={product.compareAt} />
        <Tag scarcity={product.scarcity} available={product.available} />
      </div>
    </Link>
  );
}
