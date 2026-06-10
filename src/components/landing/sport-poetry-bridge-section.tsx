import Link from "next/link";
import { Brain, Dumbbell, Feather } from "lucide-react";
import { siteConfig } from "@/content/site";

export function SportPoetryBridgeSection() {
  const { author } = siteConfig;

  const pillars = [
    {
      icon: Feather,
      title: "Poem Heals",
      handle: author.instagram.handle,
      url: author.instagram.url,
      description: "Hindi poetry, reels, and the feeling of being truly heard — 1.1M strong.",
    },
    {
      icon: Dumbbell,
      title: "Sport Is Psychology",
      handle: author.sportPsychology.handle,
      url: author.sportPsychology.url,
      description: "Mindset, discipline, and mental performance for sport and everyday life.",
    },
    {
      icon: Brain,
      title: "Ehsaas Audiobook",
      handle: "Full collection",
      url: "#audiobook",
      description: "Eight hours of poetry in her voice — the deepest cut of both worlds.",
    },
  ];

  return (
    <section aria-labelledby="bridge-heading" className="bg-cream-light section-pad-sm">
      <div className="section-shell-wide">
        <div className="text-center mb-12 sm:mb-14 max-w-2xl mx-auto">
          <p className="section-label mb-4">Two passions, one person</p>
          <h2 id="bridge-heading" className="section-heading">
            Feel deeply. Perform fiercely.
          </h2>
          <p className="section-subhead mx-auto mt-4">
            Bhawna builds at the intersection of poetry and sport psychology — healing hearts and sharpening minds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {pillars.map(({ icon: Icon, title, handle, url, description }) => (
            <Link
              key={title}
              href={url}
              {...(url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="card-light-elevated p-7 sm:p-8 group hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--cream)] border border-[var(--sand)] flex items-center justify-center mb-5 group-hover:border-[var(--terracotta-soft)] transition-colors">
                <Icon className="w-5 h-5 text-[var(--terracotta)]" />
              </div>
              <h3 className="font-serif text-xl text-[var(--espresso)] mb-1">{title}</h3>
              <p className="text-sm text-[var(--terracotta)] font-medium mb-3">{handle}</p>
              <p className="text-sm text-[var(--mocha)] leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
