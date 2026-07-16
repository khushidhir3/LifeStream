import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplet, Eye, EyeOff, ArrowRight, ArrowLeft, Check, User, MapPin, Heart, Phone } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function DonorRegister() {
    const pageRef = useScrollReveal();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const totalSteps = 4;

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", gender: "",
        password: "", confirmPassword: "", address: "", city: "", state: "", zipCode: "",
        bloodGroup: "", weight: "", lastDonationDate: "", medicalConditions: [], medications: "", allergies: "",
        emergencyName: "", emergencyRelation: "", emergencyPhone: "",
        termsAccepted: false, privacyAccepted: false
    });

    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const indianStates = ["Punjab", "Delhi", "Uttar Pradesh", "Maharashtra", "Karnataka", "Haryana", "Chandigarh"];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const stepInfo = [
        { num: 1, icon: User, label: "Personal" },
        { num: 2, icon: MapPin, label: "Address" },
        { num: 3, icon: Heart, label: "Medical" },
        { num: 4, icon: Phone, label: "Emergency" },
    ];

    const handleSubmit = () => {
        console.log("FORM DATA:", formData);
        navigate("/login");
    };

    return (
        <div ref={pageRef} className="bg-[#0a0a0f] text-white min-h-screen pt-32 pb-20 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-crimson-600/10 rounded-full blur-[120px]" />
            </div>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />

            <div className="relative max-w-3xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson-600/10 border border-crimson-600/20 mb-6">
                        <Droplet className="h-4 w-4 text-crimson-500" fill="currentColor" />
                        <span className="text-crimson-400 text-sm font-medium">Join the Network</span>
                    </div>
                    <h1 className="fade-up stagger-1 text-4xl md:text-5xl font-display font-black tracking-tight mb-3">
                        Donor <span className="gradient-text">Registration</span>
                    </h1>
                    <p className="fade-up stagger-2 text-white/40">Join our community of life savers</p>
                </div>

                {/* Progress bar */}
                <div className="fade-up stagger-3 flex items-center justify-between mb-12 max-w-md mx-auto">
                    {stepInfo.map((s, i) => (
                        <React.Fragment key={s.num}>
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= s.num ? "bg-crimson-600 text-white shadow-lg shadow-crimson-600/30" : "bg-white/5 text-white/30 border border-white/10"}`}>
                                    {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider font-semibold ${step >= s.num ? "text-crimson-400" : "text-white/20"}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < stepInfo.length - 1 && (
                                <div className="flex-1 h-0.5 mx-2 mb-5">
                                    <div className={`h-full rounded-full transition-all duration-700 ${step > s.num ? "bg-crimson-600" : "bg-white/10"}`} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Form card */}
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-crimson-600/10 to-orange-500/5 rounded-[2.5rem] blur-2xl" />

                    <div className="relative glass rounded-3xl p-8 md:p-10 overflow-hidden">
                        <div className="noise absolute inset-0" />

                        <div className="relative z-10">
                            {/* Step 1: Personal */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-display font-bold mb-6">Personal Information</h2>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">First Name</label><input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="input-premium" /></div>
                                        <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Last Name</label><input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="input-premium" /></div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Email</label><input name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" className="input-premium" /></div>
                                        <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Phone</label><input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="input-premium" /></div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input-premium" /></div>
                                        <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="input-premium">
                                                <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Password</label>
                                            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input-premium" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Confirm Password</label>
                                            <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="input-premium" />
                                        </div>
                                    </div>
                                    <button onClick={() => setShowPassword(!showPassword)} className="text-xs text-crimson-400 hover:text-crimson-300 transition-colors">
                                        {showPassword ? "Hide" : "Show"} Password
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Address */}
                            {step === 2 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-display font-bold mb-6">Address Details</h2>
                                    <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Address</label><textarea name="address" value={formData.address} onChange={handleChange} placeholder="Street address" className="input-premium resize-none" rows="3" /></div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">City</label><input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="input-premium" /></div>
                                        <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">State</label>
                                            <select name="state" value={formData.state} onChange={handleChange} className="input-premium">
                                                <option value="">Select state...</option>
                                                {indianStates.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Medical */}
                            {step === 3 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-display font-bold mb-6">Medical Information</h2>
                                    <div>
                                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 block">Blood Group</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {bloodGroups.map(bg => (
                                                <button key={bg} onClick={() => setFormData(p => ({ ...p, bloodGroup: bg }))}
                                                    className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${formData.bloodGroup === bg ? "bg-crimson-600 text-white shadow-lg shadow-crimson-600/30 scale-105" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}>
                                                    {bg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Weight (kg)</label><input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 65" className="input-premium" /></div>
                                </div>
                            )}

                            {/* Step 4: Emergency */}
                            {step === 4 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-display font-bold mb-6">Emergency Contact</h2>
                                    <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Contact Name</label><input name="emergencyName" value={formData.emergencyName} onChange={handleChange} placeholder="Emergency contact name" className="input-premium" /></div>
                                    <div><label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Contact Phone</label><input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="+91 98765 43210" className="input-premium" /></div>
                                    <div className="space-y-3 pt-4">
                                        <label className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-all duration-300">
                                            <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} className="w-4 h-4 rounded border-white/20 bg-white/5 text-crimson-600 focus:ring-crimson-500" />
                                            <span className="text-sm text-white/60">I accept the <span className="text-crimson-400">Terms of Service</span></span>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-all duration-300">
                                            <input type="checkbox" name="privacyAccepted" checked={formData.privacyAccepted} onChange={handleChange} className="w-4 h-4 rounded border-white/20 bg-white/5 text-crimson-600 focus:ring-crimson-500" />
                                            <span className="text-sm text-white/60">I accept the <span className="text-crimson-400">Privacy Policy</span></span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Navigation buttons */}
                            <div className="flex justify-between mt-10 pt-6 border-t border-white/5">
                                {step > 1 ? (
                                    <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-3 border border-white/10 text-white/60 rounded-xl hover:bg-white/5 transition-all duration-300 text-sm font-medium">
                                        <ArrowLeft className="h-4 w-4" /> Previous
                                    </button>
                                ) : <div />}

                                {step < totalSteps ? (
                                    <button onClick={() => setStep(step + 1)} className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-crimson-600 to-crimson-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-crimson-600/20 hover:from-crimson-500 hover:to-crimson-400 hover:-translate-y-0.5 transition-all duration-300">
                                        Next <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </button>
                                ) : (
                                    <button onClick={handleSubmit} className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-emerald-400 hover:-translate-y-0.5 transition-all duration-300">
                                        Complete Registration <Check className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-white/40 text-sm">
                    Already have an account? <Link to="/login" className="text-crimson-400 font-semibold hover:text-crimson-300 transition-colors">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
