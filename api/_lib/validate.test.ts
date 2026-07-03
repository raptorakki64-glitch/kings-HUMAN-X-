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
    if (!r.ok) expect((r as { ok: false; error: string }).error).toMatch(/^email:/);
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
