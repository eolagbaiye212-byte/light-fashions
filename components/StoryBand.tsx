import Link from "next/link";
import type { Product } from "@/lib/shopify";
import type { Story } from "@/lib/stories";
import { IgImage, Price, Status } from "./bits";
import { FadeImage } from "./FadeImage";
import { fit } from "@/lib/tile";

/** One 2026 campaign: copy and the pieces on one side, an uneven set of frames on the other. */
export function StoryBand({ story, products, flip = false }: { story: Story; products: Product[]; flip?: boolean }) {
  const [a, b, c] = story.images;
  return (
    <section data-surface={story.surface} aria-labelledby={`story-${story.id}`} className="band-y border-t border-day-line">
      <div className="container-x grid gap-[var(--space-lg)] lg:grid-cols-12 lg:gap-8">
        <div className={`lg:col-span-4 lg:self-start lg:sticky lg:top-28 ${flip ? "lg:order-2 lg:col-start-9" : ""}`}>
          <p className="muted text-ui">{story.when}</p>
          <h2 id={`story-${story.id}`} className="type-h3 mt-2">
            {story.title}
          </h2>
          <p className="mt-4 max-w-[42ch] text-lead">{story.text}</p>

          {products.length > 0 && (
            <ul className="mt-6 max-w-md divide-y divide-day-line border-y border-day-line">
              {products.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <Link href={`/shop/${p.slug}`} transitionTypes={["nav-forward"]} className="group flex items-center gap-4 py-3">
                    <span className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-tile">
                      {p.images[0] && <FadeImage src={p.images[0].src} alt="" fill sizes="56px" className={fit(p.images[0])} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-ui font-medium leading-snug group-hover:underline">
                        {p.name}
                        {p.color && <span className="muted font-normal">, {p.color}</span>}
                      </span>
                      <Status scarcity={p.scarcity} available={p.available} onSale={!!p.compareAt} />
                    </span>
                    <Price price={p.price} compareAt={p.compareAt} className="shrink-0 text-ui font-semibold" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {story.credit && <p className="muted mt-5 text-fine">{story.credit}</p>}
        </div>

        <div className={`grid grid-cols-6 gap-3 sm:gap-4 lg:col-span-8 ${flip ? "lg:order-1" : ""}`}>
          {a && (
            <div className="drift relative col-span-6 aspect-[4/5] overflow-hidden sm:col-span-4 sm:row-span-2 sm:aspect-auto">
              <IgImage id={a} alt={`${story.title} campaign`} fill sizes="(min-width: 1024px) 44vw, (min-width: 640px) 62vw, 92vw" className="object-cover" />
            </div>
          )}
          {b && (
            <div className="relative col-span-3 aspect-[4/5] overflow-hidden sm:col-span-2">
              <IgImage id={b} alt="" fill sizes="(min-width: 1024px) 21vw, 46vw" className="object-cover" />
            </div>
          )}
          {c && (
            <div className="relative col-span-3 aspect-[4/5] overflow-hidden sm:col-span-2">
              <IgImage id={c} alt="" fill sizes="(min-width: 1024px) 21vw, 46vw" className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
