import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import Link from "next/link";
import { LookGallery } from "@/components/LookGallery";
import { LookIndex } from "@/components/LookIndex";
import { LoopVideo } from "@/components/LoopVideo";
import { FadeImage } from "@/components/FadeImage";
import { IgImage, Price, Status, Verse, pad } from "@/components/bits";
import { LOOKS, SHOW } from "@/lib/looks";
import { INSTAGRAM, VIDEO } from "@/lib/media";
import { getProducts, type Product } from "@/lib/shopify";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Runway: Light Fashion Experience",
  description:
    "All sixteen looks from LIGHT's first solo show, New York, September 13, 2026, each with the line it was built around, and the pieces you can buy.",
  openGraph: { images: [{ url: "/media/ig/DdZybfKGMjk-1.webp", width: 1584, height: 2000 }] },
};

export default async function RunwayPage() {
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));

  return (
    <PageTransition>
    <div data-surface="night">
      <section aria-labelledby="runway-title" className="relative flex min-h-[86svh] items-end overflow-hidden">
        <LoopVideo
          src={VIDEO.runway.src}
          poster={VIDEO.runway.poster}
          label="runway film from the Light Fashion Experience"
          className="absolute inset-0 h-full w-full object-cover"
          controlClassName="absolute top-20 right-[var(--gutter)] z-10 bg-night/70 text-night-ink hover:bg-night/90"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-night)_4%,oklch(0.138_0.006_245/0.7)_40%,oklch(0.138_0.006_245/0.25)_75%)]" />
        <div className="container-x relative grid gap-10 pb-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="text-ui font-medium text-night-ink/85">
              {SHOW.city}, {SHOW.date}
            </p>
            <h1 id="runway-title" className="display mt-3 text-[clamp(3.6rem,1.4rem+9vw,6rem)]">
              {SHOW.name}
            </h1>
            <p className="mt-5 max-w-[50ch] text-lead text-night-ink/90">
              LIGHT&apos;s first solo show, during New York Fashion Week. Sixteen looks in running order, each with the line it walked
              with.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-ui lg:col-span-4">
            {SHOW.credits.map((c) => (
              <div key={c.role}>
                <dt className="muted">{c.role}</dt>
                <dd>
                  <a href={`https://www.instagram.com/${c.handle}/`} target="_blank" rel="noreferrer" className="hover:underline">
                    {c.who ?? `@${c.handle}`}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <LookIndex count={LOOKS.length} />

      {LOOKS.map((look, i) => {
        const pieces = look.products.map((id) => byId.get(id)).filter((p): p is Product => !!p);
        const flip = i % 2 === 1;
        return (
          <section
            key={look.n}
            id={`look-${look.n}`}
            data-look={look.n}
            aria-labelledby={`look-${look.n}-title`}
            className="scroll-mt-32 border-b border-night-line py-16 sm:py-24"
          >
            <div className="container-x grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
              <div className={`min-w-0 lg:col-span-6 ${flip ? "lg:order-2 lg:col-start-7" : "lg:col-start-1"}`}>
                <LookGallery
                  n={look.n}
                  frames={look.images.map((id, k) => (
                    <IgImage
                      key={id}
                      id={id}
                      alt={k === 0 ? `Look ${look.n}. ${look.alt}` : `Look ${look.n}, another angle`}
                      fill
                      priority={look.n === 1 && k === 0}
                      sizes="(min-width: 1024px) 46vw, 92vw"
                      className="object-cover"
                    />
                  ))}
                  thumbs={look.images.map((id) => (
                    <IgImage key={id} id={id} alt="" fill sizes="64px" className="object-cover" />
                  ))}
                />
              </div>

              <div className={`min-w-0 lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"}`}>
                <h2 id={`look-${look.n}-title`} className="flex items-baseline gap-4">
                  <span className="unmask display tabular text-[clamp(5rem,3.5rem+5vw,8.5rem)] leading-none">{pad(look.n)}</span>
                  <span className="sr-only">Look {look.n}</span>
                </h2>
                <Verse line={look.line} cite={look.cite} size="lg" className="mt-6" />

                <div className="mt-10">
                  {pieces.length > 0 ? (
                    <>
                      <h3 className="muted text-ui">In the shop</h3>
                      <ul className="mt-3 divide-y divide-night-line border-y border-night-line">
                        {pieces.map((p) => (
                          <li key={p.id}>
                            <Link href={`/shop/${p.slug}`} className="group flex items-center gap-4 py-3">
                              <span className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-day">
                                {p.images[0] && (
                                  <FadeImage src={p.images[0].src} alt="" fill sizes="56px" className="packshot object-contain" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block font-semibold group-hover:underline">
                                  {p.name}
                                  {p.color && <span className="muted font-normal">, {p.color}</span>}
                                </span>
                                <Status scarcity={p.scarcity} available={p.available} />
                              </span>
                              <Price price={p.price} compareAt={p.compareAt} className="font-semibold" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="muted max-w-[40ch]">
                      This look isn&apos;t in the shop.{" "}
                      <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="link text-night-ink">
                        Ask about it on Instagram
                      </a>
                      .
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section className="container-x py-24 text-center sm:py-32">
        <p className="scripture mx-auto max-w-[22ch] text-[clamp(1.8rem,1.2rem+2vw,3rem)]">“Let your light shine.”</p>
        <p className="muted mt-3 text-ui">Matthew 5:16</p>
        <Link href="/shop" className="btn btn-light mt-10">
          Shop the collection
        </Link>
      </section>
    </div>
    </PageTransition>
  );
}
