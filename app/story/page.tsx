import type { Metadata } from "next";
import Link from "next/link";
import { IgImage } from "@/components/bits";
import { StoryBand } from "@/components/StoryBand";
import { PageTransition } from "@/components/PageTransition";
import { STORIES, TIMELINE } from "@/lib/stories";
import { INSTAGRAM } from "@/lib/media";
import { getProducts, type Product } from "@/lib/shopify";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Story",
  description: "LIGHT is a faith-led streetwear label designed by Myron. From the first Crown of Thorns tee to sixteen looks at New York Fashion Week.",
};

export default async function StoryPage() {
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const pick = (ids: number[]) => ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  const first = products.find((p) => p.scarcity === "first");

  return (
    <PageTransition>
      <section data-surface="night" aria-labelledby="story-title" className="pt-32 pb-24 sm:pt-40">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 id="story-title" className="display text-[clamp(3.8rem,1.6rem+8vw,6rem)]">
              Children of the Light
            </h1>
            <div className="mt-10 max-w-[60ch] space-y-5 text-lead">
              <p>
                LIGHT is a faith-led streetwear label designed by Myron. The clothes carry scripture openly: Jesus Lives, Jesus
                Wept, All Hail Yeshua, Find God. The name is scripture&apos;s too: “that ye may be the children of light,” John 12:36.
              </p>
              <p>
                It started with one tee. The Crown of Thorns tee was the first piece LIGHT ever made, and it&apos;s still here as a
                one-of-one.{" "}
                {first && (
                  <Link href={`/shop/${first.slug}`} className="link">
                    See it in the shop
                  </Link>
                )}
              </p>
              <p>
                In 2026 LIGHT dropped skull caps in February, Jesus Lives tees on Good Friday, a reflective Light4eva collection in
                July, and in September took sixteen looks to New York Fashion Week for its first solo show.
              </p>
            </div>
          </div>
          <div className="lg:col-span-5">
            <figure>
              <div className="drift relative aspect-[4/5] overflow-hidden">
                <IgImage id="DdFUmCnj76h-2" alt="Campaign artwork for the Light Fashion Experience: a figure dissolving into white light" fill sizes="(min-width: 1024px) 38vw, 92vw" className="object-cover" />
              </div>
              <figcaption className="muted mt-3 text-fine">Artwork announcing the Light Fashion Experience, September 2026.</figcaption>
            </figure>
          </div>
        </div>

        <div className="container-x mt-24 grid items-end gap-10 border-t border-night-line pt-16 lg:grid-cols-12">
          <figure className="lg:col-span-8">
            <blockquote className="unmask display text-[clamp(3rem,1.2rem+6.4vw,6rem)]">
              Light is what I call a God vision.
            </blockquote>
            <figcaption className="muted mt-5 text-lead">Myron, March 2026</figcaption>
          </figure>
          <p className="lg:col-span-4" lang="he">
            <span className="scripture block text-[clamp(5rem,4rem+5vw,8rem)] leading-none" aria-hidden="true">
              אור
            </span>
            <span className="muted mt-2 block text-ui" lang="en">
              <i>Or</i>, the Hebrew word for light.
            </span>
          </p>
        </div>
      </section>

      <section data-surface="day" aria-labelledby="timeline-title" className="py-24 sm:py-32">
        <div className="container-x">
          <h2 id="timeline-title" className="unmask display text-[clamp(3rem,1.6rem+5.6vw,6rem)]">
            2026 so far
          </h2>
          <ol className="mt-14 border-t border-day-line">
            {TIMELINE.map((m) => (
              <li key={m.date} className="rise-in grid grid-cols-[5.5rem_1fr] items-center gap-5 border-b border-day-line py-6 sm:grid-cols-[9rem_1fr_auto] sm:gap-8">
                <time dateTime={m.date} className="display tabular text-[2rem] sm:text-[2.75rem]">
                  {m.label}
                </time>
                <p className="max-w-[56ch] text-lead">
                  {m.href ? (
                    <Link href={m.href} className="hover:underline">
                      {m.text}
                    </Link>
                  ) : (
                    m.text
                  )}
                </p>
                {m.image && (
                  <div className="relative col-start-2 aspect-[4/5] w-24 overflow-hidden bg-tile sm:col-start-3 sm:w-28">
                    <IgImage id={m.image} alt="" fill sizes="112px" className="object-cover" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {STORIES.slice(3).map((story, i) => (
        <StoryBand key={story.id} story={story} products={pick(story.products)} flip={i % 2 === 1} />
      ))}

      <section data-surface="day" aria-labelledby="credits-title" className="border-t border-day-line py-20">
        <div className="container-x grid gap-8 lg:grid-cols-12">
          <h2 id="credits-title" className="text-lead font-semibold lg:col-span-4">
            Photography on this site
          </h2>
          <p className="muted max-w-[64ch] lg:col-span-8">
            Runway looks by @diamondrose.photos, styled by @ethannn_estinvil. Campaigns by @kdshot_it, @kemflics, @kyng.archives and
            @mediabymarky. Show film by @lightproductions.co. Every image comes from{" "}
            <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="link text-day-ink">
              @children_ofthelight
            </a>
            .
          </p>
        </div>
      </section>
    </PageTransition>
  );
}
