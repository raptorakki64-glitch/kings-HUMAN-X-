# Admin Leads Inbox — Phase 2 Design Spec

**Date:** 2026-07-04
**Project:** Silent Precision (live at https://silent-precision.vercel.app)
**Status:** Approved direction — /admin page, magic-link auth, single-door admin API
**Out of scope (Phase 3+ if wanted):** CMS/content editing, multiple admin users, push notifications, custom domain.

## Goal

A protected `/admin` page where Akki reviews every inquiry, tracks status
(new/replied/closed), keeps private notes, replies via pre-addressed email
drafts, and deletes spam — usable from his phone.

## Decisions made (with user)

| Decision | Choice |
|---|---|
| Scope | Leads inbox only; CMS deferred |
| Auth | Supabase magic link, locked to exactly `raptor.akki.64@gmail.com` (server-enforced) |
| Features | Status tracking + filter, email quick-reply, private notes, delete |
| Architecture | Same single-door pattern as Phase 1: admin API routes verify the session token server-side and use the service key; RLS stays policy-less |
| Quick-reply channel | Email draft only (`mailto:` the lead, subject pre-filled). WhatsApp dropped — we don't collect phone numbers |

## Architecture

```
/admin page (second Vite entry, same repo/deploy)
   │ sign-in: supabase-js auth (anon key) → magic link → session
   │ every data call: Authorization: Bearer <access_token>
   ▼
api/admin/inquiries.ts        ← the only admin door to the DB
   │ 1. verify token via Supabase (auth.getUser)
   │ 2. user.email must equal ADMIN_EMAIL → else 401
   │ 3. act with service key (list / patch / delete)
   ▼
Supabase `inquiries` table (RLS on, zero policies — unchanged)
```

The anon key appears in the admin frontend (it is public by design and grants
nothing: RLS has no policies). The service key remains server-only.

## Components

### 1. DB migration — `docs/ops/2026-07-04-add-notes.sql`

```sql
alter table inquiries add column notes text not null default '';
```

### 2. Admin frontend — `admin.html` + `src/admin/` (own Vite entry)

- `src/admin/main.tsx` — mounts `<AdminApp />`; `admin.html` at repo root;
  `vite.config.ts` gains `build.rollupOptions.input` for both pages;
  `vercel.json` gains a rewrite `/admin → /admin.html`.
- `<AdminApp />` states: `checking` (session lookup) → `signed-out` → `inbox`.
- **Sign-in screen:** one email field + "Send sign-in link" (Supabase
  `signInWithOtp`, `emailRedirectTo` = `https://silent-precision.vercel.app/admin`).
  Any email may request a link (Supabase handles it), but only the admin's
  session passes the API check — the UI also shows "wrong account" and a
  sign-out button if a non-admin session is detected (defense in depth,
  cosmetic; the API 401 is the real gate).
- **Inbox screen:** status tabs All / New / Replied / Closed with counts;
  list newest-first: name, interest tag, relative time, one-line message
  preview, status chip. Tap to expand: full message, email, referrer, date;
  status buttons; notes textarea (saved on blur via PATCH); "Reply by email"
  (`mailto:<lead email>?subject=Re: your inquiry — Silent Precision`);
  Delete (two-tap confirm). Sign-out button in the header.
- Design: existing tokens/primitives (ink/surface/line/signal, mono labels,
  radius pair); phone-first single column; min-h-12 targets; focus-visible;
  reduced-motion respected; `<meta name="robots" content="noindex">`.
- Frontend env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public values,
  baked at build time).

### 3. Admin API — `api/admin/inquiries.ts`

All methods require `Authorization: Bearer <access_token>`.

Auth check (shared helper `api/_lib/adminAuth.ts`, pure-testable core):
token → `supabase.auth.getUser(token)` → must succeed AND
`user.email?.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()` →
else `401 { ok:false, error:"Not authorized." }`. Same env fail-fast
pattern as Phase 1 (now also requiring `ADMIN_EMAIL`).

- `GET /api/admin/inquiries?status=new|replied|closed` (param optional) →
  `200 { ok:true, inquiries: AdminInquiry[] }` — all columns except ip_hash,
  ordered created_at desc, capped at 200 rows.
- `PATCH /api/admin/inquiries` body `{ id, status?, notes? }` — at least one
  of status/notes; status must be one of new|replied|closed; notes ≤ 4000
  chars → `200 { ok:true }`. Unknown id → `404 { ok:false, error:"Not found." }`.
- `DELETE /api/admin/inquiries` body `{ id }` → `200 { ok:true }`; unknown id → 404.
- Other methods → 405. All responses `Cache-Control: no-store`. No internals
  in error bodies; body size cap reuses `guardRequest`'s 32 KB.

### 4. Supabase configuration (user gate, guided)

- Enable the Email auth provider (magic link / OTP) in the Supabase dashboard.
- Add redirect URL `https://silent-precision.vercel.app/admin` to the
  project's auth allowed-redirect list.
- Env vars added to Vercel production: `ADMIN_EMAIL=raptor.akki.64@gmail.com`
  (controller can set), `VITE_SUPABASE_URL` (same value as SUPABASE_URL),
  `VITE_SUPABASE_ANON_KEY` (anon/public key from the dashboard — public value).
- Run the notes-column migration SQL.

## Security baseline

- Phase 1 posture unchanged: RLS on, zero policies, service key server-only,
  security headers site-wide (they already apply to /admin routes via
  `vercel.json`'s `/(.*)` source).
- Every admin API call verifies the token against Supabase and the email
  against `ADMIN_EMAIL` — no client-side-only gating.
- Admin API responses `Cache-Control: no-store`; admin page `noindex`.
- ip_hash is never returned to the client (not even to the admin UI — it has
  no display use).
- No rate limiting on admin routes (authenticated single user); the 401 path
  is constant-time enough (single Supabase lookup) for this threat model.

## Testing

- Vitest, same fakes pattern: `adminAuth` core (valid token+right email passes;
  wrong email 401; invalid/missing token 401), handler logic per verb (GET
  list + filter passthrough, PATCH validation: no fields / bad status / long
  notes / unknown id, DELETE unknown id, 405, body cap) with injected deps.
- Live E2E after deploy: magic-link sign-in on the real page, list shows the
  E2E inquiry from Phase 1 (or a fresh one), status flip persists after
  reload, note persists, delete removes, signed-out fetch gets 401, and a
  second (non-admin) account's token gets 401.
- Gate unchanged: `npm run lint && npm run build && npm test`.
