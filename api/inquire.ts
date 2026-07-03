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

  for (const name of ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "IP_HASH_SALT"] as const) {
    if (!process.env[name]) {
      console.error(`missing env var: ${name}`);
      res.status(500).json({ ok: false, error: "Something went wrong — please email me directly." });
      return;
    }
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
      const { error } = await resend.emails.send({
        from: "Silent Precision <onboarding@resend.dev>",
        to: "raptor.akki.64@gmail.com",
        subject: `New inquiry — ${f.name} (${f.interest})`,
        text: `Name: ${f.name}\nEmail: ${f.email}\nInterest: ${f.interest}\nReferrer: ${f.referrer || "direct"}\n\n${f.message}`,
      });
      if (error) throw new Error(error.message);
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
