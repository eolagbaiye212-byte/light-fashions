import { getImageProps } from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { preload } from "react-dom";
import type { ProductLite } from "@/lib/product-lite";
import type { ProductImage } from "@/lib/shopify";
import { CELL_SIZES, frame } from "@/lib/tile";
import { Price, Tag } from "./bits";

/**
 * A plain <img> with next/image's sources: grids hold dozens of these, and a plain element costs
 * nothing to hydrate. Filled per frame() (cropped, or whole on its own backdrop).
 */
function CellPhoto({
  img,
  alt,
  sizes,
  priority,
  hoverOnly,
  className = "",
}: {
  img: ProductImage;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** The hover photo: only downloaded on devices that can hover. */
  hoverOnly?: boolean;
  className?: string;
}) {
  const { props } = getImageProps({ src: img.src, alt, fill: true, sizes, quality: 80, preload: priority });
  if (priority) preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "high" });
  const fill = frame(img);
  const style = { ...props.style, ...fill.style };
  if (hoverOnly) {
    return (
      <picture>
        <source media="(hover: hover) and (pointer: fine)" srcSet={props.srcSet} sizes={props.sizes} />
        <img src={BLANK} alt={alt} loading="lazy" decoding="async" className={`${fill.className} ${className}`} style={style} />
      </picture>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- next/image's own props, rendered without its client wrapper
  return <img {...props} alt={alt} className={`${fill.className} ${className}`} style={style} />;
}

const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

/**
 * One product in a grid or strip: a 3:4 photo that fills its frame (the second photo on hover, pointer devices only),
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
        <CellPhoto
          img={first}
          alt={first.alt || product.name}
          sizes={sizes}
          priority={priority}
          className={second ? "transition-opacity duration-300 can-hover:group-hover:opacity-0" : ""}
        />
      )}
      {second && <CellPhoto img={second} alt="" sizes={sizes} hoverOnly className="opacity-0 transition-opacity duration-300 can-hover:group-hover:opacity-100" />}
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
