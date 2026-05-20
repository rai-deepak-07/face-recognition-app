import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
// Tailwind configuration setup/theme extension or inline equivalents:
// bg-black | border-zinc-900 | text-amber-500

<nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black text-zinc-100 px-4 py-3.5">
  <div className="max-w-xl mx-auto flex items-center justify-between">
    
    <Link to="/dashboard" className="text-xl font-black tracking-tighter text-white hover:opacity-90 active:scale-95 transition-transform">
      FaceShare<span className="text-amber-500">.</span>
    </Link>

    <div className="flex items-center gap-5">
      {token ? (
        <>
          <Link to="/dashboard" className="text-xs font-medium tracking-widest text-zinc-500 hover:text-zinc-200 transition-colors uppercase">
            Dashboard
          </Link>
          <button onClick={handleLogout} className="text-xs font-medium tracking-widest text-red-400 hover:text-red-300 transition-colors uppercase">
            [ Logout ]
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="text-xs font-medium tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors uppercase">
            Login
          </Link>
          <Link to="/register" className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-bold text-black hover:bg-white active:scale-95">
            Register
          </Link>
        </>
      )}
    </div>
  </div>
</nav>
  );
}

export default Navbar;