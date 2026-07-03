import { site } from "../content";

export default function Footer() {
  return (
    <footer className="border-t border-line py-12">
      <div className="max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-text-low">
          © {new Date().getFullYear()} {site.name}
        </span>
        <span className="font-serif italic text-text-low">Silent Precision</span>
      </div>
    </footer>
  );
}
