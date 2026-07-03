# Lead Capture Backend (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secured inquiry form to the live Silent Precision site: submissions validated and bot-filtered in a Vercel serverless function, stored in Supabase, emailed to Akki via Resend, with site-wide security headers and Vercel Analytics conversion events. Spec: `docs/superpowers/specs/2026-07-03-lead-capture-backend-design.md`.

**Architecture:** The browser form POSTs to `/api/inquire` — the only door to the database. Pure logic (validation, bot checks, orchestration) lives in `api/_lib/` and is fully unit-tested with injected fakes; `api/inquire.ts` is a thin adapter wiring real Supabase/Resend clients. Frontend reuses the existing token/primitive system.

**Tech Stack:** Vercel Node serverless functions, `@supabase/supabase-js`, `resend`, `@vercel/analytics`, Vitest. Existing: Vite 6 + React 19 + Tailwind 4.

## Global Constraints

- Design tokens only in frontend (bg-ink/surface, border-line, text-text-hi/mid/low, bg-signal, rounded-(--radius-sharp)); no zinc-*, no hex; min-h-12 touch targets; focus-visible outlines; cursor-pointer; color-only hovers (duration-200); mono labels are the ONLY text below 0.875rem (text-xs uppercase tracked).
- Copy voice: first person, plain. No jargon (protocol/transmit/node/gateway).
- All user-visible copy lives in `src/content.ts`.
- Bot handling is SILENT: honeypot/time-trap hits return `200 {ok:true}` and store nothing.
- Raw IPs never stored — only `sha256(ip + IP_HASH_SALT)` hex.
- Secrets ONLY in Vercel env vars / git-ignored `.env.local`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `IP_HASH_SALT`. Never committed, never echoed into files or chat.
- Rate limit: 5 inquiries per ip_hash per hour → 429.
- Email failure after successful insert still returns 200 (lead is saved); the error is logged.
- Verification gate every task: `npm run lint` && `npm run build` && `npm test` all exit 0.
- Commit trailer: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

## File Structure (end state)

```
vercel.json                      — security headers (new)
vitest.config.ts                 — test runner config (new)
docs/ops/supabase-inquiries.sql  — ready-to-paste table DDL (new)
api/
  inquire.ts                     — thin Vercel handler adapter (new)
  _lib/
    validate.ts                  — pure validation + bot checks (new)
    validate.test.ts
    processInquiry.ts            — pure orchestration w/ injected deps (new)
    processInquiry.test.ts
src/
  content.ts                     — + INTERESTS, inquiryCopy exports
  components/InquiryForm.tsx     — the form (new)
  components/Contact.tsx         — + form card, + click tracking
  App.tsx                        — + <Analytics />
  primitives/Button.tsx          — + optional onClick prop
.gitignore                       — + .env.local
package.json                     — + deps, + "test" script
tsconfig.json                    — include api/
```

---

### Task 1: Foundation — deps, test runner, security headers, SQL file

**Files:**
- Modify: `package.json`, `tsconfig.json`, `.gitignore`
- Create: `vitest.config.ts`, `vercel.json`, `docs/ops/supabase-inquiries.sql`

**Interfaces:**
- Produces: `npm test` command (vitest, passes with no tests); `vercel.json` headers applied on next deploy; SQL file for the user-gate task.

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/aakash/silent-precision && npm install @supabase/supabase-js resend @vercel/analytics && npm install -D vitest @vercel/node
```

- [ ] **Step 2: Add test script**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run --passWithNoTests"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["api/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Ensure tsc covers `api/`**

Open `tsconfig.json`. If it has an `"include"` array, add `"api"` to it (e.g. `"include": ["src", "api"]`). If it has no `"include"` key, leave it (everything is included by default).

- [ ] **Step 5: Create `vercel.json`**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' https://va.vercel-scripts.com; connect-src 'self' https://va.vercel-scripts.com" }
      ]
    }
  ]
}
```

- [ ] **Step 6: Git-ignore local secrets**

Append to `.gitignore`:

```
.env.local
```

- [ ] **Step 7: Create `docs/ops/supabase-inquiries.sql`**

```sql
-- Silent Precision: inquiries table (Phase 1 lead capture)
-- Paste into Supabase SQL Editor and run once.
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
-- Deliberately NO policies: anon/authenticated can do nothing.
-- Only the service-role key (server-side) bypasses RLS.
create index inquiries_ip_hash_created_at on inquiries (ip_hash, created_at);
```

- [ ] **Step 8: Verify**

Run: `npm run lint && npm run build && npm test`
Expected: all exit 0 (vitest prints "no test files found, exiting with code 0").

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: backend foundation — deps, vitest, security headers, inquiries DDL"
```

---

### Task 2: Content additions + validation module (TDD)

**Files:**
- Modify: `src/content.ts` (append two exports at the end of the file)
- Create: `api/_lib/validate.ts`
- Test: `api/_lib/validate.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces (later tasks import these exactly):
  - from `src/content.ts`: `INTERESTS: readonly ["Positioning Sprint","Advisory Retainer","Not sure yet"]`, `inquiryCopy: { heading; name; email; interest; message; submit; submitting; success }`
  - from `api/_lib/validate.ts`: `interface CleanInquiry { name: string; email: string; interest: string; message: string }`, `type ValidationResult = { ok: true; data: CleanInquiry } | { ok: false; error: string }`, `validateInquiry(body: unknown): ValidationResult`, `isBot(b: { company?: unknown; startedAt?: unknown }, now?: number): boolean`, `MIN_FORM_MS = 3000`

- [ ] **Step 1: Append to `src/content.ts`**

```ts
export const INTERESTS = ["Positioning Sprint", "Advisory Retainer", "Not sure yet"] as const;

export const inquiryCopy = {
  heading: "Or write to me here",
  name: "Name",
  email: "Email",
  interest: "What do you need",
  message: "What are you building, and where is it stuck?",
  submit: "Send inquiry",
  submitting: "Sending…",
  success: "Got it — I reply within a day.",
};
```

- [ ] **Step 2: Write the failing tests — `api/_lib/validate.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { validateInquiry, isBot, MIN_FORM_MS } from "./validate";

const good = {
  name: "Akki",
  email: "someone@example.com",
  interest: "Positioning Sprint",
  message: "I run a fintech and our positioning is mush.",
};

describe("validateInquiry", () => {
  it("accepts a valid inquiry and trims fields", () => {
    const r = validateInquiry({ ...good, name: "  Akki  " });
    expect(r).toEqual({ ok: true, data: { ...good, name: "Akki" } });
  });
  it("rejects non-object bodies", () => {
    for (const bad of [null, "x", 7, []]) {
      const r = validateInquiry(bad as unknown);
      expect(r.ok).toBe(false);
    }
  });
  it("enforces name 2–80", () => {
    expect(validateInquiry({ ...good, name: "A" }).ok).toBe(false);
    expect(validateInquiry({ ...good, name: "A".repeat(81) }).ok).toBe(false);
    expect(validateInquiry({ ...good, name: "Al" }).ok).toBe(true);
    expect(validateInquiry({ ...good, name: "A".repeat(80) }).ok).toBe(true);
  });
  it("enforces email shape and 254 cap", () => {
    expect(validateInquiry({ ...good, email: "nope" }).ok).toBe(false);
    expect(validateInquiry({ ...good, email: "a@b" }).ok).toBe(false);
    expect(validateInquiry({ ...good, email: `${"a".repeat(64)}@${"b".repeat(200)}.com` }).ok).toBe(false);
    expect(validateInquiry({ ...good, email: "a@b.co" }).ok).toBe(true);
  });
  it("enforces interest enum", () => {
    expect(validateInquiry({ ...good, interest: "Hack me" }).ok).toBe(false);
    expect(validateInquiry({ ...good, interest: "Not sure yet" }).ok).toBe(true);
  });
  it("enforces message 10–2000", () => {
    expect(validateInquiry({ ...good, message: "short" }).ok).toBe(false);
    expect(validateInquiry({ ...good, message: "x".repeat(2001) }).ok).toBe(false);
    expect(validateInquiry({ ...good, message: "x".repeat(2000) }).ok).toBe(true);
  });
  it("error messages name the field in plain language", () => {
    const r = validateInquiry({ ...good, email: "nope" });
    if (!r.ok) expect(r.error).toMatch(/^email:/);
  });
});

describe("isBot", () => {
  const now = 1_000_000_000;
  it("flags filled honeypot", () => {
    expect(isBot({ company: "Acme", startedAt: now - 60_000 }, now)).toBe(true);
  });
  it("flags missing or non-numeric startedAt", () => {
    expect(isBot({ company: "" }, now)).toBe(true);
    expect(isBot({ company: "", startedAt: "yes" }, now)).toBe(true);
  });
  it("flags submissions faster than MIN_FORM_MS", () => {
    expect(isBot({ company: "", startedAt: now - (MIN_FORM_MS - 1) }, now)).toBe(true);
  });
  it("passes a human-speed submission with empty honeypot", () => {
    expect(isBot({ company: "", startedAt: now - MIN_FORM_MS }, now)).toBe(false);
    expect(isBot({ startedAt: now - 60_000 }, now)).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `./validate`.

- [ ] **Step 4: Implement `api/_lib/validate.ts`**

```ts
import { INTERESTS } from "../../src/content";

export interface CleanInquiry {
  name: string;
  email: string;
  interest: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; data: CleanInquiry }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

export function validateInquiry(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "request: invalid body." };
  }
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const interest = typeof b.interest === "string" ? b.interest.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";

  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "name: please use 2–80 characters." };
  }
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return { ok: false, error: "email: that doesn't look like a valid address." };
  }
  if (!(INTERESTS as readonly string[]).includes(interest)) {
    return { ok: false, error: "interest: please pick one of the options." };
  }
  if (message.length < 10 || message.length > 2000) {
    return { ok: false, error: "message: please use 10–2000 characters." };
  }
  return { ok: true, data: { name, email, interest, message } };
}

export const MIN_FORM_MS = 3000;

export function isBot(
  b: { company?: unknown; startedAt?: unknown },
  now: number = Date.now(),
): boolean {
  if (typeof b.company === "string" && b.company.trim() !== "") return true;
  if (typeof b.startedAt !== "number" || !Number.isFinite(b.startedAt)) return true;
  if (now - b.startedAt < MIN_FORM_MS) return true;
  return false;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test` → Expected: all validate tests PASS.
Run: `npm run lint && npm run build` → Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: inquiry validation and bot checks with full test coverage"
```

---

### Task 3: Orchestration module (TDD)

**Files:**
- Create: `api/_lib/processInquiry.ts`
- Test: `api/_lib/processInquiry.test.ts`

**Interfaces:**
- Consumes: `validateInquiry`, `isBot` from `./validate`.
- Produces (Task 4 imports these exactly):
  - `interface InquiryDeps { countRecentByIp(ipHash: string): Promise<number>; insertInquiry(row: InquiryRow): Promise<void>; sendNotification(f: NotificationFields): Promise<void>; log(msg: string): void }`
  - `interface InquiryRow { name: string; email: string; interest: string; message: string; referrer: string; user_agent: string; ip_hash: string }`
  - `interface NotificationFields { name: string; email: string; interest: string; message: string; referrer: string }`
  - `interface InquiryResult { status: number; body: { ok: boolean; error?: string } }`
  - `RATE_LIMIT_PER_HOUR = 5`, `MAX_BODY_BYTES = 32768`
  - `guardRequest(method: string | undefined, bodyBytes: number): InquiryResult | null`
  - `processInquiry(rawBody: unknown, meta: { ipHash: string; referrer: string; userAgent: string }, deps: InquiryDeps): Promise<InquiryResult>`

- [ ] **Step 1: Write the failing tests — `api/_lib/processInquiry.test.ts`**

```ts
import { describe, it, expect, vi } from "vitest";
import { processInquiry, guardRequest, RATE_LIMIT_PER_HOUR, MAX_BODY_BYTES, InquiryDeps } from "./processInquiry";

const meta = { ipHash: "hash123", referrer: "https://x.com", userAgent: "UA" };
const humanBody = {
  name: "Akki",
  email: "someone@example.com",
  interest: "Positioning Sprint",
  message: "I run a fintech and our positioning is mush.",
  company: "",
  startedAt: Date.now() - 60_000,
};

function fakeDeps(overrides: Partial<InquiryDeps> = {}): InquiryDeps & {
  inserted: unknown[];
  emails: unknown[];
  logs: string[];
} {
  const inserted: unknown[] = [];
  const emails: unknown[] = [];
  const logs: string[] = [];
  return {
    inserted,
    emails,
    logs,
    countRecentByIp: vi.fn(async () => 0),
    insertInquiry: vi.fn(async (row) => { inserted.push(row); }),
    sendNotification: vi.fn(async (f) => { emails.push(f); }),
    log: (m: string) => logs.push(m),
    ...overrides,
  };
}

describe("guardRequest", () => {
  it("rejects non-POST with 405", () => {
    expect(guardRequest("GET", 10)?.status).toBe(405);
    expect(guardRequest(undefined, 10)?.status).toBe(405);
  });
  it("rejects oversized bodies with 413", () => {
    expect(guardRequest("POST", MAX_BODY_BYTES + 1)?.status).toBe(413);
  });
  it("passes valid POST", () => {
    expect(guardRequest("POST", 100)).toBeNull();
  });
});

describe("processInquiry", () => {
  it("silently discards honeypot hits: 200 ok, nothing stored or emailed", async () => {
    const deps = fakeDeps();
    const r = await processInquiry({ ...humanBody, company: "Acme Corp" }, meta, deps);
    expect(r).toEqual({ status: 200, body: { ok: true } });
    expect(deps.inserted).toHaveLength(0);
    expect(deps.emails).toHaveLength(0);
  });
  it("silently discards too-fast submissions", async () => {
    const deps = fakeDeps();
    const r = await processInquiry({ ...humanBody, startedAt: Date.now() }, meta, deps);
    expect(r.status).toBe(200);
    expect(deps.inserted).toHaveLength(0);
  });
  it("returns 400 with field error for invalid input", async () => {
    const deps = fakeDeps();
    const r = await processInquiry({ ...humanBody, email: "nope" }, meta, deps);
    expect(r.status).toBe(400);
    expect(r.body.ok).toBe(false);
    expect(r.body.error).toMatch(/^email:/);
    expect(deps.inserted).toHaveLength(0);
  });
  it("returns 429 at the rate limit", async () => {
    const deps = fakeDeps({ countRecentByIp: vi.fn(async () => RATE_LIMIT_PER_HOUR) });
    const r = await processInquiry(humanBody, meta, deps);
    expect(r.status).toBe(429);
    expect(deps.inserted).toHaveLength(0);
  });
  it("happy path: stores row with meta and sends email", async () => {
    const deps = fakeDeps();
    const r = await processInquiry(humanBody, meta, deps);
    expect(r).toEqual({ status: 200, body: { ok: true } });
    expect(deps.inserted).toEqual([
      {
        name: "Akki",
        email: "someone@example.com",
        interest: "Positioning Sprint",
        message: "I run a fintech and our positioning is mush.",
        referrer: "https://x.com",
        user_agent: "UA",
        ip_hash: "hash123",
      },
    ]);
    expect(deps.emails).toHaveLength(1);
  });
  it("still returns 200 when the email fails after insert; failure is logged", async () => {
    const deps = fakeDeps({ sendNotification: vi.fn(async () => { throw new Error("resend down"); }) });
    const r = await processInquiry(humanBody, meta, deps);
    expect(r.status).toBe(200);
    expect(deps.inserted).toHaveLength(1);
    expect(deps.logs.join(" ")).toContain("resend down");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test` → Expected: FAIL — cannot resolve `./processInquiry`.

- [ ] **Step 3: Implement `api/_lib/processInquiry.ts`**

```ts
import { validateInquiry, isBot } from "./validate";

export interface InquiryRow {
  name: string;
  email: string;
  interest: string;
  message: string;
  referrer: string;
  user_agent: string;
  ip_hash: string;
}

export interface NotificationFields {
  name: string;
  email: string;
  interest: string;
  message: string;
  referrer: string;
}

export interface InquiryDeps {
  countRecentByIp(ipHash: string): Promise<number>;
  insertInquiry(row: InquiryRow): Promise<void>;
  sendNotification(f: NotificationFields): Promise<void>;
  log(msg: string): void;
}

export interface InquiryResult {
  status: number;
  body: { ok: boolean; error?: string };
}

export const RATE_LIMIT_PER_HOUR = 5;
export const MAX_BODY_BYTES = 32768;

export function guardRequest(method: string | undefined, bodyBytes: number): InquiryResult | null {
  if (method !== "POST") {
    return { status: 405, body: { ok: false, error: "Method not allowed." } };
  }
  if (bodyBytes > MAX_BODY_BYTES) {
    return { status: 413, body: { ok: false, error: "Request too large." } };
  }
  return null;
}

export async function processInquiry(
  rawBody: unknown,
  meta: { ipHash: string; referrer: string; userAgent: string },
  deps: InquiryDeps,
): Promise<InquiryResult> {
  const b = (typeof rawBody === "object" && rawBody !== null ? rawBody : {}) as Record<string, unknown>;

  if (isBot(b)) {
    return { status: 200, body: { ok: true } };
  }

  const v = validateInquiry(b);
  if (!v.ok) {
    return { status: 400, body: { ok: false, error: v.error } };
  }

  const recent = await deps.countRecentByIp(meta.ipHash);
  if (recent >= RATE_LIMIT_PER_HOUR) {
    return {
      status: 429,
      body: { ok: false, error: "Too many requests — try again in an hour or email me directly." },
    };
  }

  await deps.insertInquiry({
    ...v.data,
    referrer: meta.referrer,
    user_agent: meta.userAgent,
    ip_hash: meta.ipHash,
  });

  try {
    await deps.sendNotification({ ...v.data, referrer: meta.referrer });
  } catch (e) {
    deps.log(`resend failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  return { status: 200, body: { ok: true } };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → Expected: all PASS (validate + processInquiry suites).
Run: `npm run lint && npm run build` → Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: inquiry orchestration — guards, rate limit, insert, resilient email"
```

---

### Task 4: Vercel handler adapter

**Files:**
- Create: `api/inquire.ts`

**Interfaces:**
- Consumes: `processInquiry`, `guardRequest`, `InquiryDeps` from `./_lib/processInquiry`.
- Produces: `POST /api/inquire` endpoint (deployed by Vercel automatically from the `api/` directory).

- [ ] **Step 1: Implement `api/inquire.ts`**

```ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { createHash } from "node:crypto";
import { processInquiry, guardRequest, InquiryDeps } from "./_lib/processInquiry";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const bodyBytes = Buffer.byteLength(JSON.stringify(req.body ?? ""), "utf8");
  const guard = guardRequest(req.method, bodyBytes);
  if (guard) {
    res.status(guard.status).json(guard.body);
    return;
  }

  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false } },
  );
  const resend = new Resend(process.env.RESEND_API_KEY as string);

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256")
    .update(ip + (process.env.IP_HASH_SALT as string))
    .digest("hex");

  const deps: InquiryDeps = {
    async countRecentByIp(hash) {
      const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
      const { count, error } = await supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", hash)
        .gte("created_at", oneHourAgo);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
    async insertInquiry(row) {
      const { error } = await supabase.from("inquiries").insert(row);
      if (error) throw new Error(error.message);
    },
    async sendNotification(f) {
      await resend.emails.send({
        from: "Silent Precision <onboarding@resend.dev>",
        to: "raptor.akki.64@gmail.com",
        subject: `New inquiry — ${f.name} (${f.interest})`,
        text: `Name: ${f.name}\nEmail: ${f.email}\nInterest: ${f.interest}\nReferrer: ${f.referrer || "direct"}\n\n${f.message}`,
      });
    },
    log: (m) => console.error(m),
  };

  try {
    const result = await processInquiry(
      req.body,
      {
        ipHash,
        referrer: (req.headers.referer as string | undefined) ?? "",
        userAgent: (req.headers["user-agent"] as string | undefined) ?? "",
      },
      deps,
    );
    res.status(result.status).json(result.body);
  } catch (e) {
    console.error(`inquire failed: ${e instanceof Error ? e.message : String(e)}`);
    res.status(500).json({ ok: false, error: "Something went wrong — please email me directly." });
  }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build && npm test` → Expected: exit 0. (The adapter is thin by design; its behavior is covered by the Task 3 unit tests plus the live E2E in Task 7.)

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: /api/inquire Vercel handler wiring Supabase, Resend, IP hashing"
```

---

### Task 5: Frontend — form, contact integration, analytics

**Files:**
- Modify: `src/primitives/Button.tsx` (add optional onClick), `src/components/Contact.tsx`, `src/App.tsx`
- Create: `src/components/InquiryForm.tsx`

**Interfaces:**
- Consumes: `INTERESTS`, `inquiryCopy`, `contact`, `site` from `../content`; `track` from `@vercel/analytics`; `Analytics` from `@vercel/analytics/react`; existing primitives.
- Produces: working form UI posting to `/api/inquire`; analytics events `inquiry_submitted`, `email_click`, `whatsapp_click`.

- [ ] **Step 1: Add onClick pass-through to `src/primitives/Button.tsx`**

Change the interface and signature (rest of file unchanged):

```tsx
interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "signal" | "ghost";
  external?: boolean;
  onClick?: () => void;
}

export default function Button({ href, children, variant = "signal", external = false, onClick }: ButtonProps) {
```

and add `onClick={onClick}` to the `<a>` element's props.

- [ ] **Step 2: Create `src/components/InquiryForm.tsx`**

```tsx
import { FormEvent, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { INTERESTS, inquiryCopy } from "../content";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full bg-ink border border-line rounded-(--radius-sharp) px-4 min-h-12 text-base text-text-hi placeholder:text-text-low transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

const labelClass = "block font-mono text-xs uppercase tracking-[0.15em] text-text-low mb-2";

export default function InquiryForm() {
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [interest, setInterest] = useState<string>(INTERESTS[2]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          interest,
          message: data.get("message"),
          company: data.get("company"),
          startedAt: startedAt.current,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setError(json.error ?? "Something went wrong — please email me directly.");
        return;
      }
      track("inquiry_submitted");
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Network error — please email me directly.");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="text-base md:text-lg text-text-hi">
        {inquiryCopy.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="inq-name" className={labelClass}>{inquiryCopy.name}</label>
          <input id="inq-name" name="name" type="text" required minLength={2} maxLength={80} className={inputClass} />
        </div>
        <div>
          <label htmlFor="inq-email" className={labelClass}>{inquiryCopy.email}</label>
          <input id="inq-email" name="email" type="email" required maxLength={254} className={inputClass} />
        </div>
      </div>

      <div>
        <span className={labelClass}>{inquiryCopy.interest}</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {INTERESTS.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={interest === opt}
              onClick={() => setInterest(opt)}
              className={`min-h-12 px-3 border rounded-(--radius-sharp) font-mono text-xs uppercase tracking-[0.15em] cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                interest === opt
                  ? "border-white/25 bg-surface text-text-hi"
                  : "border-line text-text-mid hover:text-text-hi hover:border-line-strong"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="inq-message" className={labelClass}>{inquiryCopy.message}</label>
        <textarea id="inq-message" name="message" required minLength={10} maxLength={2000} rows={5} className={`${inputClass} py-3 resize-none min-h-32`} />
      </div>

      {/* Honeypot — humans never see or fill this */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
        <label htmlFor="inq-company">Company</label>
        <input id="inq-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div aria-live="polite">
        {status === "error" && <p className="text-sm text-text-hi mb-4">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center font-mono text-xs font-medium uppercase tracking-[0.15em] px-7 min-h-12 rounded-(--radius-sharp) bg-signal text-white hover:bg-signal-hover disabled:opacity-60 cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        {status === "submitting" ? inquiryCopy.submitting : inquiryCopy.submit}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Integrate into `src/components/Contact.tsx`**

Full replacement of the file:

```tsx
import { track } from "@vercel/analytics";
import { contact, site, inquiryCopy } from "../content";
import Reveal from "../primitives/Reveal";
import Button from "../primitives/Button";
import InquiryForm from "./InquiryForm";

export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-40 border-t border-line scroll-mt-16">
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
          <Button href={`mailto:${site.email}`} onClick={() => track("email_click")}>
            Email me
          </Button>
          <Button href={site.whatsapp} variant="ghost" external onClick={() => track("whatsapp_click")}>
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
        <Reveal delay={0.2} className="mt-16 max-w-2xl">
          <div className="bg-surface border border-line rounded-(--radius-frame) p-8 md:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low mb-8">
              {inquiryCopy.heading}
            </p>
            <InquiryForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add Analytics to `src/App.tsx`**

Add import `import { Analytics } from "@vercel/analytics/react";` and place `<Analytics />` immediately before the closing `</div>` of the root container (after `<Footer />`).

- [ ] **Step 5: Verify locally**

Run: `npm run lint && npm run build && npm test` → Expected: exit 0.
Run dev server; in the browser: form renders inside a surface card below the contact buttons, tokens/motion consistent; submit with fields filled → the local dev server has no `/api` runtime, so the form must show the graceful error path ("Network error — please email me directly.") with the direct buttons still visible. Keyboard: Tab reaches every field; honeypot is skipped (tabindex -1).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: inquiry form with invisible bot defenses, contact integration, analytics events"
```

---

### Task 6: USER GATE — Supabase, Resend, env vars (controller + Akki, not a subagent task)

**Files:** none (external services + Vercel dashboard).

- [ ] Akki creates a Supabase project (free tier), runs `docs/ops/supabase-inquiries.sql` in the SQL Editor, and collects: project URL, service-role key.
- [ ] Akki creates a Resend account (free tier) and collects an API key.
- [ ] Set four env vars on the Vercel project (via `npx vercel env add NAME production` prompts or the dashboard): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `IP_HASH_SALT` (salt = any long random string, e.g. output of `openssl rand -hex 32`).
- [ ] Confirm with `npx vercel env ls` that all four exist for Production. Keys are never pasted into the repo or committed files.

---

### Task 7: Deploy, live E2E, security verification

**Files:** none new (fixes only if defects found).

- [ ] **Step 1: Deploy**

```bash
git push origin main && npx vercel --prod --yes
```

- [ ] **Step 2: Verify security headers live**

Run: `curl -sI https://silent-precision.vercel.app | grep -iE "strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy|content-security"`
Expected: all six headers present with the Task 1 values.

- [ ] **Step 3: CSP sanity check**

Load the live site in a browser; open console. Expected: no CSP violation errors; fonts, photos, analytics all load. If a violation appears, adjust the offending directive in `vercel.json` to the exact blocked origin (never widen to `*`), redeploy, recheck.

- [ ] **Step 4: Live API checks**

```bash
# bot (honeypot) → silent accept, nothing stored:
curl -s -X POST https://silent-precision.vercel.app/api/inquire -H "Content-Type: application/json" \
  -d '{"name":"Bot","email":"b@b.co","interest":"Not sure yet","message":"buy my stuff please","company":"SpamCo","startedAt":1}'
# expected: {"ok":true}

# invalid → 400 with field error:
curl -s -X POST https://silent-precision.vercel.app/api/inquire -H "Content-Type: application/json" \
  -d '{"name":"A","email":"nope","interest":"x","message":"short","company":"","startedAt":1}'
# expected: {"ok":false,"error":"name: ..."}

# GET → 405:
curl -s -o /dev/null -w "%{http_code}" https://silent-precision.vercel.app/api/inquire
# expected: 405
```

- [ ] **Step 5: Real human E2E**

Akki (or controller via the live form with realistic timing) submits a genuine test inquiry. Expected: form shows success copy; a row appears in Supabase Table Editor (status 'new', ip_hash populated, no raw IP anywhere); notification email arrives at raptor.akki.64@gmail.com; `inquiry_submitted` event appears in Vercel Analytics (events can lag a few minutes).

- [ ] **Step 6: Dependency audit**

Run: `npm audit --omit=dev` → Expected: no high/critical. (If any: `npm audit fix` where non-breaking; otherwise document and decide.)

- [ ] **Step 7: Commit any fixes; final security-focused review**

The final whole-branch review (per subagent-driven-development) must specifically cover: secrets handling, injection surfaces, the silent-discard logic, rate-limit correctness, and error-message information leakage.

---

## Deferred (not in this plan)

- Phase 2: admin panel / CMS (own spec).
- WhatsApp notifications, Turnstile, custom email domain (spec's out-of-scope list).
- Deleting old inquiries / retention policy — revisit when volume exists.
