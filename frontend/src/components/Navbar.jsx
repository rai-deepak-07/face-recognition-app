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

    <nav className="bg-gray-800 text-white px-8 py-4 flex justify-between items-center">

      <Link
        to="/dashboard"
        className="text-2xl font-bold"
      >
        FaceShare
      </Link>

      <div className="flex gap-6 items-center">

        {token ? (
          <>
            <Link
              to="/dashboard"
              className="hover:text-blue-400"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hover:text-blue-400"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="hover:text-blue-400"
            >
              Register
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;