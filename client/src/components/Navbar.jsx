import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Droplet, Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { user, isAdmin, isAuthenticated } = useAuth();
    const dashboardPath = isAdmin ? "/admin-dashboard" : "/dashboard";

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close the mobile menu after navigating.
    const [prevPath, setPrevPath] = useState(location.pathname);
    if (location.pathname !== prevPath) {
        setPrevPath(location.pathname);
        setMobileOpen(false);
    }

    const links = [
        { to: "/", label: "Home" },
        { to: "/about", label: "About" },
        { to: "/find-donors", label: "Find Donors" },
        { to: "/request-blood", label: "Request Blood" },
        { to: "/contact", label: "Contact" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "glass-dark shadow-2xl shadow-black/20 py-3"
                    : "bg-transparent py-5"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="relative">
                        <Droplet
                            className="h-8 w-8 text-crimson-500 transition-transform duration-300 group-hover:scale-110"
                            fill="currentColor"
                        />
                        <div className="absolute inset-0 bg-crimson-500/30 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <span className="text-2xl font-display font-bold text-white tracking-tight">
                        Life<span className="gradient-text">Stream</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                isActive(link.to)
                                    ? "text-white bg-white/10"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {link.label}
                            {isActive(link.to) && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-crimson-500 rounded-full" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-3">
                    {isAuthenticated ? (
                        <Link to={dashboardPath} className="flex items-center gap-2 pl-2 pr-5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-crimson-500 to-crimson-700 flex items-center justify-center text-xs font-bold">
                                {(user.firstName || user.email)[0].toUpperCase()}
                            </span>
                            <span className="text-sm font-semibold">{isAdmin ? "Admin panel" : "My dashboard"}</span>
                        </Link>
                    ) : (<>
                    <Link
                        to="/login"
                        className="px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white transition-colors duration-300"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="px-6 py-2.5 bg-gradient-to-r from-crimson-600 to-crimson-500 text-white text-sm font-semibold rounded-full hover:from-crimson-500 hover:to-crimson-400 transition-all duration-300 shadow-lg shadow-crimson-600/25 hover:shadow-crimson-500/40 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Become a Donor
                    </Link>
                    </>)}
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                    className="md:hidden text-white p-2"
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
                    mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="px-6 py-4 space-y-2 glass-dark mt-2 mx-4 rounded-2xl">
                    {links.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                                isActive(link.to)
                                    ? "text-white bg-white/10"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isAuthenticated ? (
                        <div className="pt-3 border-t border-white/10">
                            <Link to={dashboardPath} className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-gradient-to-r from-crimson-600 to-crimson-500 text-white rounded-xl">
                                <LayoutDashboard className="h-4 w-4" /> {isAdmin ? "Admin panel" : "My dashboard"}
                            </Link>
                        </div>
                    ) : (
                    <div className="flex gap-3 pt-3 border-t border-white/10">
                        <Link
                            to="/login"
                            className="flex-1 text-center px-4 py-3 text-sm font-semibold text-white/80 border border-white/10 rounded-xl hover:bg-white/5"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="flex-1 text-center px-4 py-3 text-sm font-semibold bg-gradient-to-r from-crimson-600 to-crimson-500 text-white rounded-xl"
                        >
                            Register
                        </Link>
                    </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
