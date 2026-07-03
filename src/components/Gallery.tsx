import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { gallery } from "../content";
import Photo from "../primitives/Photo";
import SectionHeader from "../primitives/SectionHeader";

export default function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["4%", "-8%"]);

  return (
    <section ref={ref} className="py-24 md:py-40 overflow-hidden border-t border-line">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionHeader kicker={gallery.kicker} title={gallery.title} />
      </div>
      <div className="overflow-x-auto md:overflow-visible">
        <motion.div style={{ x }} className="flex gap-6 md:gap-8 px-6 md:px-8 w-max">
          {gallery.photos.map((photo) => (
            <Photo
              key={photo.src + photo.caption}
              photo={photo}
              className="w-[240px] md:w-[320px] shrink-0"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
