import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { NoiseBg } from "@/components/noise-bg";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Audiobook Seller",
  description: "Buy and download audiobooks securely",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.className} h-full relative bg-gradient-to-br from-black via-zinc-900 to-black text-white`}
      >
        <header className="bg-black/40 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a
              href="/"
              className="text-2xl font-light text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Audiobook Seller
            </a>
            <div className="flex items-center gap-6">
              <a
                href="/purchases"
                className="text-sm font-light text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                My Purchases
              </a>
            </div>
          </nav>
        </header>
        <main className="flex-1 relative min-h-[calc(100vh-8rem)]">
          {children}
        </main>
        <footer className="bg-black/40 backdrop-blur-xl border-t border-emerald-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-zinc-400 font-light">
              © {new Date().getFullYear()} Audiobook Seller. All rights
              reserved.
            </div>
          </div>
        </footer>
        <Toaster
          toastOptions={{
            style: {
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
