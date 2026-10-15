# Design

LIGHT is called LIGHT, so the site is white. The direction is Balenciaga's severity with H&M's
shoppability: stark, image-first and undecorated, with categories, filters and the bag always one
obvious step away. Faith content is present but quiet: scripture set small, in the same voice as
everything else. One typographic moment per page is allowed to be enormous; everything else is small.

This file is the contract. Every component and page checks against it.

## Principles
1. **Images do the work.** Photography runs edge to edge with zero gutters. Text never sits on a face;
   an image carries at most one small caption, placed beside or below it, not over it.
2. **Tiny or enormous.** UI and headings are 11–13px uppercase. A page may have one enormous line.
   Nothing in between.
3. **Words, not icons.** BAG (2), MENU, CLOSE, FILTER, SORT. No icon fonts, no glyph buttons except
   the + / − of a quantity stepper and the ← → of carousels, which are characters, not icons.
4. **One shape.** Rectangles with square corners. 1px hairlines are the only borders. No shadows,
   cards, pills, gradients, glow or chrome.
5. **Facts, plainly.** Prices, sizes, stock and scarcity come from Shopify and `lib/catalog.ts`.
   "1 OF 1" is a fact, set in mono, never a sales banner.
6. **Phone first.** Most visits come from Instagram on a phone. Design at 375px, then scale up.

## Tokens

### Colour (and nothing else)
| Token | Hex | Use |
|---|---|---|
| `--color-paper` | #FFFFFF | Every background |
| `--color-ink` | #000000 | Text, buttons, active states |
| `--color-grey` | #767676 | Secondary text and hairlines (4.54:1 on white, AA at any size) |
| `--color-alert` | #D0021B | Sale prices and errors only (5.2:1 on white) |

No dark mode. Video and photographs are the only places colour appears.

### Type
- **Geist** (variable 100–900, OFL, self-hosted `app/fonts/geist-variable.woff2`). Everything.
- **Geist Mono** (variable, OFL, `app/fonts/geist-mono-variable.woff2`). Metadata only: look numbers,
  sizes, "1 OF 1", dates, counts, scripture references, the gallery counter.
- Fallbacks: "Helvetica Neue", Helvetica, Arial, sans-serif / ui-monospace, Menlo, monospace.

| Style | Utility | Spec |
|---|---|---|
| Label | `t-label` | Geist 500, 12px / 16px, uppercase, +0.04em. Nav, buttons, tabs, product names, section labels |
| Meta | `t-meta` | Geist Mono 400, 11px / 16px, uppercase, +0.02em. Counts, sizes, tags, references, dates |
| Body | `t-body` | Geist 400, 14px / 22px, sentence case. Descriptions, story paragraphs, info pages |
| Price | `t-price` | Geist 500, 12px, tabular figures |
| Giant | `t-giant` | Geist 600, clamp(56px, 13vw, 208px) / 0.86, uppercase, −0.045em. One per page at most |
| Menu | `t-menu` | Geist 600, 40px / 1, uppercase, −0.03em. The mobile menu sheet only |

Scripture is set in `t-body` (or `t-label` in tight places), with its reference in `t-meta`.
Myron's own lines are set the same way, with no attribution, as he asked.

### Space
- Page edge `--edge`: 16px under 768px, 24px from 768px.
- Header height `--header`: 48px.
- Vertical rhythm, a 4px base: 8 / 16 / 24 / 48 / 96. Sections are separated by 96px (48px on
  phones) or by a hairline, never by both.
- Grids have zero gutters. Product grids are ruled with 1px hairlines instead of gaps.

### Motion
- Opacity fades only, 200ms out, 300ms in, `cubic-bezier(0.2, 0, 0, 1)`.
- View transitions: the product photo carries from grid to product page (shared element); other
  page changes fade. No slides, bounce, parallax, smooth-scroll libraries or scroll-driven effects.
- `prefers-reduced-motion`: no video autoplay, no transitions.

## Components
| Component | Spec |
|---|---|
| Header | Fixed, white, 48px, hairline bottom. Phone: MENU left, mark centre, BAG (n) right. Desktop: mark left, SHOP RUNWAY STORY after it, BAG (n) right. Current page underlined |
| Mark | Myron's LIGHT mark, flattened to solid black (`public/brand/light-mark-black*`), 20px tall in the header. Shape unchanged. Needs Myron's approval; fallback is "LIGHT" in Geist 800 |
| Menu sheet | Full-screen white `<dialog>`. CLOSE top right, links in `t-menu`, Instagram and Help links small at the bottom |
| Button | Black rectangle, white `t-label`, 48px tall, full width in context. Secondary: 1px black outline. Disabled: grey outline, grey text |
| Text link | `t-label`, underlined 1px, offset 3px |
| Tabs | `t-label` words; the active one underlined 2px. Wrap on phones, never clip |
| Size box | 48×48 min, 1px grey hairline, `t-meta`. Selected: black fill, white text. Sold out: grey text, struck through, disabled |
| Accordion | Native `<details>`, hairline above each, `t-label` summary with + / − at the right |
| Product cell | Image 3:4 that always fills its frame (see Imagery), hover shows the second image (pointer devices only; it isn't downloaded on touch screens). Below: name `t-label`, price `t-price`, tag `t-meta` ("1 OF 1", "ONLY 2 EXIST", "UNRELEASED SAMPLE", "PRE-RELEASE", "SOLD OUT"). Sold out keeps its cell, image at 50% opacity |
| Product grid | Hairline-ruled cells, edge to edge. Density toggle: phones 1 / 2 columns (default 2), desktop 2 / 4 (default 4) |
| Carousel | Native horizontal scroll with snap; ← → buttons on the left and right edges of the images on pointer devices |
| Gallery | Phone: swipeable full-bleed strip with a `1/4` counter, one frame shape for the strip (the first photo's, between 3:4 and square), every photo cropped to fill it. Desktop product page: vertical stack, each frame in its photo's own proportions. Choosing a colour moves that colour's photo to the front |
| Bag drawer | Right-side white `<dialog>`, 100% wide on phones, 420px on desktop. Lines, quantity stepper, subtotal, CHECKOUT, Shopify note |
| Caption bar | The strip under a campaign image: campaign `t-meta` grey over the product name `t-label` on the left, SHOP NOW on the right, 56px tall, hairline below. The image and its bar are one link |

## Pages
### Home `/`
**Every photograph on the home page links to the product being worn**, opened on that colour where the
product has several (`?color=`). Nothing on the home page links to Story or Runway.

1. **Hero.** The runway film fills the viewport under the header, minus a 48px caption bar
   below it: "LIGHT FASHION EXPERIENCE — NEW YORK, SEPTEMBER 13, 2026" left, SHOP THE COLLECTION right,
   PAUSE / PLAY between. Muted, autoplay, loop, playsinline, poster frame. No text on the film.
2. **Campaign tiles**, stacked edge to edge: THE SHOW COLLECTION, MADE ONCE, JESUS LIVES, LIGHT
   RESURGENCE, LIGHT4EVA SUMMER. Phone: one portrait image. Desktop: two portraits side by side, each
   with its own caption bar naming its piece.
3. **From the show**: a tight carousel of the show drop.
4. **Shop the looks**: the twelve looks whose main piece is in the shop (3 columns on phones, 6 on
   desktop), each captioned with the piece's name and linking to it. Looks 4, 6 and 13 aren't in
   the shop; look 10 repeats the Women's Light Tank from look 3.
5. **Closing line**, the page's one enormous moment: WALK AS CHILDREN OF LIGHT in `t-giant`,
   EPHESIANS 5:8 in `t-meta`.

### Shop `/shop`
One row: SHOP left, CLEAR FILTERS and the count right. Category tabs (Everything, the categories in
`lib/catalog.ts`, One of one) wrap in their own row below large screens; from 1024px they sit in the
sticky bar. The sticky bar (overlapping the header's rule, so there's never a double line) holds SIZE
(letter sizes and waist sizes listed apart), IN STOCK, SORT and VIEW (phones 1 / 2, larger screens
2 / 4 columns). On phones, size and stock live in a FILTER sheet. Every filter is a URL parameter: `category`,
`only=one-of-one`, `stock=1`, `size`, `sort`.

### Product `/shop/[slug]`
Desktop: images stacked on the left (7 of 12 columns), a sticky info column on the right: breadcrumb,
name, price, colour, tag, short description, COLOUR (when the same piece in another colour is a
separate Shopify product, its colours are links), the options (colour always first and preselected
to the colour the first photo shows; sizes that don't exist in the chosen colour are struck through),
ADD TO BAG, then accordions DETAILS,
SIZE & FIT (with any size-chart images), SHIPPING & RETURNS and WORN IN LOOK N. Choosing a colour puts
its photo first and writes `?color=` to the URL; arriving with `?color=` starts on that colour. Phone: swipeable gallery with counter, the same column below,
and a sticky ADD TO BAG bar once the main button scrolls away. One missing-size message only:
SELECT A SIZE, in red under the sizes, announced, with focus returned to the sizes. Below: WEAR IT WITH.

### Runway `/runway`
A short intro (LIGHT FASHION EXPERIENCE, date, credits, a 01–16 index), then one look per screen:
LOOK 01 in mono, the photograph (all angles, swipeable), the line and its reference, WORN: links.
Anchors `#look-1` … `#look-16` unchanged. The page ends on look 16; the footer follows.

### Story `/story`
Words only, no photographs: "LIGHT IS WHAT I CALL A GOD VISION." in `t-giant`, ABOUT LIGHT (what it
is, where the name comes from, the first tee, אור), then 2026 SO FAR as a ruled list of dates.

### Info `/info`
Plain anchored sections: `#shipping`, `#returns`, `#sizing`, `#payment`, `#contact`.

### Footer
Generous and plain: columns (Shop, LIGHT, Help), photography credits, Instagram, the Shopify note.

## Copy
Short, uppercase in UI, plain. ADD TO BAG, ADDED, SELECT A SIZE, SOLD OUT, BAG (0), YOUR BAG IS EMPTY,
CHECKOUT, CLEAR, SHOW 13 ITEMS. Descriptions and story text stay sentence case. Never invent product
facts, prices, sizes, stock, scripture or quotes.

## Imagery
Every photograph fills the space it is given: no box of white (or of a different white) around a
photo, ever. How, in `lib/shopify.ts` (`frameOf`) and `lib/tile.ts` (`frame`):
- Close to 3:4: cropped to fill (`object-cover`).
- A packshot (a flat backdrop, or a cut-out on transparent): shown whole, and its own backdrop colour
  fills the rest of the frame, so off-white and grey backdrops never show as boxes. Edge colours come
  from `scripts/build-image-fit.mjs`; re-run it when photos are added in Shopify.
- Any other photograph: cropped to fill, unless it's landscape, in which case it's left out of the
  gallery (a crop would lose its subject).
- Size charts (listed per product in `lib/catalog.ts`, `charts`) never sit in a gallery; they show
  under SIZE & FIT at their own proportions.
- Each colour's photo comes from Shopify's variant images, else from `colorImages` in `lib/catalog.ts`.

Images under ~1600px on the long edge are never used full-bleed on desktop.

### Image placements
| Where | Photos | Focal point | Links to |
|---|---|---|---|
| Home hero | `runway.mp4`, poster `runway-first-frame.webp` (1280×724) | centre | — |
| The show collection | `DdXhh9lGzsf-2` (look 2), `Ddg9ywokdFD-2` (look 12) | 50% 25%, 45% 18% | Forgiven Jacket (black), Women's Red Cross Garment |
| Made once | `Ddh1xvnG7AR-0` (look 16), `DdedB0Kkfih-1` (look 7) | 50% 22% | Light Rhinestone Jacket, Purple Flower Denim Set |
| Jesus Lives | `DcZ3A7_kdYU-1`, `-3` | 50% 30%, 50% 40% | Jesus Lives Tee, off-white tee & pink chrome |
| Light Resurgence | `DaHD4q5jWT--2`, `-3` | 45% 25%, 50% 20% | Jesus Wept Scarf Tee, white |
| Light4eva summer | `DaJvqbyEe0Y-2`, `-3` | 45% 30%, 50% 55% | Light4eva Women's Tee (white), Light4eva Bag (yellow) |
| Shop the looks | each look's lead photo (`lib/looks.ts`) | 50% 50% | the look's main piece |
| Runway | every angle of each look | 50% 25% | — |
