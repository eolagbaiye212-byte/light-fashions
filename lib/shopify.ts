import { cache } from "react";
import snapshot from "./products.snapshot.json";
import { SHOPIFY_DOMAIN } from "./shop-config";
import { OVERRIDES, type Category, type Drop, type Scarcity } from "./catalog";


type RawImage = { src: string; width: number; height: number; position: number; alt?: string | null };
type RawVariant = {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price: string;
  compare_at_price: string | null;
  available: boolean;
};
type RawProduct = {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  published_at: string;
  created_at: string;
  product_type: string;
  tags: string[];
  variants: RawVariant[];
  images: RawImage[];
  options: { name: string; position: number; values: string[] }[];
};

export type ProductImage = { src: string; width: number; height: number; alt: string };
export type Variant = {
  id: number;
  title: string;
  options: string[];
  price: number;
  compareAt: number | null;
  available: boolean;
};
export type ProductOption = { name: string; values: string[] };
export type DescriptionSection = { heading?: string; paragraphs: string[]; bullets: string[] };

export type Product = {
  id: number;
  slug: string;
  handle: string;
  shopifyTitle: string;
  name: string;
  color?: string;
  category: Category;
  drop: Drop;
  scarcity?: Scarcity;
  looks: number[];
  lede?: string;
  price: number;
  priceMax: number;
  compareAt: number | null;
  available: boolean;
  /** Only one physical piece (1 of 1 / sample / first piece) — quantity is capped at 1. */
  single: boolean;
  images: ProductImage[];
  variants: Variant[];
  options: ProductOption[];
  description: DescriptionSection[];
  shipping?: string;
  publishedAt: string;
};

// ---------------------------------------------------------------- fetching

async function fetchRaw(): Promise<RawProduct[]> {
  try {
    const all: RawProduct[] = [];
    for (let page = 1; page <= 4; page++) {
      const res = await fetch(`https://${SHOPIFY_DOMAIN}/products.json?limit=250&page=${page}`, {
        next: { revalidate: 300, tags: ["products"] },
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Shopify responded ${res.status}`);
      const { products } = (await res.json()) as { products: RawProduct[] };
      all.push(...products);
      if (products.length < 250) break;
    }
    if (all.length === 0) throw new Error("Shopify returned no products");
    return all;
  } catch (err) {
    console.warn("[shopify] live catalog unavailable, using bundled snapshot:", err);
    return (snapshot as { products: RawProduct[] }).products;
  }
}

// cache() dedupes within a render; Next's fetch cache handles revalidation across requests.
export const getProducts = cache(async (): Promise<Product[]> => normalizeAll(await fetchRaw()));

export async function getProduct(slug: string) {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

// ---------------------------------------------------------------- normalizing

function normalizeAll(raw: RawProduct[]): Product[] {
  const used = new Set<string>();
  return raw
    .map((r) => normalize(r))
    .map((p) => {
      let slug = p.slug;
      for (let i = 2; used.has(slug); i++) slug = `${p.slug}-${i}`;
      used.add(slug);
      return { ...p, slug };
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function normalize(r: RawProduct): Product {
  const o = OVERRIDES[r.id];
  const auto = parseTitle(r.title);
  const name = o?.name ?? auto.name;
  const color = o?.color;
  const scarcity = o?.scarcity ?? auto.scarcity;

  const variants: Variant[] = r.variants.map((v) => ({
    id: v.id,
    title: v.title,
    options: [v.option1, v.option2, v.option3].filter((x): x is string => !!x),
    price: Number(v.price),
    compareAt: v.compare_at_price ? Number(v.compare_at_price) : null,
    available: v.available,
  }));
  const prices = variants.map((v) => v.price);
  const compare = variants.map((v) => v.compareAt ?? 0);
  const maxCompare = Math.max(...compare);

  const options = r.options
    .filter((op) => !(op.name === "Title" && op.values.length === 1 && op.values[0] === "Default Title"))
    .map((op) => {
      const values = op.values.map(niceValue);
      return { name: niceOptionName(op.name), values: /size/i.test(op.name) ? sortSizes(values) : values };
    });
  // One-size pieces carry Shopify's placeholder "Default Title" option; drop it.
  for (const v of variants) v.options = options.length ? v.options.map(niceValue) : [];

  const { sections, shipping } = parseDescription(r.body_html, r.title);
  const alt = `${name}${color ? `, ${color.toLowerCase()}` : ""}`;

  return {
    id: r.id,
    slug: slugify(`${name}${color ? ` ${color}` : ""}`),
    handle: r.handle,
    shopifyTitle: r.title,
    name,
    color,
    category: o?.category ?? guessCategory(r.title),
    drop: o?.drop ?? "archive",
    scarcity,
    looks: o?.looks ?? [],
    lede: o?.lede,
    price: Math.min(...prices),
    priceMax: Math.max(...prices),
    compareAt: maxCompare > Math.min(...prices) ? maxCompare : null,
    available: variants.some((v) => v.available),
    single: scarcity === "one-of-one" || scarcity === "sample" || scarcity === "first" || scarcity === "pre-release",
    images: r.images
      .sort((a, b) => a.position - b.position)
      .map((img, i) => ({
        src: img.src,
        width: img.width,
        height: img.height,
        alt: img.alt?.trim() || (i === 0 ? alt : `${alt}, view ${i + 1}`),
      })),
    variants,
    options,
    description: sections,
    shipping,
    publishedAt: r.published_at,
  };
}

const SIZE_WORDS: Record<string, string> = {
  SMALL: "S",
  MEDIUM: "M",
  LARGE: "L",
  "EXTRA LARGE": "XL",
  XXL: "2XL",
};

function niceValue(v: string) {
  const up = v.trim().toUpperCase();
  if (SIZE_WORDS[up]) return SIZE_WORDS[up];
  if (/^(XS|S|M|L|XL|2XL|3XL)$/.test(up)) return up;
  if (/^\d+$/.test(up)) return up;
  return titleCase(v.trim());
}

function niceOptionName(n: string) {
  if (/^sizes?$/i.test(n)) return "Size";
  return n.toLowerCase() === "title" ? "Option" : titleCase(n);
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
function sortSizes(values: string[]) {
  const rank = (v: string) => (/^\d+$/.test(v) ? 100 + Number(v) : SIZE_ORDER.indexOf(v) === -1 ? 999 : SIZE_ORDER.indexOf(v));
  return [...values].sort((a, b) => rank(a) - rank(b));
}

// ---------------------------------------------------------------- titles

function parseTitle(title: string): { name: string; scarcity?: Scarcity } {
  let t = title.replace(/["“”†]/g, " ").replace(/\s+/g, " ").trim();
  let scarcity: Scarcity | undefined;
  if (/1\s*o[f0]\s*1/i.test(t)) scarcity = "one-of-one";
  if (/only\s*2\s*exist/i.test(t)) scarcity = "only-two";
  if (/pre-?release/i.test(t)) scarcity = "pre-release";
  if (/sample/i.test(t)) scarcity = scarcity ?? "sample";
  t = t
    .replace(/\(?\s*1\s*o[f0]\s*1\s*\)?/gi, " ")
    .replace(/\(?only \d+ exist\)?/gi, " ")
    .replace(/pre-?release|unreleased|sample|runway garment/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { name: titleCase(t), scarcity };
}

const KEEP_UPPER = new Set(["LIGHT", "NYFW", "USA", "GSM", "P.G", "YAH", "XL", "2XL", "XS", "II", "III"]);

export function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => {
      const up = w.toUpperCase();
      if (KEEP_UPPER.has(up)) return up === "LIGHT" ? "Light" : up;
      if (["of", "the", "and", "a", "in", "x"].includes(w)) return w === "x" ? "×" : w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
}

function guessCategory(title: string): Category {
  const t = title.toLowerCase();
  if (/jacket|coat/.test(t)) return "outerwear";
  if (/hoodie|crewneck|zip/.test(t)) return "hoodies";
  if (/pants|jeans|shorts/.test(t)) return "bottoms";
  if (/set/.test(t)) return "sets";
  if (/cap|bag|chain|hat|beanie/.test(t)) return "accessories";
  return "tops";
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------- descriptions

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', nbsp: " ", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", mdash: "—", ndash: "–", bull: "•", hellip: "…" };

function decode(s: string) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

const POLICY = [
  /^_{3,}$/,
  /exchanges|returns|final sale|double[- ]check|prior to placing/i,
  /^\*?\s*items are (pre-?made|hand-?crafted)/i,
  /will sell out/i,
  /^pre-?made$/i,
];
const HEADINGS: [RegExp, string][] = [
  [/^(product )?details:?$/i, "Details"],
  [/^size guide:?$/i, "Size guide"],
  [/^(care|care instructions|hand wash):?$/i, "Care"],
  [/^fit:?$/i, "Fit"],
];

function isShouting(line: string) {
  const letters = line.replace(/[^A-Za-z]/g, "");
  return letters.length > 12 && letters === letters.toUpperCase();
}

function sentenceCase(line: string) {
  return line
    .toLowerCase()
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase())
    .replace(/\b(light|nyfw|usa|gsm|yah|p\.g)\b/gi, (w) => (w.toLowerCase() === "light" ? "LIGHT" : w.toUpperCase()))
    .replace(/\b1 of 1\b/gi, "1 of 1")
    .replace(/\byeshua\b/gi, "Yeshua")
    .replace(/\bjesus\b/gi, "Jesus")
    .replace(/\bgod\b/gi, "God");
}

function parseDescription(html: string, title: string) {
  const text = decode(
    html
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<(br|\/p|\/li|\/div|\/h\d|\/ul|\/span)[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
  let lines = text
    .split("\n")
    .flatMap((l) => (l.split("•").length > 2 ? l.split("•").map((x) => `• ${x}`) : [l]))
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l && l !== "•" && l.toLowerCase() !== title.toLowerCase());

  let shipping: string | undefined;
  lines = lines.filter((l) => {
    const m = l.match(/ships (immediately|soon|asap)/i);
    if (m) {
      shipping = m[1].toLowerCase() === "soon" ? "Ships soon" : "Ships immediately";
      if (l.replace(/[^a-z]/gi, "").length < 30) return false;
    }
    return !POLICY.some((re) => re.test(l));
  });

  const sections: DescriptionSection[] = [{ paragraphs: [], bullets: [] }];
  for (let line of lines) {
    const heading = HEADINGS.find(([re]) => re.test(line));
    if (heading) {
      sections.push({ heading: heading[1], paragraphs: [], bullets: [] });
      continue;
    }
    const inline = line.match(/^(care|details|fit)\s*[:–-]\s*(.+)$/i);
    if (inline) {
      const name = HEADINGS.find(([re]) => re.test(inline[1]))?.[1] ?? "Care";
      sections.push({ heading: name, paragraphs: [inline[2]], bullets: [] });
      continue;
    }
    const wash = line.match(/^washing instructions\s*-\s*(.*)$/i);
    if (wash) {
      sections.push({ heading: "Care", paragraphs: [wash[1]], bullets: [] });
      continue;
    }
    if (isShouting(line)) line = sentenceCase(line);
    const current = sections[sections.length - 1];
    if (line.startsWith("•") || line.startsWith("- ")) current.bullets.push(line.replace(/^[•-]\s*/, ""));
    else if (line.length <= 34 && !/[.!?]$/.test(line)) current.bullets.push(line);
    else current.paragraphs.push(line);
  }
  return {
    sections: sections.filter((s) => s.paragraphs.length || s.bullets.length),
    shipping,
  };
}

// ---------------------------------------------------------------- helpers

export function isSoldOut(p: Product) {
  return !p.available;
}

export function sizeRange(p: Product) {
  const size = p.options.find((o) => /size/i.test(o.name)) ?? (p.options.length === 1 ? p.options[0] : undefined);
  if (!size) return null;
  const inStock = size.values.filter((v) =>
    p.variants.some((variant) => variant.available && variant.options.includes(v)),
  );
  if (inStock.length === 0) return null;
  if (inStock.length === 1) return inStock[0];
  return `${inStock[0]}–${inStock[inStock.length - 1]}`;
}

