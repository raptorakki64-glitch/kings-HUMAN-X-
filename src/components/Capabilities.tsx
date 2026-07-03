import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { capabilities } from "../content";
import Reveal from "../primitives/Reveal";
import SectionHeader from "../primitives/SectionHeader";
import { EASE, DUR } from "../motion";

export default function Capabilities() {
  const [open, setOpen] = useState<number>(0);
  const reduced = useReducedMotion();

  return (
    <section className="py-24 md:py-40 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionHeader kicker={capabilities.kicker} title={capabilities.title} />
        <div>
          {capabilities.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.name}>
                <div className="border-t border-line">
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-expanded={isOpen}
                    className="w-full grid grid-cols-12 gap-4 items-baseline py-6 text-left cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    <span className="col-span-2 md:col-span-1 font-mono text-xs text-text-low">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`col-span-10 md:col-span-4 text-lg md:text-xl font-bold tracking-tight transition-colors duration-200 ${
                        isOpen ? "text-text-hi" : "text-text-mid group-hover:text-text-hi"
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="col-span-10 col-start-3 md:col-span-7 md:col-start-6 text-base text-text-mid">
                      {item.line}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0 : DUR.reveal, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="pb-8 md:pl-[41.666%] text-base text-text-mid max-w-prose">
                          {item.detail}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
