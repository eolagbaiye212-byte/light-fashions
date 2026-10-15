"use client";

import Image, { type ImageProps } from "next/image";

/**
 * next/image that settles in once decoded, instead of popping (see img[data-fade] in globals.css).
 * A photo that is already in the cache shows at once, so a re-render never replays the fade.
 * Preloaded photos (the first screen) never fade: they're what the page is judged on loading.
 */
export function FadeImage({ alt, onLoad, ...props }: ImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      data-fade={props.preload ? undefined : ""}
      ref={(el) => {
        if (el?.complete && el.naturalWidth) el.dataset.loaded = "true";
      }}
      onLoad={(e) => {
        e.currentTarget.dataset.loaded = "true";
        onLoad?.(e);
      }}
    />
  );
}
