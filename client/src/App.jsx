import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

/* STATE */
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import RequestBlood from "./pages/RequestBlood.jsx";
import { TermsPage, PrivacyPage } from "./pages/Legal.jsx";

function PublicLayout({ children }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

export default function App() {
    return (
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <ScrollToTop />
                    <Routes>
                        {/* PUBLIC PAGES WITH NAVBAR + FOOTER */}
                        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                        <Route path="/home" element={<Navigate to="/" replace />} />
                        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
                        <Route path="/find-donors" element={<PublicLayout><FindDonorsPage /></PublicLayout>} />
                        <Route path="/request-blood" element={<PublicLayout><RequestBlood /></PublicLayout>} />
                        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
                        <Route path="/register" element={<PublicLayout><DonorRegistrationForm /></PublicLayout>} />
                        <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
                        <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />

                        {/* AUTH PAGES (no shared navbar) */}
                        <Route path="/login" element={<UserLogin />} />
                        <Route path="/admin-login" element={<AdminLogin />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* DASHBOARDS (signed-in only) */}
                        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                        <Route path="/user-dashboard" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

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
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    );
}
