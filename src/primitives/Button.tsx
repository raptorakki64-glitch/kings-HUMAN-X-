import { ReactNode } from "react";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "signal" | "ghost";
  external?: boolean;
  onClick?: () => void;
}

export default function Button({ href, children, variant = "signal", external = false, onClick }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.15em] px-7 min-h-12 rounded-(--radius-sharp) cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";
  const variants = {
    signal: "bg-signal text-white hover:bg-signal-hover",
    ghost: "border border-line text-text-mid hover:text-text-hi hover:border-line-strong",
  };
  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </a>
  );
}
