import Image from "next/image";
import Link from "next/link";
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
  style,
}: {
  id: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}) {
  const m = media(id);
  return (
    <Image
      src={m.src}
      alt={alt}
      fill
      sizes={sizes}
      placeholder="blur"
      blurDataURL={m.blur}
      preload={priority}
      quality={80}
      className={className}
      style={style}
    />
  );
}

/**
 * A look's line: scripture, or Myron's own words (which stand unattributed). Set small and quiet in
 * the same face as everything else; scripture's reference follows in mono.
 */
export function Verse({ line, cite, className = "" }: { line: string; cite?: string; className?: string }) {
  return (
    <figure className={className}>
      <blockquote className="t-body">
        <span aria-hidden="true">“</span>
        {line}
        <span aria-hidden="true">”</span>
      </blockquote>
      {cite && <figcaption className="t-meta mt-2 text-grey">{cite}</figcaption>}
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
    <span className={`t-price ${className}`}>
      {compareAt ? (
        <>
          <span className="sr-only">Sale price </span>
          <span className="text-alert">{money(price)}</span>{" "}
          <s className="text-grey">
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

/** Scarcity and stock facts, in mono. Plain statements, never banners. */
export function Tag({ scarcity, available, className = "" }: { scarcity?: Scarcity; available: boolean; className?: string }) {
  const label = !available ? "Sold out" : scarcity ? SCARCITY_LABEL[scarcity] : null;
  if (!label) return null;
  return <span className={`t-meta ${available ? "" : "text-grey"} ${className}`}>{label}</span>;
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** A section's opening line: a small label on the left, an optional link or count on the right. */
export function SectionBar({
  id,
  title,
  href,
  action,
  as: Heading = "h2",
  className = "",
}: {
  id?: string;
  title: React.ReactNode;
  href?: string;
  action?: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={`px-edge flex min-h-12 items-center justify-between gap-6 ${className}`}>
      <Heading id={id} className="t-label">
        {title}
      </Heading>
      {href && action ? (
        <Link href={href} className="t-label link shrink-0">
          {action}
        </Link>
      ) : (
        action
      )}
    </div>
  );
}
