import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
    Heart, Droplet, Users, Clock, Award, Phone, MapPin,
    Activity, ArrowRight, ArrowUpRight, ChevronRight,
    Zap, Shield, Star, TrendingUp, Globe
} from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { api, timeAgo } from "../lib/api";

/* ─── Animated Counter ─── */
function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const startTime = Date.now();
                    const animate = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * end));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return (
        <span ref={ref}>
            {count.toLocaleString()}{suffix}
        </span>
    );
}

/* ─── Floating Blood Cells (decorative) ─── */
function FloatingCells() {
    // Random positions are generated once per mount so re-renders don't move the cells.
    const [cells] = useState(() => [...Array(6)].map(() => ({
        size: 20 + Math.random() * 60,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 5 + Math.random() * 5,
        delay: Math.random() * 3,
    })));
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {cells.map((c, i) => (
                <div
                    key={i}
                    className="absolute rounded-full opacity-10"
                    style={{
                        width: `${c.size}px`,
                        height: `${c.size}px`,
                        background: `radial-gradient(circle, rgba(220,38,38,0.6), rgba(220,38,38,0.1))`,
                        left: `${c.left}%`,
                        top: `${c.top}%`,
                        animation: `float ${c.duration}s ease-in-out ${c.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}

export default function Homepage() {
    const pageRef = useScrollReveal();

    const [stats, setStats] = useState(null);
    const [urgentRequests, setUrgentRequests] = useState(null);

    useEffect(() => {
        api("/stats", { auth: false }).then(setStats).catch(() => setStats(null));
        api("/requests", { query: { limit: 3 }, auth: false })
            .then((r) => setUrgentRequests(r.data.map((x) => ({
                id: x.id, type: x.bloodType, location: `${x.hospital}, ${x.city}`, time: timeAgo(x.createdAt), critical: x.urgency === "critical",
            }))))
            .catch(() => setUrgentRequests([]));
    }, []);

    const benefits = [
        { icon: Heart, title: "Save Lives", desc: "A single donation can save up to 3 lives. Be someone's hero today.", color: "from-rose-500 to-crimson-600" },
        { icon: Activity, title: "Health Benefits", desc: "Regular donation reduces heart disease risk and stimulates new blood cell production.", color: "from-orange-500 to-amber-600" },
        { icon: Award, title: "Recognition", desc: "Earn badges, certificates, and climb the leaderboard as a lifesaving champion.", color: "from-yellow-500 to-orange-500" },
        { icon: Users, title: "Community", desc: "Join a growing network of compassionate donors in your city.", color: "from-crimson-500 to-rose-600" },
    ];

    const testimonials = [
        { name: "Dr. Priya Sharma", role: "Hematologist, PGI Chandigarh", quote: "LifeStream has revolutionized how we source blood for emergency surgeries. The response time has improved by 60%.", avatar: "PS" },
        { name: "Rajesh Kumar", role: "Regular Donor, 12 donations", quote: "The gamification aspect keeps me motivated. Seeing my 'Lives Impacted' counter go up is incredibly fulfilling.", avatar: "RK" },
        { name: "Anjali Gupta", role: "Blood Bank Manager", quote: "Managing inventory has never been easier. Real-time tracking and alerts have eliminated critical shortages.", avatar: "AG" },
    ];

    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    return (
        <div ref={pageRef} className="bg-[#0a0a0f] text-white overflow-hidden">

            {/* ═══════════ HERO SECTION ═══════════ */}
            <section className="relative min-h-screen flex items-center pt-24 pb-20">
                {/* Background effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-crimson-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px]" />
                    <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-crimson-800/10 rounded-full blur-[80px]" />
                </div>
                <FloatingCells />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Text */}
                    <div>
                        <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson-600/10 border border-crimson-600/20 mb-8">
                            <span className="w-2 h-2 bg-crimson-500 rounded-full animate-pulse" />
                            <span className="text-crimson-400 text-sm font-medium">
                                24/7 Emergency Blood Network
                            </span>
                        </div>

                        <h1 className="fade-up stagger-1 text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-[1.05] tracking-tight">
                            Donate Blood,
                            <br />
                            <span className="gradient-text">Save Lives.</span>
                        </h1>

                        <p className="fade-up stagger-2 mt-6 text-lg text-white/50 leading-relaxed max-w-xl">
                            One donation can be someone's second chance at life. Join India's fastest-growing
                            blood donor network and become a hero in your community.
                        </p>

                        <div className="fade-up stagger-3 mt-10 flex flex-wrap gap-4">
                            <Link
                                to="/register"
                                className="group relative px-8 py-4 bg-gradient-to-r from-crimson-600 to-crimson-500 text-white font-semibold rounded-2xl shadow-2xl shadow-crimson-600/25 hover:shadow-crimson-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 overflow-hidden"
                            >
                                <span className="relative z-10">Become a Donor</span>
                                <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                <div className="absolute inset-0 bg-gradient-to-r from-crimson-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </Link>
                            <Link
                                to="/find-donors"
                                className="group px-8 py-4 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center gap-2"
                            >
                                Find Donors
                                <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="fade-up stagger-4 mt-12 flex items-center gap-6 text-white/30 text-sm">
                            <div className="flex -space-x-2">
                                {["R", "P", "A", "S"].map((letter, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-crimson-500 to-crimson-700 border-2 border-[#0a0a0f] flex items-center justify-center text-white text-xs font-bold"
                                    >
                                        {letter}
                                    </div>
                                ))}
                            </div>
                            <span>
                                {stats?.donors ? <>Trusted by <strong className="text-white">{stats.donors.toLocaleString()}</strong> registered donors</> : <>Join our growing donor community</>}
                            </span>
                        </div>
                    </div>

                    {/* Right: Urgent Requests Card */}
                    <div className="fade-right stagger-2">
                        <div className="relative">
                            {/* Glow behind card */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-crimson-600/20 to-orange-500/10 rounded-[2rem] blur-2xl" />

                            <div className="relative glass rounded-3xl p-8 overflow-hidden">
                                <div className="noise absolute inset-0" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-display font-bold flex items-center gap-3">
                                            <div className="p-2 bg-crimson-600/20 rounded-xl">
                                                <Zap className="h-5 w-5 text-crimson-400" />
                                            </div>
                                            Urgent Requests
                                        </h3>
                                        <span className="text-xs font-semibold px-3 py-1.5 bg-crimson-600/20 text-crimson-400 rounded-full pulse-ring">
                                            LIVE
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {urgentRequests === null && [0, 1, 2].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse" />)}
                                        {urgentRequests?.length === 0 && (
                                            <p className="text-sm text-white/40 text-center py-8">No open requests right now. Need blood? Post a request and we'll alert donors nearby.</p>
                                        )}
                                        {urgentRequests?.map((req, i) => (
                                            <Link
                                                to="/dashboard"
                                                key={req.id}
                                                className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 cursor-pointer ${i === 0 ? 'bg-crimson-600/10 border border-crimson-600/20' : 'bg-white/[0.03] border border-white/5'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${req.critical ? 'bg-crimson-600 text-white shadow-lg shadow-crimson-600/30' : 'bg-white/10 text-white/70'}`}>
                                                        {req.type}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{req.location}</p>
                                                        <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                                                            <Clock className="h-3 w-3" />{req.time}
                                                        </p>
                                                    </div>
                                                </div>
                                                {req.critical && (
                                                    <span className="text-[10px] font-bold px-2.5 py-1 bg-crimson-600/20 text-crimson-400 rounded-full uppercase tracking-wider">
                                                        Critical
                                                    </span>
                                                )}
                                                <ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors duration-300" />
                                            </Link>
                                        ))}
                                    </div>

                                    <Link
                                        to="/request-blood"
                                        className="block mt-6 text-center py-3.5 bg-gradient-to-r from-crimson-600 to-crimson-500 rounded-xl font-semibold text-sm hover:from-crimson-500 hover:to-crimson-400 transition-all duration-300 shadow-lg shadow-crimson-600/20"
                                    >
                                        Request Blood →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                    <span className="text-white/20 text-xs tracking-widest uppercase">Scroll</span>
                    <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5">
                        <div className="w-1 h-2 bg-crimson-500 rounded-full blood-drop" />
                    </div>
                </div>
            </section>

            {/* ═══════════ BLOOD TYPE MARQUEE ═══════════ */}
            <section className="relative py-8 border-y border-white/5 overflow-hidden">
                <div className="flex marquee">
                    {[...bloodTypes, ...bloodTypes, ...bloodTypes, ...bloodTypes].map((type, i) => (
                        <div key={i} className="flex items-center gap-8 px-8">
                            <span className="text-3xl font-display font-black text-white/[0.06] whitespace-nowrap">
                                {type}
                            </span>
                            <Droplet className="h-4 w-4 text-crimson-600/20" />
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════ STATS SECTION ═══════════ */}
            <section className="relative py-24">
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-crimson-600/5 rounded-full blur-[100px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { value: stats?.donors || 0, suffix: "", label: "Registered Donors", icon: Users },
                            { value: stats?.livesImpacted || 0, suffix: "", label: "Lives Impacted", icon: Heart },
                            { value: stats?.cities || 0, suffix: "", label: "Cities Covered", icon: Globe },
                            { value: stats?.requestsFulfilled || 0, suffix: "", label: "Requests Fulfilled", icon: TrendingUp },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className={`fade-up stagger-${i + 1} group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 cursor-default overflow-hidden`}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-crimson-600/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <stat.icon className="h-6 w-6 text-crimson-500 mb-4" />
                                <p className="text-4xl lg:text-5xl font-display font-black tracking-tight">
                                    <AnimatedCounter key={stat.value} end={stat.value} />
                                    <span className="text-crimson-500">{stat.suffix}</span>
                                </p>
                                <p className="text-white/40 text-sm font-medium mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ BENEFITS SECTION ═══════════ */}
            <section className="relative py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="fade-up text-crimson-500 text-sm font-semibold uppercase tracking-widest mb-3">
                            Why Donate?
                        </p>
                        <h2 className="fade-up stagger-1 text-4xl md:text-5xl font-display font-black tracking-tight">
                            Every Drop <span className="gradient-text">Makes a Difference</span>
                        </h2>
                        <p className="fade-up stagger-2 mt-4 text-white/40 text-lg max-w-2xl mx-auto">
                            Blood donation is one of the most selfless acts you can perform. Here's why your contribution matters.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((b, i) => (
                            <div
                                key={i}
                                className={`fade-up stagger-${i + 1} group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 hover:-translate-y-2 cursor-default overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <b.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="relative z-10 text-xl font-display font-bold mb-3">
                                    {b.title}
                                </h3>
                                <p className="relative z-10 text-white/40 text-sm leading-relaxed">
                                    {b.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="relative py-24 border-y border-white/5">
                <div className="absolute inset-0">
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-crimson-600/5 rounded-full blur-[100px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="fade-up text-crimson-500 text-sm font-semibold uppercase tracking-widest mb-3">
                            Simple Process
                        </p>
                        <h2 className="fade-up stagger-1 text-4xl md:text-5xl font-display font-black tracking-tight">
                            How It <span className="gradient-text">Works</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Register", desc: "Create your profile with basic health details and blood type in under 2 minutes.", icon: Users },
                            { step: "02", title: "Get Matched", desc: "Our smart system matches you with nearby hospitals and patients who need your blood type.", icon: Zap },
                            { step: "03", title: "Save Lives", desc: "Visit the nearest collection center, donate safely, and track your impact in real-time.", icon: Heart },
                        ].map((item, i) => (
                            <div key={i} className={`fade-up stagger-${i + 1} relative group`}>
                                <div className="relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 h-full">
                                    <span className="text-7xl font-display font-black text-white/[0.04] absolute top-4 right-6 group-hover:text-crimson-600/10 transition-colors duration-500">
                                        {item.step}
                                    </span>

                                    <div className="w-12 h-12 rounded-xl bg-crimson-600/10 flex items-center justify-center mb-6 group-hover:bg-crimson-600/20 transition-colors duration-500">
                                        <item.icon className="h-6 w-6 text-crimson-500" />
                                    </div>

                                    <h3 className="text-xl font-display font-bold mb-3">{item.title}</h3>
                                    <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                                </div>

                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 z-20">
                                        <ChevronRight className="h-6 w-6 text-white/10" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ TESTIMONIALS ═══════════ */}
            <section className="relative py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="fade-up text-crimson-500 text-sm font-semibold uppercase tracking-widest mb-3">
                            Testimonials
                        </p>
                        <h2 className="fade-up stagger-1 text-4xl md:text-5xl font-display font-black tracking-tight">
                            Voices of <span className="gradient-text">Our Community</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className={`fade-up stagger-${i + 1} p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500`}
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="h-4 w-4 text-amber-400" fill="currentColor" />
                                    ))}
                                </div>

                                <p className="text-white/60 text-sm leading-relaxed mb-8 italic">
                                    "{t.quote}"
                                </p>

                                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-crimson-500 to-crimson-700 flex items-center justify-center text-sm font-bold">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{t.name}</p>
                                        <p className="text-white/40 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FINAL CTA ═══════════ */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-crimson-900/40 via-crimson-800/20 to-crimson-900/40" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-crimson-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <div className="fade-up">
                        <Heart className="h-16 w-16 text-crimson-500 mx-auto mb-8 heartbeat" />
                    </div>
                    <h2 className="fade-up stagger-1 text-4xl md:text-6xl font-display font-black tracking-tight mb-6">
                        Someone Needs Your
                        <br />
                        <span className="gradient-text">Blood Type Right Now</span>
                    </h2>
                    <p className="fade-up stagger-2 text-white/50 text-lg mb-10 max-w-2xl mx-auto">
                        Every 2 seconds, someone in India needs blood. Your single donation can save up to 3 lives.
                        Don't wait — register now and become a hero.
                    </p>
                    <div className="fade-up stagger-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="group px-10 py-5 bg-white text-gray-900 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                        >
                            Register as a Donor
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                        <Link
                            to="/find-donors"
                            className="px-10 py-5 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/5 transition-all duration-300"
                        >
                            Request Blood
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
