import { siteConfig } from "@/content/site";

export function TestimonialsSection() {
  const { testimonials } = siteConfig;

  return (
    <section aria-labelledby="testimonials-heading" className="bg-cream-light section-pad-sm">
      <div className="section-shell-wide">
        <div className="text-center mb-12 sm:mb-16">
          <p className="section-label mb-4">Community</p>
          <h2 id="testimonials-heading" className="section-heading">
            What listeners say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="card-light-elevated p-7 sm:p-8 flex flex-col justify-between min-h-[220px]"
            >
              <blockquote className="text-[var(--mocha)] text-base sm:text-lg leading-relaxed italic font-serif">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 pt-6 border-t border-[var(--sand)]">
                <p className="text-[var(--espresso)] text-sm font-medium">{t.author}</p>
                <p className="text-[var(--taupe)] text-xs mt-1">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
