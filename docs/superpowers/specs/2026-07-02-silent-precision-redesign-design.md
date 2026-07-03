# Silent Precision — Redesign Design Spec

**Date:** 2026-07-02
**Project:** Personal-brand advisory site for Golla Aakash Venkat ("Akki")
**Repo:** `~/silent-precision/` → pushes to `github.com/raptorakki64-glitch/kings-HUMAN-X-`
**Status:** Approved direction — "Editorial Athlete"

## Goal

Rebuild the AI Studio–generated "Silent Precision" portfolio into a client-facing
brand-advisory site that feels real, lucid, and in motion — not AI-generated.
Primary audience: founders and athletes who might hire Akki for positioning and
brand strategy. Primary conversion: direct contact (email/WhatsApp).

## Decisions Made (with user)

| Decision | Choice |
|---|---|
| Scope | Full redesign — new structure AND new copy, not just visual polish |
| Audience | Clients for brand advisory; site = credibility + intake |
| Case-study numbers | Real (GAV Farming ₹3,00,000 / 200+ boxes; Chanikya HS 200+ admissions / 10x social) — keep and expand |
| Contact | No form. Direct email + WhatsApp buttons (`mailto:raptor.akki.64@gmail.com`, `wa.me/917659830110`) + LinkedIn |
| Imagery | Real photos of Akki (he will provide); consistent art-directed treatment |
| Home | `~/silent-precision/`, push to existing GitHub repo |
| Direction | A: Editorial Athlete (oversized editorial type, real photography, restrained motion) |
| Pixel canvas | KEPT in hero (user override) — reduced opacity, paused off-screen, disabled under `prefers-reduced-motion` |
| Services model | Positioning sprint + monthly advisory retainer; no public pricing ("scoped after a first call") |

## Design System (tokens in `index.css` `@theme`)

### Color
- `--color-ink: #0A0A0B` — page background
- `--color-surface: #131316` — raised surfaces (replaces glass panels)
- `--color-line: rgba(255,255,255,0.08)` — the single border color
- Text: `#F4F4F5` (primary) / `#A1A1AA` (secondary) / `#71717A` (tertiary) — all ≥4.5:1 on ink
- `--color-signal: #E11D48` — the ONLY accent; used exclusively for proof metrics and primary CTA

### Typography
- Display: Geist 800, `clamp(3rem, 8vw, 7.5rem)`, tracking tight — headlines
- Section lead: Newsreader italic (replaces EB Garamond), `text-2xl–4xl` — pull-quotes/section headers
- Body: Geist 400, `1rem–1.0625rem`, line-height 1.7
- Label/data: JetBrains Mono, exactly ONE small size: `0.75rem`, uppercase, tracked
- No other font sizes below 0.875rem anywhere.

### Space & radius
- Spacing: 4px grid only (4/8/12/16/24/32/48/64/96/128); sections `py-24 md:py-40`
- Radius: exactly two — `2px` (buttons, tags) and `12px` (photos/cards)

### Photography treatment (applied identically to every image)
Slight desaturation, warm-shadow duotone toward ink, ~4% film grain overlay, 12px radius.

## Page Structure (single page, 8 sections)

1. **Hero** — Small mono kicker (name · role), two-line display headline
   (working copy: "DISCIPLINE IS THE STRATEGY."), one real photo bleeding in
   from the right (~45% width), one CTA ("Work with me" → contact). Pixel
   canvas retained behind at reduced opacity. No glass panel, no watermark.
2. **Proof strip** — single quiet row of real numbers (₹3,00,000 revenue ·
   200+ boxes · 200+ admissions · 10x social growth), counting up once on
   first view. Positioned before any philosophy.
3. **The Story** — two-paragraph editorial narrative (athlete → operator) in
   prose columns, one Newsreader pull-quote, one cricket/training photo.
   Absorbs "The Strategic Playbook" content. Replaces "Operating Model" cards.
4. **Athletic gallery** — 4–6 real photos in a horizontal scroll-drift band,
   mono captions (place, year).
5. **Case studies** — GAV Farming and Chanikya High School as full-width
   horizontal entries: category tag, title, 2–3 sentences of what Akki
   actually did, metrics right-aligned in mono with signal accent.
6. **Capabilities** — five disciplines as a numbered list (01–05), one-line
   plain-English descriptions, hover/tap reveals detail. No fake versioning.
7. **Services & engagement** — two formats: (a) Positioning Sprint (fixed
   2–4 week engagement), (b) Advisory Retainer (ongoing monthly). Describes
   what happens in the first two weeks and what the client must bring.
   Pricing: "scoped after a first call."
8. **Contact** — large headline ("Let's talk."), Email + WhatsApp buttons,
   LinkedIn link (real URL needed from Akki). Minimal footer: name + year.

### Voice rule
First person, plain, concrete — every sentence something Akki would say to a
client across a table. ALL sci-fi jargon ("TRANSMIT PARAMETERS", "SCROLL
PROTOCOL", "NODE-A_GAV", "STACK v2.16") is deleted.

## Motion System

- One ease everywhere: `cubic-bezier(0.16, 1, 0.3, 1)`
- Three durations: 200ms (hover/micro), 450ms (scroll reveals), 800ms (hero entrance, once)
- Scroll reveals: `y: 24 → 0` + fade, `whileInView`, once
- Proof numbers count up over 1.2s on first view
- Gallery band drifts with scroll (transform-only)
- Buttons: color/background transitions only — never scale
- `prefers-reduced-motion`: all motion collapses to simple fades; pixel canvas disabled
- Pixel canvas: paused when hero off-screen (IntersectionObserver)

## Architecture

Stack unchanged: Vite 6 + React 19 + Tailwind 4 + motion.

```
src/
  content.ts        — ALL copy/data, typed (edit content without touching components)
  index.css         — tokens (@theme) + base styles
  App.tsx           — section composition only
  components/
    Nav.tsx  Hero.tsx  ProofStrip.tsx  Story.tsx  Gallery.tsx
    CaseStudies.tsx  Capabilities.tsx  Services.tsx  Contact.tsx  Footer.tsx
    PixelHero.tsx    — kept, tuned (opacity, pause, reduced-motion)
  primitives/
    Reveal.tsx       — the one scroll-reveal wrapper
    SectionHeader.tsx
    Button.tsx
```

Deleted: `FrostedGlassPanel.tsx`, the fake `ContactForm.tsx`.

## Cleanup (from audit)

- Remove unused deps: `@google/genai`, `express`, `dotenv`, `tsx`, `@types/express`
- Fix `index.html`: real title, meta description, OG tags
- Replace AI Studio README with a real one
- Delete `.env.example` (no env vars needed)
- Fix inherited bugs: `border-zinc-850` (nonexistent class), double padding
  pattern from FrostedGlassPanel callers (moot — component deleted)
- `metadata.json`: remove false server-side Gemini capability claim

## Content Akki must provide

- Photos (hero portrait, 1 story photo, 4–6 gallery shots)
- LinkedIn URL
- Optional: expanded case-study detail, gallery captions (place/year)

Until provided: build with clearly-marked local placeholder images sized to
final aspect ratios; never ship them.

## Verification (per implementation step)

- Dev server + Chrome screenshot at 375px and 1440px after each section built
- Contrast check of all new token combinations (≥4.5:1)
- `npm run lint` (tsc) clean
- Final pass: Lighthouse, keyboard nav, reduced-motion, no horizontal scroll
