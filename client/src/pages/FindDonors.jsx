import React, { useState } from "react";
import { Search, MapPin, Droplet, Phone, Mail, Filter, X, User, Clock, Award, Navigation, Star, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function FindDonorsPage() {
    const pageRef = useScrollReveal();
    const [filters, setFilters] = useState({ bloodGroup: "", location: "", distance: "10", availability: "all" });
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    const donors = [
        { id: 1, name: "Rajesh Kumar", bloodGroup: "O+", location: "Sector 17, Chandigarh", distance: "2.3 km", phone: "+91 98765 43210", lastDonation: "90 days ago", donations: 12, availability: "Available", verified: true },
        { id: 2, name: "Priya Singh", bloodGroup: "A+", location: "Phase 7, Mohali", distance: "5.1 km", phone: "+91 98765 43211", lastDonation: "120 days ago", donations: 8, availability: "Available", verified: true },
        { id: 3, name: "Amit Sharma", bloodGroup: "B+", location: "Sector 22, Chandigarh", distance: "3.8 km", phone: "+91 98765 43212", lastDonation: "45 days ago", donations: 15, availability: "Not Available", verified: true },
        { id: 4, name: "Neha Patel", bloodGroup: "O+", location: "Sector 35, Chandigarh", distance: "4.2 km", phone: "+91 98765 43213", lastDonation: "95 days ago", donations: 6, availability: "Available", verified: false },
        { id: 5, name: "Vikram Reddy", bloodGroup: "AB+", location: "Phase 11, Mohali", distance: "7.5 km", phone: "+91 98765 43214", lastDonation: "100 days ago", donations: 20, availability: "Available", verified: true },
        { id: 6, name: "Sonia Verma", bloodGroup: "O-", location: "Sector 21, Panchkula", distance: "8.9 km", phone: "+91 98765 43215", lastDonation: "110 days ago", donations: 10, availability: "Available", verified: true },
    ];

    const filteredDonors = donors.filter(donor => {
        if (filters.bloodGroup && donor.bloodGroup !== filters.bloodGroup) return false;
        if (filters.availability !== "all" && donor.availability !== filters.availability) return false;
        if (searchQuery && !donor.name.toLowerCase().includes(searchQuery.toLowerCase()) && !donor.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div ref={pageRef} className="bg-[#0a0a0f] text-white overflow-hidden">

            {/* ═══════════ HERO + SEARCH ═══════════ */}
            <section className="relative pt-40 pb-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-crimson-600/10 rounded-full blur-[120px]" />
                </div>
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson-600/10 border border-crimson-600/20 mb-8">
                            <Search className="h-4 w-4 text-crimson-500" />
                            <span className="text-crimson-400 text-sm font-medium">Donor Search</span>
                        </div>
                        <h1 className="fade-up stagger-1 text-5xl md:text-7xl font-display font-black tracking-tight mb-4">
                            Find <span className="gradient-text">Donors</span>
                        </h1>
                        <p className="fade-up stagger-2 text-lg text-white/50 max-w-2xl mx-auto">
                            Search verified donors near you and connect with potential lifesavers.
                        </p>
                    </div>

                    {/* Search bar */}
                    <div className="fade-up stagger-3 max-w-4xl mx-auto">
                        <div className="glass rounded-2xl p-4">
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name or location..."
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-crimson-500 focus:ring-2 focus:ring-crimson-500/20 transition-all duration-300"
                                    />
                                </div>
                                <select
                                    value={filters.bloodGroup}
                                    onChange={(e) => setFilters(p => ({ ...p, bloodGroup: e.target.value }))}
                                    className="px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-crimson-500 transition-all duration-300 min-w-[160px]"
                                >
                                    <option value="">All Blood Types</option>
                                    {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-6 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${showFilters ? 'bg-crimson-600 text-white' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'}`}
                                >
                                    <Filter className="h-4 w-4" /> Filters
                                </button>
                            </div>

                            {showFilters && (
                                <div className="mt-4 pt-4 border-t border-white/10 grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Distance</label>
                                        <select value={filters.distance} onChange={(e) => setFilters(p => ({ ...p, distance: e.target.value }))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-crimson-500 transition-all duration-300">
                                            <option value="5">Within 5 km</option>
                                            <option value="10">Within 10 km</option>
                                            <option value="25">Within 25 km</option>
                                            <option value="50">Within 50 km</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Availability</label>
                                        <select value={filters.availability} onChange={(e) => setFilters(p => ({ ...p, availability: e.target.value }))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-crimson-500 transition-all duration-300">
                                            <option value="all">All Donors</option>
                                            <option value="Available">Available Only</option>
                                            <option value="Not Available">Not Available</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button onClick={() => { setFilters({ bloodGroup: "", location: "", distance: "10", availability: "all" }); setSearchQuery(""); }} className="w-full px-4 py-3 border border-white/10 text-white/60 rounded-xl hover:bg-white/5 transition-all duration-300 font-medium text-sm">
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ RESULTS ═══════════ */}
            <section className="py-12 pb-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-display font-bold">
                            <span className="text-crimson-500">{filteredDonors.length}</span> Donors Found
                        </h2>
                        <div className="flex items-center gap-2 text-white/30 text-sm">
                            <MapPin className="h-4 w-4" /> Sorted by distance
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDonors.map((donor, i) => (
                            <div key={donor.id} className={`fade-up stagger-${Math.min(i + 1, 6)} group relative p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden`}>
                                {/* Status indicator */}
                                <div className={`absolute top-0 left-0 right-0 h-0.5 ${donor.availability === 'Available' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`} />

                                {/* Header */}
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-crimson-500 to-crimson-700 flex items-center justify-center text-lg font-bold shadow-lg shadow-crimson-600/20">
                                        {donor.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display font-bold flex items-center gap-2">
                                            {donor.name}
                                            {donor.verified && (
                                                <Shield className="h-4 w-4 text-blue-400" fill="currentColor" />
                                            )}
                                        </h3>
                                        <p className="text-white/30 text-xs">ID: LS{donor.id.toString().padStart(4, "0")}</p>
                                    </div>
                                </div>

                                {/* Blood Type Badge */}
                                <div className="flex justify-center mb-5">
                                    <div className="px-8 py-3 bg-crimson-600 rounded-2xl shadow-lg shadow-crimson-600/30">
                                        <span className="text-3xl font-display font-black">{donor.bloodGroup}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="p-3 bg-white/[0.03] rounded-xl text-center border border-white/5">
                                        <Award className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                                        <p className="text-lg font-bold">{donor.donations}</p>
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Donations</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.03] rounded-xl text-center border border-white/5">
                                        <Clock className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                                        <p className="text-sm font-bold">{donor.lastDonation}</p>
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Last Donation</p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-center gap-2 text-white/50 text-sm">
                                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{donor.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Navigation className="h-3.5 w-3.5 text-crimson-500 flex-shrink-0" />
                                        <span className="text-crimson-400 text-sm font-semibold">{donor.distance} away</span>
                                    </div>
                                </div>

                                {/* Availability */}
                                <div className="mb-5">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${donor.availability === "Available" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-white/40 border border-white/10"}`}>
                                        {donor.availability}
                                    </span>
                                </div>

                                {/* Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="px-4 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-600/30 transition-all duration-300">
                                        <Phone className="h-4 w-4" /> Call
                                    </button>
                                    <button className="px-4 py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-emerald-600/30 transition-all duration-300">
                                        <Mail className="h-4 w-4" /> Email
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredDonors.length === 0 && (
                        <div className="text-center py-24">
                            <Droplet className="h-16 w-16 text-white/10 mx-auto mb-6" />
                            <h3 className="text-2xl font-display font-bold mb-3">No Donors Found</h3>
                            <p className="text-white/40 mb-8">Try adjusting your search criteria or filters</p>
                            <button
                                onClick={() => { setFilters({ bloodGroup: "", location: "", distance: "10", availability: "all" }); setSearchQuery(""); }}
                                className="px-8 py-4 bg-crimson-600 text-white rounded-xl font-semibold hover:bg-crimson-500 transition-all duration-300"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}