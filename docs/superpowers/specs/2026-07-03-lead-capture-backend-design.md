# Lead Capture Backend — Phase 1 Design Spec

**Date:** 2026-07-03
**Project:** Silent Precision (live at https://silent-precision.vercel.app)
**Status:** Approved direction — Vercel serverless + Supabase, invisible bot defenses, Resend email, Vercel Analytics
**Out of scope (Phase 2, separate spec):** admin panel / CMS, WhatsApp notifications, Turnstile, custom email domain.

## Goal

Add a lead-capture inquiry form to the live site whose submissions are stored
in a database and emailed to Akki instantly — with production-grade security —
plus privacy-friendly analytics with conversion events. Direct email/WhatsApp
buttons remain; the form is an option, not a gate.

## Decisions made (with user)

| Decision | Choice |
|---|---|
| Scope | Phase 1 = lead capture + analytics. CMS/admin deferred to Phase 2 |
| Stack | Vercel serverless functions (same repo/deploy) + Supabase Postgres |
| Bot defense | Invisible only: honeypot + time-trap + per-IP rate limit + server validation. No CAPTCHA |
| Notification | Email to raptor.akki.64@gmail.com via Resend (free tier) |
| Analytics | Vercel Analytics + custom conversion events |

## Architecture

```
Browser form (Contact section)
   │  POST /api/inquire  (JSON)
   ▼
Vercel serverless function  api/inquire.ts     ← the ONLY door to the DB
   │  1. validate  2. honeypot/time-trap  3. rate limit  4. insert  5. email
   ├──► Supabase Postgres (inquiries table, RLS locked, service key only)
   └──► Resend (notification email)
```

The browser never talks to Supabase. All secrets live in Vercel env vars.

## Components

### 1. Frontend — `src/components/InquiryForm.tsx`

Rendered inside the existing Contact section, above the Email/WhatsApp buttons.
Uses existing primitives/tokens (surface card, `--radius-sharp` inputs, signal
CTA, mono labels, Reveal). Fields:

- `name` — text, required, 2–80 chars
- `email` — email, required, ≤254 chars
- `interest` — segmented choice: "Positioning Sprint" / "Advisory Retainer" / "Not sure yet" (default)
- `message` — textarea, required, 10–2000 chars
- `company` — the honeypot: visually hidden (CSS, not `display:none` alone; also `tabindex="-1"`, `autocomplete="off"`), real users never fill it
- `elapsedMs` — client-computed elapsed milliseconds since form mount, sent at submit, for the time-trap (single-clock; immune to client clock skew; still best-effort/spoofable)

States: idle → submitting (button disabled, spinner) → success ("Got it — I
reply within a day.") or error (inline message near the form: what went wrong,
how to fix; direct-contact buttons remain visible as fallback). Client-side
validation mirrors the server rules for instant feedback but is advisory only.
Reduced-motion respected (reuse existing patterns). Labels use `<label for>`;
errors are announced via `aria-live="polite"`.

### 2. API — `api/inquire.ts` (Vercel Node function)

Contract: `POST /api/inquire`, JSON body `{ name, email, interest, message, company, elapsedMs }`.

Processing order:
1. Method check → 405 for non-POST.
2. Parse + validate (shared module `api/_lib/validate.ts`, pure functions):
   trims, length caps as above, email regex (pragmatic RFC subset), `interest`
   must be one of the three enum values. Fail → 400 `{ ok:false, error:"<field>: <plain-language reason>" }`.
3. Honeypot: `company` non-empty → respond 200 `{ ok:true }` and discard
   (never tip off the bot). Time-trap: `elapsedMs` missing or < 3000 →
   same silent discard. (Client timestamp is spoofable; this is best-effort —
   the rate limit and honeypot are the primary defenses.)
4. Rate limit: sha256(IP + `IP_HASH_SALT`) → count `inquiries` rows with that
   `ip_hash` in the last hour; ≥5 → 429 `{ ok:false, error:"Too many requests — try again in an hour or email me directly." }`.
5. Insert row via Supabase JS client with `SUPABASE_SERVICE_ROLE_KEY`.
6. Send Resend email (from `onboarding@resend.dev` until a domain exists; to
   `raptor.akki.64@gmail.com`; subject `New inquiry — {name} ({interest})`;
   body: all fields + referrer). Email failure does NOT fail the request —
   the lead is already stored; log the error.
7. 200 `{ ok:true }`.

No stack traces or internals in any response. Request body size cap 32 KB.

### 3. Database — Supabase

```sql
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  interest text not null,
  message text not null,
  referrer text,
  user_agent text,
  ip_hash text not null,
  status text not null default 'new'
);
alter table inquiries enable row level security;
-- NO policies created: anon and authenticated roles can do nothing.
-- Only the service-role key (server-side) bypasses RLS.
```

`status` exists for Phase 2 (new/replied/closed). Raw IPs are never stored —
only salted hashes (privacy + still rate-limitable).

### 4. Security baseline (site-wide, this phase)

- `vercel.json` headers on all routes: `Strict-Transport-Security: max-age=63072000; includeSubDomains`,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
  and `Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' https://va.vercel-scripts.com; connect-src 'self' https://va.vercel-scripts.com` —
  validated against the live site before merge (Tailwind injects inline styles, hence `'unsafe-inline'` for styles only).
- Secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`,
  `IP_HASH_SALT` — Vercel env vars only; `.env.local` git-ignored for local dev; never committed.
- `npm audit` must be clean (no high/critical) at merge.
- Final pass with the code-review skill focused on the API before deploy.

### 5. Analytics

- `@vercel/analytics` → `<Analytics />` in `App.tsx`.
- Custom events: `inquiry_submitted` (on API success), `whatsapp_click`,
  `email_click` (Contact buttons). Viewable in the Vercel dashboard.

## Testing

- **Vitest** (new devDep) unit tests for `api/_lib/validate.ts` (every rule,
  boundary lengths, enum) and for the handler with mocked Supabase/Resend:
  honeypot discard, time-trap discard, rate-limit 429, insert+email happy
  path, email-failure-still-succeeds, 405, oversized body.
- **Live E2E after deploy:** real submission on the production URL → row
  visible in Supabase → email arrives → analytics event registered.
- Existing gate stays: `npm run lint` + `npm run build` clean.

## Accounts Akki must create (5 minutes each, before implementation of API tasks)

1. **Supabase** — free project; provide URL + service-role key + run the table SQL (I supply it ready to paste).
2. **Resend** — free account; provide API key.

Both keys go straight into Vercel env vars (I'll give exact instructions);
they are never pasted into chat files or the repo.
