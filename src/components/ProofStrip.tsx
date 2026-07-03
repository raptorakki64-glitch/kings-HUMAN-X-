import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { proof, ProofStat } from "../content";
import { DUR } from "../motion";

function Stat({ stat }: { stat: ProofStat }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? stat.value : 0);

  useEffect(() => {
    if (!inView || reduced) {
      if (inView) setDisplay(stat.value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = Math.min((performance.now() - start) / (DUR.count * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(stat.value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, stat.value]);

  return (
    <div ref={ref}>
      <div className="font-mono text-2xl md:text-3xl font-bold text-signal">
        {stat.prefix ?? ""}
        {display.toLocaleString("en-IN")}
        {stat.suffix ?? ""}
      </div>
      <div className="mt-2 text-sm text-text-mid max-w-[22ch]">{stat.label}</div>
    </div>
  );
}

export default function ProofStrip() {
  return (
    <section id="proof" className="border-y border-line bg-surface/60">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
        {proof.map((stat) => (
          <Stat key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
