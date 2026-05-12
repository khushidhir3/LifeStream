import React, { useState } from "react";
import { 
    Heart, Droplet, Users, Clock, Award, Shield, 
    QrCode, ChevronRight, Activity, Star
} from "lucide-react";

export default function UserDashboard() {
    const [isCardFlipped, setIsCardFlipped] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                        <Heart className="text-red-600 h-8 w-8" />
                    </div>
                    Donor Portal
                </h1>
                <button className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200">
                    Logout
                </button>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: ID Card & Gamification */}
                <div className="space-y-8">
                    
                    {/* DIGITAL ID CARD (Glassmorphism) */}
                    <div className="relative group" style={{ perspective: '1000px' }}>
                        <div 
                            onClick={() => setIsCardFlipped(!isCardFlipped)}
                            className="relative w-full h-64 transition-all duration-700 cursor-pointer"
                            style={{ 
                                transformStyle: 'preserve-3d',
                                transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                            }}
                        >
                            {/* FRONT OF CARD */}
                            <div 
                                className="absolute inset-0 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col justify-between"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9), rgba(153, 27, 27, 0.95))',
                                    backdropFilter: 'blur(10px)',
                                    backfaceVisibility: 'hidden'
                                }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                
                                <div className="flex justify-between items-start z-10 text-white">
                                    <div>
                                        <h2 className="text-sm uppercase tracking-wider font-semibold opacity-80">LifeStream Donor</h2>
                                        <p className="text-2xl font-bold mt-1">Suresh Rao</p>
                                    </div>
                                    <Droplet className="h-10 w-10 opacity-50" />
                                </div>

                                <div className="z-10 flex justify-between items-end text-white">
                                    <div>
                                        <p className="text-sm opacity-80 mb-1">Blood Type</p>
                                        <p className="text-6xl font-black drop-shadow-md tracking-tighter">O-</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-white p-2 rounded-xl inline-block mb-2 shadow-inner">
                                            <QrCode className="h-12 w-12 text-red-700" />
                                        </div>
                                        <p className="text-xs font-mono opacity-80 font-semibold tracking-wider">LS-849201</p>
                                    </div>
                                </div>
                            </div>

                            {/* BACK OF CARD */}
                            <div 
                                className="absolute inset-0 rounded-3xl p-6 shadow-2xl bg-gray-900 text-white flex flex-col justify-center items-center border border-gray-800"
                                style={{ 
                                    transform: 'rotateY(180deg)',
                                    backfaceVisibility: 'hidden'
                                }}
                            >
                                <Shield className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="font-bold text-xl text-red-500 mb-1">Emergency Info</h3>
                                <div className="w-12 h-1 bg-red-600 rounded-full mb-4"></div>
                                <p className="text-sm text-gray-300 font-medium">Allergies: None</p>
                                <p className="text-sm text-gray-300 font-medium">Contact: +91 98765 43210</p>
                                <p className="text-xs text-gray-500 mt-6 text-center italic">Scan QR code on front for full medical history.</p>
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-4 font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
                            <span className="w-8 h-px bg-gray-300"></span>
                            Click card to flip
                            <span className="w-8 h-px bg-gray-300"></span>
                        </p>
                    </div>

                    {/* GAMIFICATION: BADGES */}
                    <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full -mr-12 -mt-12 blur-xl"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Award className="text-yellow-500" /> Achievements
                            </h2>
                            <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">Level 4 Hero</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 relative z-10">
                            <div className="flex flex-col items-center transform hover:scale-105 transition">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-sm mb-3 border border-yellow-300">
                                    <Star className="h-8 w-8 text-yellow-600 drop-shadow-sm" fill="currentColor" />
                                </div>
                                <span className="text-xs font-bold text-center text-gray-800">First Blood</span>
                            </div>
                            <div className="flex flex-col items-center transform hover:scale-105 transition">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-sm mb-3 border border-red-300">
                                    <Activity className="h-8 w-8 text-red-600 drop-shadow-sm" />
                                </div>
                                <span className="text-xs font-bold text-center text-gray-800">3x Saver</span>
                            </div>
                            <div className="flex flex-col items-center opacity-50 grayscale transition hover:grayscale-0 hover:opacity-100 cursor-help" title="Locked: Complete 5 donations">
                                <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center shadow-inner mb-3 border border-gray-200">
                                    <Shield className="h-8 w-8 text-gray-400" />
                                </div>
                                <span className="text-xs font-bold text-center text-gray-500">Gold Hero</span>
                            </div>
                        </div>
                        
                        <div className="mt-8 relative z-10">
                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                <span>Progress to Gold Hero</span>
                                <span>3 / 5</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                                <div className="bg-gradient-to-r from-red-500 to-yellow-400 h-3 rounded-full relative" style={{ width: '60%' }}>
                                    <div className="absolute inset-0 bg-white opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,.15) 25%, rgba(255,255,255,.15) 50%, transparent 50%, transparent 75%, rgba(255,255,255,.15) 75%, rgba(255,255,255,.15) 100%)', backgroundSize: '20px 20px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Stats & Requests */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* STATS */}
                    <div className="grid sm:grid-cols-2 gap-5">
                        <StatCard icon={Heart} label="Lives Impacted" value="9" color="text-pink-600" bg="bg-pink-100" />
                        <StatCard icon={Droplet} label="Total Donations" value="3" color="text-red-600" bg="bg-red-100" />
                        <StatCard icon={Users} label="Community Rank" value="Top 15%" color="text-blue-600" bg="bg-blue-100" />
                        <StatCard icon={Clock} label="Next Eligible Date" value="Available Now" color="text-green-600" bg="bg-green-100" />
                    </div>

                    {/* ACTIONABLE REQUESTS */}
                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Urgent Matches Near You
                            </h2>
                            <button className="text-sm font-bold text-red-600 flex items-center gap-1 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                                View Map <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="group border-2 border-red-100 rounded-2xl p-6 hover:border-red-300 hover:shadow-xl hover:shadow-red-50 transition-all duration-300 bg-gradient-to-r from-red-50 to-white relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-5 items-center">
                                        <div className="h-16 w-16 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-2xl shadow-inner shadow-red-800">
                                            O-
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-xl mb-1">City General Hospital</p>
                                            <p className="text-sm text-red-600 font-bold flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" /> Critical Shortage • 2.4 km away
                                            </p>
                                        </div>
                                    </div>
                                    <button className="px-8 py-3.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200">
                                        Respond Now
                                    </button>
                                </div>
                            </div>

                            <div className="group border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300 bg-white">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-5 items-center">
                                        <div className="h-16 w-16 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center font-bold text-2xl border-2 border-gray-100 group-hover:bg-gray-100 transition">
                                            O-
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-xl mb-1">Apollo Clinic Center</p>
                                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" /> Routine Replenishment • 5.1 km away
                                            </p>
                                        </div>
                                    </div>
                                    <button className="px-8 py-3.5 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
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

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 flex items-center space-x-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className={`h-16 w-16 ${bg} rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition`}>
                <Icon className={`h-8 w-8 ${color}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-1">{label}</p>
                <p className="text-3xl font-black text-gray-900">{value}</p>
            </div>
        </div>
    );
}
