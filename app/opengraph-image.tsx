import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "LIGHT, Children of the Light";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card: white, Myron's mark in black, one line of mono. Same rules as the site. */
export default async function Image() {
  const dir = join(process.cwd(), "assets/og");
  const [mono, mark] = await Promise.all([readFile(join(dir, "geist-mono-500.woff")), readFile(join(dir, "light-mark-black.png"))]);
  const src = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={700} height={244} alt="" style={{ objectFit: "contain" }} />
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #000000", paddingTop: 24, fontFamily: "Geist Mono", fontSize: 26, letterSpacing: 1, textTransform: "uppercase", color: "#000000" }}>
          <span>Children of the Light</span>
          <span>Faith-led streetwear by Myron</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist Mono", data: mono, style: "normal", weight: 500 }] },
  );
}
