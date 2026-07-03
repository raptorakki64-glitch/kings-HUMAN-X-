import { describe, it, expect, vi } from "vitest";
import { processInquiry, guardRequest, RATE_LIMIT_PER_HOUR, MAX_BODY_BYTES, InquiryDeps } from "./processInquiry";

const meta = { ipHash: "hash123", referrer: "https://x.com", userAgent: "UA" };
const humanBody = {
  name: "Akki",
  email: "someone@example.com",
  interest: "Positioning Sprint",
  message: "I run a fintech and our positioning is mush.",
  company: "",
  elapsedMs: 60_000,
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
    const r = await processInquiry({ ...humanBody, elapsedMs: 100 }, meta, deps);
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
