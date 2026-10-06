"use client";

import { useState, type ReactNode } from "react";

/** One look's frames: a large view plus thumbnails to switch angle. Frames are server-rendered. */
export function LookGallery({ n, frames, thumbs }: { n: number; frames: ReactNode[]; thumbs: ReactNode[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="relative aspect-[1584/2048] overflow-hidden bg-night-2">
        {frames.map((frame, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ease-quint ${i === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={i !== active}
          >
            {i === active || Math.abs(i - active) <= 1 ? frame : null}
          </div>
        ))}
      </div>
      {thumbs.length > 1 && (
        <div role="group" aria-label={`Angles of look ${n}`} className="no-scrollbar mt-3 flex gap-2 overflow-x-auto p-1">
          {thumbs.map((thumb, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Angle ${i + 1} of ${thumbs.length}`}
              className={`relative aspect-[4/5] w-14 shrink-0 overflow-hidden transition-opacity sm:w-16 ${i === active ? "opacity-100 ring-2 ring-night-ink ring-offset-2 ring-offset-night" : "opacity-55 hover:opacity-90"}`}
            >
              {thumb}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
