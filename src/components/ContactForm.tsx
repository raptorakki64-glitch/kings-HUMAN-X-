import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, RefreshCw } from "lucide-react";
import { ContactInput } from "../types";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactInput>({
    name: "",
    email: "",
    interest: "Brand Repositioning",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [checksum, setChecksum] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please complete all fields to establish connection.");
      return;
    }

    setStatus("submitting");

    // Simulate precise satellite-like cryptographic submission
    setTimeout(() => {
      const generatedChecksum = Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 16).toString(16).toUpperCase()
      ).join("");
      setChecksum(generatedChecksum);
      setStatus("success");
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      interest: "Brand Repositioning",
      message: "",
    });
    setStatus("idle");
    setChecksum("");
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 border-t border-zinc-900 bg-zinc-950/20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Left info column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase mb-3">
                DIRECT SECURE GATEWAY
              </p>
              <h2 className="font-serif text-4xl md:text-5xl italic text-zinc-100 mb-8">
                Establish Connection
              </h2>
              <p className="font-sans text-sm text-zinc-400 leading-relaxed mb-8 max-w-md">
                Initiate collaboration, request brand advisory playbooks, or schedule athletic alignment consultations. All inquiries are parsed with absolute discretion.
              </p>
            </div>

            <div className="space-y-6 border-t border-zinc-900 pt-8 mt-8 md:mt-0">
              <div className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                  NODE STATUS: READY FOR INTAKE
                </span>
              </div>
              <div className="font-sans text-xs text-zinc-500">
                Response Latency: &lt; 18 hours
              </div>
            </div>
          </div>

          {/* Right form column */}
          <div className="md:col-span-7 bg-white/[0.02] border border-white/10 p-8 md:p-12 rounded-2xl relative overflow-hidden backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            {/* Top glass reflection gradient */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
              {status !== "success" ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase mb-2">
                        NAME / IDENTITY
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Founders Group"
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 rounded-lg py-3 px-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase mb-2">
                        SECURE EMAIL
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@domain.com"
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 rounded-lg py-3 px-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase mb-2">
                      CORE FOCUS / OBJECTIVE
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {["Brand Repositioning", "Athletic Alignment", "General Inquiry"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, interest: opt })}
                          className={`py-2 px-3 border rounded-lg font-mono text-[11px] tracking-wider text-center transition-all duration-300 ${
                            formData.interest === opt
                              ? "bg-zinc-100 border-zinc-100 text-zinc-950 font-semibold"
                              : "bg-transparent border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                          }`}
                        >
                          {opt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase mb-2">
                      MESSAGE / PARAMETERS
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Specify your operational intent, timeline constraints, and desired outcomes."
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 rounded-lg py-3 px-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-300 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-mono text-xs tracking-widest font-semibold py-4 px-6 rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] group"
                  >
                    {status === "submitting" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>ESTABLISHING PATH...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        <span>TRANSMIT PARAMETERS</span>
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-center py-12"
                >
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="w-16 h-16 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-bounce" />
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl italic text-zinc-100">
                    Connection Secure
                  </h3>

                  <p className="font-sans text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Operational data transmitted successfully. The request has been ingested by the private network queue and will be processed immediately.
                  </p>

                  {/* Cryptographic check card */}
                  <div className="max-w-xs mx-auto p-4 bg-zinc-950/80 border border-zinc-800 rounded-lg text-left space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                      <span>STATUS</span>
                      <span className="text-emerald-500">ENQUEUED</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                      <span>DESTINATION</span>
                      <span>NODE-A_GAV</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                      <span>SIGNATURE_HEX</span>
                      <span className="text-zinc-300 font-bold">{checksum}</span>
                    </div>
                  </div>

                  <button
                    onClick={resetForm}
                    className="mt-6 text-[10px] font-mono tracking-widest text-zinc-500 hover:text-zinc-300 underline underline-offset-4 cursor-pointer uppercase transition-colors"
                  >
                    Transmit New Signal
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
