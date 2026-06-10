import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/hero-section";
import { AudiobookSection } from "@/components/landing/audiobook-section";
import { HighlightsSection } from "@/components/landing/highlights-section";
import { DetailsSection } from "@/components/landing/details-section";
import { ThemesSection } from "@/components/landing/themes-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { AboutSection } from "@/components/landing/about-section";
import { CommunitySection } from "@/components/landing/community-section";
import { SportPoetryBridgeSection } from "@/components/landing/sport-poetry-bridge-section";
import { PurchaseCtaSection } from "@/components/landing/purchase-cta-section";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

function JsonLd() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author.name,
    description: siteConfig.author.bio,
    url: siteConfig.url,
    sameAs: [siteConfig.author.instagram.url, siteConfig.author.sportPsychology.url],
  };

  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: "Ehsaas: The Poetry of Bhawna Jaiswal",
    author: { "@type": "Person", name: siteConfig.author.name },
    inLanguage: siteConfig.bookMeta.language,
    genre: siteConfig.bookMeta.genre,
    bookFormat: "AudiobookFormat",
    description: siteConfig.description,
    image: siteConfig.images.cover,
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Ehsaas Audiobook",
    description: siteConfig.description,
    image: siteConfig.images.cover,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}#audiobook`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    </>
  );
}

export default function Home() {
  return (
    <>
      <JsonLd />
      <HeroSection />
      <AudiobookSection />
      <HighlightsSection />
      <SportPoetryBridgeSection />
      <DetailsSection />
      <ThemesSection />
      <TestimonialsSection />
      <AboutSection />
      <CommunitySection />
      <PurchaseCtaSection />
    </>
  );
}
