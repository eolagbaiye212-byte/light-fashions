# light-fashions

A new storefront for **LIGHT (Children of the Light)**, the faith-led streetwear label designed by Myron ([@children_ofthelight](https://www.instagram.com/children_ofthelight/)). It replaces the stock Shopify theme at lightfashions.com with a site built around the Light Fashion Experience, LIGHT's first solo show at New York Fashion Week (September 13, 2026).

## How it works

The site is **headless on the existing Shopify store**. No API keys or app installs are needed.

- **Products, prices and stock** come live from Shopify's public `products.json` feed (`lib/shopify.ts`), re-fetched every 5 minutes. If Shopify can't be reached, a bundled snapshot (`lib/products.snapshot.json`) keeps the site up.
- **Names, categories, scarcity labels and runway looks** are an editorial layer in `lib/catalog.ts`, keyed by Shopify product ID. New Shopify products still appear without an entry.
- **The bag** lives in the browser (`lib/bag.ts`). **Check out** sends it to Shopify's own checkout through a cart permalink (`/cart/{variantId}:{qty},…`), so payments, discount codes, Shop Pay and order emails all stay in Shopify.

## Pages

| Route | What it is |
|---|---|
| `/` | Runway film hero, the 16 looks, the darkness-to-light transition, the show collection, one-of-ones, 2026 campaigns |
| `/shop` | Full catalog with category, one-of-one and in-stock filters (state lives in the URL) |
| `/shop/[slug]` | Product page: gallery, size picker, size guide, the runway look it walked in |
| `/runway` | All 16 looks in running order, each with its scripture line and shoppable pieces |
| `/story` | The brand, Myron's words, and a 2026 timeline |
| `/info` | Shipping, returns (all sales final), sizing, payment, contact |

## Design

- `PRODUCT.md` covers who it's for, brand personality and principles.
- `DESIGN.md` covers color tokens (sampled from the show photography), type (Hanken Grotesk for everything, Frank Ruhl Libre for scripture and Myron's words; both OFL and self-hosted in `app/fonts`), layout and the motion system.

Motion is built to stay smooth: Lenis wheel smoothing, React view transitions between pages (the product photo carries from grid to product page), CSS scroll-driven animations for the light transition, and full `prefers-reduced-motion` support.

## Run it

Requires Node 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000. For a production build, which is smoother than dev mode:

```bash
npm run build
npm start
```

## Environment variables (all optional)

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SHOPIFY_DOMAIN` | `children-ofthe-light.myshopify.com` | Shopify store used for products and checkout |
| `NEXT_PUBLIC_SITE_URL` | `https://lightfashions.com` | Canonical URL for metadata, sitemap and share images |

## Media

Photos and video in `public/media` come from @children_ofthelight posts published after February 13, 2026. `scripts/build-media.mjs` converts the raw pull (`_source/`, not committed) into WebP images, blur placeholders (`lib/media.generated.json`) and trimmed, muted video loops.

## Deploy

Import the repo into [Vercel](https://vercel.com/new) as a Next.js project. No configuration is required. To launch on lightfashions.com, point the domain at Vercel and move Shopify's primary domain to a subdomain (for example `shop.lightfashions.com`); checkout keeps working through the `myshopify.com` domain.

## Licensing

The code is MIT licensed (see `LICENSE`). The LIGHT name, logo, product photography and runway imagery belong to LIGHT and the credited photographers, and are not covered by that license.
