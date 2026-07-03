# Silent Precision Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the AI Studio–generated portfolio at `/Users/aakash/silent-precision/` into the approved "Editorial Athlete" one-page advisory site (spec: `docs/superpowers/specs/2026-07-02-silent-precision-redesign-design.md`).

**Architecture:** Single-page Vite + React 19 + Tailwind 4 app. All copy/data lives in `src/content.ts`; design tokens live in `src/index.css` `@theme`; every section is a self-contained component composed in `App.tsx`; shared behavior lives in three primitives (`Reveal`, `Button`, `Photo`) plus `SectionHeader`.

**Tech Stack:** Vite 6, React 19, Tailwind CSS 4 (`@tailwindcss/vite`), `motion` (framer-motion successor, imported from `motion/react`), `lucide-react`, TypeScript 5.8. No test runner exists in this project — verification per task is `npm run lint` (tsc --noEmit) + visual check in browser.

## Global Constraints

- Colors: ONLY `--color-ink: #0A0A0B`, `--color-surface: #131316`, `--color-line: rgba(255,255,255,0.08)`, text `#F4F4F5`/`#A1A1AA`/`#71717A`, accent `--color-signal: #E11D48`. No other colors, no `zinc-*` classes, no hardcoded hex in components.
- `--color-signal` is used ONLY for: proof metrics (at ≥24px, or bold ≥19px — it is 3.5:1 on ink, passes AA large-text only) and primary CTA **backgrounds** (white text on signal = 5.7:1 ✓). Never for body text.
- Type: display = Geist 800 `clamp(3rem,8vw,7.5rem)`; serif = Newsreader italic; body = Geist 400 at 1rem/1.7; the ONLY size below 0.875rem is `text-xs` (0.75rem) mono uppercase tracked. No arbitrary `text-[Npx]` classes.
- Radius: ONLY `--radius-sharp: 2px` (buttons/tags) and `--radius-frame: 12px` (photos/cards).
- Motion: ONLY ease `[0.16, 1, 0.3, 1]`; ONLY durations 0.2s (hover), 0.45s (reveals), 0.8s (hero, once); count-up 1.2s. All via constants from `src/motion.ts`. Buttons never scale. Everything honors `prefers-reduced-motion` (use `useReducedMotion()` from `motion/react`).
- Voice: first person, plain, concrete. Forbidden words anywhere in copy: protocol, transmit, node, gateway, parameters, signal (as jargon), stack v-anything.
- Touch targets ≥44px (`min-h-12` = 48px on all buttons/links that act as buttons).
- All interactive elements: `cursor-pointer`, visible `focus-visible` outline, color-only hover transitions (`duration-200`).
- Contact: `mailto:raptor.akki.64@gmail.com`, `https://wa.me/917659830110`, `https://www.linkedin.com/in/aakash-venkat-golla-664907309`.
- Commit after every task with the trailer: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Verification browser: dev server via `npm run dev` (may land on port other than 3000 if occupied — read the vite output). Screenshot at 1440px and 375px widths.

## File Structure (end state)

```
index.html                       — real title/meta/OG
public/photos/                   — placeholder SVGs now, real photos later (same filenames)
src/
  index.css                      — @theme tokens, base styles, .photo-frame treatment
  motion.ts                      — EASE, DUR constants
  content.ts                     — ALL copy + typed content (replaces types.ts)
  App.tsx                        — composition only
  primitives/
    Reveal.tsx  Button.tsx  Photo.tsx  SectionHeader.tsx
  components/
    Nav.tsx  Hero.tsx  ProofStrip.tsx  Story.tsx  Gallery.tsx
    CaseStudies.tsx  Capabilities.tsx  Services.tsx  Contact.tsx  Footer.tsx
    PixelHero.tsx                — kept, tuned
DELETED: src/types.ts, src/components/FrostedGlassPanel.tsx, src/components/ContactForm.tsx, .env.example
```

---

### Task 1: Foundation — cleanup, tokens, motion constants

**Files:**
- Modify: `package.json`, `index.html`, `metadata.json`, `src/index.css`, `README.md`
- Create: `src/motion.ts`
- Delete: `.env.example`

**Interfaces:**
- Produces: CSS tokens usable as Tailwind classes (`bg-ink`, `bg-surface`, `border-line`, `text-text-hi`, `text-text-mid`, `text-text-low`, `bg-signal`, `text-signal`, `font-display`, `font-serif`, `font-sans`, `font-mono`, `rounded-(--radius-sharp)`, `rounded-(--radius-frame)`); `.photo-frame` CSS class; `EASE: readonly [0.16,1,0.3,1]`, `DUR = { hover: 0.2, reveal: 0.45, hero: 0.8, count: 1.2 }` from `src/motion.ts`.

- [ ] **Step 1: Remove dead dependencies and stale files**

In `package.json` delete these lines from `dependencies`: `"@google/genai"`, `"express"`, `"dotenv"`; and from `devDependencies`: `"tsx"`, `"@types/express"`. Then:

```bash
cd /Users/aakash/silent-precision && rm .env.example && npm install
```

- [ ] **Step 2: Rewrite `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Golla Aakash Venkat — Brand Strategist & Hybrid Athlete</title>
    <meta name="description" content="I build brands for founders and athletes the way athletes build seasons — deliberately, measurably, under pressure. Positioning sprints and advisory retainers." />
    <meta property="og:title" content="Golla Aakash Venkat — Brand Strategist & Hybrid Athlete" />
    <meta property="og:description" content="Cricketer turned operator. Positioning, social strategy and brand messaging for founders and athletes." />
    <meta property="og:type" content="website" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Fix `metadata.json`**

```json
{
  "name": "Silent Precision — Golla Aakash Venkat",
  "description": "Personal brand-advisory site for Golla Aakash Venkat: positioning, social strategy and brand messaging for founders and athletes.",
  "requestFramePermissions": []
}
```

- [ ] **Step 4: Rewrite `src/index.css` with the token system**

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300..900&family=JetBrains+Mono:wght@400;500;700&family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,500&display=swap');
@import "tailwindcss";

@theme {
  --color-ink: #0A0A0B;
  --color-surface: #131316;
  --color-line: rgba(255, 255, 255, 0.08);
  --color-text-hi: #F4F4F5;
  --color-text-mid: #A1A1AA;
  --color-text-low: #71717A;
  --color-signal: #E11D48;
  --color-signal-hover: #BE123C;

  --font-display: "Geist", ui-sans-serif, sans-serif;
  --font-sans: "Geist", ui-sans-serif, sans-serif;
  --font-serif: "Newsreader", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --radius-sharp: 2px;
  --radius-frame: 12px;
}

@layer base {
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }
  body {
    background: var(--color-ink);
    color: var(--color-text-hi);
    font-family: var(--font-sans);
    line-height: 1.7;
  }
  ::selection { background: rgba(225, 29, 72, 0.25); color: var(--color-text-hi); }
}

/* Art-directed photo treatment: desaturate, ink-shadow duotone, 4% grain */
.photo-frame {
  position: relative;
  border-radius: var(--radius-frame);
  overflow: hidden;
  background: var(--color-surface);
}
.photo-frame > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.82) contrast(1.03);
}
.photo-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.04;
  mix-blend-mode: overlay;
}
.photo-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(to top, rgba(10, 10, 11, 0.38), transparent 55%);
}
```

- [ ] **Step 5: Create `src/motion.ts`**

```ts
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DUR = {
  hover: 0.2,
  reveal: 0.45,
  hero: 0.8,
  count: 1.2,
} as const;
```

- [ ] **Step 6: Replace `README.md`**

```markdown
# Silent Precision — Golla Aakash Venkat

Personal brand-advisory site. Editorial Athlete design (spec in
`docs/superpowers/specs/`). Vite + React 19 + Tailwind 4 + motion.

## Develop
npm install
npm run dev        # vite dev server
npm run lint       # tsc --noEmit
npm run build      # production build

## Content
All copy and data: `src/content.ts`. Photos: `public/photos/`
(replace placeholder SVGs with real images, same filenames — then update
the `src` fields in `src/content.ts`).
```

- [ ] **Step 7: Verify**

Run: `npm run lint` → Expected: exits 0 (old components still compile; they still reference zinc classes but that's Tailwind, not TS — they get replaced in later tasks).
Run: `npm run dev` (background), open the printed URL → Expected: existing site still renders (fonts may shift since EB Garamond import was replaced — acceptable, old components die in later tasks).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: token foundation — design system tokens, motion constants, cleanup dead deps and AI Studio boilerplate"
```

---

### Task 2: Content module

**Files:**
- Create: `src/content.ts`

**Interfaces:**
- Produces (exact exports later tasks import):
  - `site: { name; role; email; whatsapp; linkedin }`
  - `hero: { kicker; headline: [string, string]; sub; cta; photo: PhotoRef }`
  - `proof: ProofStat[]` where `ProofStat = { prefix?: string; value: number; suffix?: string; label: string }`
  - `story: { kicker; title; paragraphs: [string, string]; pullQuote; photo: PhotoRef }`
  - `gallery: { kicker; title; photos: PhotoRef[] }` where `PhotoRef = { src: string; alt: string; caption?: string; ratio: string }`
  - `caseStudies: { kicker; title; entries: CaseStudyEntry[] }` where `CaseStudyEntry = { tag; title; body; metrics: { label: string; value: string }[] }`
  - `capabilities: { kicker; title; items: { name: string; line: string; detail: string }[] }`
  - `services: { kicker; title; formats: { name: string; term: string; body: string }[]; firstTwoWeeks: string[]; youBring: string; pricing: string }`
  - `contact: { headline; sub }`

- [ ] **Step 1: Write `src/content.ts`**

```ts
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
    src: "/photos/cricket-batting.svg",
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
    src: "/photos/formal-portrait.svg",
    alt: "Aakash in a black suit",
    caption: "Off the field",
    ratio: "3 / 4",
  } as PhotoRef,
};

export const gallery = {
  kicker: "The Athlete",
  title: "Trained for pressure",
  photos: [
    { src: "/photos/cricket-batting.svg", alt: "Walking out to bat, Purple Panthers kit", caption: "Match day", ratio: "2 / 3" },
    { src: "/photos/golf-swing.svg", alt: "Mid golf swing at the driving range", caption: "Range work", ratio: "3 / 4" },
    { src: "/photos/formal-portrait.svg", alt: "Black suit, marble interior", caption: "Off the field", ratio: "3 / 4" },
    { src: "/photos/waterfront-portrait.svg", alt: "At the marina", caption: "On the road", ratio: "1 / 1" },
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
```

- [ ] **Step 2: Verify**

Run: `npm run lint` → Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/content.ts && git commit -m "feat: typed content module — all copy and data in one file"
```

---

### Task 3: Primitives + placeholder photos

**Files:**
- Create: `src/primitives/Reveal.tsx`, `src/primitives/Button.tsx`, `src/primitives/Photo.tsx`, `src/primitives/SectionHeader.tsx`
- Create: `public/photos/cricket-batting.svg`, `public/photos/golf-swing.svg`, `public/photos/formal-portrait.svg`, `public/photos/waterfront-portrait.svg`

**Interfaces:**
- Consumes: `EASE`, `DUR` from `src/motion.ts`; `PhotoRef` from `src/content.ts`.
- Produces:
  - `Reveal({ children, className?, delay? })` — scroll-reveal wrapper
  - `Button({ href, children, variant?: "signal" | "ghost", external? })` — anchor styled as button
  - `Photo({ photo: PhotoRef, className? })` — treated figure with optional caption
  - `SectionHeader({ kicker, title })`

- [ ] **Step 1: Create the four placeholder SVGs**

Each placeholder is a dark rect with a mono label so it is unmistakably temporary. Create all four with this shell loop (labels differ):

```bash
cd /Users/aakash/silent-precision && mkdir -p public/photos
for name in cricket-batting golf-swing formal-portrait waterfront-portrait; do
cat > "public/photos/$name.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <rect width="900" height="1200" fill="#131316"/>
  <rect x="24" y="24" width="852" height="1152" fill="none" stroke="#2a2a2e" stroke-width="2" stroke-dasharray="8 8"/>
  <text x="450" y="590" fill="#71717A" font-family="monospace" font-size="34" text-anchor="middle">PLACEHOLDER</text>
  <text x="450" y="640" fill="#71717A" font-family="monospace" font-size="28" text-anchor="middle">$name</text>
</svg>
EOF
done
```

- [ ] **Step 2: Create `src/primitives/Reveal.tsx`**

```tsx
import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";
import { EASE, DUR } from "../motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: DUR.reveal, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Create `src/primitives/Button.tsx`**

```tsx
import { ReactNode } from "react";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "signal" | "ghost";
  external?: boolean;
}

export default function Button({ href, children, variant = "signal", external = false }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.15em] px-7 min-h-12 rounded-(--radius-sharp) cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";
  const variants = {
    signal: "bg-signal text-white hover:bg-signal-hover",
    ghost: "border border-line text-text-mid hover:text-text-hi hover:border-white/25",
  };
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 4: Create `src/primitives/Photo.tsx`**

```tsx
import { PhotoRef } from "../content";

interface PhotoProps {
  photo: PhotoRef;
  className?: string;
}

export default function Photo({ photo, className = "" }: PhotoProps) {
  return (
    <figure className={className}>
      <div className="photo-frame" style={{ aspectRatio: photo.ratio }}>
        <img src={photo.src} alt={photo.alt} loading="lazy" />
      </div>
      {photo.caption && (
        <figcaption className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-text-low">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}
```

- [ ] **Step 5: Create `src/primitives/SectionHeader.tsx`**

```tsx
import Reveal from "./Reveal";

interface SectionHeaderProps {
  kicker: string;
  title: string;
}

export default function SectionHeader({ kicker, title }: SectionHeaderProps) {
  return (
    <Reveal className="mb-16 md:mb-20">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low mb-3">{kicker}</p>
      <h2 className="font-serif italic text-3xl md:text-4xl text-text-hi">{title}</h2>
    </Reveal>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npm run lint` → Expected: exits 0.
Run: `curl -s http://localhost:<port>/photos/cricket-batting.svg | head -2` → Expected: SVG markup.

- [ ] **Step 7: Commit**

```bash
git add src/primitives public/photos && git commit -m "feat: primitives (Reveal, Button, Photo, SectionHeader) and placeholder photos"
```

---

### Task 4: Nav, Footer, App skeleton

**Files:**
- Create: `src/components/Nav.tsx`, `src/components/Footer.tsx`
- Modify: `src/App.tsx` (full rewrite)
- Delete: `src/components/FrostedGlassPanel.tsx`, `src/components/ContactForm.tsx`

**Interfaces:**
- Consumes: `site` from `src/content.ts`; `Button` primitive.
- Produces: `Nav()` (fixed header, anchor links `#story #proof #work #services #contact`), `Footer()`. `App.tsx` becomes the composition root that later tasks append sections to (each later task adds one import + one element inside `<main>`).

- [ ] **Step 1: Create `src/components/Nav.tsx`**

```tsx
import { site } from "../content";

const links = [
  { href: "#story", label: "Story" },
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
];

export default function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink/80 backdrop-blur-md border-b border-line">
      <nav className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="font-mono text-xs uppercase tracking-[0.2em] text-text-hi min-h-12 inline-flex items-center cursor-pointer">
          {site.name.split(" ")[1]} {/* "Aakash" */}
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-mid hover:text-text-hi transition-colors duration-200 min-h-12 inline-flex items-center cursor-pointer"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          className="inline-flex items-center justify-center font-mono text-xs font-medium uppercase tracking-[0.15em] px-5 min-h-12 rounded-(--radius-sharp) bg-signal text-white hover:bg-signal-hover transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Work with me
        </a>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Create `src/components/Footer.tsx`**

```tsx
import { site } from "../content";

export default function Footer() {
  return (
    <footer className="border-t border-line py-12">
      <div className="max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-text-low">
          © {new Date().getFullYear()} {site.name}
        </span>
        <span className="font-serif italic text-text-low">Silent Precision</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Rewrite `src/App.tsx`**

```tsx
import Nav from "./components/Nav";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-ink text-text-hi antialiased overflow-x-clip">
      <Nav />
      <main className="pt-16">
        {/* sections appended by subsequent tasks */}
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Delete replaced components**

```bash
git rm src/components/FrostedGlassPanel.tsx src/components/ContactForm.tsx
```

(Old `CaseStudies.tsx` stays until Task 8 rewrites it; `src/types.ts` stays until then too because old CaseStudies imports it. Old `PixelHero.tsx` stays until Task 5 tunes it. They are unreferenced by App from this point.)

- [ ] **Step 5: Verify**

Run: `npm run lint` → Expected: exits 0.
Browser at dev URL, 1440px → Expected: fixed nav with "AAKASH", three links, red "WORK WITH ME" button; empty dark page; footer. 375px → nav shows name + CTA only, no horizontal scroll.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: nav, footer, app skeleton; delete glass panel and fake contact form"
```

---

### Task 5: Hero + PixelHero tuning

**Files:**
- Create: `src/components/Hero.tsx`
- Modify: `src/components/PixelHero.tsx` (three targeted changes), `src/App.tsx` (add section)

**Interfaces:**
- Consumes: `hero` from content; `Photo`, `Button` primitives; `EASE`, `DUR` from motion; tuned `PixelHero`.
- Produces: `Hero()` rendered as `<section id="story">`.

- [ ] **Step 1: Tune `src/components/PixelHero.tsx`**

Three changes (keep everything else identical):

(a) Respect reduced motion — the check must come AFTER all hooks (early-returning before hooks violates the rules of hooks). Immediately before the component's existing `return (` statement, insert:

```tsx
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }
```

(The existing JSX return stays unchanged below it.)

(b) Fix the re-init bug and pause off-screen — replace `const [isHovered, setIsHovered] = useState(false);` with `const isHoveredRef = useRef(false);`, replace every `isHovered` read inside `animate` with `isHoveredRef.current`, replace `setIsHovered(true/false)` with `isHoveredRef.current = true/false`, and change the effect dependency array from `[isHovered]` to `[]`. Then add an IntersectionObserver inside the same effect that cancels/restarts the rAF loop:

```tsx
    let running = true;
    const io = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      if (visible && !running) { running = true; animate(); }
      if (!visible) { running = false; cancelAnimationFrame(animationFrameId); }
    });
    io.observe(container);
```

and as the first line inside `animate()`: `if (!running) return;`. Add `io.disconnect()` to the cleanup. Also drop the now-unused `useState` import.

(c) Lower the baseline alpha so the photo leads: change `alpha: 0.15` to `alpha: 0.08` in `initParticles` and change the fade-back line to `p.alpha += (0.08 - p.alpha) * 0.1;` and the hover illumination to `p.alpha = 0.08 + (1 - dist / mouseRadius) * 0.3;`.

- [ ] **Step 2: Create `src/components/Hero.tsx`**

```tsx
import { motion, useReducedMotion } from "motion/react";
import { hero } from "../content";
import Photo from "../primitives/Photo";
import Button from "../primitives/Button";
import PixelHero from "./PixelHero";
import { EASE, DUR } from "../motion";

export default function Hero() {
  const reduced = useReducedMotion();
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DUR.hero, ease: EASE, delay },
  });

  return (
    <section id="story" className="relative min-h-[88vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 opacity-60">
        <PixelHero />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-24 md:py-32 grid grid-cols-1 md:grid-cols-12 gap-12 items-center w-full">
        <div className="md:col-span-7">
          <motion.p
            {...enter(0)}
            className="font-mono text-xs uppercase tracking-[0.2em] text-text-low mb-8"
          >
            {hero.kicker}
          </motion.p>
          <motion.h1
            {...enter(0.08)}
            className="font-display font-extrabold tracking-tight leading-[0.95] text-text-hi"
            style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
          >
            {hero.headline[0]}
            <br />
            {hero.headline[1]}
          </motion.h1>
          <motion.p
            {...enter(0.16)}
            className="mt-8 max-w-xl text-base md:text-lg text-text-mid"
          >
            {hero.sub}
          </motion.p>
          <motion.div {...enter(0.24)} className="mt-10">
            <Button href="#contact">{hero.cta}</Button>
          </motion.div>
        </div>
        <motion.div {...enter(0.2)} className="md:col-span-5">
          <Photo photo={hero.photo} />
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add to `src/App.tsx`**

Add import `import Hero from "./components/Hero";` and `<Hero />` as the first child of `<main>`.

- [ ] **Step 4: Verify**

Run: `npm run lint` → Expected: exits 0.
Browser 1440px → Expected: kicker, two-line display headline, sub, red CTA left; treated placeholder photo right; faint pixel grid behind reacting to mouse. 375px → single column, headline wraps at clamp size, no horizontal scroll. Toggle "Emulate prefers-reduced-motion" in devtools → canvas absent, content appears without rise.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: hero with editorial display type and tuned pixel canvas (reduced-motion, pause off-screen, lower alpha)"
```

---

### Task 6: Proof strip with count-up

**Files:**
- Create: `src/components/ProofStrip.tsx`
- Modify: `src/App.tsx` (add section after `<Hero />`)

**Interfaces:**
- Consumes: `proof: ProofStat[]` from content; `EASE`, `DUR`; `useInView`, `useReducedMotion` from `motion/react`.
- Produces: `ProofStrip()` rendered as `<section id="proof">`.

- [ ] **Step 1: Create `src/components/ProofStrip.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { proof, ProofStat } from "../content";
import { DUR } from "../motion";

function Stat({ stat }: { stat: ProofStat }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? stat.value : 0);

  useEffect(() => {
    if (!inView || reduced) {
      if (inView) setDisplay(stat.value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (DUR.count * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(stat.value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, stat.value]);

  return (
    <div ref={ref}>
      <div className="font-mono text-2xl md:text-3xl font-bold text-signal">
        {stat.prefix ?? ""}
        {display.toLocaleString("en-IN")}
        {stat.suffix ?? ""}
      </div>
      <div className="mt-2 text-sm text-text-mid max-w-[22ch]">{stat.label}</div>
    </div>
  );
}

export default function ProofStrip() {
  return (
    <section id="proof" className="border-y border-line bg-surface/60">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
        {proof.map((stat) => (
          <Stat key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to `src/App.tsx`** — import and place `<ProofStrip />` directly after `<Hero />`.

- [ ] **Step 3: Verify**

Run: `npm run lint` → Expected: exits 0.
Browser → Expected: four stats, numbers count up once when scrolled into view, values end at ₹3,00,000 / 200+ / 200+ / 10x in signal red at ≥24px (large-text AA). Reduced-motion → values render final immediately.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: proof strip with Indian-format count-up stats"
```

---

### Task 7: Story section

**Files:**
- Create: `src/components/Story.tsx`
- Modify: `src/App.tsx` (add after `<ProofStrip />`)

**Interfaces:**
- Consumes: `story` from content; `Reveal`, `Photo`, `SectionHeader` primitives.
- Produces: `Story()` rendered as `<section>` (no id — `#story` anchor is the hero).

- [ ] **Step 1: Create `src/components/Story.tsx`**

```tsx
import { story } from "../content";
import Reveal from "../primitives/Reveal";
import Photo from "../primitives/Photo";
import SectionHeader from "../primitives/SectionHeader";

export default function Story() {
  return (
    <section className="py-24 md:py-40">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionHeader kicker={story.kicker} title={story.title} />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">
          <div className="md:col-span-7">
            <Reveal>
              <p className="text-base md:text-lg text-text-mid">{story.paragraphs[0]}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <blockquote className="my-10 border-l-2 border-signal pl-6 font-serif italic text-2xl md:text-3xl text-text-hi">
                {story.pullQuote}
              </blockquote>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-base md:text-lg text-text-mid">{story.paragraphs[1]}</p>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="md:col-span-5">
            <Photo photo={story.photo} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to `src/App.tsx`** — import and place `<Story />` after `<ProofStrip />`.

- [ ] **Step 3: Verify**

Run: `npm run lint` → Expected: exits 0. Browser → prose + Newsreader italic pull-quote with signal left border + formal-portrait placeholder right; reveals rise once on scroll.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: story section with editorial pull-quote"
```

---

### Task 8: Gallery band

**Files:**
- Create: `src/components/Gallery.tsx`
- Modify: `src/App.tsx` (add after `<Story />`)

**Interfaces:**
- Consumes: `gallery` from content; `Photo`, `SectionHeader`; `useScroll`, `useTransform`, `motion`, `useReducedMotion` from `motion/react`.
- Produces: `Gallery()`.

- [ ] **Step 1: Create `src/components/Gallery.tsx`**

```tsx
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { gallery } from "../content";
import Photo from "../primitives/Photo";
import SectionHeader from "../primitives/SectionHeader";

export default function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["4%", "-8%"]);

  return (
    <section ref={ref} className="py-24 md:py-40 overflow-hidden border-t border-line">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionHeader kicker={gallery.kicker} title={gallery.title} />
      </div>
      <motion.div style={{ x }} className="flex gap-6 md:gap-8 px-6 md:px-8 w-max">
        {gallery.photos.map((photo) => (
          <Photo
            key={photo.src + photo.caption}
            photo={photo}
            className="w-[240px] md:w-[320px] shrink-0"
          />
        ))}
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Add to `src/App.tsx`** — import and place `<Gallery />` after `<Story />`.

- [ ] **Step 3: Verify**

Run: `npm run lint` → Expected: exits 0. Browser → four captioned photos in a band that drifts left as you scroll past; page itself never scrolls horizontally (band is `overflow-hidden` inside the section). Reduced-motion → static.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: athletic gallery band with scroll drift"
```

---

### Task 9: Case studies rewrite

**Files:**
- Modify: `src/components/CaseStudies.tsx` (full rewrite)
- Modify: `src/App.tsx` (add after `<Gallery />`)
- Delete: `src/types.ts`

**Interfaces:**
- Consumes: `caseStudies` from content; `Reveal`, `SectionHeader`.
- Produces: `CaseStudies()` rendered as `<section id="work">`.

- [ ] **Step 1: Rewrite `src/components/CaseStudies.tsx`**

```tsx
import { caseStudies } from "../content";
import Reveal from "../primitives/Reveal";
import SectionHeader from "../primitives/SectionHeader";

export default function CaseStudies() {
  return (
    <section id="work" className="py-24 md:py-40 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionHeader kicker={caseStudies.kicker} title={caseStudies.title} />
        <div>
          {caseStudies.entries.map((entry) => (
            <Reveal key={entry.title}>
              <article className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 py-12 border-t border-line">
                <div className="md:col-span-2">
                  <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-text-low border border-line rounded-(--radius-sharp) px-3 py-1.5">
                    {entry.tag}
                  </span>
                </div>
                <div className="md:col-span-6">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-text-hi mb-3">
                    {entry.title}
                  </h3>
                  <p className="text-base text-text-mid max-w-prose">{entry.body}</p>
                </div>
                <div className="md:col-span-4 flex flex-col gap-5 md:items-end">
                  {entry.metrics.map((m) => (
                    <div key={m.label} className="md:text-right">
                      <div className="font-mono text-2xl font-bold text-signal">{m.value}</div>
                      <div className="font-mono text-xs uppercase tracking-[0.15em] text-text-low mt-1">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Delete the orphaned types module**

```bash
git rm src/types.ts
```

- [ ] **Step 3: Add to `src/App.tsx`** — import and place `<CaseStudies />` after `<Gallery />`.

- [ ] **Step 4: Verify**

Run: `npm run lint` → Expected: exits 0 (nothing imports `../types` anymore). Browser → two full-width entries, tag left, narrative center, red metrics right-aligned at 24px.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: full-width case study entries with real metrics; drop legacy types"
```

---

### Task 10: Capabilities list

**Files:**
- Create: `src/components/Capabilities.tsx`
- Modify: `src/App.tsx` (add after `<CaseStudies />`)

**Interfaces:**
- Consumes: `capabilities` from content; `Reveal`, `SectionHeader`; `AnimatePresence`, `motion`, `useReducedMotion` from `motion/react`; `EASE`, `DUR`.
- Produces: `Capabilities()`.

- [ ] **Step 1: Create `src/components/Capabilities.tsx`**

```tsx
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { capabilities } from "../content";
import Reveal from "../primitives/Reveal";
import SectionHeader from "../primitives/SectionHeader";
import { EASE, DUR } from "../motion";

export default function Capabilities() {
  const [open, setOpen] = useState<number>(0);
  const reduced = useReducedMotion();

  return (
    <section className="py-24 md:py-40 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionHeader kicker={capabilities.kicker} title={capabilities.title} />
        <div>
          {capabilities.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.name}>
                <div className="border-t border-line">
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-expanded={isOpen}
                    className="w-full grid grid-cols-12 gap-4 items-baseline py-6 text-left cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    <span className="col-span-2 md:col-span-1 font-mono text-xs text-text-low">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`col-span-10 md:col-span-4 text-lg md:text-xl font-bold tracking-tight transition-colors duration-200 ${
                        isOpen ? "text-text-hi" : "text-text-mid group-hover:text-text-hi"
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="col-span-10 col-start-3 md:col-span-7 md:col-start-6 text-base text-text-mid">
                      {item.line}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0 : DUR.reveal, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="pb-8 md:pl-[41.666%] text-base text-text-mid max-w-prose">
                          {item.detail}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to `src/App.tsx`** — import and place `<Capabilities />` after `<CaseStudies />`.

- [ ] **Step 3: Verify**

Run: `npm run lint` → Expected: exits 0. Browser → numbered 01–05 list; clicking a row expands its detail (only one open); rows are real `<button>`s, Tab + Enter work, `aria-expanded` toggles.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: capabilities as accessible numbered accordion list"
```

---

### Task 11: Services & engagement

**Files:**
- Create: `src/components/Services.tsx`
- Modify: `src/App.tsx` (add after `<Capabilities />`)

**Interfaces:**
- Consumes: `services` from content; `Reveal`, `SectionHeader`.
- Produces: `Services()` rendered as `<section id="services">`.

- [ ] **Step 1: Create `src/components/Services.tsx`**

```tsx
import { services } from "../content";
import Reveal from "../primitives/Reveal";
import SectionHeader from "../primitives/SectionHeader";

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-40 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionHeader kicker={services.kicker} title={services.title} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {services.formats.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.08}>
              <div className="h-full bg-surface border border-line rounded-(--radius-frame) p-8 md:p-10">
                <div className="font-mono text-xs uppercase tracking-[0.15em] text-text-low mb-4">
                  {f.term}
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-text-hi mb-4">
                  {f.name}
                </h3>
                <p className="text-base text-text-mid">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 md:mt-20">
          <h3 className="font-serif italic text-2xl text-text-hi mb-8">The first two weeks</h3>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {services.firstTwoWeeks.map((step, i) => (
              <li key={step} className="border-t border-line pt-4">
                <span className="font-mono text-xs text-text-low">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-2 text-base text-text-mid">{step}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-12 flex flex-col md:flex-row gap-3 md:gap-12">
          <p className="text-base text-text-mid">
            <span className="text-text-hi font-bold">What you bring:</span> {services.youBring}
          </p>
          <p className="text-base text-text-mid">
            <span className="text-text-hi font-bold">Pricing:</span> {services.pricing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to `src/App.tsx`** — import and place `<Services />` after `<Capabilities />`.

- [ ] **Step 3: Verify**

Run: `npm run lint` → Expected: exits 0. Browser → two surface cards (Sprint, Retainer), four-step timeline, bring/pricing lines.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: services section — sprint + retainer, first two weeks, pricing stance"
```

---

### Task 12: Contact section

**Files:**
- Create: `src/components/Contact.tsx`
- Modify: `src/App.tsx` (add after `<Services />`, before `</main>`)

**Interfaces:**
- Consumes: `contact`, `site` from content; `Reveal`, `Button`.
- Produces: `Contact()` rendered as `<section id="contact">`.

- [ ] **Step 1: Create `src/components/Contact.tsx`**

```tsx
import { contact, site } from "../content";
import Reveal from "../primitives/Reveal";
import Button from "../primitives/Button";

export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-40 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <Reveal>
          <h2
            className="font-display font-extrabold tracking-tight leading-none text-text-hi"
            style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
          >
            {contact.headline}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-xl text-base md:text-lg text-text-mid">{contact.sub}</p>
        </Reveal>
        <Reveal delay={0.16} className="mt-10 flex flex-wrap items-center gap-4">
          <Button href={`mailto:${site.email}`}>Email me</Button>
          <Button href={site.whatsapp} variant="ghost" external>
            WhatsApp
          </Button>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-[0.15em] text-text-mid hover:text-text-hi transition-colors duration-200 underline underline-offset-8 min-h-12 inline-flex items-center cursor-pointer"
          >
            LinkedIn
          </a>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to `src/App.tsx`** — final `<main>` order must now be:

```tsx
<main className="pt-16">
  <Hero />
  <ProofStrip />
  <Story />
  <Gallery />
  <CaseStudies />
  <Capabilities />
  <Services />
  <Contact />
</main>
```

- [ ] **Step 3: Verify**

Run: `npm run lint` → Expected: exits 0. Browser → giant "Let's talk." headline, red Email button (mailto), ghost WhatsApp (opens wa.me in new tab), LinkedIn underline link.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: contact section with direct email/WhatsApp/LinkedIn"
```

---

### Task 13: Final verification pass & push

**Files:**
- Modify: only if defects found.

- [ ] **Step 1: Type + build check**

Run: `npm run lint && npm run build` → Expected: both exit 0.

- [ ] **Step 2: Full-page visual pass**

Dev server, browser at 1440px and 375px. Scroll the entire page. Expected checks:
- No horizontal scroll at either width.
- Every section present in order: Hero, Proof, Story, Gallery, Work, Capabilities, Services, Contact, Footer.
- No `zinc-*` remnants: run `grep -rn "zinc-" src/` → Expected: no output.
- No forbidden jargon: run `grep -rniE "protocol|transmit|node-a|gateway|parameters" src/content.ts` → Expected: no output.

- [ ] **Step 3: Accessibility pass**

- Keyboard: Tab through nav → CTA → capabilities buttons → contact links; every stop shows a visible outline.
- DevTools "Emulate prefers-reduced-motion: reduce": pixel canvas gone, reveals are instant/fade-only, count-up instant.
- Contrast spot-check: text-mid `#A1A1AA` on ink (~8:1 ✓), text-low `#71717A` on ink (~4.6:1 ✓), signal only on ≥24px numbers or as button background.

- [ ] **Step 4: Lighthouse**

Chrome DevTools → Lighthouse → Performance + Accessibility + Best Practices + SEO, mobile. Expected: Accessibility ≥ 95, Performance ≥ 85 (placeholder SVGs are tiny; real photos later may need compression — note results).

- [ ] **Step 5: Commit any fixes and push**

```bash
git add -A && git diff --cached --quiet || git commit -m "fix: final verification pass adjustments"
git push origin main
```

(If push is rejected for auth, report to user — do not force anything.)

---

## Deferred (not in this plan)

- Swapping real photos into `public/photos/` when Akki delivers them (one-line `src` edits in `content.ts` + possible compression/`srcset`).
- Deployment (Vercel/Netlify) — separate decision.
- Expanded case-study detail if Akki supplies more material.
