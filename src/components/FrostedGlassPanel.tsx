import { motion } from "motion/react";
import { ReactNode } from "react";

interface FrostedGlassPanelProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

export default function FrostedGlassPanel({
  children,
  className = "",
  id,
  delay = 0,
}: FrostedGlassPanelProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Apple-style custom spring-like ease-out
        delay,
      }}
      className={`relative rounded-xl overflow-hidden ${className}`}
    >
      {/* Ambient background blur and glass texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
      <div 
        className="absolute inset-0 backdrop-blur-2xl bg-zinc-950/60 border border-white/10 ring-1 ring-white/5 shadow-[0_0_80px_rgba(0,0,0,0.65)] rounded-xl pointer-events-none" 
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 p-8 md:p-12">
        {children}
      </div>
    </motion.div>
  );
}
