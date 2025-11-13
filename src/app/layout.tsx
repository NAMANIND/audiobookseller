import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { NoiseBg } from "@/components/noise-bg";
import { Navigation } from "@/components/navigation";

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
    <html lang="en" className="h-full">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.className} h-full relative bg-gradient-to-br from-emerald-50 via-white to-emerald-50 text-gray-900`}
      >
        <Navigation />
        <main className="flex-1 relative min-h-[calc(100vh-8rem)]">
          {children}
        </main>
        <footer className="bg-white/80 backdrop-blur-xl border-t border-emerald-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-gray-600 font-light">
              © {new Date().getFullYear()} Audiobook Seller. All rights
              reserved.
            </div>
          </div>
        </footer>
        <Toaster
          toastOptions={{
            style: {
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#111827",
            },
          }}
        />
      </body>
    </html>
  );
}
