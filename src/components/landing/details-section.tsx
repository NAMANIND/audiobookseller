import { siteConfig } from "@/content/site";

export function DetailsSection() {
  const { details, bookMeta } = siteConfig;
  const metaItems = [
    { label: "Genre", value: bookMeta.genre },
    { label: "Narrator", value: bookMeta.narrator },
    { label: "Duration", value: bookMeta.duration },
    { label: "Language", value: bookMeta.language },
  ];

  return (
    <section aria-labelledby="details-heading" className="bg-blush section-pad">
      <div className="section-shell-wide">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          <div className="section-gap">
            <p className="section-label">The Collection</p>
            <h2 id="details-heading" className="section-heading">
              {details.heading}
            </h2>
            <p className="section-subhead">{details.body}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4 sm:gap-5">
            {metaItems.map(({ label, value }) => (
              <div key={label} className="card-light p-6 sm:p-7">
                <dt className="text-[10px] tracking-[0.22em] uppercase text-[var(--taupe)] mb-3">
                  {label}
                </dt>
                <dd className="font-serif text-lg sm:text-xl text-[var(--espresso)] leading-snug">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
