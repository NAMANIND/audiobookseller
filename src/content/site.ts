export function splashImage(w: number, h: number, keyword: string) {
  return `https://imagesplashh.vercel.app/api/image/${w}/${h}/${keyword}`;
}

export const siteConfig = {
  name: "Bhawna Jaiswal",
  title: "Bhawna Jaiswal | Ehsaas — Poetry & Sport Psychology",
  description:
    "Poetry that heals, mindset that moves — follow @poemheals_12 and discover Ehsaas, the Hindi poetry audiobook by Bhawna Jaiswal. Building @sport_is_psychology.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bhawna-jaiswal.vercel.app",
  keywords: [
    "Bhawna Jaiswal",
    "poemheals_12",
    "sport_is_psychology",
    "Ehsaas",
    "Hindi poetry",
    "sport psychology",
    "poetry audiobook",
  ],
  author: {
    name: "Bhawna Jaiswal",
    role: "Poet · Sport Psychology · Creator",
    tagline: "Poetry for the heart, psychology for the mind.",
    bio: "Bhawna Jaiswal reaches over a million people with words that heal and ideas that sharpen. Through @poemheals_12 she shares Hindi poetry that moves millions; through @sport_is_psychology she builds mental strength for athletes and everyday life.",
    longBio:
      "What began as verses shared online grew into a movement — and a belief that feeling deeply and performing fiercely aren't opposites. Ehsaas is her poetry in full voice. Sport Is Psychology is where she turns that same clarity toward mindset, discipline, and the psychology of showing up when it matters.",
    instagram: {
      handle: "@poemheals_12",
      url: "https://instagram.com/poemheals_12",
    },
    sportPsychology: {
      handle: "@sport_is_psychology",
      url: "https://instagram.com/sport_is_psychology",
      label: "Sport Is Psychology",
    },
  },
  stats: [
    { label: "Followers", value: "1.1M" },
    { label: "Posts", value: "887" },
    { label: "Following", value: "461" },
    { label: "Audiobook", value: "8h 45m" },
  ],
  highlights: [
    { id: "1", image: splashImage(400, 500, "poetry"), caption: "Poems that heal" },
    { id: "2", image: splashImage(400, 500, "fitness"), caption: "Mind over muscle" },
    { id: "3", image: splashImage(400, 500, "sunset"), caption: "Golden hour reads" },
    { id: "4", image: splashImage(400, 500, "running"), caption: "Sport psychology" },
    { id: "5", image: splashImage(400, 500, "books"), caption: "Ehsaas audiobook" },
    { id: "6", image: splashImage(400, 500, "portrait"), caption: "Behind the voice" },
  ],
  themes: [
    {
      title: "Resilience & Recovery",
      description: "When the body pushes limits, the mind must learn to return — in sport and in life.",
      keyword: "fitness",
    },
    {
      title: "Love & Longing",
      description: "The ache of distance and the warmth of reunion, told in Hindi verse.",
      keyword: "sunset",
    },
    {
      title: "Discipline & Feeling",
      description: "Showing up every day without shutting down what you feel inside.",
      keyword: "running",
    },
    {
      title: "Hope & Healing",
      description: "Poems and psychology for the moments when you need to begin again.",
      keyword: "poetry",
    },
  ],
  testimonials: [
    {
      quote: "I followed her for the poetry — stayed for the mindset. Both changed how I show up.",
      author: "Follower",
      role: "@poemheals_12 community",
    },
    {
      quote: "Sport Is Psychology gave me language for pressure; Ehsaas gave me language for pain.",
      author: "Athlete",
      role: "Listener & reader",
    },
    {
      quote: "1.1 million people can't be wrong. Her voice makes you feel seen.",
      author: "Community member",
      role: "Instagram",
    },
  ],
  community: {
    heading: "Two worlds, one voice",
    subheading:
      "Daily poetry on @poemheals_12 · Mental performance on @sport_is_psychology · Ehsaas, right here.",
    ctaPoetry: "Follow @poemheals_12",
    ctaSport: "Follow @sport_is_psychology",
  },
  featuredBookId: "ehsaas",
  sampleAudioUrl: "/samples/ehsaas-preview.mp3",
  sampleDuration: 5,
  bookMeta: {
    genre: "Poetry",
    narrator: "Bhawna Jaiswal",
    duration: "8 hrs 45 mins",
    language: "Hindi",
    excerptTitle: "Chapter 1 — Title Poem",
    formats: "MP3 · WAV · M4A",
    guarantee: "30-day satisfaction guarantee",
  },
  details: {
    heading: "Where poetry meets performance.",
    body: "Ehsaas is the intimate side of Bhawna's work — Hindi poetry narrated in her own voice. It pairs naturally with her sport psychology content: one teaches you to feel fully, the other to move forward. Same honesty, different arena.",
  },
  purchase: {
    heading: "Own the Collection",
    subheading: "High-quality audio files, yours to keep forever.",
    note: "Instant download after purchase · Secure payment · Email delivery",
  },
  images: {
    hero: splashImage(1920, 1080, "poetry"),
    portrait: process.env.NEXT_PUBLIC_HERO_PORTRAIT ?? "/images/bhawna-hero.jpg",
    portraitBw: splashImage(600, 600, "minimal"),
    cover: splashImage(600, 600, "books"),
    og: splashImage(1200, 630, "fitness"),
  },
  chapters: [
    { id: 1, title: "Title Poem — Ehsaas", duration: "4:12" },
    { id: 2, title: "Pehli Mohabbat", duration: "6:30" },
    { id: 3, title: "Raat Ka Safar", duration: "5:48" },
    { id: 4, title: "Khushbu", duration: "3:55" },
    { id: 5, title: "Antim Kavitā", duration: "7:20" },
  ],
} as const;
