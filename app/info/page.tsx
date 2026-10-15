import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import Link from "next/link";
import { INSTAGRAM } from "@/lib/media";

export const metadata: Metadata = {
  title: "Shipping, returns and sizing",
  description: "How LIGHT orders ship, the final-sale policy, sizing for oversized fits, and how to reach us.",
  alternates: { canonical: "/info" },
};

const HOODIE = [
  ["S", "21”", "27”"],
  ["M", "23”", "28”"],
  ["L", "25”", "29”"],
  ["XL", "27”", "29.5”"],
  ["2XL", "28”", "30”"],
];

const SECTIONS = [
  { id: "shipping", title: "Shipping" },
  { id: "returns", title: "Returns" },
  { id: "sizing", title: "Sizing" },
  { id: "payment", title: "Payment" },
  { id: "contact", title: "Contact" },
];

export default function InfoPage() {
  return (
    <PageTransition>
      <div className="px-edge grid gap-10 pt-8 pb-16 md:grid-cols-12 md:gap-6 md:pt-12 md:pb-24">
        <div className="md:col-span-4">
          <h1 className="t-label">Information</h1>
          <nav aria-label="On this page" className="mt-6 md:sticky md:top-[calc(var(--header)+1.5rem)]">
            <ul className="flex flex-wrap gap-x-5 gap-y-1 md:flex-col">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="t-label inline-flex min-h-11 items-center hover:underline md:min-h-9">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="max-w-[60ch] md:col-span-7 md:col-start-6">
          <Block id="shipping" title="Shipping">
            <p>
              Most pieces are made ahead and ship right away. Pre-release and runway pieces say so on their page and ship as soon as
              they&apos;re ready. Shipping cost and delivery options for your address are shown at checkout before you pay.
            </p>
            <p>You&apos;ll get an order confirmation and tracking by email from Shopify.</p>
          </Block>

          <Block id="returns" title="Returns">
            <p className="font-medium">Every sale is final. LIGHT doesn&apos;t accept returns or exchanges.</p>
            <p>
              Most runs are small and many pieces are one-of-one, so please check the size guide and your shipping address before you
              check out. Questions about an order? Message us on Instagram with your order number.
            </p>
          </Block>

          <Block id="sizing" title="Sizing">
            <p>
              Most LIGHT tees, hoodies and crews are cut oversized. Take your usual size for the intended relaxed fit, size up for more
              room, or size down for a closer fit. Women&apos;s tanks and tees are fitted.
            </p>
            <p>Each product page lists its own measurements when we have them. Here&apos;s the Light Chain Hoodie as a reference:</p>
            <table className="mt-2 w-full max-w-sm text-left">
              <caption className="t-meta mb-3 text-left text-grey">Light Chain Hoodie, measured laid flat</caption>
              <thead>
                <tr className="border-b border-ink">
                  <th scope="col" className="t-meta py-2 font-normal">Size</th>
                  <th scope="col" className="t-meta py-2 font-normal">Chest</th>
                  <th scope="col" className="t-meta py-2 font-normal">Length</th>
                </tr>
              </thead>
              <tbody>
                {HOODIE.map(([size, chest, length]) => (
                  <tr key={size} className="border-b border-grey">
                    <th scope="row" className="t-meta py-2.5 font-normal">{size}</th>
                    <td className="t-meta py-2.5">{chest}</td>
                    <td className="t-meta py-2.5">{length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Block>

          <Block id="payment" title="Payment">
            <p>
              When you check out, your bag moves to LIGHT&apos;s Shopify checkout. Card details never touch this site. Shop Pay works
              there, and you can enter a discount code before you pay.
            </p>
          </Block>

          <Block id="contact" title="Contact">
            <p>The fastest way to reach LIGHT is a direct message on Instagram. Include your order number if it&apos;s about an order.</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="btn btn-ink">
                Message @children_ofthelight
              </a>
              <Link href="/shop" className="btn btn-line">
                Back to the shop
              </Link>
            </div>
          </Block>
        </div>
      </div>
    </PageTransition>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`h-${id}`} className="border-t border-ink pt-4 pb-12 first:border-t-0 first:pt-0 md:first:border-t md:first:pt-4">
      <h2 id={`h-${id}`} className="t-label">
        {title}
      </h2>
      <div className="t-body mt-4 space-y-4">{children}</div>
    </section>
  );
}
