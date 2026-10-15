import { cache } from "react";
import snapshot from "./products.snapshot.json";
import { SHOPIFY_DOMAIN } from "./shop-config";
import { OVERRIDES, type Category, type Drop, type Scarcity } from "./catalog";
import edges from "./image-fit.generated.json";

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
  featured_image?: { src: string } | null;
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

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** How the photo fills a 3:4 frame: cropped to fill, or whole with its own backdrop filling the rest. */
  fit: "cover" | "contain";
  /** CSS background matching the photo's backdrop, when it isn't white. */
  backdrop?: string;
  /** Brightness that lifts an off-white backdrop to pure white. */
  whiten?: number;
};
export type Variant = {
  id: number;
  title: string;
  options: string[];
  price: number;
  compareAt: number | null;
  available: boolean;
  /** The photo of this variant's colour, when one is known. */
  image?: string;
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
  /** Gallery photos: every one fills a 3:4 frame (see frameOf). */
  images: ProductImage[];
  /** Size-chart images, shown under Size & fit. */
  charts: ProductImage[];
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

  let options = r.options
    .filter((op) => !(op.name === "Title" && op.values.length === 1 && op.values[0] === "Default Title"))
    .map((op) => {
      const values = op.values.map(niceValue);
      return { name: niceOptionName(op.name), values: /size/i.test(op.name) ? sortSizes(values) : values };
    });
  // One-size pieces carry Shopify's placeholder "Default Title" option; drop it.
  for (const v of variants) v.options = options.length ? v.options.map(niceValue) : [];
  // Colour is always chosen first, whatever order the options were entered in Shopify.
  const colorFirst = options.findIndex((op) => /colou?r/i.test(op.name));
  if (colorFirst > 0) {
    const order = [colorFirst, ...options.map((_, i) => i).filter((i) => i !== colorFirst)];
    options = order.map((i) => options[i]);
    for (const v of variants) v.options = order.map((i) => v.options[i]);
  }

  const { sections, shipping } = parseDescription(r.body_html, r.title);
  const alt = `${name}${color ? `, ${color.toLowerCase()}` : ""}`;

  const raw = [...r.images].sort((a, b) => a.position - b.position);
  const charts = new Set(o?.charts ?? []);
  const pictures = raw.map((img, i) => ({ img, i, frame: frameOf(img) }));
  const toImage = ({ img, frame }: (typeof pictures)[number], label: string): ProductImage => ({
    src: img.src,
    width: img.width,
    height: img.height,
    alt: img.alt?.trim() || label,
    fit: frame?.fit ?? "contain",
    ...(frame?.backdrop && { backdrop: frame.backdrop }),
    ...(frame?.whiten && { whiten: frame.whiten }),
  });
  const kept = pictures.filter((p) => !charts.has(p.i) && p.frame);
  // Never leave a product without a photo, even if its only one is landscape.
  const gallery = kept.length ? kept : pictures.filter((p) => !charts.has(p.i)).slice(0, 1);
  const images = gallery.map((p, k) => toImage(p, k === 0 ? alt : `${alt}, view ${k + 1}`));

  // Each colour's photo: Shopify's own variant link first, then the editorial map.
  const colorAt = options.findIndex((op) => /colou?r/i.test(op.name));
  const shown = new Set(images.map((img) => img.src));
  r.variants.forEach((rv, k) => {
    const fromShopify = rv.featured_image?.src;
    const value = colorAt >= 0 ? variants[k].options[colorAt] : undefined;
    const mapped = value === undefined ? undefined : Object.entries(o?.colorImages ?? {}).find(([c]) => c.toLowerCase() === value.toLowerCase())?.[1];
    const src = fromShopify ?? (mapped === undefined ? undefined : raw[mapped]?.src);
    if (src && shown.has(src)) variants[k].image = src;
  });

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
    images,
    charts: pictures.filter((p) => charts.has(p.i)).map((p, k) => toImage(p, `${name} size chart${k ? ` ${k + 1}` : ""}`)),
    variants,
    options,
    description: sections,
    shipping,
    publishedAt: r.published_at,
  };
}

type Edges = { t: string | null; b: string | null; l: string | null; r: string | null; cutout?: boolean };
const EDGES = edges as Record<string, Edges>;

/**
 * How a photo fills a 3:4 frame, or null when it can't without losing what it shows.
 * - Near 3:4: cropped to fill.
 * - A packshot on an off-white backdrop: shown whole, its backdrop lifted to pure white (a slight
 *   brightness filter) so it disappears into the page instead of reading as a grey box.
 * - A packshot on any other flat backdrop: shown whole, that colour filling the rest of the frame.
 * - A cut-out on transparent: shown whole on the page's white.
 * - Any other photograph: cropped to fill, unless it's landscape (a crop would lose the subject).
 * Edge colours come from scripts/build-image-fit.mjs; photos added later fall back on proportions.
 */
type Frame = { fit: "cover" | "contain"; backdrop?: string; whiten?: number };

function frameOf(img: RawImage): Frame | null {
  const ratio = img.width / img.height;
  const e = EDGES[decodeURIComponent(new URL(img.src).pathname.split("/").pop() ?? "")];
  const solid = e ? [e.t, e.b, e.l, e.r].filter((c): c is string => !!c) : [];
  const darkest = solid.length >= 2 ? Math.min(...solid.flatMap((c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)))) : 0;
  const whiten = darkest >= 240 && darkest < 255 ? Math.round((255 / darkest) * 1000) / 1000 : undefined;

  if (ratio >= 0.66 && ratio <= 0.8) return { fit: "cover", ...(whiten && { whiten }) };
  if (!e) return ratio <= 0.88 ? { fit: "cover" } : { fit: "contain" };
  if (e.cutout) return { fit: "contain" };
  if (solid.length >= 2) {
    if (darkest >= 240) return { fit: "contain", ...(whiten && { whiten }) };
    const count = (c: string) => solid.filter((x) => x === c).length;
    const common = solid.reduce((best, c) => (count(c) > count(best) ? c : best));
    const [a, b, dir] = ratio > 0.8 ? [e.t ?? common, e.b ?? common, "to bottom"] : [e.l ?? common, e.r ?? common, "to right"];
    return { fit: "contain", backdrop: a === b ? a : `linear-gradient(${dir}, ${a} 50%, ${b} 50%)` };
  }
  return ratio >= 0.5 && ratio <= 1.1 ? { fit: "cover" } : null;
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
  if (/^colou?rs?$/i.test(n)) return "Color";
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
  // Dividers made of underscores, with or without spaces ("___", "_ ____").
  /^(?=(?:[^_]*_){3})[_\s]+$/,
  /exchanges|returns|final sale|double[- ]check|prior to placing/i,
  /^\*?\s*items are (pre-?made|hand-?crafted)/i,
  /will sell out/i,
  /^pre-?made$/i,
];
const HEADINGS: [RegExp, string][] = [
  [/^(product )?details:?$/i, "Details"],
  [/^size guide:?$/i, "Size guide"],
  [/^(care|care instructions):?$/i, "Care"],
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
    // Lines from <li> start with "• "; match policy wording against the text after the bullet.
    const body = l.replace(/^[•-]\s*/, "");
    return !POLICY.some((re) => re.test(body));
  });

  const sections: DescriptionSection[] = [{ paragraphs: [], bullets: [] }];
  // "Hand wash" is an instruction, not a heading: gather such lines into a Care section at the end.
  const care: string[] = [];
  for (let line of lines) {
    const body = line.replace(/^[•-]\s*/, "");
    if (/^(hand|machine) wash\b/i.test(body)) {
      care.push(body.charAt(0).toUpperCase() + body.slice(1).toLowerCase());
      continue;
    }
    const heading = HEADINGS.find(([re]) => re.test(body));
    if (heading) {
      sections.push({ heading: heading[1], paragraphs: [], bullets: [] });
      continue;
    }
    const inline = body.match(/^(care|details|fit)\s*[:–-]\s*(.+)$/i);
    if (inline) {
      const name = HEADINGS.find(([re]) => re.test(inline[1]))?.[1] ?? "Care";
      sections.push({ heading: name, paragraphs: [inline[2]], bullets: [] });
      continue;
    }
    const wash = body.match(/^washing instructions\s*-\s*(.*)$/i);
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
  if (care.length) sections.push({ heading: "Care", paragraphs: care, bullets: [] });
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

