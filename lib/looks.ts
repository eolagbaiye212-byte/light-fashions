// The Light Fashion Experience — LIGHT's first solo show, New York, September 13, 2026.
// Running order, lines and pieces are taken from the look-by-look posts on @children_ofthelight.

export type Look = {
  n: number;
  /** Instagram post the look was published in. */
  post: string;
  /** Media ids, best frame first. */
  images: string[];
  /** The line the look was built around, as the designer posted it. */
  line: string;
  /** Scripture reference. Absent when the line is the designer's own words. */
  cite?: string;
  /** Shopify product ids for pieces from this look that are in the shop. */
  products: number[];
  alt: string;
};

const range = (post: string, n: number, first = 0) =>
  [first, ...Array.from({ length: n }, (_, i) => i).filter((i) => i !== first)].map((i) => `${post}-${i}`);

export const LOOKS: Look[] = [
  {
    n: 1,
    post: "DdWuENHEfNd",
    images: range("DdWuENHEfNd", 4, 0),
    line: "And God said, let there be…",
    cite: "Genesis 1:3",
    products: [10564685824140],
    alt: "Model in the black Light Chain Hoodie and camo shorts, holding up a newspaper page that reads Jesus",
  },
  {
    n: 2,
    post: "DdXhh9lGzsf",
    images: range("DdXhh9lGzsf", 5, 0),
    line: "In Him we have redemption through His blood, the forgiveness of sins…",
    cite: "Ephesians 1:7",
    products: [10566276710540, 10566318129292],
    alt: "Model in an oxblood Forgiven leather jacket with a red scarf pulled over the face",
  },
  {
    n: 3,
    post: "DdZybfKGMjk",
    images: range("DdZybfKGMjk", 6, 1),
    line: "I am the light of the world. Whoever follows me will never walk in darkness, but will have the light of life.",
    cite: "John 8:12",
    products: [10564038590604, 9535045107852],
    alt: "Model in the white Women's Light Tank and washed jeans, carrying the yellow Light4eva bag",
  },
  {
    n: 4,
    post: "DdaQAi9kbXW",
    images: range("DdaQAi9kbXW", 3, 0),
    line: "The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?",
    cite: "Psalm 27:1",
    products: [],
    alt: "Model in an oversized white graphic tee, patterned tie and LIGHT shorts",
  },
  {
    n: 5,
    post: "Ddb20OUEfhm",
    images: range("Ddb20OUEfhm", 6, 1),
    line: "We will have a house in heaven, an eternal body made for us by God himself… We grow weary in our present bodies, and we long to put on our heavenly bodies like new clothing.",
    cite: "2 Corinthians 5:1–2",
    products: [10565502697612, 9535045107852, 9162324377740],
    alt: "Model in the black Eternal Jacket and LIGHT skull cap with the yellow Light4eva bag over one shoulder",
  },
  {
    n: 6,
    post: "DdcwKpCm1eo",
    images: range("DdcwKpCm1eo", 4, 0),
    line: "4EVA LIGHT",
    products: [],
    alt: "Model in a pink LIGHT tee and draped pink shawl, pearls at the neck",
  },
  {
    n: 7,
    post: "DdedB0Kkfih",
    images: range("DdedB0Kkfih", 5, 0),
    line: "While ye have light, believe in the light, that ye may be the children of light.",
    cite: "John 12:36",
    products: [8387385819276],
    alt: "Model in the purple flower denim jacket over an olive cross tee",
  },
  {
    n: 8,
    post: "DdemsCSkaNw",
    images: range("DdemsCSkaNw", 5, 0),
    line: "This light not chrome",
    products: [8120992235660],
    alt: "Model in the distressed grey Light × P.G jacket with olive cargo pants",
  },
  {
    n: 9,
    post: "Dde0ZWNEULl",
    images: range("Dde0ZWNEULl", 4, 1),
    line: "But He was wounded for our transgressions, He was bruised for our iniquities; the chastisement for our peace was upon Him, and by His stripes we are healed.",
    cite: "Isaiah 53:5",
    products: [10564169695372],
    alt: "Model in the red and white Light Striped Tee and sunglasses",
  },
  {
    n: 10,
    post: "DdfCII5kWpV",
    images: range("DdfCII5kWpV", 6, 1),
    line: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things have become new.",
    cite: "2 Corinthians 5:17",
    products: [10564038590604],
    alt: "Model in the black Women's Light Tank and black shorts with a pink LIGHT graphic",
  },
  {
    n: 11,
    post: "DdfP7kZkcwP",
    images: range("DdfP7kZkcwP", 4, 1),
    line: "And if Christ be not risen, then our preaching is vain, and your faith is also vain.",
    cite: "1 Corinthians 15:14",
    products: [9107472154764],
    alt: "Model in the black Jesus Lives tee with the silver chrome star",
  },
  {
    n: 12,
    post: "Ddg9ywokdFD",
    images: range("Ddg9ywokdFD", 5, 1),
    line: "I take the garments they wore in the days of Jesus and I put it in ours",
    products: [10564044259468],
    alt: "Model in the white Women's Red Cross Garment with flared sleeves and a long black skirt",
  },
  {
    n: 13,
    post: "DdhRn_OCYr0",
    images: range("DdhRn_OCYr0", 4, 0),
    line: "Light everyday",
    products: [],
    alt: "Model in a cream hoodie with pale blue lettering and wide grey jeans",
  },
  {
    n: 14,
    post: "DdhZLZpm-U5",
    images: range("DdhZLZpm-U5", 5, 1),
    line: "Iced out my chains, He took the chains off of us",
    products: [10565033230476],
    alt: "Model in the cream Light Chain Tee with its printed silver chains and crosses",
  },
  {
    n: 15,
    post: "DdhpA01m8k6",
    images: range("DdhpA01m8k6", 3, 0),
    line: "Trust in the Lord forever, for in YAH, the Lord, is everlasting strength.",
    cite: "Isaiah 26:4",
    products: [9535087739020],
    alt: "Model in a white fitted LIGHT tee and white cargo shorts with a blue graphic",
  },
  {
    n: 16,
    post: "Ddh1xvnG7AR",
    images: range("Ddh1xvnG7AR", 5, 4),
    line: "Let your light shine",
    cite: "Matthew 5:16",
    products: [10565178097804],
    alt: "Model in the one-of-one Light Rhinestone Jacket, Light of the World script on the trousers",
  },
];

export const SHOW = {
  name: "Light Fashion Experience",
  date: "September 13, 2026",
  city: "New York",
  credits: [
    { role: "Designed by", who: "Myron", handle: "divine.myron" },
    { role: "Styled by", handle: "ethannn_estinvil" },
    { role: "Look photography", handle: "diamondrose.photos" },
    { role: "Show photography", handle: "lightproductions.co" },
  ] as { role: string; who?: string; handle: string }[],
};

export function lookFor(productId: number) {
  return LOOKS.filter((l) => l.products.includes(productId));
}
