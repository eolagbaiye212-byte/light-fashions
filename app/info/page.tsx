import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import Link from "next/link";
import { INSTAGRAM } from "@/lib/media";

export const metadata: Metadata = {
  title: "Shipping, returns and sizing",
  description: "How LIGHT orders ship, the final-sale policy, sizing for oversized fits, and how to reach us.",
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
    <div data-surface="day" className="pt-28 pb-28">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h1 className="display text-[clamp(3.5rem,2rem+5vw,6rem)]">Before you order</h1>
          <nav aria-label="On this page" className="mt-8 lg:sticky lg:top-28">
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="inline-flex min-h-10 items-center rounded-full px-4 text-ui font-medium shadow-[inset_0_0_0_1px_var(--color-day-line)] hover:shadow-[inset_0_0_0_1px_var(--color-day-ink)] lg:px-0 lg:shadow-none lg:hover:underline lg:hover:shadow-none">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="max-w-[64ch] space-y-16 lg:col-span-7 lg:col-start-6">
          <section id="shipping" aria-labelledby="h-shipping" className="scroll-mt-28">
            <h2 id="h-shipping" className="display text-[2.75rem]">
              Shipping
            </h2>
            <div className="mt-4 space-y-4">
              <p>
                Most pieces are made ahead and ship right away. Pre-release and runway pieces say so on their page and ship as soon
                as they&apos;re ready. Shipping cost and delivery options for your address are shown at checkout before you pay.
              </p>
              <p>You&apos;ll get an order confirmation and tracking by email from Shopify.</p>
            </div>
          </section>

          <section id="returns" aria-labelledby="h-returns" className="scroll-mt-28">
            <h2 id="h-returns" className="display text-[2.75rem]">
              Returns
            </h2>
            <div className="mt-4 space-y-4">
              <p className="text-lead font-semibold">Every sale is final. LIGHT doesn&apos;t accept returns or exchanges.</p>
              <p>
                Most runs are small and many pieces are one-of-one, so please check the size guide and your shipping address before
                you check out. Questions about an order? Message us on Instagram with your order number.
              </p>
            </div>
          </section>

          <section id="sizing" aria-labelledby="h-sizing" className="scroll-mt-28">
            <h2 id="h-sizing" className="display text-[2.75rem]">
              Sizing
            </h2>
            <div className="mt-4 space-y-4">
              <p>
                Most LIGHT tees, hoodies and crews are cut oversized. Take your usual size for the intended relaxed fit, size up for
                more room, or size down for a closer fit. Women&apos;s tanks and tees are fitted.
              </p>
              <p>Each product page lists its own measurements when we have them. Here&apos;s the Light Chain Hoodie as a reference:</p>
            </div>
            <table className="tabular mt-6 w-full max-w-md text-left text-ui">
              <caption className="muted mb-3 text-left text-fine">Light Chain Hoodie, measured laid flat</caption>
              <thead>
                <tr className="border-b border-day-ink">
                  <th scope="col" className="py-2 font-semibold">
                    Size
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Chest
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Length
                  </th>
                </tr>
              </thead>
              <tbody>
                {HOODIE.map(([size, chest, length]) => (
                  <tr key={size} className="border-b border-day-line">
                    <th scope="row" className="py-2.5 font-semibold">
                      {size}
                    </th>
                    <td className="py-2.5">{chest}</td>
                    <td className="py-2.5">{length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="payment" aria-labelledby="h-payment" className="scroll-mt-28">
            <h2 id="h-payment" className="display text-[2.75rem]">
              Payment
            </h2>
            <p className="mt-4">
              When you check out, your bag moves to LIGHT&apos;s Shopify checkout. Card details never touch this site. Shop Pay works
              there, and you can enter a discount code before you pay.
            </p>
          </section>

          <section id="contact" aria-labelledby="h-contact" className="scroll-mt-28">
            <h2 id="h-contact" className="display text-[2.75rem]">
              Contact
            </h2>
            <p className="mt-4">
              The fastest way to reach LIGHT is a direct message on Instagram. Include your order number if it&apos;s about an order.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="btn btn-ink">
                Message @children_ofthelight
              </a>
              <Link href="/shop" className="btn btn-ghost">
                Back to the shop
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
