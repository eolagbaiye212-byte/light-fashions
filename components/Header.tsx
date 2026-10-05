"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { bag, bagCount, useBag } from "@/lib/bag";
import { INSTAGRAM } from "@/lib/media";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/runway", label: "Runway" },
  { href: "/story", label: "Story" },
];

/**
 * Keeps the header in step with the page under it without re-rendering on scroll:
 * - data-tone: the surface (night/day) directly beneath the header
 * - data-raised: scrolled away from the top
 * - data-hidden: tucked away while scrolling down, back as soon as you scroll up
 * Also publishes --header-offset so sticky bars can sit right under it.
 */
function useHeaderState(ref: React.RefObject<HTMLElement | null>, pathname: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    let frame = 0;
    let lastY = window.scrollY;
    let travel = 0;

    const read = () => {
      frame = 0;
      const y = window.scrollY;
      const hit = document.elementsFromPoint(window.innerWidth / 2, 65).find((n) => !n.closest("[data-header]"));
      const tone = hit?.closest<HTMLElement>("[data-surface]")?.dataset.surface === "day" ? "day" : "night";
      if (el.dataset.tone !== tone) el.dataset.tone = tone;
      el.dataset.raised = String(y > 8);

      // Hide after a deliberate downward scroll; reveal on any upward scroll.
      const dy = y - lastY;
      travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
      lastY = y;
      const menuOpen = !!document.querySelector("dialog[open]");
      let hidden = el.dataset.hidden === "true";
      if (y < 160 || menuOpen) hidden = false;
      else if (travel > 48) hidden = true;
      else if (travel < -12) hidden = false;
      if (String(hidden) !== el.dataset.hidden) {
        el.dataset.hidden = String(hidden);
        root.style.setProperty("--header-offset", hidden ? "0px" : "4rem");
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    el.dataset.hidden = "false";
    root.style.setProperty("--header-offset", "4rem");
    read();
    // A route change starts under the view-transition overlay, which hides the new page from
    // hit-testing. Read again once the transition has settled.
    const settle = [450, 900].map((ms) => window.setTimeout(schedule, ms));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("surfacechange", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("surfacechange", schedule);
      settle.forEach(clearTimeout);
      cancelAnimationFrame(frame);
    };
  }, [ref, pathname]);
}

export function Header() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const state = useBag();
  const count = bagCount(state);
  useHeaderState(headerRef, pathname);

  // Close the menu whenever the route changes.
  useEffect(() => {
    menuRef.current?.close();
  }, [pathname]);

  return (
    <>
      <header
        ref={headerRef}
        data-header
        data-tone="night"
        style={{ viewTransitionName: "site-header" }}
        className={[
          "group/h fixed inset-x-0 top-0 z-30 h-16 text-night-ink",
          "transition-[translate,background-color,color,box-shadow] duration-500 ease-expo",
          "data-[hidden=true]:-translate-y-full",
          // night, at the top of the page: a soft scrim lets the photograph through
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(to_bottom,oklch(0.138_0.006_245/0.72),transparent)] before:transition-opacity before:duration-500",
          "data-[raised=true]:before:opacity-0 data-[tone=day]:before:opacity-0",
          // night, scrolled: solid enough to read over anything
          "data-[raised=true]:bg-night/94 data-[raised=true]:shadow-[0_1px_0_var(--color-night-line)]",
          // day
          "data-[tone=day]:bg-day! data-[tone=day]:text-day-ink data-[tone=day]:shadow-[0_1px_0_var(--color-day-line)]",
        ].join(" ")}
      >
        <div className="container-x flex h-full items-center justify-between gap-6">
          <Link href="/" className="-my-2 shrink-0 py-2" aria-label="LIGHT, home">
            <Image src="/brand/light-chrome.webp" alt="" width={1200} height={425} priority sizes="96px" className="h-7 w-auto sm:h-8" />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="relative py-2 text-ui font-medium after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-quint hover:after:scale-x-100 aria-[current=page]:after:h-0.5 aria-[current=page]:after:scale-x-100"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={() => menuRef.current?.showModal()}
              className="min-h-11 rounded-full px-3 text-ui font-medium md:hidden"
              aria-haspopup="dialog"
            >
              Menu
            </button>
            <button
              type="button"
              onClick={() => bag.open()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-ui font-medium transition-shadow duration-200 sm:px-4 sm:shadow-[inset_0_0_0_1px_currentColor] sm:hover:shadow-[inset_0_0_0_2px_currentColor]"
              aria-haspopup="dialog"
              aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
            >
              Bag
              <span
                key={state.adds}
                className={[
                  "tabular inline-grid min-w-6 place-items-center rounded-full px-1.5 text-fine font-semibold transition-colors duration-300",
                  count > 0 ? "bg-rod text-night group-data-[tone=day]/h:bg-day-ink group-data-[tone=day]/h:text-day" : "opacity-60",
                  state.adds > 0 ? "bump" : "",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>

      <dialog ref={menuRef} className="menu" aria-label="Menu">
        <div className="flex h-full flex-col">
          <div className="container-x flex h-16 items-center justify-between">
            <Image src="/brand/light-chrome.webp" alt="LIGHT" width={1200} height={425} sizes="96px" className="h-7 w-auto" />
            <button type="button" onClick={() => menuRef.current?.close()} className="min-h-11 rounded-full px-3 text-ui font-medium">
              Close
            </button>
          </div>
          <nav aria-label="Main" className="container-x flex flex-1 flex-col justify-center gap-2 pb-16">
            {[{ href: "/", label: "Home" }, ...NAV, { href: "/info", label: "Shipping & sizing" }].map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => menuRef.current?.close()}
                aria-current={pathname === item.href ? "page" : undefined}
                style={{ "--i": i } as React.CSSProperties}
                className="menu-item display block py-1 text-[clamp(3rem,16vw,5rem)] aria-[current=page]:text-rod"
              >
                {item.label}
              </Link>
            ))}
            <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="link mt-8 text-lead">
              @children_ofthelight on Instagram
            </a>
          </nav>
        </div>
      </dialog>
    </>
  );
}
