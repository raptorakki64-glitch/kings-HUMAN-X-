import { caseStudies } from "../content";
import Reveal from "../primitives/Reveal";
import SectionHeader from "../primitives/SectionHeader";

export default function CaseStudies() {
  return (
    <section id="work" className="py-24 md:py-40 border-t border-line scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionHeader kicker={caseStudies.kicker} title={caseStudies.title} />
        <div>
          {caseStudies.entries.map((entry) => (
            <Reveal key={entry.title}>
              <article className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 py-12 border-t border-line">
                <div className="md:col-span-2">
                  <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-text-low border border-line rounded-(--radius-sharp) px-3 py-1.5">
                    {entry.tag}
                  </span>
                </div>
                <div className="md:col-span-6">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-text-hi mb-3">
                    {entry.title}
                  </h3>
                  <p className="text-base text-text-mid max-w-prose">{entry.body}</p>
                </div>
                <div className="md:col-span-4 flex flex-col gap-5 md:items-end">
                  {entry.metrics.map((m) => (
                    <div key={m.label} className="md:text-right">
                      <div className="font-mono text-2xl font-bold text-signal">{m.value}</div>
                      <div className="font-mono text-xs uppercase tracking-[0.15em] text-text-low mt-1">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
