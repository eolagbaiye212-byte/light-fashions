import { ViewTransition } from "react";

/**
 * Page-level view transition: a short fade between pages. The product photo's own shared-element
 * morph (grid → product page) runs alongside it. Lives in each page, never the layout, so enter and
 * exit fire on every navigation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
