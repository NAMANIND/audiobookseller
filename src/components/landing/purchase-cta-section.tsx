"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/content/site";
import { PurchaseDialog } from "@/components/purchase-dialog";
import { Button } from "@/components/ui/button";
import { Check, Headphones, Shield } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string;
}

export function PurchaseCtaSection() {
  const [book, setBook] = useState<Book | null>(null);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const { purchase, bookMeta, featuredBookId, images } = siteConfig;

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((data: Book[]) =>
        setBook(data.find((b) => b.id === featuredBookId) ?? data[0] ?? null),
      )
      .catch(() => {});
  }, [featuredBookId]);

  const coverSrc = book?.coverImage ?? images.cover;

  return (
    <section aria-labelledby="purchase-heading" className="relative overflow-hidden bg-[var(--espresso)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#3d2f28_0%,_transparent_55%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_bottom_left,_#b8724a22_0%,_transparent_60%)] pointer-events-none" />

      <div className="section-shell-wide relative section-pad-sm">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
          <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-start gap-8">
            <div className="relative w-44 sm:w-52 lg:w-56 shrink-0">
              <div className="absolute -inset-3 rounded-2xl bg-[var(--terracotta)]/20 blur-xl" />
              <div className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                <Image
                  src={coverSrc}
                  alt="Ehsaas audiobook cover"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 208px, 224px"
                />
              </div>
            </div>
            <div className="text-center sm:text-left lg:text-left">
              <div className="inline-flex items-center gap-2 text-[var(--terracotta-soft)] mb-4">
                <Headphones className="w-4 h-4" />
                <span className="text-[11px] tracking-[0.25em] uppercase font-semibold">Ehsaas Audiobook</span>
              </div>
              <p className="font-serif text-2xl sm:text-3xl text-white leading-snug mb-2">
                {bookMeta.duration} · {bookMeta.language}
              </p>
              <p className="text-sm text-white/55 leading-relaxed max-w-xs">
                {bookMeta.formats} · {bookMeta.guarantee}
              </p>
            </div>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-16">
            <p className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--terracotta-soft)] mb-4">
              Digital download
            </p>
            <h2 id="purchase-heading" className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] text-white leading-[1.1] tracking-tight mb-4">
              {purchase.heading}
            </h2>
            <p className="text-white/60 leading-relaxed mb-8 max-w-md">{purchase.subheading}</p>

            {book && (
              <p className="font-serif text-5xl sm:text-6xl text-[var(--terracotta-soft)] mb-8">
                ₹{book.price}
              </p>
            )}

            <Button
              onClick={() => setIsPurchaseOpen(true)}
              disabled={!book}
              className="w-full sm:w-auto min-h-[56px] rounded-full bg-[var(--terracotta)] hover:bg-[var(--terracotta-soft)] text-[var(--espresso)] px-12 py-6 text-sm font-bold tracking-wide mb-8"
            >
              Secure Purchase
            </Button>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/45">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[var(--terracotta-soft)]" />
                Instant download
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[var(--terracotta-soft)]" />
                Secure payment
              </span>
            </div>
            <p className="text-[11px] text-white/35 mt-6 leading-relaxed">{purchase.note}</p>
          </div>
        </div>
      </div>

      {book && (
        <PurchaseDialog
          isOpen={isPurchaseOpen}
          onClose={() => setIsPurchaseOpen(false)}
          book={book}
        />
      )}
    </section>
  );
}
