import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BagDrawer } from "@/components/BagDrawer";
import "./globals.css";

// Self-hosted variable fonts (OFL, see app/fonts). Geist sets everything; Geist Mono is for
// metadata only. Both get metric-matched fallbacks so the swap doesn't shift the layout.
const geist = localFont({
  src: "./fonts/geist-variable.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Arial",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "Menlo", "Consolas", "monospace"],
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
  openGraph: { type: "website", siteName: "LIGHT", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <noscript>
          <style>{`img[data-fade]{opacity:1}`}</style>
        </noscript>
        <a
          href="#main"
          className="t-label sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="pt-header">
          {children}
        </main>
        <Footer />
        <BagDrawer />
      </body>
    </html>
  );
}
