import Image from "next/image";
import Link from "next/link";
import { Brain, Instagram } from "lucide-react";
import { siteConfig } from "@/content/site";

export function AboutSection() {
  const { author, images } = siteConfig;

  return (
    <section id="about" aria-labelledby="about-heading" className="bg-cream section-pad">
      <div className="section-shell-wide">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div className="relative aspect-square max-w-md mx-auto lg:mx-0 w-full">
            <div className="absolute -inset-4 rounded-3xl bg-[var(--terracotta-soft)]/20 blur-xl" />
            <div className="relative w-full h-full rounded-2xl overflow-hidden ring-1 ring-[var(--sand)] shadow-xl shadow-[#1a1410]/10">
              <Image
                src={images.portraitBw}
                alt={`Portrait of ${author.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
            </div>
          </div>

          <div className="section-gap">
            <p className="section-label">Meet Bhawna</p>
            <h2 id="about-heading" className="section-heading">
              Poetry &amp; sport psychology
            </h2>
            <p className="section-subhead">{author.bio}</p>
            <p className="text-[var(--taupe)] leading-relaxed">{author.longBio}</p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
              <Link
                href={author.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full border border-[var(--sand)] bg-white text-sm text-[var(--espresso)] hover:border-[var(--terracotta)] transition-colors font-medium"
              >
                <Instagram className="w-4 h-4" />
                {author.instagram.handle}
              </Link>
              <Link
                href={author.sportPsychology.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-[var(--espresso)] text-sm text-white hover:bg-[var(--mocha)] transition-colors font-medium"
              >
                <Brain className="w-4 h-4" />
                {author.sportPsychology.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
