import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

function Register() {
  if (localStorage.getItem("access")) {
    window.location.href = "/dashboard";
    return;
  }

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("users/register/", formData);
      successToast("Registration Successful");
    } catch (error) {
      console.log(error.response?.data);
      errorToast(
        `Registration Failed: ${error.response?.data?.detail || "Unknown error"}`
      );
    }
  };

  return (
    /* FIXED VIEWPORT GATEWAY: 
        h-[100dvh] and overflow-hidden prevent mobile browser bars 
        from breaking the layout or triggering page bounces.
    */
    <div className="relative h-[100dvh] w-full flex items-center justify-center bg-zinc-950 text-zinc-100 px-4 antialiased selection:bg-violet-500/30 selection:text-violet-200 overflow-hidden select-none">
      
      {/* ------------------- FULL PAGE SCREEN-WIDE AI SCAN BG ------------------- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* A. Screen-Wide Matrix Geometric Blueprint */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.08)_1px,transparent_1px)] bg-[size:32px_32px] sm:bg-[size:48px_48px]" />
        
        {/* B. Dynamic Vignette Contrast Map */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.4)_0%,rgba(9,9,11,1)_90%)]" />

        {/* C. Full Viewport Biometric Interface Vector Map */}
        <div className="absolute inset-0 w-full h-full p-4 sm:p-12 opacity-30 animate-blueprint will-change-transform">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-violet-500/40" fill="none" stroke="currentColor" strokeWidth="0.05">
            {/* Corner Structural Calibration Marks */}
            <path d="M 2,10 L 2,2 L 10,2 M 98,10 L 98,2 L 90,2 M 2,90 L 2,98 L 10,98 M 98,90 L 98,98 L 90,98" strokeWidth="0.2" className="text-violet-400" />
            
            {/* Global Target Intersects */}
            <circle cx="50" cy="50" r="40" strokeDasharray="1 2" />
            <circle cx="50" cy="50" r="25" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="10" strokeDasharray="0.5 1" />
            
            {/* Diagnostic Linear Traces */}
            <line x1="0" y1="50" x2="100" y2="50" strokeDasharray="2 4" strokeWidth="0.1" className="text-zinc-800" />
            <line x1="50" y1="0" x2="50" y2="100" strokeDasharray="2 4" strokeWidth="0.1" className="text-zinc-800" />
            
            {/* Abstract Biometric Node Poly-Lines */}
            <path d="M 15,20 L 35,15 L 50,30 L 65,15 L 85,20 L 75,50 L 50,75 L 25,50 Z" strokeWidth="0.08" />
            <path d="M 25,50 L 38,45 L 50,60 L 62,45 L 75,50" strokeWidth="0.08" />
            <path d="M 38,45 L 50,30 L 62,45" strokeWidth="0.08" />

            {/* AI Node Clusters */}
            <circle cx="50" cy="30" r="0.4" fill="currentColor" className="text-fuchsia-400" />
            <circle cx="38" cy="45" r="0.4" fill="currentColor" className="text-violet-400" />
            <circle cx="62" cy="45" r="0.4" fill="currentColor" className="text-violet-400" />
            <circle cx="25" cy="50" r="0.4" fill="currentColor" className="text-violet-400" />
            <circle cx="75" cy="50" r="0.4" fill="currentColor" className="text-violet-400" />
            <circle cx="50" cy="60" r="0.4" fill="currentColor" className="text-fuchsia-400" />
            <circle cx="50" cy="75" r="0.4" fill="currentColor" className="text-fuchsia-400" />
          </svg>
        </div>

        {/* D. Full Page Sweeping Laser Beam */}
        <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-fuchsia-500 via-violet-400 to-transparent opacity-0 animate-full-scan will-change-transform laser-glow" />
      </div>
      {/* ------------------------------------------------------------------------ */}

      {/* CENTRAL BENTO CONTAINER */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900/60 border border-zinc-800/50 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        
        {/* BRAND BRANDING */}
        <header className="mb-8 text-center">
          <div className="inline-block text-2xl font-black tracking-tighter bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent mb-2">
            FaceFetch
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-200">
            Create an index
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Join the decentralized biometric asset vault
          </p>
        </header>

        {/* REGISTRATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* USERNAME BOX INPUT */}
          <div className="group relative flex rounded-2xl bg-zinc-950/60 border border-zinc-800/80 transition-all duration-300 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-transparent px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
              required
            />
          </div>

          {/* EMAIL BOX INPUT */}
          <div className="group relative flex rounded-2xl bg-zinc-950/60 border border-zinc-800/80 transition-all duration-300 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
              required
            />
          </div>

          {/* PASSWORD BOX INPUT */}
          <div className="group relative flex rounded-2xl bg-zinc-950/60 border border-zinc-800/80 transition-all duration-300 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-transparent px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
              required
            />
          </div>

          {/* ACTION HUB SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full mt-2 rounded-xl bg-zinc-100 py-3.5 text-center text-sm font-bold text-black transition-all duration-200 hover:bg-white active:scale-[0.98] shadow-lg shadow-white/5"
          >
            Create Account
          </button>
        </form>

        {/* BOTTOM NAVIGATION LINKS */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-zinc-500">
            Already have an active profile node?{" "}
            <Link
              to="/login"
              className="text-violet-400 font-medium hover:text-violet-300 transition-colors underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </footer>

      </div>
    </div>
  );
}

export default Register;