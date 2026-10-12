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

function Mark() {
  return (
    <Image
      src="/brand/light-mark-black-96.webp"
      alt="LIGHT"
      width={276}
      height={96}
      preload
      unoptimized
      className="h-5 w-auto"
    />
  );
}

/** Fixed, white, 48px. Phone: MENU, mark, BAG. Desktop: mark and nav on the left, BAG on the right. */
export function Header() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDialogElement>(null);
  const count = bagCount(useBag());

  // Close the menu whenever the route changes.
  useEffect(() => {
    menuRef.current?.close();
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        style={{ viewTransitionName: "site-header" }}
        className="fixed inset-x-0 top-0 z-30 h-[var(--header)] border-b border-ink bg-paper"
      >
        <div className="px-edge grid h-full grid-cols-[1fr_auto_1fr] items-center md:flex md:gap-10">
          <button
            type="button"
            onClick={() => menuRef.current?.showModal()}
            aria-haspopup="dialog"
            className="t-label -ml-2 justify-self-start px-2 py-3 md:hidden"
          >
            Menu
          </button>
          <Link href="/" aria-label="LIGHT, home" className="-my-2 justify-self-center py-2">
            <Mark />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="t-label py-3 underline-offset-[5px] hover:underline aria-[current=page]:underline aria-[current=page]:decoration-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => bag.open()}
            aria-haspopup="dialog"
            className="t-label -mr-2 justify-self-end px-2 py-3 md:ml-auto"
          >
            Bag <span className="t-meta align-baseline text-[0.75rem]">({count})</span>
          </button>
        </div>
      </header>

      <dialog ref={menuRef} className="menu" aria-label="Menu">
        <div className="flex h-full flex-col">
          <div className="px-edge grid h-[var(--header)] grid-cols-[1fr_auto_1fr] items-center border-b border-ink">
            <span aria-hidden="true" />
            <Link href="/" onClick={() => menuRef.current?.close()} aria-label="LIGHT, home" className="-my-2 py-2">
              <Mark />
            </Link>
            <button type="button" onClick={() => menuRef.current?.close()} className="t-label -mr-2 justify-self-end px-2 py-3">
              Close
            </button>
          </div>
          <nav aria-label="Main" className="px-edge flex flex-1 flex-col gap-1 pt-12">
            {[{ href: "/", label: "Home" }, ...NAV].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => menuRef.current?.close()}
                aria-current={pathname === item.href ? "page" : undefined}
                className="t-menu py-2 aria-[current=page]:underline aria-[current=page]:decoration-[3px] aria-[current=page]:underline-offset-[6px]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-edge flex justify-between border-t border-ink py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="t-label link">
              Instagram
            </a>
            <button type="button" onClick={() => { menuRef.current?.close(); bag.open(); }} className="t-label">
              Bag <span className="t-meta text-[0.75rem]">({count})</span>
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
