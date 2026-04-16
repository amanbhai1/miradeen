import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SEO } from "@/components/shared/SEO";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

// ─────────────────────────────────────────────────────────────────────────────
// Viewport
// ─────────────────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL = "https://miradeen.com";
const SITE_NAME = "MIRADEEN";

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────────────────────────
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Redefining Luxury Fashion`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Discover premium luxury fashion at MIRADEEN. Fluid fabric-inspired design, silk flow, craftsmanship, and artistic luxury. Shop the finest collection of men's and women's clothing.",
  keywords: [
    "MIRADEEN",
    "luxury fashion",
    "designer clothing",
    "premium clothing",
    "designer wear",
    "silk",
    "silk clothing",
    "cashmere",
    "handcrafted",
    "handcrafted fashion",
    "artisan",
    "artisan clothing",
    "men's fashion",
    "men's luxury fashion",
    "women's fashion",
    "women's luxury fashion",
    "Indian designer",
    "designer clothing India",
    "premium ethnic wear",
    "luxury kurta",
    "designer saree",
    "luxury sherwani",
    "handloom fashion",
    "bespoke fashion",
    "high-end clothing",
    "premium designer brands",
    "Indian luxury fashion",
    "sustainable luxury",
    "couture",
  ],
  authors: [{ name: "MIRADEEN", url: SITE_URL }],
  creator: "MIRADEEN",
  publisher: "MIRADEEN",
  category: "Fashion & Apparel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Icons / Favicon ───────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    title: `${SITE_NAME} — Redefining Luxury Fashion`,
    description:
      "Discover premium luxury fashion at MIRADEEN. Shop the finest collection of men's and women's designer clothing.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    alternateLocale: ["hi_IN", "en_US"],
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Premium Luxury Fashion for Men & Women`,
        type: "image/png",
      },
    ],
  },

  // ── Twitter Card ──────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image" as const,
    site: "@MIRADEEN",
    title: `${SITE_NAME} — Redefining Luxury Fashion`,
    description:
      "Discover premium luxury fashion at MIRADEEN. Shop designer clothing for men & women.",
    images: [`${SITE_URL}/og-image.png`],
    creator: "@miradeen",
  },

  // ── Verification (placeholders for production) ────────────────────────────
  verification: {
    google: "your-google-verification-code",
  },

  // ── Other ─────────────────────────────────────────────────────────────────
  alternates: {
    canonical: SITE_URL,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SEO />
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
