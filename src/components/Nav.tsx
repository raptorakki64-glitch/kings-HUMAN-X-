import { site } from "../content";

const links = [
  { href: "#story", label: "Story" },
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
];

export default function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink/80 backdrop-blur-md border-b border-line">
      <nav className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="font-mono text-xs uppercase tracking-[0.2em] text-text-hi min-h-12 inline-flex items-center cursor-pointer">
          {site.name.split(" ")[1]} {/* "Aakash" */}
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-mid hover:text-text-hi transition-colors duration-200 min-h-12 inline-flex items-center cursor-pointer"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          className="inline-flex items-center justify-center font-mono text-xs font-medium uppercase tracking-[0.15em] px-5 min-h-12 rounded-(--radius-sharp) bg-signal text-white hover:bg-signal-hover transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Work with me
        </a>
      </nav>
    </header>
  );
}
