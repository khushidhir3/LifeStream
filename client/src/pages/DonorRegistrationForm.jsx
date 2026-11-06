import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Droplet, ArrowRight, ArrowLeft, Check, User, MapPin, Heart, Phone, AlertCircle, ExternalLink } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BLOOD_TYPES, isEmail, isPhone, passwordChecks } from "../lib/api";
import PasswordStrength from "../components/PasswordStrength";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
    "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
];
const CONDITIONS = ["Diabetes", "Hypertension", "Heart disease", "Asthma", "Thyroid disorder", "None"];

// Which step each field lives on, so server errors can send the user back to it.
const FIELD_STEP = {
    firstName: 1, lastName: 1, email: 1, phone: 1, dateOfBirth: 1, gender: 1, password: 1, confirmPassword: 1,
    address: 2, city: 2, state: 2, zipCode: 2,
    bloodType: 3, bloodGroup: 3, weight: 3, lastDonationDate: 3,
    emergencyName: 4, emergencyPhone: 4, emergencyRelation: 4, termsAccepted: 4, privacyAccepted: 4,
};

function ageFrom(d) {
    if (!d) return null;
    const b = new Date(d), n = new Date();
    let a = n.getFullYear() - b.getFullYear();
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a -= 1;
    return a;
}

function Field({ label, error, children, hint }) {
    return (
        <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">{label}</label>
            {children}
            {hint && !error && <p className="text-white/30 text-[11px] mt-1">{hint}</p>}
            {error && <p className="text-crimson-400 text-xs mt-1">{error}</p>}
        </div>
    );
}

export default function DonorRegister() {
    const pageRef = useScrollReveal();
    const navigate = useNavigate();
    const toast = useToast();
    const { register, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const totalSteps = 4;

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", gender: "",
        password: "", confirmPassword: "", address: "", city: "", state: "", zipCode: "",
        bloodGroup: "", weight: "", lastDonationDate: "", medicalConditions: [], medications: "", allergies: "",
        emergencyName: "", emergencyRelation: "", emergencyPhone: "",
        termsAccepted: false, privacyAccepted: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
        setErrors((p) => ({ ...p, [name]: "" }));
        setFormError("");
    };

    const toggleCondition = (c) => {
        setFormData((p) => {
            let list = p.medicalConditions.includes(c) ? p.medicalConditions.filter((x) => x !== c) : [...p.medicalConditions, c];
            if (c === "None") list = list.includes("None") ? ["None"] : [];
            else list = list.filter((x) => x !== "None");
            return { ...p, medicalConditions: list };
        });
    };

    const validateStep = (s) => {
        const f = formData;
        const e = {};
        const today = new Date().toISOString().slice(0, 10);
        if (s === 1) {
            if (!f.firstName.trim()) e.firstName = "First name is required";
            if (!f.email.trim()) e.email = "Email is required";
            else if (!isEmail(f.email)) e.email = "Enter a valid email address";
            if (!f.phone.trim()) e.phone = "Phone number is required";
            else if (!isPhone(f.phone)) e.phone = "Enter a valid phone number, e.g. +91 98765 43210";
            if (!f.dateOfBirth) e.dateOfBirth = "Date of birth is required";
            else {
                const age = ageFrom(f.dateOfBirth);
                if (age < 18) e.dateOfBirth = "You must be at least 18 to donate blood";
                else if (age > 65) e.dateOfBirth = "Donors must be 65 or younger";
            }
            if (!f.gender) e.gender = "Please select";
            if (passwordChecks(f.password).some((c) => !c.ok)) e.password = "Password does not meet all the requirements below";
            if (!f.confirmPassword) e.confirmPassword = "Please confirm your password";
            else if (f.confirmPassword !== f.password) e.confirmPassword = "Passwords do not match";
        }
        if (s === 2) {
            if (!f.city.trim()) e.city = "City is required";
            if (!f.state) e.state = "State is required";
            if (f.zipCode && !/^\d{6}$/.test(f.zipCode.trim())) e.zipCode = "PIN code must be 6 digits";
        }
        if (s === 3) {
            if (!f.bloodGroup) e.bloodGroup = "Please select your blood group";
            if (!f.weight) e.weight = "Weight is required";
            else if (Number(f.weight) < 45) e.weight = "Donors must weigh at least 45 kg";
            else if (Number(f.weight) > 300) e.weight = "Enter a valid weight";
            if (f.lastDonationDate && f.lastDonationDate > today) e.lastDonationDate = "Date cannot be in the future";
        }
        if (s === 4) {
            if (f.emergencyPhone && !isPhone(f.emergencyPhone)) e.emergencyPhone = "Enter a valid phone number";
            if (!f.termsAccepted) e.termsAccepted = "You must accept the Terms of Service";
            if (!f.privacyAccepted) e.privacyAccepted = "You must accept the Privacy Policy";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => { if (validateStep(step)) setStep(step + 1); };

    const stepInfo = [
        { num: 1, icon: User, label: "Personal" },
        { num: 2, icon: MapPin, label: "Address" },
        { num: 3, icon: Heart, label: "Medical" },
        { num: 4, icon: Phone, label: "Emergency" },
    ];

    const handleSubmit = async () => {
        if (!validateStep(4)) return;
        setSubmitting(true);
        setFormError("");
        try {
            const { bloodGroup, ...rest } = formData;
            await register({ ...rest, bloodType: bloodGroup, email: rest.email.trim().toLowerCase() });
            toast.success("Welcome to LifeStream! Your donor profile has been created.");
            navigate("/dashboard", { replace: true });
        } catch (err) {
            const field = err.field;
            if (field && FIELD_STEP[field]) {
                setStep(FIELD_STEP[field]);
                setErrors({ [field === "bloodType" ? "bloodGroup" : field]: err.message });
            }
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    const today = new Date().toISOString().slice(0, 10);

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
                                <span className={`text-[10px] uppercase tracking-wider font-semibold ${step >= s.num ? "text-crimson-400" : "text-white/20"}`}>{s.label}</span>
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
                            {formError && (
                                <div role="alert" className="flex items-start gap-2 p-3 mb-6 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-crimson-300 text-sm">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" /> {formError}
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-display font-bold mb-6">Personal Information</h2>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <Field label="First Name *" error={errors.firstName}><input name="firstName" autoComplete="given-name" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="input-premium" /></Field>
                                        <Field label="Last Name" error={errors.lastName}><input name="lastName" autoComplete="family-name" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="input-premium" /></Field>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <Field label="Email *" error={errors.email}><input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" className="input-premium" /></Field>
                                        <Field label="Phone *" error={errors.phone}><input type="tel" name="phone" autoComplete="tel" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="input-premium" /></Field>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <Field label="Date of Birth *" error={errors.dateOfBirth} hint="Donors must be 18–65 years old"><input type="date" max={today} name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input-premium" /></Field>
                                        <Field label="Gender *" error={errors.gender}>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="input-premium">
                                                <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                                            </select>
                                        </Field>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <Field label="Password *" error={errors.password}>
                                            <input type={showPassword ? "text" : "password"} autoComplete="new-password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input-premium" />
                                        </Field>
                                        <Field label="Confirm Password *" error={errors.confirmPassword || (formData.confirmPassword && formData.confirmPassword !== formData.password ? "Passwords do not match" : "")}>
                                            <input type={showPassword ? "text" : "password"} autoComplete="new-password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="input-premium" />
                                        </Field>
                                    </div>
                                    <PasswordStrength password={formData.password} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-crimson-400 hover:text-crimson-300 transition-colors">
                                        {showPassword ? "Hide" : "Show"} Password
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-display font-bold mb-6">Address Details</h2>
                                    <Field label="Address" error={errors.address} hint="Used only to find requests near you. Never shown publicly."><textarea name="address" autoComplete="street-address" value={formData.address} onChange={handleChange} placeholder="Street address" className="input-premium resize-none" rows="3" /></Field>
                                    <div className="grid md:grid-cols-3 gap-5">
                                        <Field label="City *" error={errors.city}><input name="city" autoComplete="address-level2" value={formData.city} onChange={handleChange} placeholder="City" className="input-premium" /></Field>
                                        <Field label="State *" error={errors.state}>
                                            <select name="state" value={formData.state} onChange={handleChange} className="input-premium">
                                                <option value="">Select state...</option>
                                                {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="PIN Code" error={errors.zipCode}><input name="zipCode" inputMode="numeric" maxLength={6} autoComplete="postal-code" value={formData.zipCode} onChange={handleChange} placeholder="160017" className="input-premium" /></Field>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-display font-bold mb-6">Medical Information</h2>
                                    <Field label="Blood Group *" error={errors.bloodGroup}>
                                        <div className="grid grid-cols-4 gap-3">
                                            {BLOOD_TYPES.map((bg) => (
                                                <button type="button" key={bg} onClick={() => { setFormData((p) => ({ ...p, bloodGroup: bg })); setErrors((e) => ({ ...e, bloodGroup: "" })); }}
                                                    className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${formData.bloodGroup === bg ? "bg-crimson-600 text-white shadow-lg shadow-crimson-600/30 scale-105" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}>
                                                    {bg}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <Field label="Weight (kg) *" error={errors.weight} hint="Minimum 45 kg"><input type="number" min="45" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 65" className="input-premium" /></Field>
                                        <Field label="Last Donation Date" error={errors.lastDonationDate} hint="Leave empty if you have never donated"><input type="date" max={today} name="lastDonationDate" value={formData.lastDonationDate} onChange={handleChange} className="input-premium" /></Field>
                                    </div>
                                    <Field label="Medical Conditions">
                                        <div className="flex flex-wrap gap-2">
                                            {CONDITIONS.map((c) => (
                                                <button type="button" key={c} onClick={() => toggleCondition(c)}
                                                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${formData.medicalConditions.includes(c) ? "bg-crimson-600/30 text-crimson-200 border border-crimson-500/40" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}>
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <Field label="Current Medications"><input name="medications" value={formData.medications} onChange={handleChange} placeholder="None" className="input-premium" /></Field>
                                        <Field label="Allergies"><input name="allergies" value={formData.allergies} onChange={handleChange} placeholder="None" className="input-premium" /></Field>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-display font-bold mb-6">Emergency Contact</h2>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <Field label="Contact Name"><input name="emergencyName" value={formData.emergencyName} onChange={handleChange} placeholder="Emergency contact name" className="input-premium" /></Field>
                                        <Field label="Relation"><input name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} placeholder="e.g. Spouse, Parent" className="input-premium" /></Field>
                                    </div>
                                    <Field label="Contact Phone" error={errors.emergencyPhone}><input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="+91 98765 43210" className="input-premium" /></Field>
                                    <div className="space-y-3 pt-4">
                                        <label className={`flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border cursor-pointer hover:bg-white/[0.05] transition-all duration-300 ${errors.termsAccepted ? "border-crimson-500/50" : "border-white/5"}`}>
                                            <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} className="w-4 h-4 rounded border-white/20 bg-white/5 text-crimson-600 focus:ring-crimson-500" />
                                            <span className="text-sm text-white/60">
                                                I accept the{" "}
                                                <Link to="/terms" target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} className="text-crimson-400 hover:text-crimson-300 underline underline-offset-2 inline-flex items-center gap-1">
                                                    Terms of Service <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            </span>
                                        </label>
                                        {errors.termsAccepted && <p className="text-crimson-400 text-xs -mt-1">{errors.termsAccepted}</p>}
                                        <label className={`flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border cursor-pointer hover:bg-white/[0.05] transition-all duration-300 ${errors.privacyAccepted ? "border-crimson-500/50" : "border-white/5"}`}>
                                            <input type="checkbox" name="privacyAccepted" checked={formData.privacyAccepted} onChange={handleChange} className="w-4 h-4 rounded border-white/20 bg-white/5 text-crimson-600 focus:ring-crimson-500" />
                                            <span className="text-sm text-white/60">
                                                I accept the{" "}
                                                <Link to="/privacy" target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} className="text-crimson-400 hover:text-crimson-300 underline underline-offset-2 inline-flex items-center gap-1">
                                                    Privacy Policy <ExternalLink className="h-3 w-3" />
                                                </Link>{" "}
                                                and agree that my name, blood group and city appear in donor search
                                            </span>
                                        </label>
                                        {errors.privacyAccepted && <p className="text-crimson-400 text-xs -mt-1">{errors.privacyAccepted}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Navigation buttons */}
                            <div className="flex justify-between mt-10 pt-6 border-t border-white/5">
                                {step > 1 ? (
                                    <button type="button" onClick={() => { setErrors({}); setStep(step - 1); }} className="flex items-center gap-2 px-6 py-3 border border-white/10 text-white/60 rounded-xl hover:bg-white/5 transition-all duration-300 text-sm font-medium">
                                        <ArrowLeft className="h-4 w-4" /> Previous
                                    </button>
                                ) : <div />}

                                {step < totalSteps ? (
                                    <button type="button" onClick={next} className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-crimson-600 to-crimson-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-crimson-600/20 hover:from-crimson-500 hover:to-crimson-400 hover:-translate-y-0.5 transition-all duration-300">
                                        Next <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleSubmit} disabled={submitting} className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-emerald-400 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 transition-all duration-300">
                                        {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</> : <>Complete Registration <Check className="h-4 w-4" /></>}
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
