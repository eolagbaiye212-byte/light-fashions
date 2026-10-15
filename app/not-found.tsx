import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";

export default function NotFound() {
  return (
    <PageTransition>
      <section className="px-edge pt-8 pb-16 md:pt-12 md:pb-24">
        <h1 className="t-giant">Not found</h1>
        <div className="mt-6 md:mt-8">
          <p className="t-body max-w-[40ch]">That page doesn&apos;t exist, or the piece has been taken down. The shop and the runway are still here.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/shop" className="btn btn-ink">
              Go to the shop
            </Link>
            <Link href="/runway" className="btn btn-line">
              See the runway
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
