"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Muted, looping background film with a visible pause control (WCAG 2.2.2).
 * Never autoplays for people who ask for reduced motion.
 */
export function LoopVideo({
  src,
  poster,
  label,
  className = "",
  controlClassName = "",
  delay = 0,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
  controlClassName?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      v.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    }, delay);
    // Pause when off screen to save battery and bandwidth.
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) v.pause();
      else if (v.dataset.userPaused !== "1") v.play().catch(() => {});
    });
    io.observe(v);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [delay]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.dataset.userPaused = "0";
      v.play().then(() => setPlaying(true), () => {});
    } else {
      v.dataset.userPaused = "1";
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <video
        ref={ref}
        className={className}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-fine font-semibold ${controlClassName}`}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
      >
        <svg aria-hidden="true" width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
          {playing ? (
            <>
              <rect x="0" y="0" width="3" height="12" />
              <rect x="7" y="0" width="3" height="12" />
            </>
          ) : (
            <path d="M0 0 L10 6 L0 12 Z" />
          )}
        </svg>
        {playing ? "Pause" : "Play"}
      </button>
    </>
  );
}
