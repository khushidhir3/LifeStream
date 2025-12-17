import React from "react";
import { Link } from "react-router-dom";
import {
    Heart,
    Target,
    Eye,
    Users,
    Award,
    Shield,
    Clock,
    Droplet,
    TrendingUp
} from "lucide-react";

export default function About() {
    return (
        <div className="min-h-screen bg-white">

            {/* NAVBAR */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <Droplet className="h-8 w-8 text-red-600" fill="currentColor" />
                            <span className="text-2xl font-bold text-gray-900">LifeStream</span>
                        </div>

                        {/* Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-gray-700 hover:text-red-600">Home</Link>
                            <Link to="/about" className="text-red-600 font-medium">About</Link>
                            <Link to="/contact" className="text-gray-700 hover:text-red-600">Contact</Link>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center space-x-3">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md"
                            >
                                Register as Donor
                            </Link>
                        </div>

                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="bg-gradient-to-br from-red-50 via-white to-red-50 py-20">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        About <span className="text-red-600">LifeStream</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        Connecting blood donors with patients in need. One donation can save multiple lives.
                    </p>
                </div>
            </section>

            {/* VALUES */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                    <Value icon={Heart} title="Compassion" />
                    <Value icon={Shield} title="Trust & Safety" />
                    <Value icon={Users} title="Community" />
                    <Value icon={TrendingUp} title="Innovation" />
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-white py-10 text-center">
                <p className="text-gray-400">
                    © 2024 LifeStream. Saving lives, one donation at a time.
                </p>
            </footer>
        </div>
    );
}

/* Small helper component */
function Value({ icon: Icon, title }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow text-center">
            <Icon className="h-10 w-10 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold">{title}</h3>
        </div>
    );
}
