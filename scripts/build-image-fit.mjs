// Samples the edges of every Shopify product photo so a frame can be filled with the photo's own
// backdrop (a packshot on white, black or off-white) instead of showing a box of page white.
// Run with: node scripts/build-image-fit.mjs   (re-run when photos are added in Shopify)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "lib/image-fit.generated.json");
const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? "children-ofthe-light.myshopify.com";

async function products() {
  try {
    const res = await fetch(`https://${domain}/products.json?limit=250`);
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()).products;
  } catch (err) {
    console.warn("live catalog unavailable, using the snapshot:", err.message);
    return JSON.parse(fs.readFileSync(path.join(root, "lib/products.snapshot.json"), "utf8")).products;
  }
}

/** Shopify CDN file name, the stable part of an image URL. */
export const keyOf = (src) => decodeURIComponent(new URL(src).pathname.split("/").pop());

const hex = (c) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

/**
 * The backdrop colour along one edge: the dominant colour when at least 80% of the strip is that
 * one colour (a garment touching the edge is fine), or null when the edge is a photograph.
 */
function strip(data, width, channels, pixels) {
  const buckets = new Map();
  for (const [x, y] of pixels) {
    const i = (y * width + x) * channels;
    const key = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
    const b = buckets.get(key) ?? { n: 0, sum: [0, 0, 0] };
    b.n++;
    for (let c = 0; c < 3; c++) b.sum[c] += data[i + c];
    buckets.set(key, b);
  }
  let top = null;
  for (const b of buckets.values()) if (!top || b.n > top.n) top = b;
  return top.n / pixels.length >= 0.8 ? hex(top.sum.map((s) => s / top.n)) : null;
}

const fit = {};
const list = await products();
for (const p of list) {
  for (const img of p.images) {
    const key = keyOf(img.src);
    if (fit[key]) continue;
    const res = await fetch(`${img.src}${img.src.includes("?") ? "&" : "?"}width=320`);
    const buf = Buffer.from(await res.arrayBuffer());
    const image = sharp(buf);
    const { data, info } = await image.clone().flatten({ background: "#ffffff" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels } = info;
    const band = Math.max(2, Math.round(Math.min(w, h) * 0.02));
    const rows = (y0) => Array.from({ length: band * w }, (_, k) => [k % w, y0 + Math.floor(k / w)]);
    const cols = (x0) => Array.from({ length: band * h }, (_, k) => [x0 + Math.floor(k / h), k % h]);
    const edges = [...rows(0), ...rows(h - band), ...cols(0), ...cols(w - band)];
    // A cut-out (transparent background) already sits on the page's own white.
    let cutout = false;
    if ((await image.metadata()).hasAlpha) {
      const alpha = await image.clone().ensureAlpha().extractChannel(3).raw().toBuffer();
      cutout = edges.filter(([x, y]) => alpha[y * w + x] < 128).length / edges.length >= 0.3;
    }
    fit[key] = {
      t: strip(data, w, channels, rows(0)),
      b: strip(data, w, channels, rows(h - band)),
      l: strip(data, w, channels, cols(0)),
      r: strip(data, w, channels, cols(w - band)),
      ...(cutout && { cutout }),
    };
    console.log(p.handle.padEnd(48), key.slice(0, 40).padEnd(40), JSON.stringify(fit[key]));
  }
}
fs.writeFileSync(out, JSON.stringify(fit, null, 1) + "\n");
console.log(`wrote ${Object.keys(fit).length} images to ${path.relative(root, out)}`);
