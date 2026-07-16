import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* LAYOUT */
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

/* PAGES */
import HomePage from "./pages/Home.jsx";
import AboutPage from "./pages/About.jsx";
import FindDonorsPage from "./pages/FindDonors.jsx";
import ContactPage from "./pages/Contact.jsx";
import UserLogin from "./pages/UserLoginPage.jsx";
import AdminLogin from "./pages/AdminLoginPage.jsx";
import DonorRegistrationForm from "./pages/DonorRegistrationForm.jsx";
import UserDashboard from "./pages/user_dashboard.jsx";
import AdminDashboard from "./pages/admin_dashboard.jsx";

function PublicLayout({ children }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* PUBLIC PAGES WITH NAVBAR + FOOTER */}
                <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                <Route path="/home" element={<PublicLayout><HomePage /></PublicLayout>} />
                <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
                <Route path="/find-donors" element={<PublicLayout><FindDonorsPage /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><DonorRegistrationForm /></PublicLayout>} />

                {/* AUTH PAGES (no shared navbar) */}
                <Route path="/login" element={<UserLogin />} />
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* DASHBOARD PAGES (no shared navbar) */}
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                {/* 404 */}
                <Route
                    path="*"
                    element={
                        <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white">
                            <p className="text-8xl font-display font-black gradient-text mb-4">404</p>
                            <p className="text-white/50 text-lg mb-8">Page not found</p>
                            <a href="/" className="px-6 py-3 bg-crimson-600 rounded-full text-sm font-semibold hover:bg-crimson-500 transition-all duration-300">
                                Go Home
                            </a>
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
