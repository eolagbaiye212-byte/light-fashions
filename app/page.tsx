import Image from "next/image";
import Link from "next/link";
import { HeroRunway } from "@/components/HeroRunway";
import { RunwayRail } from "@/components/RunwayRail";
import { LightTransition } from "@/components/LightTransition";
import { ProductTile } from "@/components/ProductTile";
import { StoryBand } from "@/components/StoryBand";
import { LoopVideo } from "@/components/LoopVideo";
import { PageTransition } from "@/components/PageTransition";
import { IgImage, Price, SectionHead, Verse } from "@/components/bits";
import { LOOKS } from "@/lib/looks";
import { STORIES } from "@/lib/stories";
import { VIDEO, media } from "@/lib/media";
import { getProducts, type Product } from "@/lib/shopify";
import { toLite } from "@/lib/product-lite";

export const revalidate = 300;

const FORGIVEN = [10566276710540, 10566318129292];

export default async function Home() {
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const pick = (ids: number[]) => ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);

  const forgiven = pick(FORGIVEN);
  const show = products.filter((p) => p.drop === "show" && !FORGIVEN.includes(p.id)).slice(0, 8);
  const once = products
    .filter((p) => p.scarcity && p.scarcity !== "pre-release")
    .sort((a, b) => Number(b.available) - Number(a.available));

  const rail = LOOKS.map((look) => ({
    n: look.n,
    image: (
      <IgImage
        id={look.images[0]}
        alt={`Look ${look.n}. ${look.alt}`}
        fill
        sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 30vw, (min-width: 640px) 44vw, 80vw"
        className="object-cover"
      />
    ),
    verse: <Verse line={look.line} cite={look.cite} size="sm" />,
    pieces: pick(look.products).map((p) => ({
      slug: p.slug,
      name: p.color ? `${p.name} (${p.color.toLowerCase()})` : p.name,
    })),
  }));

  const shown = new Set([...FORGIVEN, ...show.map((p) => p.id)]);

  return (
    <PageTransition>
      <HeroRunway count={products.length} />

      <section id="looks" data-surface="night" aria-labelledby="looks-title" className="section-t scroll-mt-16 pb-[var(--space-band)]">
        <div className="container-x">
          <SectionHead
            id="looks-title"
            title="Sixteen looks, sixteen lines"
            intro={<>Every look walked with a line beside it: scripture, or a few of Myron&apos;s own words. Open one to see every angle and shop what was worn.</>}
          />
        </div>
        <div className="head-gap">
          <RunwayRail looks={rail} />
        </div>
      </section>

      <LightTransition />

      <section data-surface="day" aria-labelledby="show-title" className="section-b pt-[var(--space-md)]">
        <div className="container-x">
          <SectionHead
            id="show-title"
            title="From the show"
            intro="Released September 20, a week after the runway. Small runs, and a few pieces that exist once."
            action={
              <Link href="/shop" className="link text-ui font-medium">
                Shop all {products.length} pieces
              </Link>
            }
          />

          <div className="head-gap grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-12">
            {forgiven.length > 0 && <ForgivenFeature jackets={forgiven} />}
            {show.map((p, i) => (
              <div key={p.id} className="lg:col-span-3">
                <ProductTile product={toLite(p)} priority={i < 2} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {once.length > 0 && (
        <section data-surface="day" aria-labelledby="once-title" className="section-y border-t border-day-line">
          <div className="container-x">
            <SectionHead
              id="once-title"
              title="Made once"
              intro={<>Runway garments, hand-painted denim, unreleased samples and the first tee LIGHT ever made. Each one exists once. When it sells, it&apos;s gone.</>}
              action={
                <Link href="/shop?only=one-of-one" className="link text-ui font-medium">
                  See every one-of-one
                </Link>
              }
            />
          </div>
          <ul className="rail-fade no-scrollbar head-gap relative flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] sm:gap-5">
            {once.map((p) => (
              <li key={p.id} className="w-[64vw] shrink-0 snap-start xs:w-[46vw] sm:w-[34vw] lg:w-[22vw] xl:w-[18vw]">
                <ProductTile product={toLite(p)} morph={!shown.has(p.id)} />
              </li>
            ))}
            <li aria-hidden="true" className="w-px shrink-0" />
          </ul>
        </section>
      )}

      {STORIES.slice(0, 3).map((story, i) => (
        <StoryBand key={story.id} story={story} products={pick(story.products)} flip={i % 2 === 1} />
      ))}

      <section data-surface="day" aria-labelledby="founder-title" className="section-y border-t border-day-line">
        <div className="container-x grid items-end gap-[var(--space-xl)] lg:grid-cols-12 lg:gap-8">
          <figure className="lg:col-span-8">
            <blockquote id="founder-title" className="quote-xl max-w-[18ch]">
              <span aria-hidden="true">“</span>Light is what I call a God vision.<span aria-hidden="true">”</span>
            </blockquote>
            <figcaption className="mt-5 max-w-[44ch] text-lead">
              “More than just fashion.” <span className="muted">Myron, founder and designer, March 2026</span>
            </figcaption>
            <Link href="/story" className="btn btn-ink mt-[var(--space-lg)]">
              Read the story
            </Link>
          </figure>
          <div className="lg:col-span-4">
            <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden bg-tile lg:ml-auto">
              <Image
                src={media("Dclxg2wRFYs-0").src}
                alt="Poster for the Light Fashion Experience: September 13, 2026, 7 PM, New York City, LIGHT × NYFW"
                fill
                sizes="(min-width: 1024px) 26vw, 80vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

function ForgivenFeature({ jackets }: { jackets: Product[] }) {
  const [lead] = jackets;
  return (
    <article className="relative col-span-2 lg:col-span-6 lg:row-span-2">
      <div data-surface="night" className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:h-full">
        <LoopVideo
          src={VIDEO.forgiven.src}
          poster={VIDEO.forgiven.poster}
          label="film of the Forgiven Jacket being put on"
          className="absolute inset-0 h-full w-full object-cover"
          controlClassName="absolute top-4 right-4 z-20 bg-night/70 text-night-ink hover:bg-night/90"
        />
        {/* Deep enough under the copy that the red stock line and the name hold up over the bright sky. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/4 bg-[linear-gradient(to_top,var(--color-night)_0%,oklch(0.138_0.006_245/0.88)_38%,oklch(0.138_0.006_245/0.5)_66%,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <p className="signal text-ui font-semibold">Pre-release. Released one at a time.</p>
          <h3 className="type-h2 mt-2">
            <Link href={`/shop/${lead.slug}`} className="after:absolute after:inset-0 after:content-['']">
              Forgiven Jacket
            </Link>
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-ui">
            <Price price={lead.price} className="text-lead font-semibold" />
            {jackets.map((j) => (
              <Link
                key={j.id}
                href={`/shop/${j.slug}`}
                className="relative z-10 inline-flex min-h-10 items-center gap-2 rounded-full px-3 font-medium shadow-[inset_0_0_0_1px_currentColor] hover:shadow-[inset_0_0_0_2px_currentColor]"
              >
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full ring-1 ring-night-ink/50"
                  style={{ background: j.color === "Navy" ? "oklch(0.32 0.08 262)" : "oklch(0.16 0 0)" }}
                />
                {j.color}
                {!j.available && <span className="muted">, sold</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
