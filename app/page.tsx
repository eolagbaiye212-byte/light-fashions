import Link from "next/link";
import { HeroFilm } from "@/components/HeroFilm";
import { Carousel } from "@/components/Carousel";
import { ProductCell } from "@/components/ProductCell";
import { PageTransition } from "@/components/PageTransition";
import { IgImage, SectionBar, pad } from "@/components/bits";
import { LOOKS, SHOW } from "@/lib/looks";
import { INSTAGRAM } from "@/lib/media";
import { getProducts } from "@/lib/shopify";
import { toLite } from "@/lib/product-lite";

export const revalidate = 300;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lightfashions.com";

/**
 * Campaign tiles: one portrait on phones, two side by side on desktop, each with a caption bar
 * below the photographs (never text on them). Image choices and focal points: DESIGN.md, Image placements.
 */
const TILES: {
  id: string;
  label: string;
  action: "Shop now" | "Discover";
  href: string;
  images: { id: string; alt: string; position?: string }[];
}[] = [
  {
    id: "show",
    label: "The show collection",
    action: "Shop now",
    href: "/shop",
    images: [
      { id: "DdXhh9lGzsf-2", alt: "Look 2 from the Light Fashion Experience: an oxblood Forgiven leather jacket with a red scarf pulled over the face", position: "50% 25%" },
      { id: "Ddg9ywokdFD-2", alt: "Look 12: the white Women's Red Cross Garment with flared sleeves and a long black skirt", position: "45% 18%" },
    ],
  },
  {
    id: "once",
    label: "Made once",
    action: "Shop now",
    href: "/shop?only=one-of-one",
    images: [
      { id: "Ddh1xvnG7AR-0", alt: "Look 16: the one-of-one Light Rhinestone Jacket, Light of the World script on the trousers", position: "50% 22%" },
      { id: "DdedB0Kkfih-1", alt: "Look 7: the one-of-one purple flower denim jacket over an olive cross tee", position: "50% 22%" },
    ],
  },
  {
    id: "jesus-lives",
    label: "Jesus Lives",
    action: "Shop now",
    href: "/shop/jesus-lives-tee",
    images: [
      { id: "DcZ3A7_kdYU-1", alt: "The Jesus Lives tee, photographed by the lake", position: "50% 30%" },
      { id: "DcZ3A7_kdYU-3", alt: "The Jesus Lives tee, photographed by the lake", position: "50% 40%" },
    ],
  },
  {
    id: "light-resurgence",
    label: "Light Resurgence",
    action: "Shop now",
    href: "/shop/jesus-wept-scarf-tee",
    images: [
      { id: "DaHD4q5jWT--2", alt: "The Jesus Wept scarf tee, the scarf pulled over the nose", position: "45% 25%" },
      { id: "DaHD4q5jWT--3", alt: "The Jesus Wept scarf tee, worn with a knit cap, the scarf draped", position: "50% 20%" },
    ],
  },
  {
    id: "summer",
    label: "Light4eva summer",
    action: "Discover",
    href: "/story#summer",
    images: [
      { id: "DaJvqbyEe0Y-2", alt: "The Light4eva summer shoot on a tennis court", position: "45% 30%" },
      { id: "DaJvqbyEe0Y-3", alt: "Light4eva summer: the yellow Light4eva reflective bag", position: "50% 55%" },
    ],
  },
];

export default async function Home() {
  const products = await getProducts();
  const show = products.filter((p) => p.drop === "show");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "LIGHT", alternateName: "Children of the Light", url: SITE, logo: `${SITE}/brand/light-mark-black.png`, sameAs: [INSTAGRAM] },
      { "@type": "WebSite", name: "LIGHT", url: SITE },
    ],
  };

  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <HeroFilm caption={`${SHOW.name} — ${SHOW.city}, ${SHOW.date}`} />

      {TILES.map((tile) => (
        <section key={tile.id} id={tile.id} aria-labelledby={`tile-${tile.id}`}>
          <Link href={tile.href} className="group block" tabIndex={-1} aria-hidden="true">
            <div className="grid md:grid-cols-2">
              {tile.images.map((img, i) => (
                <div key={img.id} className={`relative aspect-[4/5] overflow-hidden ${i > 0 ? "hidden md:block" : ""}`}>
                  <IgImage id={img.id} alt={img.alt} sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" style={{ objectPosition: img.position }} />
                </div>
              ))}
            </div>
          </Link>
          <div className="px-edge flex min-h-12 items-center justify-between gap-6 border-b border-ink">
            <h2 id={`tile-${tile.id}`} className="t-label">
              {tile.label}
            </h2>
            <Link href={tile.href} className="t-label link shrink-0">
              {tile.action}
            </Link>
          </div>
        </section>
      ))}

      <section aria-labelledby="show-title" className="pt-12 md:pt-24">
        <SectionBar id="show-title" title="From the show" href="/shop" action={`Shop all ${products.length}`} />
        <div className="[--cw:50vw] sm:[--cw:33.333vw] lg:[--cw:25vw]">
          <Carousel label="The show collection" itemClass="w-[var(--cw)]" arrowTop="calc(var(--cw) * 0.6667)">
            {show.map((p) => (
              <ProductCell key={p.id} product={toLite(p)} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
            ))}
          </Carousel>
        </div>
      </section>

      <section aria-labelledby="looks-title" className="pt-12 md:pt-24">
        <SectionBar id="looks-title" title="Sixteen looks" href="/runway" action="View the runway" />
        <ol className="grid grid-cols-4 border-t border-grey md:grid-cols-8">
          {LOOKS.map((look) => (
            <li key={look.n} className="border-r border-b border-grey [&:nth-child(4n)]:border-r-0 md:[&:nth-child(4n)]:border-r md:[&:nth-child(8n)]:border-r-0">
              <Link href={`/runway#look-${look.n}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <IgImage id={look.images[0]} alt={`Look ${look.n}. ${look.alt}`} sizes="(min-width: 768px) 12.5vw, 25vw" className="object-cover transition-opacity duration-300 can-hover:group-hover:opacity-80" />
                </div>
                <span className="t-meta block px-2 py-2 group-hover:underline">Look {pad(look.n)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="closing" className="px-edge py-16 md:py-28">
        <h2 id="closing" className="t-giant">
          Walk as children of light
        </h2>
        <p className="t-meta mt-4 md:mt-6">Ephesians 5:8</p>
      </section>
    </PageTransition>
  );
}
