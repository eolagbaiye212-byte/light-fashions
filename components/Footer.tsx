import Link from "next/link";
import { INSTAGRAM } from "@/lib/media";

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
    <footer className="border-t border-ink bg-paper">
      <div className="px-edge grid gap-12 py-12 md:grid-cols-12 md:gap-6 md:py-16">
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:col-span-7">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="t-meta text-grey">{col.title}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {"external" in l ? (
                      <a href={l.href} target="_blank" rel="noreferrer" className="t-label hover:underline hover:underline-offset-[3px]">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="t-label hover:underline hover:underline-offset-[3px]">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="md:col-span-4 md:col-start-9">
          <h2 className="t-meta text-grey">Photography</h2>
          <p className="t-body mt-4 max-w-[46ch]">
            Runway looks by @diamondrose.photos, styled by @ethannn_estinvil. Campaigns by @kdshot_it, @kemflics, @kyng.archives
            and @mediabymarky. Show film by @lightproductions.co. Every image comes from{" "}
            <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="link">
              @children_ofthelight
            </a>
            .
          </p>
        </div>
      </div>

      <div className="px-edge t-meta flex flex-col gap-1 border-t border-grey py-4 text-grey sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} LIGHT, Children of the Light. Designed by Myron.</p>
        <p>Checkout and payments by Shopify.</p>
      </div>
    </footer>
  );
}
