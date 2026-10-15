import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBag } from "@/components/AddToBag";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCell } from "@/components/ProductCell";
import { ProductStage } from "@/components/ProductStage";
import { PageTransition } from "@/components/PageTransition";
import { IgImage, Price, SectionBar, Tag, Verse, pad } from "@/components/bits";
import { CATEGORY_LABEL, DROP_LABEL } from "@/lib/catalog";
import { lookFor } from "@/lib/looks";
import { getProduct, getProducts, type Product } from "@/lib/shopify";
import { toLite } from "@/lib/product-lite";

export const revalidate = 300;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lightfashions.com";

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
    alternates: { canonical: `/shop/${p.slug}` },
    openGraph: { title, description, images: p.images[0] ? [{ url: p.images[0].src, width: p.images[0].width, height: p.images[0].height, alt: title }] : [] },
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
  const name = product.color ? `${product.name}, ${product.color}` : product.name;
  // The same piece in other colours is a separate Shopify product; link them as one colour choice.
  const colors = product.color ? all.filter((p) => p.name === product.name && p.color).sort((a, b) => a.id - b.id) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name,
        url: `${SITE}/shop/${product.slug}`,
        image: product.images.map((i) => i.src),
        description: product.lede ?? intro?.paragraphs.join(" "),
        brand: { "@type": "Brand", name: "LIGHT" },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: product.price,
          highPrice: product.priceMax,
          offerCount: product.variants.length,
          availability: product.available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Shop", item: `${SITE}/shop` },
          { "@type": "ListItem", position: 2, name: CATEGORY_LABEL[product.category], item: `${SITE}/shop?category=${product.category}` },
          { "@type": "ListItem", position: 3, name },
        ],
      },
    ],
  };

  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductStage>
        <div className="md:grid md:grid-cols-12">
          <div className="md:col-span-7 md:border-r md:border-grey">
            <ProductGallery productId={product.id} images={product.images} name={name} />
          </div>

          <div className="md:col-span-5">
            <div className="px-edge pt-5 pb-12 md:sticky md:top-header md:px-8 md:pt-8 lg:px-12">
              <nav aria-label="Breadcrumb" className="t-meta text-grey">
                <Link href="/shop" transitionTypes={["nav-back"]} className="hover:text-ink hover:underline">
                  Shop
                </Link>
                <span aria-hidden="true"> / </span>
                <Link href={`/shop?category=${product.category}`} transitionTypes={["nav-back"]} className="hover:text-ink hover:underline">
                  {CATEGORY_LABEL[product.category]}
                </Link>
              </nav>

              <h1 className="t-label mt-6 text-[0.8125rem]">{product.name}</h1>
              {product.color && <p className="t-meta mt-1 text-grey">{product.color}</p>}
              <Price price={product.price} priceMax={product.priceMax} compareAt={product.compareAt} className="mt-2 block text-[0.8125rem]" />
              <Tag scarcity={product.scarcity} available={product.available} className="mt-2 block" />

              {(product.lede || intro?.paragraphs.length) && (
                <div className="t-body mt-5 max-w-[52ch] space-y-3">
                  {product.lede ? <p>{product.lede}</p> : intro?.paragraphs.map((t) => <p key={t}>{t}</p>)}
                </div>
              )}

              <div className="mt-8">
                {colors.length > 1 && (
                  <nav aria-label="Color" className="mb-6">
                    <p className="t-meta">
                      Color<span className="text-grey">: {product.color}</span>
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {colors.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/shop/${c.slug}`}
                            scroll={false}
                            aria-current={c.id === product.id ? "page" : undefined}
                            className={[
                              "t-meta grid min-h-12 min-w-12 place-items-center border px-3",
                              c.id === product.id
                                ? "border-ink bg-ink text-paper"
                                : c.available
                                  ? "border-grey hover:border-ink"
                                  : "border-grey text-grey line-through hover:border-ink",
                            ].join(" ")}
                          >
                            {c.color}
                            {!c.available && <span className="sr-only">, sold out</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
                <AddToBag product={toLite(product, 1)} sizeGuide />
              </div>

              <div className="mt-10 border-b border-grey">
                {((intro?.bullets.length ?? 0) > 0 || rest.length > 0) && (
                  <Accordion title="Details" open>
                    {(intro?.bullets.length ?? 0) > 0 && (
                      <ul className="list-disc space-y-1 pl-4">
                        {intro!.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {rest.map((s, i) => (
                      <div key={`${s.heading}-${i}`} className="mt-4 first:mt-0">
                        {s.heading !== "Details" && <h3 className="t-meta text-grey">{s.heading}</h3>}
                        {s.paragraphs.map((t) => (
                          <p key={t} className="mt-1">
                            {t}
                          </p>
                        ))}
                        {s.bullets.length > 0 && (
                          <ul className="mt-1 list-disc space-y-1 pl-4">
                            {s.bullets.map((b) => (
                              <li key={b}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    <p className="t-meta mt-4 text-grey">From {DROP_LABEL[product.drop]}</p>
                  </Accordion>
                )}
                <Accordion title="Size & fit" id="size-guide">
                  {sizeGuide ? (
                    <>
                      <ul className="t-meta space-y-1">
                        {sizeGuide.bullets.map((b) => (
                          <li key={b}>{b}</li>
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
                  {product.charts.map((c) => (
                    <Image key={c.src} src={c.src} width={c.width} height={c.height} alt={c.alt} sizes="(min-width: 768px) 36vw, 100vw" quality={80} className="mt-4 h-auto w-full" />
                  ))}
                </Accordion>
                <Accordion title="Shipping & returns">
                  <p>
                    {product.shipping ? `${product.shipping}. ` : ""}Shipping and tax are shown at checkout. All sales are final: no returns or
                    exchanges, so please check your size and address before you pay.{" "}
                    <Link href="/info#shipping" className="link">
                      More on shipping
                    </Link>
                  </p>
                </Accordion>
                {looks.map((look) => (
                  <Accordion key={look.n} title={`Worn in look ${pad(look.n)}`}>
                    <div className="grid grid-cols-[5.5rem_1fr] gap-4">
                      <Link href={`/runway#look-${look.n}`} className="relative block aspect-[3/4] overflow-hidden">
                        <IgImage id={look.images[0]} alt={`Look ${look.n}. ${look.alt}`} sizes="88px" className="object-cover" />
                      </Link>
                      <div>
                        <Verse line={look.line} cite={look.cite} />
                        <Link href={`/runway#look-${look.n}`} className="t-label link mt-4 inline-block">
                          See look {pad(look.n)}
                        </Link>
                      </div>
                    </div>
                  </Accordion>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProductStage>

      {siblings.length > 0 && (
        <section aria-labelledby="more-title" className="border-t border-ink pt-2">
          <SectionBar id="more-title" title={looks.length ? "Wear it with" : `More from ${DROP_LABEL[product.drop]}`} />
          <div className="overflow-hidden border-t border-grey">
            <ul className="-mr-px grid grid-cols-2 md:grid-cols-4">
              {siblings.map((p) => (
                <li key={p.id} className="border-r border-b border-grey">
                  <ProductCell product={toLite(p)} />
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

function Accordion({ title, children, open, id }: { title: string; children: React.ReactNode; open?: boolean; id?: string }) {
  return (
    <details id={id} open={open} className="group scroll-mt-20 border-t border-grey">
      <summary className="t-label flex min-h-12 list-none items-center justify-between gap-4">
        {title}
        <span aria-hidden="true" className="t-meta text-[0.875rem]">
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">−</span>
        </span>
      </summary>
      <div className="t-body pb-5">{children}</div>
    </details>
  );
}
