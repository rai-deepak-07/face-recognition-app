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

        <Link to="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" /><circle cx="12" cy="12" r="3" /></svg>
            </div>
            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              FaceFetch
            </span>
          </div>
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