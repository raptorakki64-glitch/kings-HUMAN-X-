import { motion } from "motion/react";
import { CaseStudy } from "../types";

const caseStudiesData: CaseStudy[] = [
  {
    id: "gav-farming",
    category: "COMMERCE",
    title: "GAV Farming",
    description: "Operational efficiency applied to agricultural commerce. Streamlined supply chain and direct-to-consumer strategy.",
    metrics: [
      { label: "REVENUE", value: "₹3,00,000", isRedAccent: true },
      { label: "VOLUME", value: "200+ BOXES", isRedAccent: false },
    ],
  },
  {
    id: "chanikya-school",
    category: "INSTITUTIONAL",
    title: "Chanikya High School",
    description: "Strategic repositioning for educational institutions. Leveraging digital presence to drive tangible enrollment growth.",
    metrics: [
      { label: "GROWTH", value: "200+ Admissions Increase", isRedAccent: true },
      { label: "REACH", value: "10x SOCIAL GROWTH", isRedAccent: false },
    ],
  },
  {
    id: "strategic-playbook",
    category: "METHODOLOGY",
    title: "The Strategic Playbook",
    description: "A framework mapping elite athletic training disciplines directly onto business operations.",
    bullets: [
      "Pillar 1: Why Athletes?",
      "Pillar 2: The Bridge Built.",
      "Pillar 3: The Precision Stack."
    ]
  },
];

export default function CaseStudies() {
  return (
    <section id="ventures" className="relative py-24 md:py-32 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-24">
          <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase mb-3">
            VERIFIABLE PROOF
          </p>
          <h2 className="font-serif text-4xl md:text-5xl italic text-zinc-100">
            Execution &amp; Verification
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudiesData.map((study, idx) => (
            <motion.div
              id={`case-card-${study.id}`}
              key={study.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group relative flex flex-col justify-between p-8 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-500 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            >
              {/* Card top light glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />
              
              <div>
                {/* Category Chip */}
                <div className="mb-8">
                  <span className="inline-block font-mono text-[9px] tracking-widest text-zinc-400 bg-white/[0.04] border border-white/10 px-3 py-1 rounded-md uppercase">
                    {study.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-sans font-bold text-xl text-zinc-100 mb-3 tracking-tight">
                  {study.title}
                </h3>

                {/* Description */}
                <p className="font-sans text-sm text-zinc-400 leading-relaxed mb-8">
                  {study.description}
                </p>
              </div>

              {/* Actionable Metrics or Bullets */}
              <div className="mt-auto space-y-4">
                {study.metrics && (
                  <div className="space-y-4">
                    {study.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="flex justify-between items-end border-b border-zinc-800/60 pb-2"
                      >
                        <span className="font-mono text-[10px] tracking-wider text-zinc-500">
                          {metric.label}
                        </span>
                        
                        {metric.isRedAccent ? (
                          <span className="font-mono text-base font-semibold text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.25)]">
                            {metric.value}
                          </span>
                        ) : (
                          <span className="font-mono text-base text-zinc-300">
                            {metric.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {study.bullets && (
                  <ul className="space-y-3 pt-2">
                    {study.bullets.map((bullet, bIdx) => (
                      <li
                        key={bIdx}
                        className="font-serif text-sm italic text-zinc-300 border-b border-zinc-800/60 pb-2 flex justify-between items-center"
                      >
                        <span>{bullet}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
