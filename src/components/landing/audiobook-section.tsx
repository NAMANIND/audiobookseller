"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, Headphones, Languages, Music2 } from "lucide-react";
import { siteConfig } from "@/content/site";
import { SpotifyPlayer } from "@/components/landing/spotify-player";
import { PurchaseDialog } from "@/components/purchase-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string;
}

export function AudiobookSection() {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);
  const { bookMeta, sampleAudioUrl, sampleDuration, featuredBookId, chapters } =
    siteConfig;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch("/api/books");
        if (!response.ok) throw new Error("Failed to fetch");
        const data: Book[] = await response.json();
        setBook(data.find((b) => b.id === featuredBookId) ?? data[0] ?? null);
      } catch {
        toast.error("Could not load audiobook details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [featuredBookId]);

  const cover = book?.coverImage ?? siteConfig.images.cover;

  return (
    <section
      id="audiobook"
      aria-labelledby="audiobook-heading"
      className="bg-black section-pad"
    >
      <div className="section-shell-wide">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14 sm:mb-16">
          <div className="section-gap max-w-2xl">
            <p className="section-label text-[#1DB954]">Audiobook</p>
            <h2 id="audiobook-heading" className="section-heading text-white">
              A Glimpse into Ehsaas
            </h2>
            <p className="section-subhead text-[#a7a7a7]">
              Press play for a 5-second preview — then own the full collection.
            </p>
          </div>

          {book && (
            <Button
              onClick={() => setIsPurchaseOpen(true)}
              className="w-full lg:w-auto shrink-0 min-h-[52px] rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-10 py-6 text-sm shadow-lg shadow-[#1DB954]/25"
            >
              Purchase — ₹{book.price}
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
          <div className="lg:col-span-3 min-w-0">
            {isLoading ? (
              <div className="rounded-2xl bg-[#121212] h-[420px] sm:h-[460px] animate-pulse ring-1 ring-white/5" />
            ) : (
              <SpotifyPlayer
                src={sampleAudioUrl}
                title={chapters[activeTrack]?.title ?? bookMeta.excerptTitle}
                artist={book?.author ?? bookMeta.narrator}
                coverImage={cover}
                duration={sampleDuration}
              />
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5 min-w-0">
            {book && (
              <div className="flex gap-4 p-5 rounded-2xl bg-[#121212] ring-1 ring-white/[0.08]">
                <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden">
                  <Image src={cover} alt={book.title} fill className="object-cover" sizes="64px" />
                </div>
                <div className="min-w-0 flex-1 py-0.5 flex flex-col">
                  <p className="text-white font-semibold truncate">{book.title}</p>
                  <p className="text-[#a7a7a7] text-sm truncate mt-1">{book.author}</p>
                  <div className="flex items-center justify-between gap-3 mt-auto pt-3">
                    <p className="text-[#1DB954] text-sm font-bold">₹{book.price}</p>
                    <Button
                      onClick={() => setIsPurchaseOpen(true)}
                      className="shrink-0 h-9 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold px-5"
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-[#121212] ring-1 ring-white/[0.08] overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-4 border-b border-white/[0.06] text-[11px] text-[#727272] uppercase tracking-wider">
                <span>#</span>
                <span>Title</span>
                <span className="text-right">
                  <Clock className="w-3.5 h-3.5 inline" />
                </span>
              </div>
              {chapters.map((track, i) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setActiveTrack(i)}
                  className={cn(
                    "w-full grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-4 text-left text-sm transition-colors group min-h-[52px]",
                    activeTrack === i
                      ? "bg-[#1DB954]/10 text-white"
                      : "text-[#a7a7a7] hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  <span className="w-5 tabular-nums">{i + 1}</span>
                  <span className="truncate pr-2">{track.title}</span>
                  <span className="tabular-nums text-[#727272] group-hover:text-white shrink-0">
                    {track.duration}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Music2, label: bookMeta.genre },
                { icon: Headphones, label: bookMeta.duration },
                { icon: Languages, label: bookMeta.language },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#121212] ring-1 ring-white/[0.06] text-center min-h-[92px]"
                >
                  <Icon className="w-4 h-4 text-[#1DB954]" />
                  <span className="text-[10px] sm:text-[11px] text-[#727272] leading-snug">{label}</span>
                </div>
              ))}
            </div>
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
