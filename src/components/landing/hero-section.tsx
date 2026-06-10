import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Brain, Instagram } from "lucide-react";
import { siteConfig } from "@/content/site";

export function HeroSection() {
  const { author, images, stats } = siteConfig;
  const socialStats = stats.filter((s) => s.label !== "Audiobook");

  return (
    <section
      aria-label="Introduction"
      className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[var(--cream-light)]"
    >
      {/* Portrait — right half, no frame */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[52%]">
        <Image
          src={images.portrait}
          alt={author.name}
          fill
          priority
          className="object-cover object-top lg:object-center"
          sizes="(max-width: 1024px) 100vw, 52vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[var(--cream-light)]/90 lg:to-[var(--cream-light)]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--cream-light)]/40 via-transparent to-transparent lg:from-transparent" />
      </div>

      {/* Soft transparent wash over content side */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--cream-light)]/95 via-[var(--cream-light)]/70 to-transparent lg:from-[var(--cream-light)]/85 lg:via-[var(--cream-light)]/30 pointer-events-none" />

      <div className="section-shell-wide relative w-full py-28 sm:py-32 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 text-sm text-[var(--taupe)]">
              <Link
                href={author.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[var(--terracotta)] transition-colors"
              >
                <Instagram className="w-4 h-4" />
                {author.instagram.handle}
              </Link>
              <span className="text-[var(--sand)] hidden sm:inline" aria-hidden>
                ·
              </span>
              <Link
                href={author.sportPsychology.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[var(--terracotta)] transition-colors"
              >
                <Brain className="w-4 h-4" />
                {author.sportPsychology.handle}
              </Link>
            </div>

            <p className="section-label mb-4">{author.role}</p>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-[var(--espresso)] leading-[1.02] tracking-tight mb-8">
              {author.name.split(" ")[0]}{" "}
              <span className="text-[var(--terracotta)] italic">{author.name.split(" ")[1]}</span>
            </h1>

            <p className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-[var(--mocha)] mb-10">
              {socialStats.map((stat, i) => (
                <span key={stat.label} className="inline-flex items-center">
                  <span className="font-serif text-lg text-[var(--espresso)] mr-1.5">{stat.value}</span>
                  <span className="text-[var(--taupe)]">{stat.label.toLowerCase()}</span>
                  {i < socialStats.length - 1 && (
                    <span className="mx-3 text-[var(--sand)]" aria-hidden>
                      ·
                    </span>
                  )}
                </span>
              ))}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                href="#audiobook"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 rounded-full bg-[var(--espresso)] text-white text-sm font-semibold hover:bg-[var(--mocha)] transition-colors"
              >
                Listen to Ehsaas
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#community"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 rounded-full text-[var(--espresso)] text-sm font-medium underline underline-offset-4 decoration-[var(--sand)] hover:decoration-[var(--terracotta)] transition-colors"
              >
                Follow both worlds
              </Link>
            </div>
          </div>

          {/* Spacer column — portrait lives in the bg layer */}
          <div className="hidden lg:block" aria-hidden />
        </div>
      </div>
    </section>
  );
}
