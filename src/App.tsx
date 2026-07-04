import { Analytics } from "@vercel/analytics/react";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ProofStrip from "./components/ProofStrip";
import Story from "./components/Story";
import Gallery from "./components/Gallery";
import CaseStudies from "./components/CaseStudies";
import Capabilities from "./components/Capabilities";
import Services from "./components/Services";
import Contact from "./components/Contact";

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-ink text-text-hi antialiased overflow-x-clip">
      <Nav />
      <main className="pt-16">
        <Hero />
        <ProofStrip />
        <Story />
        <Gallery />
        <CaseStudies />
        <Capabilities />
        <Services />
        <Contact />
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}
