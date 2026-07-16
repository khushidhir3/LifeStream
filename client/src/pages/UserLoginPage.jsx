import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Heart, Droplet, ArrowRight } from "lucide-react";

export default function UserLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
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
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                navigate("/user-dashboard");
            }, 1500);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-crimson-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-crimson-800/10 rounded-full blur-[100px]" />
            </div>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8">
                        <Droplet className="h-8 w-8 text-crimson-500" fill="currentColor" />
                        <span className="text-2xl font-display font-bold text-white">LifeStream</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-crimson-600/10 to-orange-500/5 rounded-[2.5rem] blur-2xl" />

                    <div className="relative glass rounded-3xl p-8 overflow-hidden">
                        <div className="noise absolute inset-0" />

                        <div className="relative z-10">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-crimson-600/20 flex items-center justify-center mx-auto mb-4">
                                    <Heart className="h-8 w-8 text-crimson-400 heartbeat" />
                                </div>
                                <h2 className="text-2xl font-display font-bold text-white">Welcome Back</h2>
                                <p className="text-white/40 text-sm mt-1">Sign in to your donor account</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                        <input name="email" value={formData.email} onChange={handleChange} placeholder="you@lifestream.com" className="input-premium pl-11" />
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

                                <div className="flex justify-between items-center text-sm">
                                    <label className="flex items-center gap-2 text-white/40 cursor-pointer">
                                        <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="w-4 h-4 rounded border-white/20 bg-white/5 text-crimson-600 focus:ring-crimson-500" />
                                        Remember me
                                    </label>
                                    <a href="#" className="text-crimson-400 hover:text-crimson-300 transition-colors text-xs font-medium">Forgot password?</a>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className={`group w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${isLoading ? "bg-white/10 text-white/40 cursor-not-allowed" : "bg-gradient-to-r from-crimson-600 to-crimson-500 text-white hover:from-crimson-500 hover:to-crimson-400 shadow-lg shadow-crimson-600/20 hover:shadow-crimson-500/30 hover:-translate-y-0.5"}`}
                                >
                                    {isLoading ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                                    ) : (
                                        <>Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" /></>
                                    )}
                                </button>

                                <div className="pt-6 border-t border-white/5 text-center">
                                    <p className="text-white/40 text-sm">
                                        Don't have an account?{" "}
                                        <Link to="/register" className="text-crimson-400 font-semibold hover:text-crimson-300 transition-colors">Register</Link>
                                    </p>
                                    <p className="text-white/30 text-xs mt-2">
                                        Admin?{" "}
                                        <Link to="/admin-login" className="text-white/50 font-medium hover:text-white/70 transition-colors">Admin Login →</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
