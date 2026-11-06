import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function FullPageSpinner() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/10 border-t-crimson-500 rounded-full animate-spin" />
        </div>
    );
}

export default function ProtectedRoute({ children, role }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) return <FullPageSpinner />;
    if (!isAuthenticated) {
        return <Navigate to={role === "admin" ? "/admin-login" : "/login"} replace state={{ from: location.pathname }} />;
    }
    if (role === "admin" && !isAdmin) return <Navigate to="/dashboard" replace />;
    return children;
}
