import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Droplet, Users, Clock, Award, Shield, QrCode, ChevronRight, Activity, Star, LogOut, Bell, Settings } from "lucide-react";

export default function UserDashboard() {
    const [isCardFlipped, setIsCardFlipped] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Top Bar */}
            <header className="glass-dark sticky top-0 z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Droplet className="h-6 w-6 text-crimson-500" fill="currentColor" />
                        <span className="font-display font-bold text-lg">Donor Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative">
                            <Bell className="h-5 w-5 text-white/60" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-crimson-500 rounded-full" />
                        </button>
                        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <Settings className="h-5 w-5 text-white/60" />
                        </button>
                        <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-crimson-600/20 text-crimson-400 rounded-xl hover:bg-crimson-600/30 transition-all text-sm font-medium">
                            <LogOut className="h-4 w-4" /> Logout
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">

                {/* LEFT: ID Card + Badges */}
                <div className="space-y-8">
                    {/* Flip Card */}
                    <div className="relative group" style={{ perspective: "1000px" }}>
                        <div onClick={() => setIsCardFlipped(!isCardFlipped)} className="relative w-full h-64 cursor-pointer transition-all duration-700" style={{ transformStyle: "preserve-3d", transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                            {/* Front */}
                            <div className="absolute inset-0 rounded-3xl p-6 overflow-hidden flex flex-col justify-between" style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.9), rgba(153,27,27,0.95))", backfaceVisibility: "hidden" }}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                                <div className="flex justify-between items-start z-10">
                                    <div>
                                        <h2 className="text-xs uppercase tracking-[0.2em] font-semibold opacity-70">LifeStream Donor</h2>
                                        <p className="text-2xl font-display font-bold mt-1">Suresh Rao</p>
                                    </div>
                                    <Droplet className="h-10 w-10 opacity-30" />
                                </div>
                                <div className="flex justify-between items-end z-10">
                                    <div>
                                        <p className="text-xs opacity-60 mb-1">Blood Type</p>
                                        <p className="text-6xl font-display font-black tracking-tighter drop-shadow-md">O-</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-white p-2 rounded-xl inline-block mb-2 shadow-inner">
                                            <QrCode className="h-12 w-12 text-crimson-700" />
                                        </div>
                                        <p className="text-[10px] font-mono opacity-60 tracking-widest">LS-849201</p>
                                    </div>
                                </div>
                            </div>
                            {/* Back */}
                            <div className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-center items-center border border-white/10 bg-[#111118]" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
                                <Shield className="h-10 w-10 text-white/20 mb-4" />
                                <h3 className="font-display font-bold text-lg text-crimson-400 mb-1">Emergency Info</h3>
                                <div className="w-10 h-0.5 bg-crimson-600 rounded-full mb-4" />
                                <p className="text-sm text-white/50">Allergies: None</p>
                                <p className="text-sm text-white/50">Contact: +91 98765 43210</p>
                                <p className="text-xs text-white/30 mt-6 italic text-center">Scan QR on front for full medical history</p>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-white/20 mt-3 uppercase tracking-widest">Click card to flip</p>
                    </div>

                    {/* Achievements */}
                    <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display font-bold flex items-center gap-2"><Award className="h-5 w-5 text-amber-400" /> Achievements</h2>
                            <span className="text-xs font-bold px-3 py-1.5 bg-crimson-600/20 text-crimson-400 rounded-full">Level 4</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: Star, label: "First Blood", color: "from-amber-400 to-yellow-500", unlocked: true },
                                { icon: Activity, label: "3x Saver", color: "from-crimson-500 to-rose-500", unlocked: true },
                                { icon: Shield, label: "Gold Hero", color: "from-gray-500 to-gray-600", unlocked: false },
                            ].map((b, i) => (
                                <div key={i} className={`flex flex-col items-center transition-transform duration-300 hover:scale-105 ${!b.unlocked ? "opacity-40 grayscale" : ""}`}>
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-2 shadow-lg`}>
                                        <b.icon className="h-7 w-7 text-white" fill={b.unlocked ? "currentColor" : "none"} />
                                    </div>
                                    <span className="text-[10px] font-bold text-center text-white/60">{b.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">
                                <span>Progress to Gold</span><span>3/5</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-crimson-500 to-amber-400 h-full rounded-full relative" style={{ width: "60%" }}>
                                    <div className="absolute inset-0 shimmer" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Stats + Requests */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { icon: Heart, label: "Lives Impacted", value: "9", color: "text-rose-400", bg: "bg-rose-500/10" },
                            { icon: Droplet, label: "Total Donations", value: "3", color: "text-crimson-400", bg: "bg-crimson-500/10" },
                            { icon: Users, label: "Community Rank", value: "Top 15%", color: "text-blue-400", bg: "bg-blue-500/10" },
                            { icon: Clock, label: "Next Eligible", value: "Available", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        ].map((s, i) => (
                            <div key={i} className="group flex items-center gap-5 p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 hover:-translate-y-1 cursor-default">
                                <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                    <s.icon className={`h-7 w-7 ${s.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1">{s.label}</p>
                                    <p className="text-2xl font-display font-black">{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Urgent Matches */}
                    <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-display font-bold">Urgent Matches Near You</h2>
                            <button className="text-xs font-bold text-crimson-400 flex items-center gap-1 hover:text-crimson-300 px-3 py-1.5 rounded-lg hover:bg-crimson-600/10 transition-all">
                                View Map <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="group p-6 rounded-2xl border border-crimson-600/20 bg-crimson-600/5 hover:bg-crimson-600/10 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-crimson-600" />
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-5 items-center">
                                        <div className="h-14 w-14 rounded-xl bg-crimson-600 text-white flex items-center justify-center font-display font-black text-xl shadow-lg shadow-crimson-600/30">O-</div>
                                        <div>
                                            <p className="font-display font-bold text-lg">City General Hospital</p>
                                            <p className="text-xs text-crimson-400 font-semibold flex items-center gap-1.5 mt-0.5">
                                                <Clock className="h-3 w-3" /> Critical Shortage • 2.4 km
                                            </p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-crimson-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-crimson-600/20 hover:bg-crimson-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                                        Respond Now
                                    </button>
                                </div>
                            </div>

                            <div className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-5 items-center">
                                        <div className="h-14 w-14 rounded-xl bg-white/5 text-white/50 flex items-center justify-center font-display font-bold text-xl border border-white/10">O-</div>
                                        <div>
                                            <p className="font-display font-bold text-lg">Apollo Clinic Center</p>
                                            <p className="text-xs text-white/40 font-medium flex items-center gap-1.5 mt-0.5">
                                                <Clock className="h-3 w-3" /> Routine • 5.1 km
                                            </p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 border border-white/10 text-white/60 rounded-xl font-bold text-sm hover:bg-white/5 hover:text-white transition-all duration-200">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
