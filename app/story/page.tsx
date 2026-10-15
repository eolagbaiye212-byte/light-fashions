import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import { TIMELINE } from "@/lib/stories";
import { getProducts } from "@/lib/shopify";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Story",
  description: "LIGHT is a faith-led streetwear label designed by Myron. From the first Crown of Thorns tee to sixteen looks at New York Fashion Week.",
  alternates: { canonical: "/story" },
};

/** Words only: what LIGHT is, where it came from, and the year so far. */
export default async function StoryPage() {
  const products = await getProducts();
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

      <section aria-labelledby="about-title" className="px-edge grid gap-6 border-t border-ink py-8 md:grid-cols-12 md:py-12">
        <h2 id="about-title" className="t-label md:col-span-4">
          About LIGHT
        </h2>
        <div className="md:col-span-7 md:col-start-6">
          <div className="t-body max-w-[56ch] space-y-4 text-[1rem] leading-[1.6]">
            <p>
              LIGHT is a faith-led streetwear label designed by Myron. The clothes carry scripture openly: Jesus Lives, Jesus Wept, All Hail
              Yeshua, Find God. The name is scripture&apos;s too: “that ye may be the children of light,” John 12:36.
            </p>
            <p>
              It started with one tee. The Crown of Thorns tee was the first piece LIGHT ever made, and it&apos;s still here as a one-of-one.{" "}
              {first && (
                <Link href={`/shop/${first.slug}`} className="link">
                  See it in the shop
                </Link>
              )}
            </p>
          </div>
          <p className="mt-10 flex items-baseline gap-4" lang="he">
            <span className="text-[3rem] leading-none" aria-hidden="true">
              אור
            </span>
            <span className="t-meta" lang="en">
              Or, the Hebrew word for light
            </span>
          </p>
        </div>
      </section>

      <section aria-labelledby="timeline-title" className="border-t border-ink">
        <h2 id="timeline-title" className="t-label px-edge flex min-h-12 items-center">
          2026 so far
        </h2>
        <ol className="border-t border-grey">
          {TIMELINE.map((m) => (
            <li key={m.date} className="px-edge grid min-h-12 grid-cols-[4.5rem_1fr] items-baseline gap-x-4 border-b border-grey py-3 md:grid-cols-[8rem_1fr]">
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
            </li>
          ))}
        </ol>
      </section>
    </PageTransition>
  );
}
