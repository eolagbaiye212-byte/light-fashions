import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import { Suspense } from "react";
import { ShopBrowser } from "@/components/ShopBrowser";
import { getProducts } from "@/lib/shopify";
import { toLite } from "@/lib/product-lite";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop",
  description: "Everything LIGHT has in the shop: the Light Fashion Experience collection, one-of-one runway pieces, Jesus Lives tees and Light4eva essentials.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <PageTransition>
      <div data-surface="day" className="page-top section-b">
        <div className="container-x">
          <h1 className="type-h1">Shop</h1>
          <div className="mt-[var(--space-md)]">
            <Suspense fallback={<div className="h-[60vh]" />}>
              <ShopBrowser products={products.map((p) => toLite(p))} />
            </Suspense>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
