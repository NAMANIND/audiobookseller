import Link from "next/link";
import { ArrowUpRight, Brain, Heart, Instagram } from "lucide-react";
import { siteConfig } from "@/content/site";

export function CommunitySection() {
  const { community, author } = siteConfig;

  const channels = [
    {
      icon: Heart,
      label: "Poetry & reels",
      handle: author.instagram.handle,
      url: author.instagram.url,
      stat: "1.1M followers",
      description: "Hindi verses, daily healing, and the community that grew with every poem.",
      accent: "border-[var(--terracotta-soft)] bg-[var(--cream)]",
      iconBg: "bg-[var(--terracotta-soft)]/20 text-[var(--terracotta)]",
      cta: community.ctaPoetry,
    },
    {
      icon: Brain,
      label: "Sport psychology",
      handle: author.sportPsychology.handle,
      url: author.sportPsychology.url,
      stat: "Building now",
      description: "Mindset, discipline, and mental performance — for athletes and everyday life.",
      accent: "border-[var(--espresso)]/15 bg-[var(--espresso)] text-white",
      iconBg: "bg-white/10 text-[var(--terracotta-soft)]",
      cta: community.ctaSport,
      dark: true,
    },
  ];

  return (
    <section
      id="community"
      aria-labelledby="community-heading"
      className="bg-blush section-pad-sm"
    >
      <div className="section-shell-wide">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <p className="section-label mb-4">Stay connected</p>
          <h2 id="community-heading" className="section-heading">
            {community.heading}
          </h2>
          <p className="section-subhead mt-4">{community.subheading}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {channels.map(
            ({ icon: Icon, label, handle, url, stat, description, accent, iconBg, cta, dark }) => (
              <Link
                key={handle}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col justify-between min-h-[280px] p-8 sm:p-10 rounded-2xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#1a1410]/10 ${accent}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <ArrowUpRight
                      className={`w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${dark ? "text-white/50" : "text-[var(--taupe)]"}`}
                    />
                  </div>
                  <p
                    className={`text-[11px] tracking-[0.2em] uppercase font-semibold mb-2 ${dark ? "text-[var(--terracotta-soft)]" : "text-[var(--terracotta)]"}`}
                  >
                    {label}
                  </p>
                  <p
                    className={`font-serif text-2xl sm:text-3xl leading-tight mb-3 ${dark ? "text-white" : "text-[var(--espresso)]"}`}
                  >
                    {handle}
                  </p>
                  <p className={`text-sm leading-relaxed max-w-sm ${dark ? "text-white/70" : "text-[var(--taupe)]"}`}>
                    {description}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-current/10">
                  <span className={`text-xs font-medium ${dark ? "text-white/60" : "text-[var(--mocha)]"}`}>
                    {stat}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${dark ? "text-[var(--terracotta-soft)]" : "text-[var(--espresso)]"}`}
                  >
                    {!dark && <Instagram className="w-4 h-4" />}
                    {dark && <Brain className="w-4 h-4" />}
                    {cta.replace("Follow ", "")}
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
