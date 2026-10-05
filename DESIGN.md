# Design

## Concept
**Darkness into light.** Ephesians 5:8, the verse the brand is named after: "For you were once darkness, but now you are light in the Lord. Walk as children of light." The site has two surfaces and one gesture that connects them.

- **Night** is the runway set: the dark slatted wall from the Light Fashion Experience shoot, sampled directly from the photographs so images bleed into the page instead of sitting in frames.
- **Day** is the store: flash white, where product packshots live natively.
- **The rod** is the amber light bar visible behind the models. It is the only accent and the only signature motion: it opens the hero video on load, and it widens into white light when you scroll from the runway into the shop.

Scene sentence: a 22-year-old in a dim room at night, phone in hand, who just watched the NYFW recap on Instagram and wants the jacket before the one-of-one is gone.

## Color (OKLCH, sampled from his photography and NYFW poster)
| Token | Value | Hex | Role |
|---|---|---|---|
| `--night` | oklch(0.138 0.006 245) | #07090b | Runway surface (the wall) |
| `--night-2` | oklch(0.189 0.010 248) | #101418 | Raised night surface |
| `--night-ink` | oklch(0.943 0.008 92) | #eeece6 | Text on night (16.9:1) |
| `--night-muted` | oklch(0.706 0.013 248) | #9aa1a8 | Secondary text on night (7.6:1) |
| `--day` | oklch(1 0 0) | #ffffff | Store surface |
| `--day-ink` | oklch(0.162 0.008 248) | #0b0e11 | Text on day (19.4:1) |
| `--day-muted` | oklch(0.496 0.016 248) | #5b636b | Secondary text on day (6.1:1) |
| `--day-line` | oklch(0.921 0.005 258) | #e3e5e8 | Hairlines on day |
| `--tile` | oklch(0.970 0.002 248) | #f4f5f6 | Product image tile (packshots multiply into it) |
| `--rod` | oklch(0.792 0.121 78) | #e6b15a | The light. Accent, focus ring on night, progress |
| `--signal` | oklch(0.535 0.217 29) | #cd0706 | LIGHT × NYFW red. Scarcity facts only: 1 of 1, sold out, pre-release |

Strategy: Drenched night + restrained day. The rod is the only accent and stays under 5% of any screen except during the transition.

## Typography
- **Archivo** (variable, `wdth` 62–125, `wght` 100–900). One family, two voices: condensed heavy uppercase for display (from the NYFW poster's condensed grotesque), normal width for UI and body.
- **Frank Ruhl Libre**. A Hebrew-heritage text serif (the face of Hebrew Bibles and newspapers) for scripture and the founder's words only. The brand already speaks in Hebrew (I Love Jesus Hebrew Tee, "YAH", "Yeshua").
- Body 17px / 1.55 on day, 1.62 on night. Measure ≤ 68ch. Display ceiling 6rem, letter-spacing ≥ -0.02em.
- No tracked-out uppercase eyebrows. UI labels are sentence case.

## Layout
- 12-column grid, 16px side gutter on mobile, 24–40px on desktop, content max 1440px; imagery goes full-bleed.
- Look numbers 01–16 are the real running order of the show, so they are numbered. Nothing else is.
- No cards with borders or shadows. Products sit on a flat tile; type sits under the image.

## Motion
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) for reveals, `cubic-bezier(0.22, 1, 0.36, 1)` (quint-out) for UI. Exits run faster than entrances.
- Durations: 160ms micro, 280–460ms drawers, 310–520ms page transitions, 900–1400ms the hero opening.
- Feedback lives on the control that was used (the add button becomes "Added"), not in toasts.

### System (all compositor-friendly: transform, opacity, clip-path)
| Layer | How | Where |
|---|---|---|
| Smooth wheel scroll | Lenis (`components/SmoothScroll.tsx`), mouse/trackpad only, paused while any dialog is open | everywhere |
| The light | CSS scroll-driven timeline (`.light-*`), rAF fallback writes `--beam`/`--white` | home |
| Page transitions | React `<ViewTransition>` via `components/PageTransition.tsx`; lateral = fade + lift, `nav-forward`/`nav-back` = slide | every page |
| Product morph | named `product-{id}` view transition from tile photo to the product gallery's first photo | tiles → product page |
| Filter reflow | per-tile `<ViewTransition>` + `startTransition(router.replace)`; chips use `useOptimistic` | /shop |
| Scroll-linked | `.rise-in` (tiles), `.drift` (editorial photos), `.unmask` (display headings), `animation-timeline: view()` | grids, stories, headings |
| Image arrival | `FadeImage` fades Shopify images in on load | tiles, galleries, bag |
| Header | hides on scroll down, returns on scroll up; publishes `--header-offset` for sticky bars | global |

- `prefers-reduced-motion`: no autoplay video, no hero opening, static light, no scroll-linked motion, no smooth scroll, instant view transitions.
- Never animate on more than one axis of attention at once: the rod moments are the only page-level choreography.

## Components
Header (text links, theme follows the surface underneath), Bag drawer (native `<dialog>`), Size picker (radio group, sold-out sizes struck and disabled), Runway rail (scroll-snap, arrow keys, buttons), Light transition (sticky, scroll-progress driven), Product tile (image swap to runway shot on hover, quick-add sizes on hover/focus), Verse (serif quote + citation).
