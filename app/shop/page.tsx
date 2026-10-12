import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTransition } from "@/components/PageTransition";
import { ShopBrowser } from "@/components/ShopBrowser";
import { getProducts } from "@/lib/shopify";
import { toLite } from "@/lib/product-lite";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop",
  description: "Everything LIGHT has in the shop: the Light Fashion Experience collection, one-of-one runway pieces, Jesus Lives tees and Light4eva essentials.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <PageTransition>
      <div className="pt-6 md:pt-10">
        <h1 className="t-label px-edge pb-3">Shop</h1>
        <Suspense fallback={<div className="h-[60vh]" />}>
          <ShopBrowser products={products.map((p) => toLite(p))} />
        </Suspense>
      </div>
    </PageTransition>
  );
}
