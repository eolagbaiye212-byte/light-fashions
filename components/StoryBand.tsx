import type { Product } from "@/lib/shopify";
import type { Story } from "@/lib/stories";
import { toLite } from "@/lib/product-lite";
import { IgImage } from "./bits";
import { ProductTile } from "./ProductTile";

/** One 2026 campaign: copy and pieces on one side, an uneven set of frames on the other. */
export function StoryBand({ story, products, flip = false }: { story: Story; products: Product[]; flip?: boolean }) {
  const [a, b, c] = story.images;
  return (
    <section data-surface={story.surface} aria-labelledby={`story-${story.id}`} className="py-20 sm:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className={`lg:col-span-4 lg:self-start lg:sticky lg:top-28 ${flip ? "lg:order-2 lg:col-start-9" : ""}`}>
          <p className="muted text-ui">{story.when}</p>
          <h2 id={`story-${story.id}`} className="unmask display mt-2 text-[clamp(2.75rem,1.8rem+3.6vw,4.75rem)]">
            {story.title}
          </h2>
          <p className="mt-5 max-w-[40ch] text-lead">{story.text}</p>
          {products.length > 0 && (
            <div className="mt-8 grid max-w-md grid-cols-2 gap-4">
              {products.slice(0, 2).map((p) => (
                <ProductTile key={p.id} product={toLite(p)} tone={story.surface} morph={false} />
              ))}
            </div>
          )}
          {story.credit && <p className="muted mt-8 text-fine">{story.credit}</p>}
        </div>

        <div className={`grid grid-cols-6 gap-3 sm:gap-4 lg:col-span-8 ${flip ? "lg:order-1" : ""}`}>
          {a && (
            <div className="drift relative col-span-6 aspect-[4/5] overflow-hidden sm:col-span-4 sm:row-span-2 sm:aspect-auto">
              <IgImage id={a} alt={`${story.title} campaign`} fill sizes="(min-width: 1024px) 44vw, (min-width: 640px) 62vw, 92vw" className="object-cover" />
            </div>
          )}
          {b && (
            <div className="drift relative col-span-3 aspect-[4/5] overflow-hidden sm:col-span-2">
              <IgImage id={b} alt="" fill sizes="(min-width: 1024px) 21vw, 46vw" className="object-cover" />
            </div>
          )}
          {c && (
            <div className="drift relative col-span-3 aspect-[4/5] overflow-hidden sm:col-span-2">
              <IgImage id={c} alt="" fill sizes="(min-width: 1024px) 21vw, 46vw" className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
