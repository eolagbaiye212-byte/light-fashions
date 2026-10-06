import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import Link from "next/link";
import { Suspense } from "react";
import { ShopBrowser } from "@/components/ShopBrowser";
import { IgImage, SectionHead, Verse, pad } from "@/components/bits";
import { LOOKS } from "@/lib/looks";
import { getProducts } from "@/lib/shopify";
import { toLite } from "@/lib/product-lite";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop",
  description: "Everything LIGHT has in the shop: the Light Fashion Experience collection, one-of-one runway pieces, Jesus Lives tees and Light4eva essentials.",
};

// Looks that interrupt the grid, chosen for pieces that are in the shop.
const BAND_LOOKS = [16, 7, 11, 2];

export default async function ShopPage() {
  const products = await getProducts();
  const bands = BAND_LOOKS.map((n) => LOOKS.find((l) => l.n === n)!).map((look, i) => (
    <Link
      key={look.n}
      href={`/runway#look-${look.n}`}
      data-surface="night"
      className={`group grid overflow-hidden sm:grid-cols-2 ${i % 2 ? "sm:[direction:rtl]" : ""}`}
    >
      <div className="drift relative aspect-[4/5] overflow-hidden sm:aspect-auto sm:min-h-[34rem]">
        <IgImage id={look.images[0]} alt={`Look ${look.n}. ${look.alt}`} fill sizes="(min-width: 640px) 46vw, 92vw" className="object-cover" />
      </div>
      <div className="flex flex-col justify-end gap-5 p-6 [direction:ltr] sm:p-10">
        <span className="type-num text-night-muted">{pad(look.n)}</span>
        <Verse line={look.line} cite={look.cite} size="md" />
        <span className="link text-ui font-medium">See look {look.n} on the runway</span>
      </div>
    </Link>
  ));

  return (
    <PageTransition>
    <div data-surface="day" className="page-top section-b">
      <div className="container-x">
        <div className="pb-[var(--space-lg)]">
          <SectionHead
            as="h1"
            id="shop-title"
            title="Shop"
            intro="The Light Fashion Experience collection, one-of-one runway pieces, and everything still in stock from earlier drops. Checkout runs on Shopify, so Shop Pay works as usual."
          />
        </div>
        <Suspense fallback={<div className="h-[60vh]" />}>
          <ShopBrowser products={products.map((p) => toLite(p))} bands={bands} />
        </Suspense>
      </div>
    </div>
    </PageTransition>
  );
}
