import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Heart, Droplet, Users, Clock, Award,
    Phone, MapPin, Activity
} from "lucide-react";

export default function Homepage() {
    const [stats, setStats] = useState({
        donors: 0,
        livesSaved: 0,
        hospitals: 0,
    });

    useEffect(() => {
        const animate = (key, end) => {
            let current = 0;
            const step = Math.ceil(end / 60);
            const timer = setInterval(() => {
                current += step;
                if (current >= end) {
                    current = end;
                    clearInterval(timer);
                }
                setStats(prev => ({ ...prev, [key]: current }));
            }, 30);
        };

        animate("donors", 15847);
        animate("livesSaved", 42391);
        animate("hospitals", 156);
    }, []);

    const urgentRequests = [
        { id: 1, type: "A+", location: "City Hospital", time: "2 hours ago", critical: true },
        { id: 2, type: "O-", location: "Medical Center", time: "45 mins ago", critical: true },
        { id: 3, type: "B+", location: "General Hospital", time: "1 hour ago", critical: false },
    ];

    const benefits = [
        { icon: Heart, title: "Save Lives", desc: "One donation can save up to 3 lives" },
        { icon: Activity, title: "Health Benefits", desc: "Improves cardiovascular health" },
        { icon: Award, title: "Recognition", desc: "Earn badges & certificates" },
        { icon: Users, title: "Community", desc: "Join thousands of heroes" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50">

            {/* NAVBAR */}
            <nav className="bg-white shadow sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Droplet className="h-8 w-8 text-red-600" fill="currentColor" />
                        <span className="text-2xl font-bold">LifeStream</span>
                    </div>

                    <div className="hidden md:flex gap-8">
                        <Link to="/" className="hover:text-red-600">Home</Link>
                        <Link to="/about" className="hover:text-red-600">About</Link>
                        <Link to="/contact" className="hover:text-red-600">Contact</Link>
                    </div>

                    <div className="flex gap-3">
                        <Link to="/login" className="text-red-600 font-medium">
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 className="text-6xl font-bold leading-tight">
                        Donate Blood, <span className="text-red-600">Save Lives</span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-600">
                        One donation can be someone’s second chance at life.
                    </p>

                    <div className="mt-8 flex gap-4">
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-red-600 text-white rounded-lg font-semibold shadow-lg hover:bg-red-700"
                        >
                            Become a Donor
                        </Link>
                        <Link
                            to="/contact"
                            className="px-8 py-4 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                        >
                            Request Blood
                        </Link>
                    </div>
                </div>

                {/* URGENT REQUESTS */}
                <div className="bg-red-600 rounded-3xl p-6 shadow-2xl">
                    <div className="bg-white rounded-2xl p-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <Clock className="text-red-600" /> Urgent Requests
                        </h3>

                        {urgentRequests.map(req => (
                            <div key={req.id} className="flex justify-between p-4 bg-gray-50 rounded-xl mb-3">
                                <div>
                                    <p className="font-bold">{req.type}</p>
                                    <p className="text-sm text-gray-500">{req.location}</p>
                                </div>
                                {req.critical && (
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">
                    CRITICAL
                  </span>
                                )}
                            </div>
                        ))}

                        <Link
                            to="/contact"
                            className="block mt-4 text-center bg-red-600 text-white py-3 rounded-lg"
                        >
                            View All Requests
                        </Link>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">
                    <div>
                        <p className="text-5xl font-bold text-red-600">{stats.donors.toLocaleString()}</p>
                        <p>Registered Donors</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold text-red-600">{stats.livesSaved.toLocaleString()}</p>
                        <p>Lives Saved</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold text-red-600">{stats.hospitals}</p>
                        <p>Partner Hospitals</p>
                    </div>
                </div>
            </section>

            {/* BENEFITS */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-center">
                    {benefits.map((b, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow">
                            <b.icon className="h-10 w-10 text-red-600 mx-auto mb-4" />
                            <h3 className="font-bold text-lg">{b.title}</h3>
                            <p className="text-gray-600">{b.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-white py-10">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-6">
                    <div>
                        <h3 className="font-bold text-xl mb-2">LifeStream</h3>
                        <p className="text-gray-400">Saving lives, one drop at a time.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">Quick Links</h4>
                        <Link to="/about" className="block text-gray-400">About</Link>
                        <Link to="/contact" className="block text-gray-400">Contact</Link>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">Contact</h4>
                        <p className="text-gray-400 flex items-center gap-2">
                            <Phone className="h-4 w-4" /> +1-800-DONATE
                        </p>
                        <p className="text-gray-400 flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> 24/7 Emergency
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
