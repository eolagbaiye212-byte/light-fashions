import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/shopify";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lightfashions.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const pages = ["", "/shop", "/runway", "/story", "/info"].map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...products.map((p) => ({
      url: `${SITE}/shop/${p.slug}`,
      lastModified: p.publishedAt,
      changeFrequency: "weekly" as const,
      priority: p.available ? 0.7 : 0.3,
    })),
  ];
}
