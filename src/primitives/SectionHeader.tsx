import Reveal from "./Reveal";

interface SectionHeaderProps {
  kicker: string;
  title: string;
}

export default function SectionHeader({ kicker, title }: SectionHeaderProps) {
  return (
    <Reveal className="mb-16 md:mb-20">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low mb-3">{kicker}</p>
      <h2 className="font-serif italic text-3xl md:text-4xl text-text-hi">{title}</h2>
    </Reveal>
  );
}
