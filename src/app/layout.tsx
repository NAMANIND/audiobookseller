import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { Navigation } from "@/components/navigation";
import { siteConfig } from "@/content/site";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.author.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: siteConfig.images.og, width: 1200, height: 630, alt: siteConfig.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.images.og],
  },
  alternates: {
    canonical: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans h-full bg-[#f5f0eb] text-[#1a1410] antialiased`}
      >
        <Navigation />
        <main className="flex-1 relative">{children}</main>
        <footer className="bg-blush text-[var(--espresso)] border-t border-[var(--sand)]">
          <div className="section-shell-wide py-14 sm:py-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
              <div>
                <p className="font-serif text-lg tracking-wide mb-2">
                  {siteConfig.name}
                </p>
                <p className="text-sm text-[var(--taupe)] max-w-xs leading-relaxed">
                  Poetry that heals. Psychology that moves.
                </p>
              </div>
              <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[var(--mocha)]">
                <Link href="#about" className="hover:text-[var(--espresso)] transition-colors">
                  About
                </Link>
                <Link href="#audiobook" className="hover:text-[var(--espresso)] transition-colors">
                  Audiobook
                </Link>
                <Link href="#" className="hover:text-[var(--espresso)] transition-colors">
                  Privacy
                </Link>
                <Link href="#" className="hover:text-[var(--espresso)] transition-colors">
                  Terms
                </Link>
                <Link href="#" className="hover:text-[var(--espresso)] transition-colors">
                  Contact
                </Link>
              </nav>
              <p className="text-xs text-[var(--taupe)]">
                © {new Date().getFullYear()} {siteConfig.name}
              </p>
            </div>
          </div>
        </footer>
        <Toaster
          toastOptions={{
            style: {
              background: "rgba(24, 24, 24, 0.95)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
