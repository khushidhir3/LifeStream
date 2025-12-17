import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* PAGES */
import HomePage from "./pages/Home.jsx";
import UserLogin from "./pages/UserLoginPage.jsx";
import AdminLogin from "./pages/AdminLoginPage.jsx";
import DonorRegistrationForm from "./pages/DonorRegistrationForm.jsx";
import ContactPage from "./pages/Contact.jsx";
import UserDashboard from "./pages/user_dashboard.jsx";
import AdminDashboard from "./pages/admin_dashboard.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* DEFAULT → HOME */}
                <Route path="/" element={<HomePage />} />

                {/* AUTH */}
                <Route path="/login" element={<UserLogin />} />
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* PUBLIC */}
                <Route path="/register" element={<DonorRegistrationForm />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* USER */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/dashboard" element={<UserDashboard />} />

                {/* ADMIN */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                {/* 404 */}
                <Route
                    path="*"
                    element={
                        <div className="min-h-screen flex items-center justify-center text-xl">
                            404 | Page Not Found
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
