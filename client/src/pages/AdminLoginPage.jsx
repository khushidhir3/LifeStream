import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, Droplet, ArrowRight, Activity, Database, BarChart3 } from "lucide-react";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "", adminCode: "", rememberMe: false });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminCode, setShowAdminCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!formData.email) e.email = "Required";
        if (!formData.password) e.password = "Required";
        if (!formData.adminCode) e.adminCode = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                navigate("/admin-dashboard");
            }, 1500);
        }
    };

    const features = [
        { icon: Activity, title: "Real-time Monitoring", desc: "Track donations and requests live" },
        { icon: Database, title: "Donor Management", desc: "Manage 15,000+ donor profiles" },
        { icon: BarChart3, title: "Analytics Dashboard", desc: "Data-driven insights and reports" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-crimson-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]" />
            </div>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />

            <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
                {/* Left — Feature showcase */}
                <div className="hidden lg:block space-y-8 text-white">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <Droplet className="h-8 w-8 text-crimson-500" fill="currentColor" />
                        <span className="text-2xl font-display font-bold">LifeStream</span>
                    </Link>

                    <div>
                        <h1 className="text-4xl font-display font-black tracking-tight mb-3">
                            Admin <span className="gradient-text">Control Panel</span>
                        </h1>
                        <p className="text-white/40 text-lg">Manage the entire LifeStream network from one dashboard.</p>
                    </div>

                    <div className="space-y-4">
                        {features.map((f, i) => (
                            <div key={i} className="group flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
                                <div className="w-12 h-12 rounded-xl bg-crimson-600/20 flex items-center justify-center group-hover:bg-crimson-600/30 transition-colors duration-500">
                                    <f.icon className="h-6 w-6 text-crimson-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{f.title}</p>
                                    <p className="text-white/40 text-xs">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — Form */}
                <div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-crimson-600/10 to-blue-500/5 rounded-[2.5rem] blur-2xl" />

                        <div className="relative glass rounded-3xl p-8 overflow-hidden">
                            <div className="noise absolute inset-0" />

                            <div className="relative z-10">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-crimson-600/20 flex items-center justify-center mx-auto mb-4">
                                        <Shield className="h-8 w-8 text-crimson-400" />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-white">Admin Login</h2>
                                    <p className="text-white/40 text-sm mt-1">Authorized access only</p>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                            <input name="email" value={formData.email} onChange={handleChange} placeholder="admin@lifestream.com" className="input-premium pl-11" />
                                        </div>
                                        {errors.email && <p className="text-crimson-400 text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input-premium pl-11 pr-12" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-crimson-400 text-xs mt-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Security Code</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                            <input type={showAdminCode ? "text" : "password"} name="adminCode" value={formData.adminCode} onChange={handleChange} placeholder="6-digit code" className="input-premium pl-11 pr-12" />
                                            <button type="button" onClick={() => setShowAdminCode(!showAdminCode)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                                                {showAdminCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.adminCode && <p className="text-crimson-400 text-xs mt-1">{errors.adminCode}</p>}
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className={`group w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${isLoading ? "bg-white/10 text-white/40 cursor-not-allowed" : "bg-gradient-to-r from-crimson-600 to-crimson-500 text-white hover:from-crimson-500 hover:to-crimson-400 shadow-lg shadow-crimson-600/20"}`}
                                    >
                                        {isLoading ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                                        ) : (
                                            <>Access Admin Panel <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" /></>
                                        )}
                                    </button>

                                    <div className="pt-6 border-t border-white/5 text-center">
                                        <p className="text-white/40 text-sm">
                                            Not admin?{" "}
                                            <Link to="/login" className="text-crimson-400 font-semibold hover:text-crimson-300 transition-colors">User Login</Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
