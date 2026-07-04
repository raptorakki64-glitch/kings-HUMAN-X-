import { track } from "@vercel/analytics";
import { contact, site, inquiryCopy } from "../content";
import Reveal from "../primitives/Reveal";
import Button from "../primitives/Button";
import InquiryForm from "./InquiryForm";

export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-40 border-t border-line scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <Reveal>
          <h2
            className="font-display font-extrabold tracking-tight leading-none text-text-hi"
            style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
          >
            {contact.headline}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-xl text-base md:text-lg text-text-mid">{contact.sub}</p>
        </Reveal>
        <Reveal delay={0.16} className="mt-10 flex flex-wrap items-center gap-4">
          <Button href={`mailto:${site.email}`} onClick={() => track("email_click")}>
            Email me
          </Button>
          <Button href={site.whatsapp} variant="ghost" external onClick={() => track("whatsapp_click")}>
            WhatsApp
          </Button>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-[0.15em] text-text-mid hover:text-text-hi transition-colors duration-200 underline underline-offset-8 min-h-12 inline-flex items-center cursor-pointer"
          >
            LinkedIn
          </a>
        </Reveal>
        <Reveal delay={0.2} className="mt-16 max-w-2xl">
          <div className="bg-surface border border-line rounded-(--radius-frame) p-8 md:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low mb-8">
              {inquiryCopy.heading}
            </p>
            <InquiryForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
