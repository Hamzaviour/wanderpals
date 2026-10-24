import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Bricolage_Grotesque, Figtree } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const shoulders = Big_Shoulders({ variable: "--font-shoulders", subsets: ["latin"], weight: ["700", "800", "900"] });

export const metadata: Metadata = {
  title: "Wanderpals · Where to next, pal?",
  description:
    "Say one sentence about a trip. Wanderpals plans it day by day, plots it on a 3D globe, and flies you through it with your traveler pals.",
};

export const viewport: Viewport = {
  themeColor: "#16233B",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} ${shoulders.variable} h-full`}>
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
