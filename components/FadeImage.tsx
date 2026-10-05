"use client";

import Image, { type ImageProps } from "next/image";

/** next/image that settles in over ~0.7s once decoded, instead of popping (see img[data-fade] in globals.css). */
export function FadeImage({ alt, onLoad, ...props }: ImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      data-fade=""
      onLoad={(e) => {
        e.currentTarget.dataset.loaded = "true";
        onLoad?.(e);
      }}
    />
  );
}
