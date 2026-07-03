import { services } from "../content";
import Reveal from "../primitives/Reveal";
import SectionHeader from "../primitives/SectionHeader";

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-40 border-t border-line scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionHeader kicker={services.kicker} title={services.title} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {services.formats.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.08}>
              <div className="h-full bg-surface border border-line rounded-(--radius-frame) p-8 md:p-10">
                <div className="font-mono text-xs uppercase tracking-[0.15em] text-text-low mb-4">
                  {f.term}
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-text-hi mb-4">
                  {f.name}
                </h3>
                <p className="text-base text-text-mid">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 md:mt-20">
          <h3 className="font-serif italic text-2xl text-text-hi mb-8">The first two weeks</h3>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {services.firstTwoWeeks.map((step, i) => (
              <li key={step} className="border-t border-line pt-4">
                <span className="font-mono text-xs text-text-low">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-2 text-base text-text-mid">{step}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-12 flex flex-col md:flex-row gap-3 md:gap-12">
          <p className="text-base text-text-mid">
            <span className="text-text-hi font-bold">What you bring:</span> {services.youBring}
          </p>
          <p className="text-base text-text-mid">
            <span className="text-text-hi font-bold">Pricing:</span> {services.pricing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
