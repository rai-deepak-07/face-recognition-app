import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function FaceFetchLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // 1. Navbar style mutate tracking listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // 2. Automated Scroll Reveal Intersector Logic
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15, // Triggers when 15% of the element is visible
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target); // Animate once
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    // Select all animatable element nodes across sections
    const hiddenElements = document.querySelectorAll(
      ".reveal-hidden, .reveal-slide-left, .reveal-slide-right, .reveal-scale"
    );
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  // Smooth scroll click link routing intercept handler
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans antialiased selection:bg-violet-500/30 selection:text-violet-200 scroll-smooth relative">
      
      {/* ---------------- HARDWARE-ACCELERATED LAYER BACKDROPS ---------------- */}
      <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] aspect-square bg-violet-600/10 rounded-full blur-[120px] pointer-events-none z-0 animate-fade-load" />
      <div className="absolute top-[1400px] right-1/4 w-[400px] sm:w-[600px] aspect-square bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none z-0 animate-fade-load" />
      <div className="absolute bottom-[1000px] left-10 w-[300px] sm:w-[400px] aspect-square bg-fuchsia-600/5 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* --- SECTION 1: NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-zinc-950/80 border-b border-zinc-800/50 backdrop-blur-md py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Identity with custom inline vector framing */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" /><circle cx="12" cy="12" r="3" /></svg>
            </div>
            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              FaceFetch
            </span>
          </div>

          {/* Desktop Links Matrix */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#home" onClick={(e) => handleSmoothScroll(e, "home")} className="hover:text-white transition-colors">Home</a>
            <a href="#about" onClick={(e) => handleSmoothScroll(e, "about")} className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, "how-it-works")} className="hover:text-white transition-colors">How It Works</a>
            <a href="#use-cases" onClick={(e) => handleSmoothScroll(e, "use-cases")} className="hover:text-white transition-colors">Use Cases</a>
            <a href="#developer" onClick={(e) => handleSmoothScroll(e, "developer")} className="hover:text-white transition-colors">Developer</a>
          </div>

          {/* Desktop Right Hand Interaction Hub */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-4 py-2">
              Login
            </Link>
            <Link to="/register" className="text-sm font-bold bg-zinc-100 text-zinc-950 hover:bg-white px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]">
              Get Started
            </Link>
          </div>

          {/* Mobile Collapse Command Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        {/* Mobile Nav Overlay Canvas */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-zinc-950 border-b border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <a href="#home" onClick={(e) => handleSmoothScroll(e, "home")} className="text-zinc-300 font-medium">Home</a>
            <a href="#about" onClick={(e) => handleSmoothScroll(e, "about")} className="text-zinc-300 font-medium">Features</a>
            <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, "how-it-works")} className="text-zinc-300 font-medium">How It Works</a>
            <a href="#use-cases" onClick={(e) => handleSmoothScroll(e, "use-cases")} className="text-zinc-300 font-medium">Use Cases</a>
            <a href="#developer" onClick={(e) => handleSmoothScroll(e, "developer")} className="text-zinc-300 font-medium">Developer</a>
            <hr className="border-zinc-800 my-1" />
            <div className="flex flex-col gap-3">
              <Link to="/login" className="w-full text-center py-3 text-zinc-300 font-medium border border-zinc-800 roundedLink">
                Login
              </Link>
              <Link to="/register" className="w-full text-center py-3 bg-gradient-to-r from-violet-500 to-blue-600 font-bold text-white rounded-xl">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* --- SECTION 2: HERO SECTION --- */}
      <section id="home" className="relative pt-[16dvh] pb-16 lg:pt-[22dvh] lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 overflow-hidden">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 tracking-wide mb-6 opacity-0 animate-fade-load">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Next-Gen Biometric Image Delivery
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6 opacity-0 animate-text-load">
            Find Your Photos Instantly Using{" "}
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI Face Recognition
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl font-normal leading-relaxed mb-10 opacity-0 animate-text-load [animation-delay:150ms]">
            Upload event photos once and let everyone instantly discover their own memories with a simple face scan.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-20 opacity-0 animate-text-load [animation-delay:300ms]">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-500 via-blue-500 to-blue-600 hover:opacity-90 text-sm font-bold text-white rounded-2xl transition-all shadow-xl shadow-violet-500/10 active:scale-[0.99] flex items-center justify-center gap-2 group">
              Try Free Now
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-bold text-zinc-200 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.99]">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-400 fill-cyan-400"><path d="M8 5v14l11-7z" /></svg>
              Watch Demo
            </button>
          </div>
        </div>

        {/* --- HERO SCALE UP ENTRANCE REVEAL --- */}
        <div className="relative mx-auto max-w-5xl rounded-3xl border border-zinc-800/60 bg-zinc-900/20 p-2 sm:p-4 backdrop-blur-sm shadow-2xl shadow-black/80 animate-float-slow opacity-0 animate-fade-load [animation-delay:400ms]">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 via-transparent to-cyan-500/10 rounded-3xl opacity-30 pointer-events-none" />
          
          <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
            {/* Left Nav Pane */}
            <div className="lg:col-span-3 border-r border-zinc-900 p-4 bg-zinc-950 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <div className="h-8 w-full bg-violet-500/5 rounded-lg px-3 flex items-center text-[11px] font-bold text-violet-400 border border-violet-500/20">
                ✦ Main Workspace
              </div>
              <div className="h-8 w-4/5 bg-zinc-900/30 rounded-lg ml-2" />
              <div className="h-8 w-2/3 bg-zinc-900/30 rounded-lg ml-2" />
            </div>

            {/* Core Pipeline Console View */}
            <div className="lg:col-span-9 p-6 flex flex-col gap-6 bg-zinc-900/10 relative">
              <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 animate-scan-line pointer-events-none z-10" />

              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">Grand Wedding Album</h4>
                  <p className="text-[11px] text-zinc-500">1,240 Total Uploaded Photos</p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md font-semibold border border-emerald-500/20">
                  AI Active Indexing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-900/70 border border-zinc-800/80 p-4 rounded-xl flex flex-col items-center justify-center text-center min-h-[160px]">
                  <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-3 text-violet-400 relative">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" /></svg>
                    <div className="absolute inset-0 border border-violet-400 rounded-full animate-ping opacity-20" />
                  </div>
                  <span className="text-xs font-bold text-zinc-300">Face Scanning Module</span>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl overflow-hidden flex flex-col p-2">
                  <div className="w-full aspect-square rounded-lg bg-zinc-900 flex items-center justify-center relative">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-800" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-zinc-950/90 text-[9px] font-bold text-cyan-400 border border-cyan-500/20">Match: 99.4%</div>
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl overflow-hidden flex flex-col p-2">
                  <div className="w-full aspect-square rounded-lg bg-zinc-900 flex items-center justify-center relative">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-800" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-zinc-950/90 text-[9px] font-bold text-cyan-400 border border-cyan-500/20">Match: 98.9%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- COUNTERS REVEAL CARD LAYER --- */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto relative z-10 reveal-scale">
          <div className="bg-zinc-900/20 border border-zinc-800/40 p-6 rounded-2xl text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-white bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">10K+</div>
            <div className="text-xs text-zinc-500 font-medium mt-1 uppercase tracking-wider">Photos Processed</div>
          </div>
          <div className="bg-zinc-900/20 border border-zinc-800/40 p-6 rounded-2xl text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">500+</div>
            <div className="text-xs text-zinc-500 font-medium mt-1 uppercase tracking-wider">Albums Created</div>
          </div>
          <div className="bg-zinc-900/20 border border-zinc-800/40 p-6 rounded-2xl text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-white bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">99%</div>
            <div className="text-xs text-zinc-500 font-medium mt-1 uppercase tracking-wider">Matching Accuracy</div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: WHAT IS FACEFETCH (LEFT-TO-RIGHT SLIDES) --- */}
      <section id="about" className="py-20 border-t border-zinc-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 reveal-slide-left">
            <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">Core Infrastructure</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">Smart Gallery platform built for speed.</h2>
            <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
              FaceFetch is an AI-powered image sharing platform where users create albums, upload event images, and share a secure link. Receivers simply scan or upload their face to instantly view all matched photos from weddings, trips, college events, parties, and functions.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 reveal-slide-right">
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-400">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2" /></svg>
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mb-2">AI Face Detection</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Advanced biometric tracking isolates structural features securely.</p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mb-2">Instant Matching</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Sub-second clustering engines serve individual user matches instantly.</p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316" /></svg>
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mb-2">Smart Album Sharing</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">One structured cryptographic web access link rules the workspace.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: HOW IT WORKS TIMELINE (FADE-IN STAGGERED UP) --- */}
      <section id="how-it-works" className="py-20 border-t border-zinc-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 reveal-hidden">
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">Architecture Blueprint</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Four Steps to Automated Delivery</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 flex flex-col justify-between h-full reveal-hidden delay-100">
            <div>
              <div className="text-3xl font-black text-zinc-800 mb-4">01</div>
              <h3 className="text-base font-bold text-zinc-200 mb-1">Register and Login</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Setup your secure administrative profile credentials on the platform workspace panel.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 flex flex-col justify-between h-full reveal-hidden delay-200">
            <div>
              <div className="text-3xl font-black text-zinc-800 mb-4">02</div>
              <h3 className="text-base font-bold text-zinc-200 mb-1">Create Album &amp; Upload</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Establish album containers and dump high-resolution imagery assets directly into storage layers.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 flex flex-col justify-between h-full reveal-hidden delay-300">
            <div>
              <div className="text-3xl font-black text-zinc-800 mb-4">03</div>
              <h3 className="text-base font-bold text-zinc-200 mb-1">Share Generated Link</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Distribute a secure unified resource path to event managers, couples, or attendees via chat.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 flex flex-col justify-between h-full reveal-hidden [transition-delay:400ms]">
            <div>
              <div className="text-3xl font-black text-zinc-800 mb-4">04</div>
              <h3 className="text-base font-bold text-zinc-200 mb-1">Receiver Scans Face</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">End users follow the link, activate an instantaneous biometric sweep, and instantly get matched photos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: FEATURES GRID --- */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 reveal-hidden">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">System Framework</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Core System Capabilities</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs reveal-scale">
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/20 flex flex-col gap-1.5">
            <h3 className="font-bold text-zinc-200">AI Face Recognition</h3>
            <p className="text-zinc-500 leading-relaxed">State-of-the-art vector node mapping guarantees target match points across variable orientations.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/20 flex flex-col gap-1.5">
            <h3 className="font-bold text-zinc-200">Fast Image Matching</h3>
            <p className="text-zinc-500 leading-relaxed">Sub-second parallel calculations map individual faces against databases without indexing latency.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/20 flex flex-col gap-1.5">
            <h3 className="font-bold text-zinc-200">Secure Sharing Links</h3>
            <p className="text-zinc-500 leading-relaxed">Cryptographic endpoint generation locks private image paths tightly against directory scraping bots.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/20 flex flex-col gap-1.5">
            <h3 className="font-bold text-zinc-200">Unlimited Albums</h3>
            <p className="text-zinc-500 leading-relaxed">Scale deployment structures infinitely without checking against hard volumetric restrictions.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/20 flex flex-col gap-1.5">
            <h3 className="font-bold text-zinc-200">Real-Time Processing</h3>
            <p className="text-zinc-500 leading-relaxed">Pipeline logic queries files instantly as soon as active uploads strike network endpoints.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/20 flex flex-col gap-1.5">
            <h3 className="font-bold text-zinc-200">Mobile Friendly</h3>
            <p className="text-zinc-500 leading-relaxed">Responsive structural ergonomics promise fluid execution rates across handheld mobile devices.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/20 flex flex-col gap-1.5">
            <h3 className="font-bold text-zinc-200">Easy Event Sharing</h3>
            <p className="text-zinc-500 leading-relaxed">Distribute unique entry links via simple QR structures or standard context shares.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/20 flex flex-col gap-1.5">
            <h3 className="font-bold text-zinc-200">Free to Use</h3>
            <p className="text-zinc-500 leading-relaxed">Initiate event albums and track operational indexes without paying baseline costs up front.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/20 flex flex-col gap-1.5">
            <h3 className="font-bold text-zinc-200">Privacy Focused</h3>
            <p className="text-zinc-500 leading-relaxed">Facial mathematical coordinates remain encrypted; raw identification maps are wiped post session expiration.</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 6: USE CASES --- */}
      <section id="use-cases" className="py-20 border-t border-zinc-900 relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 reveal-hidden">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Versatile Environments</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Tailored Across Dynamic Event Scopes</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center reveal-hidden delay-100">
          <div className="p-5 rounded-xl border border-zinc-800/40 bg-zinc-900/15">
            <div className="text-rose-400 font-bold mb-1 text-sm">Weddings</div>
            <p className="text-[10px] text-zinc-500">Guests retrieve marriage assets directly.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-800/40 bg-zinc-900/15">
            <div className="text-violet-400 font-bold mb-1 text-sm">College Trips</div>
            <p className="text-[10px] text-zinc-500">Group travel pictures compiled effortlessly.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-800/40 bg-zinc-900/15">
            <div className="text-fuchsia-400 font-bold mb-1 text-sm">Birthday Parties</div>
            <p className="text-[10px] text-zinc-500">Instant extraction loops for friends.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-800/40 bg-zinc-900/15">
            <div className="text-cyan-400 font-bold mb-1 text-sm">Corporate Events</div>
            <p className="text-[10px] text-zinc-500">Professional networking media sharing.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-800/40 bg-zinc-900/15">
            <div className="text-blue-400 font-bold mb-1 text-sm">Family Functions</div>
            <p className="text-[10px] text-zinc-500">Generational memories gathered safely.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-800/40 bg-zinc-900/15">
            <div className="text-emerald-400 font-bold mb-1 text-sm">Photography</div>
            <p className="text-[10px] text-zinc-500">Automated client fulfillment systems.</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 7: WHY CHOOSE US (COMPARISON) --- */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/40 relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-16 reveal-hidden">
          <div className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-3">Workflow Comparison</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Traditional Sharing vs FaceFetch</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Traditional Box */}
          <div className="bg-zinc-900/20 border border-zinc-800/40 p-6 sm:p-8 rounded-2xl reveal-slide-left">
            <h3 className="text-base font-bold text-red-400 mb-6 flex items-center gap-2">
              ✕ Traditional Sharing Methods
            </h3>
            <ul className="space-y-4 text-xs sm:text-sm text-zinc-500 font-medium">
              <li className="flex items-start gap-2">▪ Manually searching hundreds of photos inside unstructured cloud folders.</li>
              <li className="flex items-start gap-2">▪ Sending heavy image packages individually over compression-heavy apps.</li>
              <li className="flex items-start gap-2">▪ Extremely time-consuming manual lookups tracking down particular shots.</li>
              <li className="flex items-start gap-2">▪ Missed photo opportunities because guests never get the root URLs.</li>
            </ul>
          </div>

          {/* FaceFetch Box */}
          <div className="bg-gradient-to-b from-zinc-900/60 to-zinc-900/10 border border-violet-500/20 p-6 sm:p-8 rounded-2xl reveal-slide-right">
            <h3 className="text-base font-bold text-violet-400 mb-6 flex items-center gap-2">
              ✓ FaceFetch AI Automation
            </h3>
            <ul className="space-y-4 text-xs sm:text-sm text-zinc-300 font-medium">
              <li className="flex items-start gap-2">▪ AI-powered system searches automatically isolate specific portrait matrices.</li>
              <li className="flex items-start gap-2">▪ Instant, localized personal gallery generation structures match items immediately.</li>
              <li className="flex items-start gap-2">▪ One centralized link covers safe distribution protocols for all attendees.</li>
              <li className="flex items-start gap-2">▪ Fast, completely automated framework pipeline executions save days of work.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- SECTION 8: FAKE TESTIMONIALS --- */}
      <section className="py-20 border-t border-zinc-900 relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 reveal-hidden">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">User Feedback</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Validated by Real Organizers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/10 border border-zinc-800/40 flex flex-col justify-between reveal-hidden delay-100">
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 italic">
              "We dropped FaceFetch onto a wedding with over 500 guests. Attendees were pulling their personal galleries within seconds of snapping faces."
            </p>
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Aria Montgomery</h4>
              <p className="text-[10px] text-zinc-500">Bespoke Wedding Director</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/10 border border-zinc-800/40 flex flex-col justify-between reveal-hidden delay-200">
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 italic">
              "The automated image delivery completely changed how we run corporate event coverage. No folder dig problems ever again."
            </p>
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Jonathan Briggs</h4>
              <p className="text-[10px] text-zinc-500">Lead Corporate Photographer</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/10 border border-zinc-800/40 flex flex-col justify-between reveal-hidden delay-300">
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 italic">
              "College festival media collection task complexities dissolved. 1,000+ students extracted their own profile images via the scan route."
            </p>
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Rahul Sharma</h4>
              <p className="text-[10px] text-zinc-500">Student Council Tech Chair</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 9: DEVELOPER DETAILS --- */}
      <section id="developer" className="py-20 border-t border-zinc-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 reveal-hidden">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">System Architect</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Behind the Platform Framework</h2>
        </div>

        <div className="max-w-2xl mx-auto bg-gradient-to-b from-zinc-900/40 to-zinc-900/10 border border-zinc-800/60 p-6 sm:p-10 rounded-3xl backdrop-blur-md flex flex-col sm:flex-row gap-8 items-center reveal-scale">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 via-blue-600 to-cyan-400 shrink-0 flex flex-col items-center justify-center font-black text-white text-xl shadow-lg">
            DR
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-zinc-100">Deepak Raikwar</h3>
            <p className="text-xs font-semibold text-violet-400 mt-1">Full Stack Developer | AI Enthusiast</p>
            
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mt-4 font-normal">
              Passionate about building AI-powered real-world solutions that simplify digital experiences. Focused on optimizing biometric matching loops and scalable database infrastructure layout nodes.
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4 justify-center sm:justify-start">
              {["React", "Django", "REST API", "Face Recognition", "Python", "PostgreSQL"].map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-5 mt-6 border-t border-zinc-900 pt-4 text-xs font-bold text-zinc-500">
              <span className="hover:text-white transition-colors cursor-pointer">GitHub</span>
              <span className="hover:text-white transition-colors cursor-pointer">LinkedIn</span>
              <span className="hover:text-white transition-colors cursor-pointer">Portfolio</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 10: CTA SECTION --- */}
      <section className="py-20 lg:py-28 border-t border-zinc-900 bg-zinc-950 relative overflow-hidden z-10 px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto rounded-3xl border border-zinc-800/60 bg-gradient-to-b from-zinc-900/50 to-zinc-900/10 p-8 sm:p-12 text-center backdrop-blur-xl relative z-10 reveal-scale">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Start Sharing Memories Smarter
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            Create your first AI-powered photo album today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-zinc-100 text-zinc-950 hover:bg-white font-bold text-sm rounded-xl transition-all active:scale-[0.98]">
              Launch App
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition-all active:scale-[0.98]">
              Create Free Album
            </button>
          </div>
          
          <div className="mt-8">
            <button className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors group">
              Open FaceFetch App
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* --- SECTION 11: FOOTER --- */}
      <footer id="contact" className="border-t border-zinc-900 bg-zinc-950 relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-zinc-900">
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-500 to-blue-500 flex items-center justify-center shadow">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2" /></svg>
              </div>
              <span className="text-base font-black tracking-tight text-white">FaceFetch</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Biometric image delivery pipeline built for fast automation. Streamlining event photoretrieval systems transparently via machine learning.
            </p>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-bold tracking-wider text-zinc-300 uppercase">Quick Links</h4>
            <div className="flex flex-col gap-2 text-xs text-zinc-500">
              <a href="#home" onClick={(e) => handleSmoothScroll(e, "home")} className="hover:text-zinc-300 transition-colors">Home</a>
              <a href="#about" onClick={(e) => handleSmoothScroll(e, "about")} className="hover:text-zinc-300 transition-colors">Features</a>
              <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, "how-it-works")} className="hover:text-zinc-300 transition-colors">How It Works</a>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-3">
            <h4 className="text-xs font-bold tracking-wider text-zinc-300 uppercase">Legal &amp; Support</h4>
            <div className="flex flex-col gap-2 text-xs text-zinc-500">
              <span className="hover:text-zinc-300 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-zinc-300 transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-zinc-300 transition-colors cursor-pointer">contact@facefetch.ai</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600 font-medium">
          <span>&copy; {new Date().getFullYear()} FaceFetch System Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Frontend: React + Tailwind CSS</span>
            <span className="hover:text-zinc-400 cursor-pointer">Backend: Django REST</span>
          </div>
        </div>
      </footer>

    </div>
  );
}