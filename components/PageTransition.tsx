import { ViewTransition } from "react";

/**
 * Page-level view transition. Lateral moves (header links, browser back/forward) crossfade with
 * a small lift; links tagged `nav-forward` / `nav-back` (grid → product → back) slide instead.
 * Lives in each page, never the layout, so enter/exit fire on every navigation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "page-in" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "page-out" }}
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}
