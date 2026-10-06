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
      <section data-surface="night" aria-labelledby="story-title" className="page-top section-b">
        <div className="container-x grid gap-[var(--space-xl)] lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <h1 id="story-title" className="type-h1 max-w-[12ch]">
              Children of the Light
            </h1>
            <div className="mt-[var(--space-lg)] max-w-[58ch] space-y-4 text-lead">
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
          <div className="lg:col-span-5 lg:col-start-8">
            <figure>
              <div className="drift relative aspect-[4/5] overflow-hidden">
                <IgImage id="DdFUmCnj76h-2" alt="Campaign artwork for the Light Fashion Experience: a figure dissolving into white light" fill sizes="(min-width: 1024px) 38vw, 92vw" className="object-cover" />
              </div>
              <figcaption className="muted mt-3 text-fine">Artwork announcing the Light Fashion Experience, September 2026.</figcaption>
            </figure>
          </div>
        </div>

        <div className="container-x section-t mt-[var(--space-section)] grid items-end gap-[var(--space-lg)] border-t border-night-line lg:grid-cols-12 lg:gap-8">
          <figure className="lg:col-span-8">
            <blockquote className="quote-xl max-w-[18ch]">
              <span aria-hidden="true">“</span>Light is what I call a God vision.<span aria-hidden="true">”</span>
            </blockquote>
            <figcaption className="muted mt-5 text-lead">Myron, March 2026</figcaption>
          </figure>
          <p className="lg:col-span-4" lang="he">
            <span className="scripture block text-[clamp(4rem,3.2rem+3.4vw,6rem)] leading-none" aria-hidden="true">
              אור
            </span>
            <span className="muted mt-2 block text-ui" lang="en">
              <i>Or</i>, the Hebrew word for light.
            </span>
          </p>
        </div>
      </section>

      <section data-surface="day" aria-labelledby="timeline-title" className="section-y">
        <div className="container-x">
          <h2 id="timeline-title" className="type-h2">
            2026 so far
          </h2>
          <ol className="head-gap border-t border-day-line">
            {TIMELINE.map((m) => (
              <li key={m.date} className="grid grid-cols-[5rem_1fr] items-center gap-x-5 gap-y-3 border-b border-day-line py-5 sm:grid-cols-[8rem_1fr_auto] sm:gap-x-8 sm:py-6">
                <time dateTime={m.date} className="type-h4 tabular">
                  {m.label}
                </time>
                <p className="max-w-[52ch] text-body sm:text-lead">
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

      <section data-surface="day" aria-labelledby="credits-title" className="band-y border-t border-day-line">
        <div className="container-x grid gap-8 lg:grid-cols-12">
          <h2 id="credits-title" className="text-lead font-medium lg:col-span-4">
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
