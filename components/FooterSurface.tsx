"use client";

import { usePathname } from "next/navigation";

/** The footer continues whatever surface the page ends on: night after the runway, day everywhere else. */
export function FooterSurface({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const surface = pathname === "/runway" ? "night" : "day";
  return (
    <footer data-surface={surface} className="relative overflow-hidden transition-colors duration-500">
      {children}
    </footer>
  );
}
