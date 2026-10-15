import type { Metadata } from "next";
import { connection } from "next/server";
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
  // Rendered per request so the filters in the URL (?category=…, ?only=…) are in the first paint:
  // a static page could only apply them after loading, rebuilding the grid on screen.
  await connection();
  const products = (await getProducts()).map((p) => toLite(p));

  return (
    <PageTransition>
      <div className="pt-3 md:pt-6">
        <ShopBrowser products={products} />
      </div>
    </PageTransition>
  );
}
