import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Menu, X, Shield, Activity, Dribbble, Compass, Cpu, Mail, Globe } from "lucide-react";
import PixelHero from "./components/PixelHero";
import FrostedGlassPanel from "./components/FrostedGlassPanel";
import CaseStudies from "./components/CaseStudies";
import ContactForm from "./components/ContactForm";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCapability, setActiveCapability] = useState<string | null>("positioning");

  const capabilities = [
    {
      id: "positioning",
      name: "POSITIONING",
      icon: Compass,
      description: "Establishing clear competitive gaps and framing value propositions to dominate market categories with razor-sharp authority.",
    },
    {
      id: "social",
      name: "SOCIAL STRATEGY",
      icon: Activity,
      description: "Data-driven organic distribution models leveraging athletic prestige, raw operational authenticity, and narrative rigor.",
    },
    {
      id: "messaging",
      name: "BRAND MESSAGING",
      icon: Shield,
      description: "Crafting precise, high-impact copy and narrative architectures designed to engage institutional allocators and premier founders.",
    },
    {
      id: "execution",
      name: "HANDS-ON EXECUTION",
      icon: Dribbble,
      description: "Direct tactical integration into your operations—bridging the gap between elite high-level strategy and immediate on-pitch delivery.",
    },
    {
      id: "ai-workflows",
      name: "AI-ASSISTED WORKFLOWS",
      icon: Cpu,
      description: "Architecting private, intelligent workflows to drastically accelerate research, market mapping, and narrative production cycles.",
    },
  ];

  const handleScroll = (selector: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="root-container" className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-red-500/20 selection:text-red-300 overflow-x-hidden relative">
      
      {/* Background Pixel Grid */}
      <div 
        className="absolute inset-0 opacity-[0.14] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* Decorative Corner Borders */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-white/10 pointer-events-none z-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-white/10 pointer-events-none z-20" />

      {/* Navigation Header */}
      <nav id="navbar" className="fixed top-0 inset-x-0 bg-[#09090b]/75 backdrop-blur-md border-b border-zinc-900/80 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          
          {/* Brand Logo with HX Badge */}
          <div 
            onClick={() => handleScroll("#story")}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 border border-white/20 group-hover:border-white/50 flex items-center justify-center transition-colors">
              <span className="text-[10px] font-mono font-bold tracking-widest text-white">HX</span>
            </div>
            <span className="text-xs font-sans font-medium tracking-[0.3em] uppercase text-zinc-300 group-hover:text-white transition-colors">
              Silent Precision
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => handleScroll("#story")}
              className="font-mono text-[10px] tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              STORY
            </button>
            <button 
              onClick={() => handleScroll("#operating-model")}
              className="font-mono text-[10px] tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              MODEL
            </button>
            <button 
              onClick={() => handleScroll("#ventures")}
              className="font-mono text-[10px] tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              VENTURES
            </button>
            <button 
              onClick={() => handleScroll("#capabilities")}
              className="font-mono text-[10px] tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              CAPABILITIES
            </button>
          </div>

          {/* Connect Button */}
          <div className="hidden md:block">
            <button
              onClick={() => handleScroll("#contact")}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-[10px] tracking-widest font-bold px-5 py-2.5 rounded-sm transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
            >
              CONNECT
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-zinc-300 hover:text-zinc-100 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-b border-zinc-900 bg-[#09090b]"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                <button 
                  onClick={() => handleScroll("#story")}
                  className="font-mono text-xs tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors text-left"
                >
                  STORY
                </button>
                <button 
                  onClick={() => handleScroll("#operating-model")}
                  className="font-mono text-xs tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors text-left"
                >
                  MODEL
                </button>
                <button 
                  onClick={() => handleScroll("#ventures")}
                  className="font-mono text-xs tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors text-left"
                >
                  VENTURES
                </button>
                <button 
                  onClick={() => handleScroll("#capabilities")}
                  className="font-mono text-xs tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors text-left"
                >
                  CAPABILITIES
                </button>
                <button
                  onClick={() => handleScroll("#contact")}
                  className="w-full bg-zinc-100 text-zinc-950 font-mono text-xs tracking-widest font-bold py-3 text-center rounded-sm"
                >
                  CONNECT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Container */}
      <main className="pt-20 relative z-10">

        {/* Hero Section */}
        <section id="story" className="relative h-[90vh] min-h-[600px] flex items-center justify-center px-6 md:px-12 overflow-hidden bg-[#09090b]">
          
          {/* 1. Behind the typography: Interactive Pixel/Particle Background */}
          <PixelHero />

          {/* 2. Brand mark: Large, low-opacity "Human X" logo watermark placed subtly in the background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none z-0">
            <span className="text-[20vw] md:text-[24rem] font-black tracking-tighter text-white">HUMAN X</span>
          </div>

          {/* 3. Accent: A single subtle red radial glow behind the hero headline like a soft spotlight */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] max-w-full rounded-full bg-red-600/[0.12] blur-[120px] pointer-events-none z-0" />

          {/* 4. Frosted glass typography container */}
          <div className="relative z-10 w-full max-w-4xl text-center">
            <FrostedGlassPanel className="p-8 md:p-16 max-w-3xl mx-auto bg-zinc-950/40" delay={0.1}>
              
              {/* Category */}
              <p className="font-mono text-[10px] tracking-[0.5em] text-white/40 uppercase mb-6 font-bold">
                Strategic Hybrid Performance
              </p>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6">
                SYSTEMATIC <br />
                <span className="text-white/90">EXCELLENCE.</span>
              </h1>

              {/* Subheadline */}
              <p className="font-sans text-sm md:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed mb-10 font-light tracking-wide">
                Merging the discipline of elite athletic training with high-stakes digital growth infrastructure.
              </p>

              {/* Call to action */}
              <button
                onClick={() => handleScroll("#contact")}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-xs tracking-widest font-bold py-3.5 px-8 rounded-sm inline-flex items-center gap-2 group transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] cursor-pointer"
              >
                <span>ESTABLISH PROTOCOL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </FrostedGlassPanel>
          </div>

          {/* Bottom scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 select-none z-10">
            <span className="font-mono text-[8px] tracking-widest text-zinc-500">SCROLL PROTOCOL</span>
            <div className="w-[1px] h-6 bg-zinc-800 relative overflow-hidden">
              <motion.div 
                animate={{ y: ["-100%", "100%"] }} 
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} 
                className="absolute left-0 top-0 w-full h-1/2 bg-zinc-300" 
              />
            </div>
          </div>

        </section>

        {/* The Operating Model Section */}
        <section id="operating-model" className="relative py-24 md:py-32 bg-[#09090b] border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            {/* Section Header */}
            <div className="mb-16 md:mb-24">
              <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase mb-3">
                METHODOLOGY
              </p>
              <h2 className="font-serif text-4xl md:text-5xl italic text-zinc-100">
                The Operating Model
              </h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Column: The Transition */}
              <FrostedGlassPanel className="p-8 md:p-12 border border-zinc-800 bg-zinc-950/20">
                <div className="flex items-center gap-4 border-b border-zinc-800 pb-6 mb-6">
                  <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center font-mono text-xs text-zinc-500">
                    01
                  </div>
                  <h3 className="font-serif text-2xl italic text-zinc-100">
                    The Transition
                  </h3>
                </div>
                
                <p className="font-sans text-sm text-zinc-400 leading-relaxed mb-6">
                  I spent years operating inside a strict performance framework where execution is absolute. On the cricket pitch, there is no room for ambiguity—you prepare, you analyze, and you perform under pressure. Every variable is measured, every weakness targeted, and every output is a direct result of intentional input.
                </p>
                <p className="font-sans text-sm text-zinc-400 leading-relaxed font-medium">
                  That same rigorous methodology applies to building businesses and constructing resilient personal brand equities.
                </p>
              </FrostedGlassPanel>

              {/* Right Column: The Intent */}
              <FrostedGlassPanel className="p-8 md:p-12 border border-zinc-800 bg-zinc-950/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 border-b border-zinc-800 pb-6 mb-6">
                    <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center font-mono text-xs text-zinc-500">
                      02
                    </div>
                    <h3 className="font-serif text-2xl italic text-zinc-100">
                      The Intent
                    </h3>
                  </div>

                  <p className="font-sans text-sm text-zinc-400 leading-relaxed mb-8">
                    I am building toward a practice focused on helping ambitious founders, creators, and athletes establish and leverage their unique brand equity. This is not high-level theoretical advice; it is absolute operational discipline applied directly to modern brand architecture.
                  </p>
                </div>

                {/* Status Block */}
                <div className="p-4 bg-[#09090b]/80 border border-zinc-800 rounded-sm flex items-center gap-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase">
                    Active playbook development &amp; in-market verification.
                  </span>
                </div>
              </FrostedGlassPanel>

            </div>
          </div>
        </section>

        {/* Case Studies Section (Execution & Verification) */}
        <CaseStudies />

        {/* Capabilities Section */}
        <section id="capabilities" className="relative py-24 md:py-32 border-t border-zinc-900 bg-[#09090b]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              
              {/* Left Side: Header & Context */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase mb-3">
                    TACTICAL RANGE
                  </p>
                  <h2 className="font-serif text-4xl md:text-5xl italic text-zinc-100 mb-6">
                    Capabilities
                  </h2>
                  <p className="font-sans text-sm text-zinc-400 leading-relaxed">
                    A focused, tactical stack of disciplines designed to build, position, and scale premium personal and institutional brands. Click on any discipline to reveal its mechanical focus.
                  </p>
                </div>

                <div className="hidden lg:block border-t border-zinc-900 pt-8 mt-8">
                  <div className="font-mono text-[9px] text-zinc-600 tracking-widest uppercase">
                    PROTOCOL INTAKE // STACK v2.16
                  </div>
                </div>
              </div>

              {/* Right Side: Interactive Stack */}
              <div className="lg:col-span-7 space-y-4">
                {capabilities.map((cap) => {
                  const IconComponent = cap.icon;
                  const isActive = activeCapability === cap.id;

                  return (
                    <div
                      key={cap.id}
                      onClick={() => setActiveCapability(cap.id)}
                      className={`group p-6 border rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                        isActive
                          ? "bg-zinc-900/40 border-zinc-700/80 shadow-[0_0_20px_rgba(255,255,255,0.01)]"
                          : "bg-transparent border-zinc-850 hover:border-zinc-800"
                      }`}
                    >
                      {/* Left side thin selection line */}
                      {isActive && (
                        <div className="absolute left-0 inset-y-0 w-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-sm border transition-colors ${
                            isActive 
                              ? "border-red-500/20 bg-red-500/5 text-red-500" 
                              : "border-zinc-800 text-zinc-500 group-hover:text-zinc-300 group-hover:border-zinc-700"
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <h3 className={`font-mono text-xs tracking-widest font-semibold transition-colors ${
                            isActive ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
                          }`}>
                            {cap.name}
                          </h3>
                        </div>
                        <span className={`font-mono text-[9px] text-zinc-600 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                          {isActive ? "[ ACTIVE ]" : "[ ACTIVATE ]"}
                        </span>
                      </div>

                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className="font-sans text-xs md:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-4">
                              {cap.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* Stateful secure contact gateway */}
        <ContactForm />

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#09090b] border-t border-zinc-900/80 py-16 md:py-24 relative overflow-hidden">
        
        {/* Decorative ambient footer glow */}
        <div className="absolute right-0 bottom-0 w-[400px] h-[300px] rounded-full bg-red-600/[0.02] blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center">
            
            {/* Giant brand name representation */}
            <div className="md:col-span-4 flex flex-col justify-center">
              <div className="font-sans font-black text-4xl md:text-5xl text-zinc-800/15 tracking-tighter leading-none select-none uppercase">
                HUMAN X
              </div>
              <div className="font-mono text-[9px] text-zinc-600 tracking-widest mt-3 uppercase">
                SILENT PRECISION CORE // OPERATIONAL EST. 2024
              </div>
            </div>

            {/* Mid text */}
            <div className="md:col-span-5 max-w-md">
              <p className="font-sans text-xs md:text-sm text-zinc-400 leading-relaxed mb-6">
                Whether you want to discuss category positioning, secure athletic brand advisory, or hybrid sports training—reach out to arrange a secure protocol intake.
              </p>
              
              {/* Contact anchors */}
              <div className="flex gap-6 font-mono text-[10px] tracking-wider">
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>LINKEDIN</span>
                </a>
                <a 
                  href="mailto:raptor.akki.64@gmail.com"
                  className="text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>EMAIL GATEWAY</span>
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="md:col-span-3 md:text-right flex flex-col justify-center">
              <span className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase">
                &copy; {new Date().getFullYear()} HUMAN X
              </span>
              <span className="font-mono text-[8px] text-zinc-600 tracking-widest uppercase mt-1">
                ALL OPERATIONAL RIGHTS RESERVED
              </span>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
