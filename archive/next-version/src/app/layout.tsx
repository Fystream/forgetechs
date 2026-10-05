import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* ----------------------------------------------------------------------------
 *  TYPE SYSTEM
 *  Three voices, each with exactly one job:
 *    Inter Tight      — structural. Headlines and UI. Tight, neutral, modern.
 *    Instrument Serif — editorial accent. Italic only, one word at a time.
 *    JetBrains Mono   — technical labels. Signals "this person writes code."
 *  Loaded via next/font so they're self-hosted, preloaded and zero-CLS.
 * -------------------------------------------------------------------------- */
const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-instrument",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://codes-it.netlify.app"),
  title: {
    default: "Codes-It — Hand-coded websites for Kerala businesses",
    template: "%s · Codes-It",
  },
  description:
    "Independent web studio in Pulpally, Wayanad. Fast, hand-coded websites for clinics, shops and homestays across Kerala. Built from scratch, no templates, live inside a week.",
  keywords: [
    "web designer Wayanad",
    "website development Kerala",
    "Pulpally web design",
    "small business website Kerala",
    "hand-coded websites",
  ],
  authors: [{ name: "Falah" }],
  creator: "Falah",
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Codes-It — Hand-coded websites for Kerala businesses",
    description:
      "Independent web studio in Pulpally, Wayanad. Built from scratch, no templates, live inside a week.",
    siteName: "Codes-It",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#091529",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${instrument.variable} ${jetbrains.variable}`}
    >
      <body className="bg-midnight font-sans text-bone antialiased">
        {children}
      </body>
    </html>
  );
}
