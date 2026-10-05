// Editorial layer over the live Shopify catalog. Shopify stays the source of truth for
// price, stock, variants and images; this file only names, groups and annotates.
// Products added in Shopify later work without an entry here (see fallbacks in shopify.ts).

export type Category = "outerwear" | "tops" | "hoodies" | "bottoms" | "sets" | "accessories";
export type Drop = "show" | "summer" | "jesus-lives" | "messiah-made" | "archive";
export type Scarcity = "one-of-one" | "only-two" | "pre-release" | "sample" | "first";

export type Override = {
  name: string;
  color?: string;
  category: Category;
  drop: Drop;
  scarcity?: Scarcity;
  /** One or two plain sentences, used when Shopify's description is mostly policy text. */
  lede?: string;
  /** Runway look numbers this piece walked in. */
  looks?: number[];
};

export const CATEGORY_LABEL: Record<Category, string> = {
  outerwear: "Outerwear",
  tops: "Tees & tops",
  hoodies: "Hoodies & crews",
  bottoms: "Bottoms",
  sets: "Sets",
  accessories: "Accessories",
};

export const DROP_LABEL: Record<Drop, string> = {
  show: "Light Fashion Experience",
  summer: "Light4eva summer",
  "jesus-lives": "Jesus Lives",
  "messiah-made": "Messiah Made",
  archive: "Archive",
};

export const SCARCITY_LABEL: Record<Scarcity, string> = {
  "one-of-one": "1 of 1",
  "only-two": "Only 2 exist",
  "pre-release": "Pre-release",
  sample: "Unreleased sample",
  first: "The first LIGHT piece",
};

export const OVERRIDES: Record<number, Override> = {
  10566276710540: {
    name: "Forgiven Jacket",
    color: "Black",
    category: "outerwear",
    drop: "show",
    scarcity: "pre-release",
    lede: "Faux-leather moto jacket with FORGIVEN embossed across the chest and quilted shoulders. Released one at a time; this is pre-release access.",
    looks: [2],
  },
  10566318129292: {
    name: "Forgiven Jacket",
    color: "Navy",
    category: "outerwear",
    drop: "show",
    scarcity: "pre-release",
    lede: "Faux-leather moto jacket with FORGIVEN embossed across the chest and quilted shoulders. Released one at a time; this is pre-release access.",
    looks: [2],
  },
  10565502697612: { name: "Eternal Jacket", category: "outerwear", drop: "show", looks: [5] },
  10565178097804: {
    name: "Light Rhinestone Jacket",
    category: "outerwear",
    drop: "show",
    scarcity: "one-of-one",
    looks: [16],
  },
  10565033230476: { name: "Light Chain Tee", category: "tops", drop: "show", looks: [14] },
  10564685824140: { name: "Light Chain Hoodie", category: "hoodies", drop: "show", looks: [1] },
  10564169695372: { name: "Light Striped Tee", category: "tops", drop: "show", looks: [9] },
  10564044259468: { name: "Women's Red Cross Garment", category: "tops", drop: "show", looks: [12] },
  10564038590604: { name: "Women's Light Tank", category: "tops", drop: "show", looks: [3, 10] },
  9535087739020: { name: "Light4eva Reflective Women's Tee", category: "tops", drop: "summer", looks: [15] },
  9535045107852: { name: "Light4eva Reflective Bag", category: "accessories", drop: "summer", looks: [3, 5] },
  9162324377740: {
    name: "Light Skull Cap",
    category: "accessories",
    drop: "summer",
    lede: "Knit skull cap with the LIGHT wordmark in reflective thread. It throws back light under flash and headlights.",
    looks: [5],
  },
  9107472154764: {
    name: "Jesus Lives Tee",
    category: "tops",
    drop: "jesus-lives",
    lede: "Oversized tee with the chrome-printed JESUS LIVES star. First released on Good Friday 2026.",
    looks: [11],
  },
  8686660223116: { name: "Messiah Made Pants", category: "bottoms", drop: "messiah-made" },
  8686381793420: { name: "Messiah Made Zip-Up", category: "hoodies", drop: "messiah-made" },
  7164959359116: {
    name: "Crown of Thorns Hoodie",
    color: "Desert Sand",
    category: "hoodies",
    drop: "archive",
    lede: "Scarf-hood pullover with a reflective embroidered crown of thorns.",
  },
  7547145584780: {
    name: "Find God Hoodie",
    color: "White",
    category: "hoodies",
    drop: "archive",
    lede: "Scarf hood with tonal FIND GOD embroidery and Proverbs 8:17 down the sleeve: those who seek me diligently find me.",
  },
  7547151777932: {
    name: "Find God Hoodie",
    color: "Black",
    category: "hoodies",
    drop: "archive",
    lede: "Scarf hood with reflective FIND GOD embroidery and Proverbs 8:17 down the sleeve: those who seek me diligently find me.",
  },
  7257809092748: {
    name: "The Light Crewneck",
    color: "White",
    category: "hoodies",
    drop: "archive",
    lede: "Oversized crewneck with a screen-printed radiant cross.",
  },
  8387394535564: { name: "Light Crewneck", category: "hoodies", drop: "archive", scarcity: "sample" },
  8387385819276: {
    name: "Purple Flower Denim Set",
    category: "sets",
    drop: "show",
    scarcity: "one-of-one",
    lede: "Cropped LIGHT × P.G denim jacket with reflective embroidery, custom cross zippers and hand-placed flowers, with matching flare jeans (size 36).",
    looks: [7],
  },
  8387323822220: {
    name: "White Paint Denim Set",
    category: "sets",
    drop: "archive",
    scarcity: "one-of-one",
    lede: "Cropped LIGHT × P.G denim jacket and flare jeans, painted out in white by hand. Jacket M, jeans 36.",
  },
  8387322118284: { name: "Chrome Light Zip-Up", category: "hoodies", drop: "archive", scarcity: "sample" },
  8387314581644: { name: "Lavender Find God Hoodie", category: "hoodies", drop: "archive", scarcity: "only-two" },
  8387311173772: { name: "Pink Tie-Dye All Hail Yeshua Tee", category: "tops", drop: "archive", scarcity: "one-of-one" },
  8387285287052: { name: "Lavender Hebrew Tee", category: "tops", drop: "archive", scarcity: "one-of-one" },
  8387260547212: {
    name: "Purple Light Cross Hoodie",
    category: "hoodies",
    drop: "archive",
    scarcity: "one-of-one",
    lede: "Oversized lavender hoodie with a screen-printed radiant cross.",
  },
  8242434834572: {
    name: "Light Chain",
    color: "White",
    category: "accessories",
    drop: "archive",
    scarcity: "one-of-one",
    lede: "Stainless steel LIGHT star pendant with a frosted finish.",
  },
  8242434736268: {
    name: "Light Chain",
    color: "Concrete Grey",
    category: "accessories",
    drop: "archive",
    scarcity: "one-of-one",
    lede: "Stainless steel LIGHT star pendant with a frosted finish.",
  },
  7861896413324: {
    name: "Jesus Wept Scarf Tee",
    category: "tops",
    drop: "archive",
    lede: "300+ GSM heavyweight tee with an attached scarf hood and reflective JESUS WEPT embroidery. John 11:35 on the scarf.",
  },
  8120874107020: { name: "Light × P.G Denim Pants", category: "bottoms", drop: "archive" },
  8120992235660: { name: "Light × P.G Denim Jacket", category: "outerwear", drop: "archive", looks: [8] },
  7331564290188: {
    name: "Crucifix Hoodie",
    color: "Charcoal Grey",
    category: "hoodies",
    drop: "archive",
    lede: "Oversized scarf-hood pullover with a screen-printed crucifix.",
  },
  7831257448588: {
    name: "All Hail Yeshua Tee",
    category: "tops",
    drop: "archive",
    lede: "300+ GSM heavyweight tee with reflective ALL HAIL YESHUA embroidery and three crosses on the back.",
  },
  7004827779212: {
    name: "Crown of Thorns Tee",
    category: "tops",
    drop: "archive",
    scarcity: "first",
    lede: "The first piece LIGHT ever made, kept as a 1 of 1. Oversized cotton with puff print front and back.",
  },
  7831290314892: {
    name: "I Love Jesus Hebrew Tee",
    category: "tops",
    drop: "archive",
    lede: "300+ GSM heavyweight tee with reflective Hebrew embroidery: “I love Yeshua.”",
  },
  8089712951436: {
    name: "All Hail Runway Garment",
    category: "tops",
    drop: "archive",
    scarcity: "one-of-one",
  },
};
