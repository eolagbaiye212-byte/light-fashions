/** The store's permanent Shopify domain. Keeps working even if lightfashions.com is pointed at this site. */
export const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? "children-ofthe-light.myshopify.com";

/** Shopify cart permalink: builds a cart with these variants and opens Shopify's own checkout. */
export function checkoutUrl(lines: { variantId: number; quantity: number }[]) {
  const path = lines.map((l) => `${l.variantId}:${l.quantity}`).join(",");
  return `https://${SHOPIFY_DOMAIN}/cart/${path}`;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });
const usdCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export function money(n: number) {
  return Number.isInteger(n) ? usd.format(n) : usdCents.format(n);
}
