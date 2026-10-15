import { notFound, permanentRedirect } from "next/navigation";
import { getProducts } from "@/lib/shopify";

// Old Shopify product URLs (/products/<handle>) from lightfashions.com, Instagram and search results
// land on the matching product here. The map comes from the live catalog, so new products work too.
export default async function OldProductUrl(props: PageProps<"/products/[handle]">) {
  const { handle } = await props.params;
  const product = (await getProducts()).find((p) => p.handle === handle);
  if (!product) notFound();
  permanentRedirect(`/shop/${product.slug}`);
}
