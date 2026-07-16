import React from "react";
import { Link } from "react-router-dom";
import {
    Heart, Target, Eye, Users, Award, Shield, Clock,
    Droplet, TrendingUp, Zap, Globe, ArrowRight
} from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function About() {
    const pageRef = useScrollReveal();

    const values = [
        { icon: Heart, title: "Compassion", desc: "Every action is driven by empathy for those in need of life-saving blood.", gradient: "from-rose-500 to-crimson-600" },
        { icon: Shield, title: "Trust & Safety", desc: "Rigorous verification ensures every donor and unit meets the highest safety standards.", gradient: "from-blue-500 to-indigo-600" },
        { icon: Users, title: "Community", desc: "Building a network of heroes who show up when it matters most.", gradient: "from-emerald-500 to-teal-600" },
        { icon: TrendingUp, title: "Innovation", desc: "Leveraging technology to make blood donation faster, smarter, and more accessible.", gradient: "from-amber-500 to-orange-600" },
    ];

    const milestones = [
        { year: "2020", title: "Founded", desc: "Started with 50 donors in Chandigarh" },
        { year: "2021", title: "1,000 Donors", desc: "Expanded to tri-city region" },
        { year: "2022", title: "10,000 Lives", desc: "Crossed 10,000 lives saved milestone" },
        { year: "2023", title: "100+ Hospitals", desc: "Partnered with hospitals across North India" },
        { year: "2024", title: "15,000+ Donors", desc: "India's fastest-growing blood network" },
    ];

    const team = [
        { name: "Dr. Meera Patel", role: "Chief Medical Advisor", initials: "MP" },
        { name: "Arjun Kapoor", role: "Founder & CEO", initials: "AK" },
        { name: "Sanya Malhotra", role: "Head of Operations", initials: "SM" },
        { name: "Ravi Sharma", role: "Lead Developer", initials: "RS" },
    ];

    return (
        <div ref={pageRef} className="bg-[#0a0a0f] text-white overflow-hidden">

            {/* ═══════════ HERO ═══════════ */}
            <section className="relative pt-40 pb-24 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-crimson-600/10 rounded-full blur-[120px]" />
                </div>
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />

                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson-600/10 border border-crimson-600/20 mb-8">
                        <Heart className="h-4 w-4 text-crimson-500" />
                        <span className="text-crimson-400 text-sm font-medium">Our Story</span>
                    </div>

                    <h1 className="fade-up stagger-1 text-5xl md:text-7xl font-display font-black tracking-tight mb-6">
                        About <span className="gradient-text">LifeStream</span>
                    </h1>

                    <p className="fade-up stagger-2 text-xl text-white/50 leading-relaxed max-w-2xl mx-auto">
                        We believe no one should die because blood wasn't available in time.
                        LifeStream bridges the gap between donors and patients with technology, compassion, and community.
                    </p>
                </div>
            </section>

            {/* ═══════════ MISSION & VISION ═══════════ */}
            <section className="py-24 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
                    <div className="fade-left p-10 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-crimson-500 to-crimson-700 flex items-center justify-center mb-6">
                            <Target className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-display font-bold mb-4">Our Mission</h3>
                        <p className="text-white/50 leading-relaxed">
                            To create a reliable, instant blood donation network that connects
                            verified donors with patients in need — ensuring no life is lost due to blood shortage.
                        </p>
                    </div>

                    <div className="fade-right p-10 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6">
                            <Eye className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-display font-bold mb-4">Our Vision</h3>
                        <p className="text-white/50 leading-relaxed">
                            A world where every hospital has adequate blood supply, every donor is celebrated,
                            and the act of giving blood is as common as any other act of kindness.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════ VALUES ═══════════ */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="fade-up text-crimson-500 text-sm font-semibold uppercase tracking-widest mb-3">Our Values</p>
                        <h2 className="fade-up stagger-1 text-4xl md:text-5xl font-display font-black tracking-tight">
                            What <span className="gradient-text">Drives Us</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((v, i) => (
                            <div
                                key={i}
                                className={`fade-up stagger-${i + 1} group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 hover:-translate-y-2 text-center`}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <v.icon className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-lg font-display font-bold mb-3">{v.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ TIMELINE ═══════════ */}
            <section className="py-24 border-y border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="fade-up text-crimson-500 text-sm font-semibold uppercase tracking-widest mb-3">Our Journey</p>
                        <h2 className="fade-up stagger-1 text-4xl md:text-5xl font-display font-black tracking-tight">
                            The <span className="gradient-text">LifeStream</span> Timeline
                        </h2>
                    </div>

                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-crimson-600/50 via-crimson-600/20 to-transparent" />

                        {milestones.map((m, i) => (
                            <div
                                key={i}
                                className={`fade-up stagger-${i + 1} relative flex items-center gap-8 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                            >
                                {/* Dot */}
                                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-crimson-500 rounded-full z-10 ring-4 ring-[#0a0a0f]" />

                                <div className={`flex-1 ml-16 md:ml-0 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                                    <span className="text-crimson-500 text-sm font-bold">{m.year}</span>
                                    <h4 className="text-xl font-display font-bold mt-1">{m.title}</h4>
                                    <p className="text-white/40 text-sm mt-1">{m.desc}</p>
                                </div>

                                <div className="flex-1 hidden md:block" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ TEAM ═══════════ */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="fade-up text-crimson-500 text-sm font-semibold uppercase tracking-widest mb-3">Our Team</p>
                        <h2 className="fade-up stagger-1 text-4xl md:text-5xl font-display font-black tracking-tight">
                            Meet the <span className="gradient-text">Heroes Behind</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((t, i) => (
                            <div
                                key={i}
                                className={`fade-up stagger-${i + 1} group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 text-center`}
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-crimson-500 to-crimson-700 mx-auto mb-6 flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-crimson-600/20">
                                    {t.initials}
                                </div>
                                <h4 className="font-display font-bold">{t.name}</h4>
                                <p className="text-white/40 text-sm mt-1">{t.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-crimson-900/30 to-crimson-900/30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-crimson-600/20 rounded-full blur-[100px]" />

                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <h2 className="fade-up text-4xl md:text-5xl font-display font-black tracking-tight mb-6">
                        Join the <span className="gradient-text">Movement</span>
                    </h2>
                    <p className="fade-up stagger-1 text-white/50 text-lg mb-10">
                        Be part of something bigger than yourself. Every donor is a lifeline.
                    </p>
                    <Link
                        to="/register"
                        className="fade-up stagger-2 group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-crimson-600 to-crimson-500 text-white font-bold rounded-2xl shadow-2xl shadow-crimson-600/25 hover:shadow-crimson-500/40 hover:-translate-y-1 transition-all duration-300"
                    >
                        Start Your Journey
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
