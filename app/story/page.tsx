import type { Metadata } from "next";
import Link from "next/link";
import { IgImage } from "@/components/bits";
import { StoryBand } from "@/components/StoryBand";
import { PageTransition } from "@/components/PageTransition";
import { STORIES, TIMELINE } from "@/lib/stories";
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

            {/* Myron's words close the story, in the same column, rather than as a section of their own. */}
            <figure className="mt-[var(--space-xl)]">
              <blockquote className="quote-xl max-w-[18ch]">
                <span aria-hidden="true">“</span>Light is what I call a God vision.<span aria-hidden="true">”</span>
              </blockquote>
              <figcaption className="muted mt-4 text-ui">Myron, March 2026</figcaption>
            </figure>
            <p className="mt-[var(--space-lg)] flex items-baseline gap-4" lang="he">
              <span className="scripture text-[3.25rem] leading-none" aria-hidden="true">
                אור
              </span>
              <span className="muted text-ui" lang="en">
                <i>Or</i>, the Hebrew word for light.
              </span>
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <figure className="lg:sticky lg:top-28">
              <div className="drift relative aspect-[4/5] overflow-hidden">
                <IgImage id="DdFUmCnj76h-2" alt="Campaign artwork for the Light Fashion Experience: a figure dissolving into white light" fill sizes="(min-width: 1024px) 38vw, 92vw" className="object-cover" />
              </div>
              <figcaption className="muted mt-3 text-fine">Artwork announcing the Light Fashion Experience, September 2026.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section data-surface="day" aria-labelledby="timeline-title" className="section-y">
        {/* Title on the left, the year on the right (desktop), so each line sits near its picture. */}
        <div className="container-x lg:grid lg:grid-cols-12 lg:gap-8">
          <h2 id="timeline-title" className="type-h3 lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            2026 so far
          </h2>
          <ol className="mt-[var(--space-md)] border-t border-day-line lg:col-span-8 lg:mt-0">
            {TIMELINE.map((m) => (
              <li key={m.date} className="grid min-h-[4.75rem] grid-cols-[4.25rem_1fr_auto] items-center gap-x-4 border-b border-day-line py-2.5 sm:grid-cols-[6rem_1fr_auto] sm:gap-x-6">
                <time dateTime={m.date} className="tabular text-ui font-medium">
                  {m.label}
                </time>
                <p className="max-w-[56ch]">
                  {m.href ? (
                    <Link href={m.href} className="hover:underline">
                      {m.text}
                    </Link>
                  ) : (
                    m.text
                  )}
                </p>
                {m.image && (
                  <div className="relative col-start-3 aspect-[4/5] w-12 overflow-hidden bg-tile">
                    <IgImage id={m.image} alt="" fill sizes="48px" className="object-cover" />
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

    </PageTransition>
  );
}
