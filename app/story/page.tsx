import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import { IgImage, Price, Tag } from "@/components/bits";
import { STORIES, TIMELINE } from "@/lib/stories";
import { getProducts, type Product } from "@/lib/shopify";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Story",
  description: "LIGHT is a faith-led streetwear label designed by Myron. From the first Crown of Thorns tee to sixteen looks at New York Fashion Week.",
  alternates: { canonical: "/story" },
};

export default async function StoryPage() {
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const pick = (ids: number[]) => ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  const first = products.find((p) => p.scarcity === "first");

  return (
    <PageTransition>
      <section aria-labelledby="story-title" className="px-edge pt-8 pb-12 md:pt-12 md:pb-20">
        <h1 id="story-title" className="t-label">
          Children of the Light
        </h1>
        <figure className="mt-8 md:mt-12">
          <blockquote className="t-giant max-w-[14ch]">
            <span aria-hidden="true">“</span>Light is what I call a God Vision.<span aria-hidden="true">”</span>
          </blockquote>
          <figcaption className="t-meta mt-5">Myron, March 2026</figcaption>
        </figure>
      </section>

      <section aria-label="About LIGHT" className="border-t border-ink md:grid md:grid-cols-2">
        <div className="relative aspect-[4/5] md:border-r md:border-ink">
          <IgImage
            id="DZLeRuQFFSn-3"
            alt="Children of the Light, shot in studio white: a close portrait, the collar pulled up over the mouth"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[50%_30%]"
          />
        </div>
        <div className="px-edge flex flex-col justify-between gap-12 py-8 md:px-8 md:py-10 lg:px-12">
          <div className="t-body max-w-[52ch] space-y-4 text-[1rem] leading-[1.6]">
            <p>
              LIGHT is a faith-led streetwear label designed by Myron. The clothes carry scripture openly: Jesus Lives, Jesus Wept, All
              Hail Yeshua, Find God. The name is scripture&apos;s too: “that ye may be the children of light,” John 12:36.
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
              In 2026 LIGHT dropped skull caps in February, Jesus Lives tees on Good Friday, a reflective Light4eva collection in July,
              and in September took sixteen looks to New York Fashion Week for its first solo show.
            </p>
          </div>
          <p className="flex items-baseline gap-4" lang="he">
            <span className="text-[3rem] leading-none" aria-hidden="true">
              אור
            </span>
            <span className="t-meta" lang="en">
              Or, the Hebrew word for light
            </span>
          </p>
        </div>
      </section>

      {STORIES.map((story) => {
        const pieces = pick(story.products);
        return (
          <section key={story.id} id={story.id} aria-labelledby={`story-${story.id}`} className="border-t border-ink">
            <div className="grid md:grid-cols-2">
              {story.images.slice(0, 2).map((id, i) => (
                <div key={id} className={`relative aspect-[4/5] ${i > 0 ? "hidden md:block md:border-l md:border-ink" : ""}`}>
                  <IgImage id={id} alt={i === 0 ? `${story.title} campaign` : ""} sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="px-edge grid gap-6 border-t border-ink py-6 md:grid-cols-12 md:py-8">
              <div className="md:col-span-4">
                <h2 id={`story-${story.id}`} className="t-label">
                  {story.title}
                </h2>
                <p className="t-meta mt-1 text-grey">{story.when}</p>
              </div>
              <div className="md:col-span-4">
                <p className="t-body max-w-[46ch]">{story.text}</p>
                {story.credit && <p className="t-meta mt-3 text-grey">{story.credit}</p>}
              </div>
              {pieces.length > 0 && (
                <ul className="border-t border-grey md:col-span-4">
                  {pieces.map((p) => (
                    <li key={p.id} className="border-b border-grey">
                      <Link href={`/shop/${p.slug}`} transitionTypes={["nav-forward"]} className="group flex min-h-12 items-center justify-between gap-4 py-2">
                        <span className="min-w-0">
                          <span className="t-label block group-hover:underline">
                            {p.name}
                            {p.color && <span className="text-grey">, {p.color}</span>}
                          </span>
                          <Tag scarcity={p.scarcity} available={p.available} />
                        </span>
                        <Price price={p.price} compareAt={p.compareAt} className="shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        );
      })}

      <section aria-labelledby="timeline-title" className="border-t border-ink">
        <h2 id="timeline-title" className="t-label px-edge flex min-h-12 items-center">
          2026 so far
        </h2>
        <ol className="border-t border-grey">
          {TIMELINE.map((m) => (
            <li key={m.date} className="px-edge grid min-h-14 grid-cols-[4.5rem_1fr_auto] items-center gap-x-4 border-b border-grey py-2 md:grid-cols-[8rem_1fr_auto]">
              <time dateTime={m.date} className="t-meta">
                {m.label}
              </time>
              <p className="t-body">
                {m.href ? (
                  <Link href={m.href} className="hover:underline">
                    {m.text}
                  </Link>
                ) : (
                  m.text
                )}
              </p>
              {m.image ? (
                <div className="relative aspect-[3/4] w-9">
                  <IgImage id={m.image} alt="" sizes="36px" className="object-cover" />
                </div>
              ) : (
                <span aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </section>
    </PageTransition>
  );
}
