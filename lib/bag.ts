"use client";

import { useSyncExternalStore } from "react";

export type BagLine = {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  color?: string;
  /** e.g. "M" or "White / S". Empty for one-size pieces. */
  variantLabel: string;
  price: number;
  image: string;
  /** One physical piece exists, so quantity is capped at 1. */
  single: boolean;
  quantity: number;
};

type State = { lines: BagLine[]; open: boolean; /** increments on every add, drives the count bump */ adds: number };

const KEY = "light.bag.v1";
const MAX_QTY = 10;
const EMPTY: State = { lines: [], open: false, adds: 0 };

let state: State = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function set(next: Partial<State>, save = true) {
  state = { ...state, ...next };
  if (save) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state.lines));
    } catch {
      // storage can be unavailable (private mode, blocked); the bag still works for this visit
    }
  }
  emit();
}

function readStorage(): BagLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as BagLine[]) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => l && typeof l.variantId === "number") : [];
  } catch {
    return [];
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const lines = readStorage();
  if (lines.length) queueMicrotask(() => set({ lines }, false));
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) set({ lines: readStorage() }, false);
  });
}

const cap = (l: Pick<BagLine, "single">) => (l.single ? 1 : MAX_QTY);

export const bag = {
  subscribe(listener: () => void) {
    hydrate();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => state,
  /** Returns false when nothing changed (e.g. a 1 of 1 that is already in the bag). */
  add(line: Omit<BagLine, "quantity">, quantity = 1) {
    const existing = state.lines.find((l) => l.variantId === line.variantId);
    if (existing) {
      const q = Math.min(cap(existing), existing.quantity + quantity);
      if (q === existing.quantity) return false;
      set({ lines: state.lines.map((l) => (l === existing ? { ...l, quantity: q } : l)), adds: state.adds + 1 });
      return true;
    }
    set({ lines: [...state.lines, { ...line, quantity: Math.min(cap(line), quantity) }], adds: state.adds + 1 });
    return true;
  },
  setQuantity(variantId: number, quantity: number) {
    if (quantity <= 0) return bag.remove(variantId);
    set({
      lines: state.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(cap(l), quantity) } : l)),
    });
  },
  remove(variantId: number) {
    set({ lines: state.lines.filter((l) => l.variantId !== variantId) });
  },
  open() {
    set({ open: true }, false);
  },
  close() {
    set({ open: false }, false);
  },
};

export function useBag() {
  return useSyncExternalStore(bag.subscribe, bag.get, () => EMPTY);
}

export function bagCount(s: State) {
  return s.lines.reduce((n, l) => n + l.quantity, 0);
}

export function bagSubtotal(s: State) {
  return s.lines.reduce((n, l) => n + l.price * l.quantity, 0);
}
