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
      <div className="container-x hairline grid gap-[var(--space-xl)] border-t pt-[var(--space-xl)] md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <p className="quote-lg max-w-[20ch]">Walk as children of light.</p>
          <p className="muted mt-3 text-ui">Ephesians 5:8</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:col-span-7">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-ui font-semibold">{col.title}</h2>
              <ul className="mt-4 space-y-2.5 text-ui">
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

      <div className="container-x block-gap">
        <Image
          src="/brand/light-chrome.webp"
          alt="LIGHT"
          width={1200}
          height={425}
          sizes="(min-width: 1536px) 1440px, 92vw"
          className="logo-night mx-auto h-auto w-full max-w-[90rem] select-none"
        />
        <Image
          src="/brand/light-chrome-day.webp"
          alt="LIGHT"
          width={1200}
          height={425}
          sizes="(min-width: 1536px) 1440px, 92vw"
          className="logo-day mx-auto h-auto w-full max-w-[90rem] select-none"
        />
      </div>

      <div className="container-x hairline mt-[var(--space-lg)] flex flex-col gap-1 border-t py-6 text-fine sm:flex-row sm:justify-between">
        <p className="muted">© {new Date().getFullYear()} LIGHT, Children of the Light. Designed by Myron.</p>
        <p className="muted">Checkout and payments by Shopify.</p>
      </div>
    </FooterSurface>
  );
}
