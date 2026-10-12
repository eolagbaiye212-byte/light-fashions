import type { Metadata } from "next";
import Link from "next/link";
import { Frames } from "@/components/Frames";
import { PageTransition } from "@/components/PageTransition";
import { IgImage, Price, Tag, Verse, pad } from "@/components/bits";
import { LOOKS, SHOW } from "@/lib/looks";
import { INSTAGRAM, media } from "@/lib/media";
import { getProducts, type Product } from "@/lib/shopify";

export const revalidate = 300;

const OG = media("DdZybfKGMjk-1");

export const metadata: Metadata = {
  title: "Runway: Light Fashion Experience",
  description:
    "All sixteen looks from LIGHT's first solo show, New York, September 13, 2026, each with the line it was built around, and the pieces you can buy.",
  alternates: { canonical: "/runway" },
  openGraph: { images: [{ url: OG.src, width: OG.w, height: OG.h, alt: "Look 3 from the Light Fashion Experience" }] },
};

export default async function RunwayPage() {
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));

  return (
    <PageTransition>
      <section aria-labelledby="runway-title" className="px-edge pt-8 pb-10 md:pt-12 md:pb-16">
        <p className="t-meta">
          {SHOW.city}, {SHOW.date}
        </p>
        <h1 id="runway-title" className="t-giant mt-4 max-w-[12ch]">
          {SHOW.name}
        </h1>
        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-12 md:gap-6">
          <p className="t-body max-w-[48ch] md:col-span-5">
            LIGHT&apos;s first solo show, during New York Fashion Week. Sixteen looks in running order, each with the line it walked with.
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:col-span-6 md:col-start-7 md:grid-cols-4">
            {SHOW.credits.map((c) => (
              <div key={c.role}>
                <dt className="t-meta text-grey">{c.role}</dt>
                <dd className="t-label mt-1">
                  <a href={`https://www.instagram.com/${c.handle}/`} target="_blank" rel="noreferrer" className="hover:underline">
                    {c.who ?? `@${c.handle}`}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <nav aria-label="Looks" className="sticky top-header z-20 border-y border-ink bg-paper">
        <ol className="no-scrollbar px-edge flex overflow-x-auto">
          {LOOKS.map((look) => (
            <li key={look.n}>
              <a href={`#look-${look.n}`} className="t-meta grid min-h-11 min-w-10 place-items-center px-1 hover:underline">
                {pad(look.n)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {LOOKS.map((look) => {
        const pieces = look.products.map((id) => byId.get(id)).filter((p): p is Product => !!p);
        return (
          <section
            key={look.n}
            id={`look-${look.n}`}
            aria-labelledby={`look-${look.n}-title`}
            className="scroll-mt-[calc(var(--header)+2.75rem)] border-b border-ink md:grid md:min-h-[calc(100svh-var(--header)-2.75rem)] md:grid-cols-2"
          >
            <Frames
              label={`Look ${look.n}, ${look.images.length} photos`}
              className="aspect-[1584/2048] md:aspect-auto md:h-[calc(100svh-var(--header)-2.75rem)] md:border-r md:border-ink"
              frames={look.images.map((id, k) => (
                <IgImage
                  key={id}
                  id={id}
                  alt={k === 0 ? `Look ${look.n}. ${look.alt}` : `Look ${look.n}, another angle`}
                  priority={look.n === 1 && k === 0}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover object-[50%_25%]"
                />
              ))}
            />

            <div className="px-edge flex flex-col gap-8 pt-5 pb-10 md:px-8 md:py-8 lg:px-12">
              <h2 id={`look-${look.n}-title`} className="t-meta">
                Look {pad(look.n)}
              </h2>
              <Verse line={look.line} cite={look.cite} className="max-w-[40ch] md:my-auto" />

              <div>
                <h3 className="t-meta text-grey">Worn</h3>
                {pieces.length > 0 ? (
                  <ul className="mt-2 border-t border-grey">
                    {pieces.map((p) => (
                      <li key={p.id} className="border-b border-grey">
                        <Link href={`/shop/${p.slug}`} className="group flex min-h-12 items-center justify-between gap-4 py-2">
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
                ) : (
                  <p className="t-body mt-2 max-w-[40ch]">
                    This look isn&apos;t in the shop.{" "}
                    <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="link">
                      Ask about it on Instagram
                    </a>
                    .
                  </p>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <section aria-labelledby="runway-close" className="px-edge py-16 md:py-24">
        <p id="runway-close" className="t-body">
          <span aria-hidden="true">“</span>Let your light shine.<span aria-hidden="true">”</span>
        </p>
        <p className="t-meta mt-2 text-grey">Matthew 5:16</p>
        <Link href="/shop" className="btn btn-ink mt-8">
          Shop the collection
        </Link>
      </section>
    </PageTransition>
  );
}
