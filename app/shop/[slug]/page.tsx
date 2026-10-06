import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBag } from "@/components/AddToBag";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductTile } from "@/components/ProductTile";
import { PageTransition } from "@/components/PageTransition";
import { IgImage, Price, Status, Verse, pad } from "@/components/bits";
import { CATEGORY_LABEL, DROP_LABEL } from "@/lib/catalog";
import { lookFor } from "@/lib/looks";
import { getProduct, getProducts, type Product } from "@/lib/shopify";
import { toLite } from "@/lib/product-lite";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProduct(slug);
  if (!p) return { title: "Not found" };
  const title = p.color ? `${p.name}, ${p.color}` : p.name;
  const description = p.lede ?? p.description[0]?.paragraphs[0] ?? `${title} by LIGHT.`;
  return {
    title,
    description,
    openGraph: { title, description, images: p.images[0] ? [{ url: p.images[0].src, width: p.images[0].width, height: p.images[0].height }] : [] },
  };
}

export default async function ProductPage(props: PageProps<"/shop/[slug]">) {
  const { slug } = await props.params;
  const [product, all] = await Promise.all([getProduct(slug), getProducts()]);
  if (!product) notFound();

  const looks = lookFor(product.id);
  const siblings = related(product, all);
  const sizeGuide = product.description.find((s) => s.heading === "Size guide");
  const sections = product.description.filter((s) => s.heading !== "Size guide");
  const intro = sections.find((s) => !s.heading);
  const rest = sections.filter((s) => s.heading);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.color ? `${product.name}, ${product.color}` : product.name,
    image: product.images.map((i) => i.src),
    description: product.lede ?? intro?.paragraphs.join(" "),
    brand: { "@type": "Brand", name: "LIGHT" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: product.price,
      highPrice: product.priceMax,
      availability: product.available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
  };

  return (
    <PageTransition>
      <div data-surface="day" className="pt-[var(--header-h)] lg:pt-[calc(var(--header-h)+var(--space-md))]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <div className="lg:container-x lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <ProductGallery productId={product.id} images={product.images} name={product.name} />
          </div>

          <div className="container-x pt-[var(--space-md)] pb-[var(--space-xl)] lg:col-span-5 lg:px-0 lg:pt-0">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--space-md))]">
              <nav aria-label="Breadcrumb" className="muted text-fine">
                <Link href="/shop" transitionTypes={["nav-back"]} className="hover:underline">
                  Shop
                </Link>
                <span aria-hidden="true"> / </span>
                <Link href={`/shop?category=${product.category}`} transitionTypes={["nav-back"]} className="hover:underline">
                  {CATEGORY_LABEL[product.category]}
                </Link>
              </nav>

              <Status scarcity={product.scarcity} available={product.available} onSale={!!product.compareAt} className="mt-5 block text-ui" />
              <h1 className="type-h2 mt-2 max-w-[16ch]">{product.name}</h1>
              {product.color && <p className="mt-2 text-lead">{product.color}</p>}
              <Price price={product.price} priceMax={product.priceMax} compareAt={product.compareAt} className="mt-3 block text-lead font-semibold" />

              {(product.lede || intro) && (
                <div className="mt-5 max-w-[52ch] space-y-3">
                  {product.lede ? <p>{product.lede}</p> : intro?.paragraphs.map((t) => <p key={t}>{t}</p>)}
                </div>
              )}

              <div className="mt-[var(--space-lg)]">
                <AddToBag product={toLite(product, 1)} sizeGuide />
              </div>

              <div className="mt-[var(--space-lg)] divide-y divide-day-line border-y border-day-line">
                {(intro?.bullets.length ?? 0) > 0 && (
                  <Disclosure title="Details" open>
                    <ul className="list-disc space-y-1 pl-5">
                      {intro!.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </Disclosure>
                )}
                {rest.map((s, i) => (
                  <Disclosure key={`${s.heading}-${i}`} title={s.heading!} open={s.heading === "Details" && !intro?.bullets.length}>
                    {s.paragraphs.map((t) => (
                      <p key={t}>{t}</p>
                    ))}
                    {s.bullets.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {s.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </Disclosure>
                ))}
                <Disclosure title="Size guide" id="size-guide">
                  {sizeGuide ? (
                    <>
                      <ul className="space-y-1">
                        {sizeGuide.bullets.map((b) => (
                          <li key={b} className="tabular">
                            {b}
                          </li>
                        ))}
                      </ul>
                      {sizeGuide.paragraphs.map((t) => (
                        <p key={t} className="mt-2">
                          {t}
                        </p>
                      ))}
                    </>
                  ) : (
                    <p>
                      Most LIGHT pieces are cut oversized. Take your usual size for a relaxed fit, or size down for a closer one.{" "}
                      <Link href="/info#sizing" className="link">
                        Full size guide
                      </Link>
                    </p>
                  )}
                </Disclosure>
                <Disclosure title="Shipping and returns">
                  <p>
                    {product.shipping ? `${product.shipping}. ` : ""}Shipping and tax are shown at checkout. All sales are final: no returns
                    or exchanges, so please check your size and address before you pay.{" "}
                    <Link href="/info" className="link">
                      More on shipping
                    </Link>
                  </p>
                </Disclosure>
              </div>
              <p className="muted mt-5 text-fine">From {DROP_LABEL[product.drop]}.</p>
            </div>
          </div>
        </div>
      </div>

      {looks.map((look) => (
        <section key={look.n} data-surface="night" aria-labelledby={`walked-${look.n}`} className="overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="drift relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[44rem]">
              <IgImage id={look.images[0]} alt={`Look ${look.n}. ${look.alt}`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="container-x band-y flex flex-col justify-center gap-6 lg:max-w-[40rem] lg:px-14">
              <p id={`walked-${look.n}`} className="text-ui">
                Walked as look {look.n} at the Light Fashion Experience, New York, September&nbsp;13,&nbsp;2026.
              </p>
              <span className="type-num text-night-muted" aria-hidden="true">
                {pad(look.n)}
              </span>
              <Verse line={look.line} cite={look.cite} size="lg" />
              <Link href={`/runway#look-${look.n}`} className="btn btn-ghost self-start">
                See every angle of look {look.n}
              </Link>
            </div>
          </div>
        </section>
      ))}

      {siblings.length > 0 && (
        <section data-surface="day" aria-labelledby="more-title" className="section-y border-t border-day-line">
          <div className="container-x">
            <h2 id="more-title" className="type-h3">
              {looks.length ? "Wear it with" : `More from ${DROP_LABEL[product.drop]}`}
            </h2>
            <ul className="head-gap grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
              {siblings.map((p) => (
                <li key={p.id}>
                  <ProductTile product={toLite(p)} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </PageTransition>
  );
}

function related(product: Product, all: Product[]) {
  const others = all.filter((p) => p.id !== product.id && p.available);
  const lookIds = new Set(lookFor(product.id).flatMap((l) => l.products));
  const fromLook = others.filter((p) => lookIds.has(p.id));
  const sameDrop = others.filter((p) => p.drop === product.drop && !lookIds.has(p.id));
  const sameCategory = others.filter((p) => p.category === product.category && p.drop !== product.drop);
  return [...fromLook, ...sameDrop, ...sameCategory].slice(0, 4);
}

function Disclosure({ title, children, open, id }: { title: string; children: React.ReactNode; open?: boolean; id?: string }) {
  return (
    <details id={id} open={open} className="group scroll-mt-24 py-1">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden="true" className="text-lead font-normal transition-transform duration-200 ease-quint group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-5 text-ui leading-relaxed">{children}</div>
    </details>
  );
}
