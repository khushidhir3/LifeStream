import React, { useState } from "react";
import {
    Phone, Mail, MapPin, Clock, Send,
    MessageSquare, CheckCircle, ArrowUpRight,
    Headphones, Globe
} from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function Contact() {
    const pageRef = useScrollReveal();
    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", subject: "", message: "", inquiryType: ""
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const inquiryTypes = [
        "Blood Donation Inquiry", "Blood Request", "Partnership Opportunity",
        "Technical Support", "Feedback", "Other"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!formData.name) e.name = "Required";
        if (!formData.email) e.email = "Required";
        if (!formData.message) e.message = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            setIsLoading(true);
            setTimeout(() => {
                setSubmitted(true);
                setIsLoading(false);
                setTimeout(() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", subject: "", message: "", inquiryType: "" });
                }, 3000);
            }, 1500);
        }
    };

    const contactInfo = [
        { icon: Phone, title: "Emergency Hotline", detail: "+91-1800-DONATE", sub: "Available 24/7", gradient: "from-crimson-500 to-rose-600" },
        { icon: Mail, title: "Email Us", detail: "help@lifestream.org", sub: "Response within 2 hours", gradient: "from-blue-500 to-indigo-600" },
        { icon: MapPin, title: "Visit Us", detail: "Sector 17, Chandigarh", sub: "Mon–Sat, 9 AM – 6 PM", gradient: "from-emerald-500 to-teal-600" },
        { icon: Headphones, title: "Live Chat", detail: "Start a conversation", sub: "Instant support", gradient: "from-purple-500 to-violet-600" },
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
                        <MessageSquare className="h-4 w-4 text-crimson-500" />
                        <span className="text-crimson-400 text-sm font-medium">Get In Touch</span>
                    </div>

                    <h1 className="fade-up stagger-1 text-5xl md:text-7xl font-display font-black tracking-tight mb-6">
                        Contact <span className="gradient-text">Us</span>
                    </h1>

                    <p className="fade-up stagger-2 text-xl text-white/50 leading-relaxed max-w-2xl mx-auto">
                        We're available 24/7 for emergency blood requests and general inquiries.
                        Reach out — every second counts.
                    </p>
                </div>
            </section>

            {/* ═══════════ CONTACT CARDS ═══════════ */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {contactInfo.map((c, i) => (
                        <div
                            key={i}
                            className={`fade-up stagger-${i + 1} group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 hover:-translate-y-1 cursor-pointer`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                                <c.icon className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="font-display font-bold text-sm mb-1">{c.title}</h4>
                            <p className="text-white/70 text-sm font-medium">{c.detail}</p>
                            <p className="text-white/30 text-xs mt-1">{c.sub}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════ CONTACT FORM ═══════════ */}
            <section className="py-24">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-crimson-600/10 to-orange-500/5 rounded-[2.5rem] blur-2xl" />

                        <div className="relative glass rounded-3xl p-10 overflow-hidden">
                            <div className="noise absolute inset-0" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2.5 bg-crimson-600/20 rounded-xl">
                                        <Send className="h-5 w-5 text-crimson-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-bold">Send a Message</h2>
                                        <p className="text-white/40 text-sm">We'll get back to you within 2 hours.</p>
                                    </div>
                                </div>

                                {submitted ? (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="h-10 w-10 text-emerald-400" />
                                        </div>
                                        <h3 className="text-2xl font-display font-bold mb-2">Message Sent!</h3>
                                        <p className="text-white/50">We'll get back to you as soon as possible.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Full Name *</label>
                                                <input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="input-premium" />
                                                {errors.name && <p className="text-crimson-400 text-xs mt-1">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Email *</label>
                                                <input name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" className="input-premium" />
                                                {errors.email && <p className="text-crimson-400 text-xs mt-1">{errors.email}</p>}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Phone</label>
                                                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="input-premium" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Inquiry Type</label>
                                                <select name="inquiryType" value={formData.inquiryType} onChange={handleChange} className="input-premium">
                                                    <option value="">Select type...</option>
                                                    {inquiryTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Subject</label>
                                            <input name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" className="input-premium" />
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Message *</label>
                                            <textarea name="message" rows="5" value={formData.message} onChange={handleChange} placeholder="Tell us more..." className="input-premium resize-none" />
                                            {errors.message && <p className="text-crimson-400 text-xs mt-1">{errors.message}</p>}
                                        </div>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                                                isLoading
                                                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                                                    : "bg-gradient-to-r from-crimson-600 to-crimson-500 text-white hover:from-crimson-500 hover:to-crimson-400 shadow-lg shadow-crimson-600/20 hover:shadow-crimson-500/30 hover:-translate-y-0.5"
                                            }`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
