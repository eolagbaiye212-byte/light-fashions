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
 * The line a look was built around: scripture, or Myron's own words. Both are quotations, so both
 * are set in the serif; the citation says whose words they are.
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
  const s = { sm: "quote-sm", md: "quote-md", lg: "quote-lg" }[size];
  return (
    <figure className={className}>
      <blockquote className={s}>
        <span aria-hidden="true">“</span>
        {line}
        <span aria-hidden="true">”</span>
      </blockquote>
      <figcaption className="muted mt-3 text-ui">{cite ?? "Myron"}</figcaption>
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

/** The one way a section opens: a title, a short muted intro, an optional action on the right. */
export function SectionHead({
  id,
  title,
  intro,
  action,
  as: Tag = "h2",
}: {
  id: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
      <div className="max-w-3xl">
        <Tag id={id} className={Tag === "h1" ? "type-h1" : "type-h2"}>
          {title}
        </Tag>
        {intro && <p className="muted mt-3 max-w-[52ch] text-lead sm:mt-4">{intro}</p>}
      </div>
      {action && <div className="shrink-0 pb-1.5">{action}</div>}
    </div>
  );
}
