import React from "react";
import { Link } from "react-router-dom";
import { Droplet, Heart, Phone, Mail, MapPin, ArrowUpRight, Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
    return (
        <footer className="relative bg-[#0a0a0f] text-white overflow-hidden">
            {/* Decorative orbs */}
            <div className="orb w-96 h-96 bg-crimson-600 -top-48 -left-48" />
            <div className="orb w-64 h-64 bg-orange-500 -bottom-32 -right-32" />

            {/* Noise overlay */}
            <div className="noise absolute inset-0" />

            <div className="relative z-10">
                {/* CTA Strip */}
                <div className="border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-3xl md:text-4xl font-display font-bold mb-2">
                                Ready to <span className="gradient-text">save a life</span>?
                            </h3>
                            <p className="text-white/50 text-lg">
                                Register as a donor today and join our community of heroes.
                            </p>
                        </div>
                        <Link
                            to="/register"
                            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-crimson-600 to-crimson-500 text-white font-semibold rounded-full shadow-2xl shadow-crimson-600/30 hover:shadow-crimson-500/50 hover:-translate-y-1 transition-all duration-300"
                        >
                            Become a Donor
                            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>
                </div>

                {/* Main footer grid */}
                <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <Droplet className="h-7 w-7 text-crimson-500" fill="currentColor" />
                            <span className="text-xl font-display font-bold tracking-tight">LifeStream</span>
                        </Link>
                        <p className="text-white/40 text-sm leading-relaxed mb-6">
                            Connecting donors with those in need. Every drop matters, every donor is a hero.
                        </p>
                        <div className="flex gap-3">
                            {[Github, Twitter, Instagram].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-crimson-600 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <Icon className="h-4 w-4 text-white/50 hover:text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/30 mb-5">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { to: "/about", label: "About Us" },
                                { to: "/find-donors", label: "Find Donors" },
                                { to: "/register", label: "Register" },
                                { to: "/contact", label: "Contact" },
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-white/50 hover:text-white text-sm transition-colors duration-300 flex items-center gap-1 group"
                                    >
                                        {link.label}
                                        <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/30 mb-5">
                            Resources
                        </h4>
                        <ul className="space-y-3">
                            {["Eligibility", "Blood Types Guide", "Donation Process", "Health Tips", "FAQs"].map(
                                (label) => (
                                    <li key={label}>
                                        <a
                                            href="#"
                                            className="text-white/50 hover:text-white text-sm transition-colors duration-300"
                                        >
                                            {label}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/30 mb-5">
                            Contact
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Phone className="h-4 w-4 text-crimson-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-white/70 text-sm font-medium">24/7 Emergency</p>
                                    <p className="text-white/40 text-xs">+91-1800-DONATE</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="h-4 w-4 text-crimson-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-white/70 text-sm font-medium">Email</p>
                                    <p className="text-white/40 text-xs">help@lifestream.org</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-crimson-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-white/70 text-sm font-medium">Headquarters</p>
                                    <p className="text-white/40 text-xs">Chandigarh, India</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/30 text-xs">
                            © 2024 LifeStream. All rights reserved. Every drop saves a life.
                        </p>
                        <div className="flex items-center gap-1 text-white/30 text-xs">
                            Made with <Heart className="h-3 w-3 text-crimson-500 mx-1 heartbeat" fill="currentColor" /> for humanity
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
