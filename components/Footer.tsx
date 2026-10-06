import Image from "next/image";
import Link from "next/link";
import { INSTAGRAM } from "@/lib/media";
import { FooterSurface } from "./FooterSurface";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Everything" },
      { href: "/shop?category=outerwear", label: "Outerwear" },
      { href: "/shop?category=tops", label: "Tees & tops" },
      { href: "/shop?category=hoodies", label: "Hoodies & crews" },
      { href: "/shop?only=one-of-one", label: "One of one" },
    ],
  },
  {
    title: "LIGHT",
    links: [
      { href: "/runway", label: "The runway" },
      { href: "/story", label: "Story" },
      { href: INSTAGRAM, label: "Instagram", external: true },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/info#shipping", label: "Shipping" },
      { href: "/info#returns", label: "Returns" },
      { href: "/info#sizing", label: "Size guide" },
      { href: "/info#contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <FooterSurface>
      <div className="container-x hairline grid gap-[var(--space-lg)] border-t pt-[var(--space-xl)] md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          {/* The mark signs off the page at a modest size: chrome on night, gunmetal on day. */}
          <Image src="/brand/light-chrome.webp" alt="LIGHT" width={1200} height={425} unoptimized className="logo-night h-auto w-[12rem] select-none sm:w-[14rem]" />
          <Image src="/brand/light-chrome-day.webp" alt="LIGHT" width={1200} height={425} unoptimized className="logo-day h-auto w-[12rem] select-none sm:w-[14rem]" />
          <p className="quote-lg mt-[var(--space-md)] max-w-[20ch]">Walk as children of light.</p>
          <p className="muted mt-2 text-ui">Ephesians 5:8</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 md:col-span-7">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-ui font-semibold">{col.title}</h2>
              <ul className="mt-3 space-y-2 text-ui">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {"external" in l ? (
                      <a href={l.href} target="_blank" rel="noreferrer" className="hover:underline">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="hover:underline">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="container-x hairline mt-[var(--space-xl)] border-t py-5 text-fine">
        <p className="muted max-w-[120ch]">
          Photography: runway looks by @diamondrose.photos, styled by @ethannn_estinvil. Campaigns by @kdshot_it, @kemflics,
          @kyng.archives and @mediabymarky. Show film by @lightproductions.co. Every image comes from{" "}
          <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="link">
            @children_ofthelight
          </a>
          .
        </p>
        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:justify-between">
          <p className="muted">© {new Date().getFullYear()} LIGHT, Children of the Light. Designed by Myron.</p>
          <p className="muted">Checkout and payments by Shopify.</p>
        </div>
      </div>
    </FooterSurface>
  );
}
