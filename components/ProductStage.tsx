"use client";

import { createContext, use, useState, type ReactNode } from "react";

type Stage = { lead: string | null; setLead: (src: string | null) => void };

const StageContext = createContext<Stage>({ lead: null, setLead: () => {} });

/**
 * Shared between the product page's gallery and its colour picker: choosing a colour puts that
 * colour's photo first in the gallery.
 */
export function ProductStage({ children }: { children: ReactNode }) {
  const [lead, setLead] = useState<string | null>(null);
  return <StageContext value={{ lead, setLead }}>{children}</StageContext>;
}

export function useStage() {
  return use(StageContext);
}
