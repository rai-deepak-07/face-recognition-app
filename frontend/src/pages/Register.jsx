import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

function Register() {
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
    <div className="h-[100dvh] w-full flex items-center justify-center bg-black text-zinc-100 px-4 antialiased selection:bg-violet-500/30 selection:text-violet-200 overflow-hidden select-none">
      
      {/* CENTRAL BENTO CONTAINER */}
      <div className="w-full max-w-md bg-gradient-to-b from-zinc-900/60 to-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        
        {/* BRAND BRANDING */}
        <header className="mb-8 text-center">
          <div className="inline-block text-2xl font-black tracking-tighter bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent mb-2">
            FaceShare
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