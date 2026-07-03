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

export function isBot(b: { company?: unknown; elapsedMs?: unknown }): boolean {
  if (typeof b.company === "string" && b.company.trim() !== "") return true;
  if (typeof b.elapsedMs !== "number" || !Number.isFinite(b.elapsedMs)) return true;
  if (b.elapsedMs < MIN_FORM_MS) return true;
  return false;
}
