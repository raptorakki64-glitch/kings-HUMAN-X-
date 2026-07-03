export interface PhotoRef {
  src: string;
  alt: string;
  caption?: string;
  ratio: string; // CSS aspect-ratio value, e.g. "3 / 4"
}

export interface ProofStat {
  prefix?: string;
  value: number;
  suffix?: string;
  label: string;
}

export interface CaseStudyEntry {
  tag: string;
  title: string;
  body: string;
  metrics: { label: string; value: string }[];
}

export const site = {
  name: "Golla Aakash Venkat",
  role: "Brand Strategist & Hybrid Athlete",
  email: "raptor.akki.64@gmail.com",
  whatsapp: "https://wa.me/917659830110",
  linkedin: "https://www.linkedin.com/in/aakash-venkat-golla-664907309",
};

export const hero = {
  kicker: "Golla Aakash Venkat — Brand Strategist & Hybrid Athlete",
  headline: ["DISCIPLINE IS", "THE STRATEGY."] as [string, string],
  sub: "I'm a cricketer who became an operator. I build brands for founders and athletes the way athletes build seasons — deliberately, measurably, under pressure.",
  cta: "Work with me",
  photo: {
    src: "/photos/cricket-batting.jpg",
    alt: "Aakash walking out to bat in Purple Panthers kit",
    ratio: "3 / 4",
  } as PhotoRef,
};

export const proof: ProofStat[] = [
  { prefix: "₹", value: 300000, label: "revenue generated — GAV Farming" },
  { value: 200, suffix: "+", label: "boxes sold direct to consumers" },
  { value: 200, suffix: "+", label: "admissions added — Chanikya High School" },
  { value: 10, suffix: "x", label: "organic social growth" },
];

export const story = {
  kicker: "The Story",
  title: "From the pitch to the practice",
  paragraphs: [
    "I spent years inside a strict performance framework. On the cricket pitch there is no room for ambiguity — you prepare, you analyse, you perform under pressure. Every variable is measured, every weakness is targeted, and every outcome traces back to a deliberate input.",
    "That is the method I bring to brand work. I help founders, creators and athletes find a position worth defending — and build the equity to defend it. Not with theory: with the same operational discipline that wins matches. Why athletes think differently, how that bridges into business, and the repeatable system that comes out of it — that is the playbook.",
  ] as [string, string],
  pullQuote: "I build brands the way athletes build seasons.",
  photo: {
    src: "/photos/waterfront.jpg",
    alt: "Aakash at the marina, off the field",
    caption: "Off the field",
    ratio: "3 / 4",
  } as PhotoRef,
};

export const gallery = {
  kicker: "The Athlete",
  title: "Trained for pressure",
  photos: [
    { src: "/photos/cricket-batting.jpg", alt: "Walking out to bat, Purple Panthers kit", caption: "Match day", ratio: "2 / 3" },
    { src: "/photos/golf-swing.jpg", alt: "Mid golf swing at the driving range", caption: "Range work", ratio: "3 / 4" },
    { src: "/photos/cricket-league.jpg", alt: "Walking out to bat in league kit", caption: "League season", ratio: "3 / 4" },
    { src: "/photos/waterfront.jpg", alt: "At the marina", caption: "On the road", ratio: "1 / 1" },
  ] as PhotoRef[],
};

export const caseStudies = {
  kicker: "Verifiable Proof",
  title: "Work that moved numbers",
  entries: [
    {
      tag: "Commerce",
      title: "GAV Farming",
      body: "I applied operational discipline to agricultural commerce — streamlined the supply chain and sold direct to consumers instead of through middlemen. Sourcing, packing, pricing and the social presence that moved it.",
      metrics: [
        { label: "Revenue", value: "₹3,00,000" },
        { label: "Volume", value: "200+ boxes" },
      ],
    },
    {
      tag: "Institutional",
      title: "Chanikya High School",
      body: "I repositioned the school's public presence and used digital channels to drive real enrollment — not vanity metrics. The growth showed up in the admissions register.",
      metrics: [
        { label: "Admissions", value: "200+ added" },
        { label: "Social reach", value: "10x growth" },
      ],
    },
  ] as CaseStudyEntry[],
};

export const capabilities = {
  kicker: "Capabilities",
  title: "What I actually do",
  items: [
    {
      name: "Positioning",
      line: "Finding the gap in your market and the sentence that owns it.",
      detail: "Competitive mapping, category framing and a value proposition sharp enough that people repeat it back to you.",
    },
    {
      name: "Social strategy",
      line: "Organic distribution that compounds.",
      detail: "Built on authenticity and consistency, not ad spend — the way athletic credibility actually travels online.",
    },
    {
      name: "Brand messaging",
      line: "Copy that sounds like you and lands with the people who pay.",
      detail: "Narrative architecture and high-impact copy for founders talking to allocators, customers and press.",
    },
    {
      name: "Hands-on execution",
      line: "I don't hand you a deck and leave.",
      detail: "I work inside the operation — bridging strategy and delivery until the numbers move.",
    },
    {
      name: "AI-assisted workflows",
      line: "Research and production cycles cut from weeks to days.",
      detail: "Private, fast pipelines for market mapping, research and content production.",
    },
  ],
};

export const services = {
  kicker: "Working Together",
  title: "Two ways in",
  formats: [
    {
      name: "Positioning Sprint",
      term: "2–4 weeks · fixed scope",
      body: "We find your position, your message and your proof — and ship the assets that carry them. You leave with a playbook you can run without me.",
    },
    {
      name: "Advisory Retainer",
      term: "Monthly · limited seats",
      body: "Ongoing counsel and execution support as the brand compounds. For founders and athletes who want a strategist inside the operation, not outside it.",
    },
  ],
  firstTwoWeeks: [
    "Intake call — goals, constraints, honest numbers",
    "Diagnosis — market map and where your equity actually stands",
    "Playbook draft — position, message, channels",
    "First assets live",
  ],
  youBring: "Access, honesty about the numbers, and one hour a week.",
  pricing: "Scoped after a first call.",
};

export const contact = {
  headline: "Let's talk.",
  sub: "Tell me what you're building and where it's stuck. I reply within a day.",
};
