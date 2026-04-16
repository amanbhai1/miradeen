import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIRADEEN — Redefining Luxury Fashion",
  description: "Discover premium luxury fashion at MIRADEEN. Fluid fabric-inspired design, silk flow, craftsmanship, and artistic luxury. Shop the finest collection of men's and women's clothing.",
  keywords: ["MIRADEEN", "luxury fashion", "premium clothing", "designer wear", "silk", "cashmere", "handcrafted", "artisan"],
  authors: [{ name: "MIRADEEN" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "MIRADEEN — Redefining Luxury Fashion",
    description: "Discover premium luxury fashion at MIRADEEN. Shop the finest collection of men's and women's clothing.",
    siteName: "MIRADEEN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
