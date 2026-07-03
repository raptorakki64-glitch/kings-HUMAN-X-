import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";
import { EASE, DUR } from "../motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: DUR.reveal, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
