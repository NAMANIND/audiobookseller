import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { siteConfig } from "@/content/site";

export function HighlightsSection() {
  const { highlights, author } = siteConfig;

  return (
    <section
      id="highlights"
      aria-labelledby="highlights-heading"
      className="bg-cream-light section-pad-sm"
    >
      <div className="section-shell-wide">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-16">
          <div className="section-gap">
            <p className="section-label">From Instagram</p>
            <h2 id="highlights-heading" className="section-heading">
              Poetry in motion
            </h2>
            <p className="section-subhead">
              Reels, readings, and quiet moments — follow for daily verses.
            </p>
          </div>
          <Link
            href={author.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[48px] px-6 rounded-full border border-[var(--sand)] bg-white text-[var(--espresso)] text-sm hover:border-[var(--terracotta-soft)] transition-colors shrink-0 shadow-sm"
          >
            <Instagram className="w-4 h-4" />
            {author.instagram.handle}
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {highlights.map((item) => (
            <Link
              key={item.id}
              href={author.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[4/5] rounded-xl overflow-hidden ring-1 ring-[var(--sand)] hover:ring-[var(--terracotta)] transition-all hover:scale-[1.02] shadow-sm"
            >
              <Image
                src={item.image}
                alt={item.caption}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/60 via-transparent to-transparent" />
              <p className="absolute bottom-3 inset-x-3 text-[11px] text-white font-medium truncate">
                {item.caption}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
