import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BagDrawer } from "@/components/BagDrawer";
import { SmoothScroll } from "@/components/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

// Self-hosted variable fonts (OFL, see app/fonts). Archivo carries both weight and width axes;
// the font-stretch range must be declared or browsers clamp the width axis to 100%.
const archivo = localFont({
  src: "./fonts/archivo-variable.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

const frank = localFont({
  src: "./fonts/frank-ruhl-libre-variable.woff2",
  variable: "--font-frank",
  weight: "300 900",
  display: "swap",
});

const frankHebrew = localFont({
  src: "./fonts/frank-ruhl-libre-hebrew-variable.woff2",
  variable: "--font-frank-hebrew",
  weight: "300 900",
  display: "swap",
  preload: false,
});


const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lightfashions.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "LIGHT — Children of the Light",
    template: "%s — LIGHT",
  },
  description:
    "Faith-led streetwear by Myron. Shop the Light Fashion Experience collection from New York Fashion Week, one-of-one runway pieces and Light4eva essentials.",
  openGraph: {
    type: "website",
    siteName: "LIGHT",
    images: [{ url: "/media/ig/Ddh1xvnG7AR-4.webp", width: 1584, height: 2000, alt: "Look 16, Let your light shine" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#07090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${frank.variable} ${frankHebrew.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <noscript>
          <style>{`img[data-fade]{opacity:1}`}</style>
        </noscript>
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-night-ink focus:px-4 focus:py-2 focus:text-night"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <BagDrawer />
      </body>
    </html>
  );
}
