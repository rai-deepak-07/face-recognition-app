import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { successToast, errorToast, dismissToast, loadingToast } from "../utils/toast";

import api from "../services/api";

// 1. INJECT CUSTOM CSS FOR ANIMATION (Add this to your index.css or a dedicated CSS file)
/*
@keyframes meshFloat {
  0% { opacity: 0.1; transform: translate(0px, 0px) scale(1); }
  25% { opacity: 0.3; transform: translate(10px, -15px) scale(1.02); }
  50% { opacity: 0.2; transform: translate(-5px, 10px) scale(0.99); }
  75% { opacity: 0.3; transform: translate(-10px, -10px) scale(1.01); }
  100% { opacity: 0.1; transform: translate(0px, 0px) scale(1); }
}

@keyframes particleRun {
  0% { transform: translateY(0); opacity: 0.1; }
  5% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

.mesh-glow {
  filter: drop-shadow(0 0 10px rgba(167, 139, 250, 0.4));
}

.particle {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: particleRun linear infinite;
  pointer-events: none;
  opacity: 0;
}
*/

// 2. PARTICLE COMPONENT (Generates small moving light streaks)
const Particles = () => {
  const particleCount = 12;
  const particles = Array.from({ length: particleCount }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 1 + 'px',
    left: Math.random() * 100 + '%',
    delay: Math.random() * 8 + 's',
    duration: Math.random() * 4 + 4 + 's',
  }));

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: '-5px',
            animationDelay: p.delay,
            animationDuration: p.duration,
            boxShadow: '0 0 10px 1px rgba(255,255,255,0.7)',
          }}
        />
      ))}
    </div>
  );
};

// 3. MAIN COMPONENT (Updated with new background logic)
function Login() {
  const navigate = useNavigate();
  if (localStorage.getItem("access")) {
    window.location.href = "/dashboard";
    return;
  }

  const [formData, setFormData] = useState({
    username: "",
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

    const toastId = loadingToast("Verifying credentials...");
    try {
      const response = await api.post("/token/", formData);

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      
      dismissToast(toastId);
      successToast("Login successful");

      navigate("/dashboard");
    } catch (error) {
      dismissToast(toastId);
      errorToast(
        error.response?.data?.detail || "Invalid credentials"
      );
    }
  };



  return (
    /* NEW BACKGROUND IMPLEMENTATION:
      - relative is added here to contain absolute background elements.
      - bg-black is kept as the base layer.
    */
    <div className="relative h-[100dvh] w-full flex items-center justify-center bg-black text-zinc-100 px-4 antialiased selection:bg-violet-500/30 selection:text-violet-200 overflow-hidden select-none">
      
      {/* --- NEW ANIMATED BACKGROUND LAYER --- */}
      
      {/* A. Base subtle radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,10,60,0.4)_0%,rgba(0,0,0,1)_70%)] z-0" />

      {/* B. Floating Abstract Face Mesh SVG */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.15] scale-125 select-none pointer-events-none mesh-glow"
           style={{ animation: 'meshFloat 20s ease-in-out infinite' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full text-violet-600/30" fill="none" stroke="currentColor" strokeWidth="0.1">
          {/* Subtle Abstract Mesh structure */}
          <path d="M50,10 C60,10 70,15 75,25 C80,35 80,45 75,55 C70,65 60,70 50,70 C40,70 30,65 25,55 C20,45 20,35 25,25 C30,15 40,10 50,10 Z" />
          <path d="M35,40 C35,38 38,35 40,35 C42,35 45,38 45,40" />
          <path d="M55,40 C55,38 58,35 60,35 C62,35 65,38 65,40" />
          <path d="M45,55 C48,58 52,58 55,55" />
          {/* Connecting grid lines */}
          <line x1="25" y1="25" x2="75" y2="25" />
          <line x1="20" y1="45" x2="80" y2="45" />
          <line x1="25" y1="65" x2="75" y2="65" />
          <line x1="50" y1="10" x2="50" y2="90" strokeWidth="0.05" opacity="0.5" />
        </svg>
      </div>

      {/* C. Dynamic Falling Particles */}
      <Particles />

      {/* -------------------------------------- */}

      
      {/* CENTRAL BENTO CONTAINER (Added relative z-10 to stay above BG) */}
      <div className="relative z-10 w-full max-w-md bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 border border-zinc-800/60 p-6 sm:p-8 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-black/70 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        
        {/* BRAND LOGO */}
        <header className="mb-8 text-center">
          <div className="inline-block text-2xl font-black tracking-tighter bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent mb-2">
            FaceFatch
          </div>
          
          <h1 className="text-xl font-bold tracking-tight text-zinc-200">
            Welcome back
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Enter your credentials to sync your profile
          </p>
        </header>

        {/* AUTHENTICATION FORM */}
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
            Sign In
          </button>
        </form>

        {/* BOTTOM NAVIGATION LINKS */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-zinc-500">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="text-violet-400 font-medium hover:text-violet-300 transition-colors underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </footer>

      </div>
    </div>
  );
}

export default Login;