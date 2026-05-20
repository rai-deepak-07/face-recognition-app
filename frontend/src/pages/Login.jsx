import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { successToast, errorToast, dismissToast, loadingToast } from "../utils/toast";

import api from "../services/api";

function Login() {
  const navigate = useNavigate();

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
    /* CRITICAL FIXES applied here:
      - h-[100dvh] locks the boundaries precisely inside the real runtime screen window
      - overflow-hidden kills any accidental touch gesture scrolling entirely
    */
    <div className="h-[100dvh] w-full flex items-center justify-center bg-black text-zinc-100 px-4 antialiased selection:bg-violet-500/30 selection:text-violet-200 overflow-hidden select-none">
      
      {/* CENTRAL BENTO CONTAINER */}
      <div className="w-full max-w-md bg-gradient-to-b from-zinc-900/60 to-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        
        {/* BRAND LOGO */}
        <header className="mb-8 text-center">
          <div className="inline-block text-2xl font-black tracking-tighter bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent mb-2">
            FaceShare
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