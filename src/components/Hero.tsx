import { motion, useReducedMotion } from "motion/react";
import { hero } from "../content";
import Photo from "../primitives/Photo";
import Button from "../primitives/Button";
import PixelHero from "./PixelHero";
import { EASE, DUR } from "../motion";

export default function Hero() {
  const reduced = useReducedMotion();
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DUR.hero, ease: EASE, delay },
  });

  return (
    <section id="story" className="relative min-h-[88vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 opacity-60">
        <PixelHero />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-24 md:py-32 grid grid-cols-1 md:grid-cols-12 gap-12 items-center w-full">
        <div className="md:col-span-7">
          <motion.p
            {...enter(0)}
            className="font-mono text-xs uppercase tracking-[0.2em] text-text-low mb-8"
          >
            {hero.kicker}
          </motion.p>
          <motion.h1
            {...enter(0.08)}
            className="font-display font-extrabold tracking-tight leading-[0.95] text-text-hi"
            style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
          >
            {hero.headline[0]}
            <br />
            {hero.headline[1]}
          </motion.h1>
          <motion.p
            {...enter(0.16)}
            className="mt-8 max-w-xl text-base md:text-lg text-text-mid"
          >
            {hero.sub}
          </motion.p>
          <motion.div {...enter(0.24)} className="mt-10">
            <Button href="#contact">{hero.cta}</Button>
          </motion.div>
        </div>
        <motion.div {...enter(0.2)} className="md:col-span-5">
          <Photo photo={hero.photo} />
        </motion.div>
      </div>
    </section>
  );
}
