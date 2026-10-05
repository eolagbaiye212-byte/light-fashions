import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";

export default function NotFound() {
  return (
    <PageTransition>
    <section data-surface="night" className="relative grid min-h-[88svh] place-items-center overflow-hidden px-[var(--gutter)] pt-16">
      <div aria-hidden="true" className="rod absolute top-0 left-1/2 h-full w-[3px] -translate-x-1/2 opacity-70" />
      <div className="relative max-w-xl text-center">
        <h1 className="display text-[clamp(3.5rem,2rem+6vw,6rem)]">Nothing here</h1>
        <p className="muted mx-auto mt-5 max-w-[40ch] text-lead">
          That page doesn&apos;t exist, or the piece has been taken down. The shop and the runway are still here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-light">
            Go to the shop
          </Link>
          <Link href="/runway" className="btn btn-ghost">
            See the runway
          </Link>
        </div>
      </div>
    </section>
    </PageTransition>
  );
}
