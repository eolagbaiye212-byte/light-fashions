import Image from "next/image";
import { media } from "@/lib/media";
import { money } from "@/lib/shop-config";
import { SCARCITY_LABEL, type Scarcity } from "@/lib/catalog";

/** An Instagram photo from the generated media set, with its blur placeholder. */
export function IgImage({
  id,
  alt,
  sizes,
  className,
  priority,
  fill,
}: {
  id: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const m = media(id);
  return fill ? (
    <Image
      src={m.src}
      alt={alt}
      fill
      sizes={sizes}
      placeholder="blur"
      blurDataURL={m.blur}
      priority={priority}
      quality={80}
      className={className}
    />
  ) : (
    <Image
      src={m.src}
      alt={alt}
      width={m.w}
      height={m.h}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={m.blur}
      priority={priority}
      quality={80}
      className={className}
    />
  );
}

/**
 * The line a look was built around. Scripture is set in the Bible face;
 * the designer's own words are set in the poster face.
 */
export function Verse({
  line,
  cite,
  size = "md",
  className = "",
}: {
  line: string;
  cite?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (!cite) {
    const s = { sm: "text-[1.75rem]", md: "text-[clamp(2.25rem,1.6rem+2.4vw,3.75rem)]", lg: "text-[clamp(3rem,2rem+4vw,6rem)]" }[size];
    return (
      <figure className={className}>
        <blockquote className={`display ${s}`}>{line}</blockquote>
        <figcaption className="muted mt-3 text-ui">Myron</figcaption>
      </figure>
    );
  }
  const s = { sm: "text-[1.2rem]", md: "text-[clamp(1.35rem,1.1rem+0.9vw,1.85rem)]", lg: "text-[clamp(1.6rem,1.2rem+1.6vw,2.6rem)]" }[size];
  return (
    <figure className={className}>
      <blockquote className={`scripture ${s}`}>
        <span aria-hidden="true">“</span>
        {line}
        <span aria-hidden="true">”</span>
      </blockquote>
      <figcaption className="muted mt-3 text-ui">{cite}</figcaption>
    </figure>
  );
}

export function Price({
  price,
  priceMax,
  compareAt,
  className = "",
}: {
  price: number;
  priceMax?: number;
  compareAt?: number | null;
  className?: string;
}) {
  return (
    <span className={`tabular ${className}`}>
      {compareAt ? (
        <>
          <span className="sr-only">Sale price </span>
          {money(price)}{" "}
          <s className="muted font-normal">
            <span className="sr-only">was </span>
            {money(compareAt)}
          </s>
        </>
      ) : priceMax && priceMax > price ? (
        `${money(price)}–${money(priceMax)}`
      ) : (
        money(price)
      )}
    </span>
  );
}

/** Scarcity and stock facts. Red is reserved for these. */
export function Status({
  scarcity,
  available,
  onSale,
  className = "",
}: {
  scarcity?: Scarcity;
  available: boolean;
  onSale?: boolean;
  className?: string;
}) {
  const label = !available ? "Sold out" : scarcity ? SCARCITY_LABEL[scarcity] : onSale ? "On sale" : null;
  if (!label) return null;
  return <span className={`text-fine font-semibold ${available ? "signal" : "muted"} ${className}`}>{label}</span>;
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}
