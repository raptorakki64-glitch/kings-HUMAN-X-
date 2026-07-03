import { story } from "../content";
import Reveal from "../primitives/Reveal";
import Photo from "../primitives/Photo";
import SectionHeader from "../primitives/SectionHeader";

export default function Story() {
  return (
    <section id="story" className="py-24 md:py-40 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionHeader kicker={story.kicker} title={story.title} />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">
          <div className="md:col-span-7">
            <Reveal>
              <p className="text-base md:text-lg text-text-mid">{story.paragraphs[0]}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <blockquote className="my-10 border-l-2 border-signal pl-6 font-serif italic text-2xl md:text-3xl text-text-hi">
                {story.pullQuote}
              </blockquote>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-base md:text-lg text-text-mid">{story.paragraphs[1]}</p>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="md:col-span-5">
            <Photo photo={story.photo} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
