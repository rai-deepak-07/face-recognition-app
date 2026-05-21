import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Register from "../pages/Register";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

import Navbar from "../components/Navbar";
import ProtectedRoute from "./ProtectedRoute";
import AlbumDetails from "../pages/AlbumDetails";

import SharePage from "../pages/SharePage";
import FaceFetchLanding from "../pages/FaceFetchLanding";

// Component wrapper to hide navbar on specific pages
function NavigationLayout() {
  const location = useLocation();
  
  // Hide global navbar on Landing page and public Share pages
  const hideNavbarOn = ["/", "/share"];
  const shouldHide = hideNavbarOn.some(path => 
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)
  );

  return !shouldHide ? <Navbar /> : null;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      {/* Handled dynamically by location state */}
      <NavigationLayout />
      
      <Routes>
        <Route
          path="/"
          element={<FaceFetchLanding />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/share/:token"
          element={<SharePage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/albums/:id"
          element={
            <ProtectedRoute>
              <AlbumDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;