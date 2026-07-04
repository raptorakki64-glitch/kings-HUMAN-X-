import { validateInquiry, isBot } from "./validate.js";

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
  if (v.ok === false) {
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
