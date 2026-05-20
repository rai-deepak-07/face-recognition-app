import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "../pages/Register";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

import Navbar from "../components/Navbar";
import ProtectedRoute from "./ProtectedRoute";
import AlbumDetails from "../pages/AlbumDetails";

import SharePage from "../pages/SharePage";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>

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