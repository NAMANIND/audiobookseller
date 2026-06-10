import Image from "next/image";
import { splashImage, siteConfig } from "@/content/site";

export function ThemesSection() {
  const { themes } = siteConfig;

  return (
    <section aria-labelledby="themes-heading" className="bg-cream section-pad">
      <div className="section-shell">
        <div className="text-center section-gap mb-14 sm:mb-16 max-w-2xl mx-auto">
          <p className="section-label">What you&apos;ll feel</p>
          <h2 id="themes-heading" className="section-heading">
            Themes woven through Ehsaas
          </h2>
          <p className="section-subhead mx-auto">
            Four emotional landscapes — each poem a doorway into something familiar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          {themes.map((theme, i) => (
            <article
              key={theme.title}
              className="group card-light overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-36 sm:h-44 overflow-hidden">
                <Image
                  src={splashImage(600, 300, theme.keyword)}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--espresso)]/40 to-transparent" />
              </div>
              <div className="p-6 sm:p-8">
                <span className="text-[11px] text-[var(--terracotta)] font-semibold tracking-widest">
                  0{i + 1}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[var(--espresso)] mt-2 mb-3">
                  {theme.title}
                </h3>
                <p className="text-[var(--mocha)] text-sm sm:text-base leading-relaxed">
                  {theme.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
