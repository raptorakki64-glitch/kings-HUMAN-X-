import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ProofStrip from "./components/ProofStrip";
import Story from "./components/Story";
import Gallery from "./components/Gallery";

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-ink text-text-hi antialiased overflow-x-clip">
      <Nav />
      <main className="pt-16">
        <Hero />
        <ProofStrip />
        <Story />
        <Gallery />
        {/* sections appended by subsequent tasks */}
      </main>
      <Footer />
    </div>
  );
}
