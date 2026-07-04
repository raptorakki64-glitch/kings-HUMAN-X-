# Admin Leads Inbox (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A protected `/admin` page (magic-link auth, admin-email-locked) to list, filter, annotate, status-track, and delete inquiries — per spec `docs/superpowers/specs/2026-07-04-admin-leads-inbox-design.md`.

**Architecture:** Second Vite entry (`admin.html` → `src/admin/`) in the same repo/deploy. All data flows through one admin API route (`api/admin/inquiries.ts`) that verifies the caller's Supabase session token server-side (email must equal `ADMIN_EMAIL`) and acts with the service key. Pure logic in `api/_lib/` with injected deps, fully unit-tested. DB unchanged except one new `notes` column; RLS stays policy-less.

**Tech Stack:** Existing: Vite 6 multi-page, React 19, Tailwind 4 tokens, `@supabase/supabase-js` (now also in the browser with the public anon key), Vitest, Vercel functions.

## Global Constraints

- Design tokens only (bg-ink/surface, border-line/line-strong, text-text-hi/mid/low, bg-signal/signal-hover, rounded-(--radius-sharp)/(--radius-frame)); no zinc-*, no hex; min-h-12 targets; cursor-pointer; focus-visible outlines; transition-colors duration-200; only sub-0.875rem text is font-mono text-xs uppercase tracked. Phone-first single column.
- Copy voice: first person, plain. No sci-fi jargon.
- Admin API: every verb requires `Authorization: Bearer <token>`; verified server-side against `ADMIN_EMAIL` (case-insensitive) — 401 `{ ok:false, error:"Not authorized." }` otherwise. All responses set `Cache-Control: no-store`. `ip_hash` is never returned. No internals in error bodies.
- Statuses exactly: `new | replied | closed`. Notes ≤ 4000 chars. GET capped at 200 rows, newest first.
- Env vars: existing four + `ADMIN_EMAIL` (server) + `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public, build-time). Service key never in the browser.
- Verification gate every task: `npm run lint && npm run build && npm test` all exit 0.
- Commit trailer: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

## File Structure (end state)

```
docs/ops/2026-07-04-add-notes.sql     (new)
admin.html                             (new second entry)
vite.config.ts                         (+ rollupOptions.input)
vercel.json                            (+ rewrite /admin → /admin.html)
api/_lib/adminAuth.ts + .test.ts       (new: pure token/email check)
api/_lib/adminInquiries.ts + .test.ts  (new: pure verb logic, injected deps)
api/admin/inquiries.ts                 (new: thin adapter)
src/admin/main.tsx                     (new: mount + env guard)
src/admin/supabaseClient.ts            (new: browser client, anon key)
src/admin/api.ts                       (new: authed fetch wrapper)
src/admin/AdminApp.tsx                 (new: checking/signed-out/inbox)
src/admin/SignIn.tsx                   (new)
src/admin/Inbox.tsx                    (new: tabs, list, expand, actions)
```

---

### Task 1: Scaffold — second entry, rewrite, migration file

**Files:**
- Create: `admin.html`, `src/admin/main.tsx`, `src/admin/supabaseClient.ts`, `src/admin/AdminApp.tsx` (shell), `docs/ops/2026-07-04-add-notes.sql`
- Modify: `vite.config.ts`, `vercel.json`

**Interfaces:**
- Produces: `dist/admin.html` in the build; `supabase` browser client export (or `null` when env missing); `<AdminApp />` shell that later tasks flesh out; the migration SQL for the user-gate task.

- [ ] **Step 1: Create `admin.html`** (repo root, next to index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Admin — Silent Precision</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/admin/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Multi-page build in `vite.config.ts`**

Inside the returned config object, add a `build` key (sibling of `plugins`/`resolve`/`server`):

```ts
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          admin: path.resolve(__dirname, "admin.html"),
        },
      },
    },
```

(`path` is already imported in this file.)

- [ ] **Step 3: Rewrite in `vercel.json`**

Add a top-level `"rewrites"` key alongside the existing `"headers"`:

```json
  "rewrites": [
    { "source": "/admin", "destination": "/admin.html" }
  ],
```

- [ ] **Step 4: Create `src/admin/supabaseClient.ts`**

```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
```

- [ ] **Step 5: Create `src/admin/AdminApp.tsx`** (shell — Task 5 replaces the body)

```tsx
import { supabase } from "./supabaseClient";

export default function AdminApp() {
  if (!supabase) {
    return (
      <main className="min-h-screen bg-ink text-text-mid flex items-center justify-center p-6">
        <p className="font-mono text-xs uppercase tracking-[0.15em]">
          Admin is not configured on this build.
        </p>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-ink text-text-hi flex items-center justify-center p-6">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-text-low">Admin — coming online</p>
    </main>
  );
}
```

- [ ] **Step 6: Create `src/admin/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AdminApp from "./AdminApp";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
```

- [ ] **Step 7: Create `docs/ops/2026-07-04-add-notes.sql`**

```sql
-- Phase 2: private notes per inquiry. Run once in Supabase SQL Editor.
alter table inquiries add column notes text not null default '';
```

- [ ] **Step 8: Verify**

Run: `npm run lint && npm test && npm run build && ls dist/admin.html`
Expected: all exit 0; `dist/admin.html` exists.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: /admin scaffold — second vite entry, rewrite, notes migration"
```

---

### Task 2: Admin auth core (TDD)

**Files:**
- Create: `api/_lib/adminAuth.ts`
- Test: `api/_lib/adminAuth.test.ts`

**Interfaces:**
- Produces (Task 4 imports these exactly):
  - `interface AuthDeps { getUserEmail(token: string): Promise<string | null> }`
  - `verifyAdmin(authHeader: string | undefined, adminEmail: string, deps: AuthDeps): Promise<boolean>`

- [ ] **Step 1: Write the failing tests — `api/_lib/adminAuth.test.ts`**

```ts
import { describe, it, expect, vi } from "vitest";
import { verifyAdmin, AuthDeps } from "./adminAuth";

const ADMIN = "raptor.akki.64@gmail.com";
const deps = (email: string | null): AuthDeps => ({ getUserEmail: vi.fn(async () => email) });

describe("verifyAdmin", () => {
  it("accepts a valid bearer token whose user email matches (case-insensitive)", async () => {
    expect(await verifyAdmin("Bearer tok123", ADMIN, deps("Raptor.Akki.64@GMAIL.com"))).toBe(true);
  });
  it("rejects a valid token with the wrong email", async () => {
    expect(await verifyAdmin("Bearer tok123", ADMIN, deps("someone@else.com"))).toBe(false);
  });
  it("rejects when the token resolves to no user", async () => {
    expect(await verifyAdmin("Bearer tok123", ADMIN, deps(null))).toBe(false);
  });
  it("rejects missing or malformed Authorization headers without calling deps", async () => {
    const d = deps(ADMIN);
    expect(await verifyAdmin(undefined, ADMIN, d)).toBe(false);
    expect(await verifyAdmin("", ADMIN, d)).toBe(false);
    expect(await verifyAdmin("Basic abc", ADMIN, d)).toBe(false);
    expect(await verifyAdmin("Bearer ", ADMIN, d)).toBe(false);
    expect(d.getUserEmail).not.toHaveBeenCalled();
  });
  it("rejects when the email lookup throws", async () => {
    const d: AuthDeps = { getUserEmail: vi.fn(async () => { throw new Error("network"); }) };
    expect(await verifyAdmin("Bearer tok123", ADMIN, d)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test` → Expected: FAIL — cannot resolve `./adminAuth`; existing 20 tests still pass.

- [ ] **Step 3: Implement `api/_lib/adminAuth.ts`**

```ts
export interface AuthDeps {
  getUserEmail(token: string): Promise<string | null>;
}

export async function verifyAdmin(
  authHeader: string | undefined,
  adminEmail: string,
  deps: AuthDeps,
): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  if (token === "") return false;
  try {
    const email = await deps.getUserEmail(token);
    if (!email) return false;
    return email.toLowerCase() === adminEmail.toLowerCase();
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → Expected: 25 passing. `npm run lint && npm run build` → exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: admin auth core — bearer token + admin-email verification"
```

---

### Task 3: Admin inquiries core (TDD)

**Files:**
- Create: `api/_lib/adminInquiries.ts`
- Test: `api/_lib/adminInquiries.test.ts`

**Interfaces:**
- Produces (Tasks 4 and 6 rely on these exactly):
  - `const STATUSES = ["new", "replied", "closed"] as const`
  - `interface AdminInquiry { id: string; created_at: string; name: string; email: string; interest: string; message: string; referrer: string | null; user_agent: string | null; status: string; notes: string }`
  - `interface AdminDeps { listInquiries(status?: string): Promise<AdminInquiry[]>; updateInquiry(id: string, fields: { status?: string; notes?: string }): Promise<boolean>; deleteInquiry(id: string): Promise<boolean> }` (update/delete resolve `false` when the id doesn't exist)
  - `interface AdminResult { status: number; body: Record<string, unknown> }`
  - `handleAdminRequest(method: string | undefined, query: { status?: string }, body: unknown, deps: AdminDeps): Promise<AdminResult>`
  - `const MAX_NOTES_CHARS = 4000`

- [ ] **Step 1: Write the failing tests — `api/_lib/adminInquiries.test.ts`**

```ts
import { describe, it, expect, vi } from "vitest";
import { handleAdminRequest, AdminDeps, AdminInquiry, MAX_NOTES_CHARS } from "./adminInquiries";

const row: AdminInquiry = {
  id: "11111111-1111-1111-1111-111111111111",
  created_at: "2026-07-04T00:00:00Z",
  name: "Friend",
  email: "friend@example.org",
  interest: "Not sure yet",
  message: "Real inquiry from the friend test.",
  referrer: null,
  user_agent: "phone",
  status: "new",
  notes: "",
};

function fakeDeps(overrides: Partial<AdminDeps> = {}): AdminDeps {
  return {
    listInquiries: vi.fn(async () => [row]),
    updateInquiry: vi.fn(async () => true),
    deleteInquiry: vi.fn(async () => true),
    ...overrides,
  };
}

describe("GET", () => {
  it("lists inquiries", async () => {
    const r = await handleAdminRequest("GET", {}, undefined, fakeDeps());
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ ok: true, inquiries: [row] });
  });
  it("passes a valid status filter through", async () => {
    const deps = fakeDeps();
    await handleAdminRequest("GET", { status: "replied" }, undefined, deps);
    expect(deps.listInquiries).toHaveBeenCalledWith("replied");
  });
  it("rejects an invalid status filter with 400", async () => {
    const r = await handleAdminRequest("GET", { status: "weird" }, undefined, fakeDeps());
    expect(r.status).toBe(400);
  });
});

describe("PATCH", () => {
  it("updates status", async () => {
    const deps = fakeDeps();
    const r = await handleAdminRequest("PATCH", {}, { id: row.id, status: "replied" }, deps);
    expect(r.status).toBe(200);
    expect(deps.updateInquiry).toHaveBeenCalledWith(row.id, { status: "replied" });
  });
  it("updates notes", async () => {
    const deps = fakeDeps();
    await handleAdminRequest("PATCH", {}, { id: row.id, notes: "called them" }, deps);
    expect(deps.updateInquiry).toHaveBeenCalledWith(row.id, { notes: "called them" });
  });
  it("400 when neither status nor notes present", async () => {
    expect((await handleAdminRequest("PATCH", {}, { id: row.id }, fakeDeps())).status).toBe(400);
  });
  it("400 on invalid status value", async () => {
    expect((await handleAdminRequest("PATCH", {}, { id: row.id, status: "done" }, fakeDeps())).status).toBe(400);
  });
  it("400 on over-long notes", async () => {
    const r = await handleAdminRequest("PATCH", {}, { id: row.id, notes: "x".repeat(MAX_NOTES_CHARS + 1) }, fakeDeps());
    expect(r.status).toBe(400);
  });
  it("400 on missing id", async () => {
    expect((await handleAdminRequest("PATCH", {}, { status: "replied" }, fakeDeps())).status).toBe(400);
  });
  it("404 on unknown id", async () => {
    const deps = fakeDeps({ updateInquiry: vi.fn(async () => false) });
    expect((await handleAdminRequest("PATCH", {}, { id: row.id, status: "closed" }, deps)).status).toBe(404);
  });
});

describe("DELETE", () => {
  it("deletes by id", async () => {
    const deps = fakeDeps();
    const r = await handleAdminRequest("DELETE", {}, { id: row.id }, deps);
    expect(r.status).toBe(200);
    expect(deps.deleteInquiry).toHaveBeenCalledWith(row.id);
  });
  it("404 on unknown id", async () => {
    const deps = fakeDeps({ deleteInquiry: vi.fn(async () => false) });
    expect((await handleAdminRequest("DELETE", {}, { id: row.id }, deps)).status).toBe(404);
  });
  it("400 on missing id", async () => {
    expect((await handleAdminRequest("DELETE", {}, {}, fakeDeps())).status).toBe(400);
  });
});

it("405 on other methods", async () => {
  expect((await handleAdminRequest("POST", {}, {}, fakeDeps())).status).toBe(405);
  expect((await handleAdminRequest(undefined, {}, {}, fakeDeps())).status).toBe(405);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test` → Expected: FAIL — cannot resolve `./adminInquiries`.

- [ ] **Step 3: Implement `api/_lib/adminInquiries.ts`**

```ts
export const STATUSES = ["new", "replied", "closed"] as const;
export const MAX_NOTES_CHARS = 4000;

export interface AdminInquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  referrer: string | null;
  user_agent: string | null;
  status: string;
  notes: string;
}

export interface AdminDeps {
  listInquiries(status?: string): Promise<AdminInquiry[]>;
  updateInquiry(id: string, fields: { status?: string; notes?: string }): Promise<boolean>;
  deleteInquiry(id: string): Promise<boolean>;
}

export interface AdminResult {
  status: number;
  body: Record<string, unknown>;
}

function isStatus(v: unknown): v is (typeof STATUSES)[number] {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}

function bodyId(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const id = (body as Record<string, unknown>).id;
  return typeof id === "string" && id.trim() !== "" ? id : null;
}

export async function handleAdminRequest(
  method: string | undefined,
  query: { status?: string },
  body: unknown,
  deps: AdminDeps,
): Promise<AdminResult> {
  if (method === "GET") {
    if (query.status !== undefined && !isStatus(query.status)) {
      return { status: 400, body: { ok: false, error: "status: unknown filter." } };
    }
    const inquiries = await deps.listInquiries(query.status);
    return { status: 200, body: { ok: true, inquiries } };
  }

  if (method === "PATCH") {
    const id = bodyId(body);
    if (!id) return { status: 400, body: { ok: false, error: "id: required." } };
    const b = body as Record<string, unknown>;
    const fields: { status?: string; notes?: string } = {};
    if (b.status !== undefined) {
      if (!isStatus(b.status)) return { status: 400, body: { ok: false, error: "status: must be new, replied or closed." } };
      fields.status = b.status;
    }
    if (b.notes !== undefined) {
      if (typeof b.notes !== "string" || b.notes.length > MAX_NOTES_CHARS) {
        return { status: 400, body: { ok: false, error: "notes: too long." } };
      }
      fields.notes = b.notes;
    }
    if (fields.status === undefined && fields.notes === undefined) {
      return { status: 400, body: { ok: false, error: "nothing to update." } };
    }
    const found = await deps.updateInquiry(id, fields);
    if (!found) return { status: 404, body: { ok: false, error: "Not found." } };
    return { status: 200, body: { ok: true } };
  }

  if (method === "DELETE") {
    const id = bodyId(body);
    if (!id) return { status: 400, body: { ok: false, error: "id: required." } };
    const found = await deps.deleteInquiry(id);
    if (!found) return { status: 404, body: { ok: false, error: "Not found." } };
    return { status: 200, body: { ok: true } };
  }

  return { status: 405, body: { ok: false, error: "Method not allowed." } };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → Expected: 39 passing. `npm run lint && npm run build` → exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: admin inquiries core — list/patch/delete with validation"
```

---

### Task 4: Admin API adapter

**Files:**
- Create: `api/admin/inquiries.ts`

**Interfaces:**
- Consumes: `verifyAdmin`/`AuthDeps` from `../_lib/adminAuth.js`; `handleAdminRequest`, `AdminDeps`, `AdminInquiry` from `../_lib/adminInquiries.js`; `MAX_BODY_BYTES` from `../_lib/processInquiry.js`.
- Produces: `GET/PATCH/DELETE /api/admin/inquiries`.

- [ ] **Step 1: Implement `api/admin/inquiries.ts`** (note the `.js` import extensions — the deployed runtime is ESM and requires them, same as Phase 1)

```ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { verifyAdmin, AuthDeps } from "../_lib/adminAuth.js";
import { handleAdminRequest, AdminDeps, AdminInquiry } from "../_lib/adminInquiries.js";
import { MAX_BODY_BYTES } from "../_lib/processInquiry.js";

const COLUMNS = "id,created_at,name,email,interest,message,referrer,user_agent,status,notes";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  for (const name of ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_EMAIL"] as const) {
    if (!process.env[name]) {
      console.error(`missing env var: ${name}`);
      res.status(500).json({ ok: false, error: "Something went wrong." });
      return;
    }
  }

  const bodyBytes = Buffer.byteLength(JSON.stringify(req.body ?? ""), "utf8");
  if (bodyBytes > MAX_BODY_BYTES) {
    res.status(413).json({ ok: false, error: "Request too large." });
    return;
  }

  let supabase: SupabaseClient;
  try {
    supabase = createClient(
      (process.env.SUPABASE_URL as string).trim(),
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string).trim(),
      { auth: { persistSession: false } },
    );
  } catch (e) {
    console.error(`client init failed: ${e instanceof Error ? e.message : String(e)}`);
    res.status(500).json({ ok: false, error: "Something went wrong." });
    return;
  }

  const authDeps: AuthDeps = {
    async getUserEmail(token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) return null;
      return data.user.email ?? null;
    },
  };
  const authorized = await verifyAdmin(
    req.headers.authorization,
    (process.env.ADMIN_EMAIL as string).trim(),
    authDeps,
  );
  if (!authorized) {
    res.status(401).json({ ok: false, error: "Not authorized." });
    return;
  }

  const deps: AdminDeps = {
    async listInquiries(status) {
      let q = supabase.from("inquiries").select(COLUMNS).order("created_at", { ascending: false }).limit(200);
      if (status) q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as AdminInquiry[];
    },
    async updateInquiry(id, fields) {
      const { data, error } = await supabase.from("inquiries").update(fields).eq("id", id).select("id");
      if (error) throw new Error(error.message);
      return (data ?? []).length > 0;
    },
    async deleteInquiry(id) {
      const { data, error } = await supabase.from("inquiries").delete().eq("id", id).select("id");
      if (error) throw new Error(error.message);
      return (data ?? []).length > 0;
    },
  };

  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const result = await handleAdminRequest(req.method, { status }, req.body, deps);
    res.status(result.status).json(result.body);
  } catch (e) {
    console.error(`admin inquiries failed: ${e instanceof Error ? e.message : String(e)}`);
    res.status(500).json({ ok: false, error: "Something went wrong." });
  }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build && npm test` → Expected: exit 0, 39 tests.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: /api/admin/inquiries adapter — token-gated list/patch/delete"
```

---

### Task 5: Admin frontend — auth flow

**Files:**
- Create: `src/admin/SignIn.tsx`, `src/admin/api.ts`
- Modify: `src/admin/AdminApp.tsx` (full replacement of the shell)

**Interfaces:**
- Consumes: `supabase` from `./supabaseClient` (nullable); Task 6 consumes `adminFetch` and renders inside AdminApp's `inbox` state.
- Produces: `adminFetch(method: "GET"|"PATCH"|"DELETE", opts?: { query?: string; body?: unknown }): Promise<{ ok: boolean; error?: string; inquiries?: AdminInquiryView[] }>`; `interface AdminInquiryView` (same fields as the API's AdminInquiry); `<AdminApp />` with session handling; `<SignIn />`.

- [ ] **Step 1: Create `src/admin/api.ts`**

```ts
import { supabase } from "./supabaseClient";

export interface AdminInquiryView {
  id: string;
  created_at: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  referrer: string | null;
  user_agent: string | null;
  status: string;
  notes: string;
}

export async function adminFetch(
  method: "GET" | "PATCH" | "DELETE",
  opts: { query?: string; body?: unknown } = {},
): Promise<{ ok: boolean; error?: string; inquiries?: AdminInquiryView[] }> {
  if (!supabase) return { ok: false, error: "Not configured." };
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, error: "Signed out." };
  try {
    const res = await fetch(`/api/admin/inquiries${opts.query ?? ""}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
    });
    return (await res.json()) as { ok: boolean; error?: string; inquiries?: AdminInquiryView[] };
  } catch {
    return { ok: false, error: "Network error — try again." };
  }
}
```

- [ ] **Step 2: Create `src/admin/SignIn.tsx`**

```tsx
import { FormEvent, useState } from "react";
import { supabase } from "./supabaseClient";

export default function SignIn() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending || !supabase) return;
    setSending(true);
    setError("");
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setSending(false);
    if (err) {
      setError("Couldn't send the link — try again in a minute.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p role="status" className="text-base text-text-hi max-w-sm text-center">
        Link sent. Open the email on this device and tap it — you'll land back here signed in.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6" noValidate>
      <div>
        <label htmlFor="admin-email" className="block font-mono text-xs uppercase tracking-[0.15em] text-text-low mb-2">
          Admin email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-surface border border-line rounded-(--radius-sharp) px-4 min-h-12 text-base text-text-hi placeholder:text-text-low transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        />
      </div>
      <div aria-live="polite">{error && <p className="text-sm text-text-hi">{error}</p>}</div>
      <button
        type="submit"
        disabled={sending}
        className="w-full inline-flex items-center justify-center font-mono text-xs font-medium uppercase tracking-[0.15em] px-7 min-h-12 rounded-(--radius-sharp) bg-signal text-white hover:bg-signal-hover disabled:opacity-60 cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        {sending ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Replace `src/admin/AdminApp.tsx`**

```tsx
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import SignIn from "./SignIn";
import Inbox from "./Inbox";

type Gate = "checking" | "signed-out" | "inbox";

export default function AdminApp() {
  const [gate, setGate] = useState<Gate>("checking");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setGate(data.session ? "inbox" : "signed-out");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setGate(session ? "inbox" : "signed-out");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <main className="min-h-screen bg-ink text-text-mid flex items-center justify-center p-6">
        <p className="font-mono text-xs uppercase tracking-[0.15em]">Admin is not configured on this build.</p>
      </main>
    );
  }

  if (gate === "checking") {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center p-6">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-text-low">Checking session…</p>
      </main>
    );
  }

  if (gate === "signed-out") {
    return (
      <main className="min-h-screen bg-ink flex flex-col items-center justify-center gap-10 p-6">
        <h1 className="font-mono text-xs uppercase tracking-[0.2em] text-text-low">Silent Precision — Admin</h1>
        <SignIn />
      </main>
    );
  }

  return <Inbox />;
}
```

- [ ] **Step 4: Temporary `src/admin/Inbox.tsx` stub so the build compiles** (Task 6 replaces it)

```tsx
export default function Inbox() {
  return (
    <main className="min-h-screen bg-ink flex items-center justify-center p-6">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-text-low">Inbox loading…</p>
    </main>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npm run lint && npm run build && npm test` → exit 0.
Local visual: `npm run dev`, open `http://localhost:5180/admin.html` — without VITE_ env vars the "not configured" screen shows (correct); with a local `.env.local` containing the two VITE_ values, the sign-in screen shows.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: admin auth flow — session gate, magic-link sign-in"
```

---

### Task 6: Admin frontend — the inbox

**Files:**
- Modify: `src/admin/Inbox.tsx` (full replacement of the stub)

**Interfaces:**
- Consumes: `adminFetch`, `AdminInquiryView` from `./api`; `supabase` from `./supabaseClient`; `STATUSES` values duplicated as a local UI constant (do NOT import from `api/_lib` into frontend code).

- [ ] **Step 1: Replace `src/admin/Inbox.tsx`**

```tsx
import { useCallback, useEffect, useState } from "react";
import { adminFetch, AdminInquiryView } from "./api";
import { supabase } from "./supabaseClient";

const STATUSES = ["new", "replied", "closed"] as const;
type Tab = "all" | (typeof STATUSES)[number];

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Inbox() {
  const [leads, setLeads] = useState<AdminInquiryView[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError("");
    const r = await adminFetch("GET");
    setLoading(false);
    if (!r.ok || !r.inquiries) {
      setError(r.error ?? "Couldn't load inquiries.");
      return;
    }
    setLeads(r.inquiries);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    const r = await adminFetch("PATCH", { body: { id, status } });
    if (!r.ok) void load();
  }

  async function saveNotes(id: string, notes: string) {
    const r = await adminFetch("PATCH", { body: { id, notes } });
    if (!r.ok) setError(r.error ?? "Couldn't save the note.");
    else setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, notes } : l)));
  }

  async function remove(id: string) {
    setConfirmDeleteId(null);
    setLeads((ls) => ls.filter((l) => l.id !== id));
    const r = await adminFetch("DELETE", { body: { id } });
    if (!r.ok) void load();
  }

  const visible = tab === "all" ? leads : leads.filter((l) => l.status === tab);
  const counts: Record<Tab, number> = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    replied: leads.filter((l) => l.status === "replied").length,
    closed: leads.filter((l) => l.status === "closed").length,
  };

  return (
    <main className="min-h-screen bg-ink text-text-hi">
      <header className="sticky top-0 bg-ink/90 backdrop-blur-sm border-b border-line z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-mono text-xs uppercase tracking-[0.2em] text-text-low">Leads</h1>
          <button
            onClick={() => supabase?.auth.signOut()}
            className="font-mono text-xs uppercase tracking-[0.15em] text-text-mid hover:text-text-hi transition-colors duration-200 min-h-12 px-2 cursor-pointer"
          >
            Sign out
          </button>
        </div>
        <nav className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {(["all", ...STATUSES] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`min-h-12 px-4 border rounded-(--radius-sharp) font-mono text-xs uppercase tracking-[0.15em] cursor-pointer transition-colors duration-200 shrink-0 ${
                tab === t ? "border-line-strong bg-surface text-text-hi" : "border-line text-text-mid hover:text-text-hi"
              }`}
            >
              {t} · {counts[t]}
            </button>
          ))}
        </nav>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        <div aria-live="polite">{error && <p className="text-sm text-text-hi">{error}</p>}</div>
        {loading && <p className="font-mono text-xs uppercase tracking-[0.15em] text-text-low">Loading…</p>}
        {!loading && visible.length === 0 && <p className="text-text-mid">Nothing here.</p>}

        {visible.map((lead) => {
          const open = openId === lead.id;
          return (
            <article key={lead.id} className="bg-surface border border-line rounded-(--radius-frame)">
              <button
                onClick={() => setOpenId(open ? null : lead.id)}
                aria-expanded={open}
                className="w-full text-left p-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-bold tracking-tight">{lead.name}</span>
                  <span className="font-mono text-xs text-text-low shrink-0">{timeAgo(lead.created_at)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-text-low border border-line rounded-(--radius-sharp) px-2 py-0.5">
                    {lead.interest}
                  </span>
                  <span
                    className={`font-mono text-xs uppercase tracking-[0.15em] ${
                      lead.status === "new" ? "text-signal" : "text-text-low"
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
                {!open && <p className="mt-2 text-sm text-text-mid truncate">{lead.message}</p>}
              </button>

              {open && (
                <div className="px-4 pb-4 space-y-4 border-t border-line pt-4">
                  <p className="text-base text-text-mid whitespace-pre-wrap">{lead.message}</p>
                  <p className="font-mono text-xs text-text-low break-all">
                    {lead.email}
                    {lead.referrer ? ` · via ${lead.referrer}` : ""}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(lead.id, s)}
                        aria-pressed={lead.status === s}
                        className={`min-h-12 px-4 border rounded-(--radius-sharp) font-mono text-xs uppercase tracking-[0.15em] cursor-pointer transition-colors duration-200 ${
                          lead.status === s
                            ? "border-line-strong bg-ink text-text-hi"
                            : "border-line text-text-mid hover:text-text-hi"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label
                      htmlFor={`notes-${lead.id}`}
                      className="block font-mono text-xs uppercase tracking-[0.15em] text-text-low mb-2"
                    >
                      Notes
                    </label>
                    <textarea
                      id={`notes-${lead.id}`}
                      defaultValue={lead.notes}
                      maxLength={4000}
                      rows={3}
                      onBlur={(e) => {
                        if (e.target.value !== lead.notes) void saveNotes(lead.id, e.target.value);
                      }}
                      className="w-full bg-ink border border-line rounded-(--radius-sharp) px-4 py-3 text-base text-text-hi placeholder:text-text-low transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${lead.email}?subject=${encodeURIComponent("Re: your inquiry — Silent Precision")}`}
                      className="inline-flex items-center justify-center font-mono text-xs font-medium uppercase tracking-[0.15em] px-5 min-h-12 rounded-(--radius-sharp) bg-signal text-white hover:bg-signal-hover cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    >
                      Reply by email
                    </a>
                    {confirmDeleteId === lead.id ? (
                      <button
                        onClick={() => void remove(lead.id)}
                        className="min-h-12 px-5 border border-line-strong rounded-(--radius-sharp) font-mono text-xs uppercase tracking-[0.15em] text-text-hi cursor-pointer transition-colors duration-200"
                      >
                        Confirm delete
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(lead.id)}
                        className="min-h-12 px-5 border border-line rounded-(--radius-sharp) font-mono text-xs uppercase tracking-[0.15em] text-text-mid hover:text-text-hi cursor-pointer transition-colors duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build && npm test` → exit 0.
Local visual with `.env.local` VITE_ values: sign-in screen renders; (full inbox behavior needs a session — covered in Task 8's live E2E).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: admin inbox — tabs, expand, status, notes, reply, delete"
```

---

### Task 7: USER GATE — Supabase auth config + env vars (controller + Akki)

**Files:** none (dashboards + Vercel env).

- [ ] Akki: Supabase → Authentication → Sign In / Providers → ensure **Email** provider is enabled (magic link/OTP on).
- [ ] Akki: Supabase → Authentication → URL Configuration → add `https://silent-precision.vercel.app/admin` to Redirect URLs.
- [ ] Akki: run `docs/ops/2026-07-04-add-notes.sql` in the SQL Editor ("Success. No rows returned.").
- [ ] Controller: set `ADMIN_EMAIL=raptor.akki.64@gmail.com` on Vercel production (not secret).
- [ ] Controller+Akki: set `VITE_SUPABASE_URL` (same as SUPABASE_URL — controller knows it) and `VITE_SUPABASE_ANON_KEY` (Akki copies the **anon/public** key — it is public; pbpaste flow or paste in chat both acceptable).
- [ ] Verify `npx vercel env ls production` shows all seven names.

---

### Task 8: Deploy, live E2E

- [ ] **Step 1:** `git push origin main && npx vercel --prod --yes` (env vars bake at deploy).
- [ ] **Step 2:** `curl -s https://silent-precision.vercel.app/admin | grep -o "<title>[^<]*</title>"` → `Admin — Silent Precision`; `curl -s -o /dev/null -w "%{http_code}" https://silent-precision.vercel.app/api/admin/inquiries` → 401 (no token).
- [ ] **Step 3 (Akki, on his phone):** open `/admin`, request the magic link, tap it, confirm the inbox lists the friend's real inquiry; flip its status to replied (reload — it sticks); write a note (reload — it sticks); Reply-by-email opens a draft; delete nothing real.
- [ ] **Step 4:** confirm signed-out API returns 401 and the admin page is `noindex` (`curl -s https://silent-precision.vercel.app/admin | grep robots`).
- [ ] **Step 5:** commit any fixes; final whole-branch review per SDD, then merge to main.

## Deferred

- CMS (Phase 3 candidate), multiple admins, push notifications, custom domain + Resend domain sender.
