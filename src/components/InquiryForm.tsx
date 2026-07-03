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
