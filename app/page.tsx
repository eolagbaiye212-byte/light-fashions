import Link from "next/link";
import { HeroFilm } from "@/components/HeroFilm";
import { Carousel } from "@/components/Carousel";
import { ProductCell } from "@/components/ProductCell";
import { PageTransition } from "@/components/PageTransition";
import { IgImage, SectionBar, pad } from "@/components/bits";
import { LOOKS, SHOW } from "@/lib/looks";
import { INSTAGRAM } from "@/lib/media";
import { getProducts } from "@/lib/shopify";
import { productHref, toLite } from "@/lib/product-lite";

export const revalidate = 300;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lightfashions.com";

/**
 * Campaign tiles: one portrait on phones, two side by side on desktop. Every photograph links to
 * the piece being worn (on that colour, where the product comes in several), with a caption bar
 * below it (never text on the photo). Image choices and focal points: DESIGN.md, Image placements.
 */
type Shot = { id: string; alt: string; position?: string; product: number; color?: string };

const TILES: { id: string; label: string; images: Shot[] }[] = [
  {
    id: "show",
    label: "The show collection",
    images: [
      // The jacket walked in oxblood; the shop sells the Forgiven Jacket in black and navy.
      { id: "DdXhh9lGzsf-2", alt: "Look 2 from the Light Fashion Experience: a Forgiven leather jacket with a red scarf pulled over the face", position: "50% 25%", product: 10566276710540 },
      { id: "Ddg9ywokdFD-2", alt: "Look 12: the white Women's Red Cross Garment with flared sleeves and a long black skirt", position: "45% 18%", product: 10564044259468 },
    ],
  },
  {
    id: "once",
    label: "Made once",
    images: [
      { id: "Ddh1xvnG7AR-0", alt: "Look 16: the one-of-one Light Rhinestone Jacket, Light of the World script on the trousers", position: "50% 22%", product: 10565178097804 },
      { id: "DdedB0Kkfih-1", alt: "Look 7: the one-of-one purple flower denim jacket over an olive cross tee", position: "50% 22%", product: 8387385819276 },
    ],
  },
  {
    id: "jesus-lives",
    label: "Jesus Lives",
    images: [
      { id: "DcZ3A7_kdYU-1", alt: "The Jesus Lives tee, off-white with the pink chrome star, photographed by the lake", position: "50% 30%", product: 9107472154764, color: "Off White Tee & Pink Chrome" },
      { id: "DcZ3A7_kdYU-3", alt: "The Jesus Lives tee, off-white with the pink chrome star, photographed by the lake", position: "50% 40%", product: 9107472154764, color: "Off White Tee & Pink Chrome" },
    ],
  },
  {
    id: "light-resurgence",
    label: "Light Resurgence",
    images: [
      { id: "DaHD4q5jWT--2", alt: "The white Jesus Wept scarf tee, the scarf pulled over the nose", position: "45% 25%", product: 7861896413324, color: "White" },
      { id: "DaHD4q5jWT--3", alt: "The white Jesus Wept scarf tee, worn with a knit cap, the scarf draped", position: "50% 20%", product: 7861896413324, color: "White" },
    ],
  },
  {
    id: "summer",
    label: "Light4eva summer",
    images: [
      { id: "DaJvqbyEe0Y-2", alt: "The white Light4eva reflective women's tee on a tennis court", position: "45% 30%", product: 9535087739020, color: "White" },
      { id: "DaJvqbyEe0Y-3", alt: "The yellow Light4eva reflective bag on a tennis court", position: "50% 55%", product: 9535045107852, color: "Yellow" },
    ],
  },
];

/**
 * The looks on the home page, each linked to the main piece it shows. Looks 4, 6 and 13 aren't in the
 * shop; look 10 is the Women's Light Tank again (it leads look 3).
 */
const LOOK_PIECES: Record<number, { product: number; color?: string }> = {
  1: { product: 10564685824140 },
  2: { product: 10566276710540 },
  3: { product: 10564038590604, color: "White" },
  5: { product: 10565502697612 },
  7: { product: 8387385819276 },
  8: { product: 8120992235660 },
  9: { product: 10564169695372 },
  11: { product: 9107472154764, color: "Black Tee & Silver Chrome" },
  12: { product: 10564044259468 },
  14: { product: 10565033230476 },
  15: { product: 9535087739020, color: "White" },
  16: { product: 10565178097804 },
};

export default async function Home() {
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const show = products.filter((p) => p.drop === "show");
  const looks = LOOKS.flatMap((look) => {
    const piece = LOOK_PIECES[look.n];
    const product = piece && byId.get(piece.product);
    return product ? [{ look, product, href: productHref(product, piece.color) }] : [];
  });

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
          <h2 id={`tile-${tile.id}`} className="sr-only">
            {tile.label}
          </h2>
          <ul className="grid md:grid-cols-2">
            {tile.images.map((img, i) => {
              const product = byId.get(img.product);
              if (!product) return null;
              return (
                <li key={img.id} className={i > 0 ? "hidden md:block md:border-l md:border-ink" : ""}>
                  <Link href={productHref(product, img.color)} transitionTypes={["nav-forward"]} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <IgImage id={img.id} alt={img.alt} sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" style={{ objectPosition: img.position }} />
                    </div>
                    <div className="px-edge flex min-h-14 items-center justify-between gap-6 border-b border-ink py-2">
                      <span className="min-w-0">
                        <span className="t-meta block text-grey">{tile.label}</span>
                        <span className="t-label block truncate group-hover:underline">{product.name}</span>
                      </span>
                      <span className="t-label link shrink-0">Shop now</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
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
        <SectionBar id="looks-title" title="Shop the looks" />
        <div className="overflow-hidden border-t border-grey">
          <ol className="-mr-px grid grid-cols-3 md:grid-cols-6">
            {looks.map(({ look, product, href }) => (
              <li key={look.n} className="border-r border-b border-grey">
                <Link href={href} transitionTypes={["nav-forward"]} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <IgImage
                      id={look.images[0]}
                      alt={`Look ${look.n}. ${look.alt}`}
                      sizes="(min-width: 768px) 16.7vw, 33vw"
                      className="object-cover transition-opacity duration-300 can-hover:group-hover:opacity-80"
                    />
                  </div>
                  <span className="block px-2 pt-2 pb-3 md:px-3">
                    <span className="t-meta block text-grey">Look {pad(look.n)}</span>
                    <span className="t-label mt-0.5 line-clamp-2 group-hover:underline">{product.name}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
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
