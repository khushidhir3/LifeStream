import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Droplet, AlertCircle, CheckCircle, HeartPulse } from "lucide-react";
import { api, BLOOD_TYPES, isEmail, isPhone } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const EMPTY = { patientName: "", bloodType: "", units: 1, hospital: "", city: "", urgency: "routine", neededBy: "", contactName: "", contactPhone: "", contactEmail: "", notes: "" };

export default function RequestBlood() {
    const { user } = useAuth();
    const [form, setForm] = useState(() => ({ ...EMPTY, contactName: user?.name || "", contactPhone: user?.phone || "", contactEmail: user?.email || "" }));
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(null);

    const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: "" })); setError(""); };

    const validate = () => {
        const e = {};
        if (!form.patientName.trim()) e.patientName = "Patient name is required";
        if (!form.bloodType) e.bloodType = "Select the blood group needed";
        if (!form.hospital.trim()) e.hospital = "Hospital is required";
        if (!form.city.trim()) e.city = "City is required";
        if (!form.contactName.trim()) e.contactName = "Contact name is required";
        if (!isPhone(form.contactPhone)) e.contactPhone = "Enter a valid phone number";
        if (form.contactEmail && !isEmail(form.contactEmail)) e.contactEmail = "Enter a valid email";
        setErrors(e);
        return !Object.keys(e).length;
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            setDone(await api("/requests", { method: "POST", body: form }));
        } catch (err) {
            setError(err.message);
            if (err.field) setErrors({ [err.field]: err.message });
        } finally { setLoading(false); }
    };

    const F = ({ k, label, children }) => (
        <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">{label}</label>
            {children}
            {errors[k] && <p className="text-crimson-400 text-xs mt-1">{errors[k]}</p>}
        </div>
    );

    return (
        <div className="bg-[#0a0a0f] text-white min-h-screen pt-32 pb-24 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-crimson-600/10 rounded-full blur-[120px]" />
            <div className="relative max-w-3xl mx-auto px-6">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson-600/10 border border-crimson-600/20 mb-6">
                        <HeartPulse className="h-4 w-4 text-crimson-500" />
                        <span className="text-crimson-400 text-sm font-medium">Emergency Request</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-3">Request <span className="gradient-text">Blood</span></h1>
                    <p className="text-white/40">We instantly alert compatible, eligible donors within 50 km.</p>
                </div>

                <div className="glass rounded-3xl p-8 md:p-10">
                    {done ? (
                        <div className="text-center space-y-4 py-6">
                            <CheckCircle className="h-14 w-14 text-emerald-400 mx-auto" />
                            <h2 className="text-2xl font-display font-bold">Request posted — {done.publicId}</h2>
                            <p className="text-white/60">{done.matchedDonors > 0 ? `${done.matchedDonors} matching donor${done.matchedDonors > 1 ? "s were" : " was"} alerted.` : "No matching donors were found nearby yet — our team has been notified and will help."} Donors who respond will call you on {done.contactPhone}.</p>
                            {!user && <p className="text-sm text-white/40"><Link to="/register" className="text-crimson-400 underline">Create an account</Link> to track responses to your requests.</p>}
                            <div className="flex justify-center gap-3 pt-2">
                                <Link to="/find-donors" className="px-6 py-3 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500">Search donors directly</Link>
                                <button onClick={() => { setDone(null); setForm({ ...EMPTY }); }} className="px-6 py-3 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/5">New request</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={submit} noValidate className="space-y-5">
                            {error && <div role="alert" className="flex gap-2 p-3 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-crimson-300 text-sm"><AlertCircle className="h-4 w-4 mt-0.5" /> {error}</div>}
                            <div className="grid md:grid-cols-2 gap-5">
                                {F({ k: "patientName", label: "Patient name *", children: <input className="input-premium" value={form.patientName} onChange={set("patientName")} /> })}
                                {F({ k: "units", label: "Units needed", children: <input type="number" min="1" max="20" className="input-premium" value={form.units} onChange={set("units")} /> })}
                            </div>
                            {F({
                                k: "bloodType", label: "Blood group needed *", children: (
                                    <div className="grid grid-cols-4 gap-3">
                                        {BLOOD_TYPES.map((b) => (
                                            <button type="button" key={b} onClick={() => { setForm((f) => ({ ...f, bloodType: b })); setErrors((x) => ({ ...x, bloodType: "" })); }}
                                                className={`py-3 rounded-xl font-bold text-sm transition-all ${form.bloodType === b ? "bg-crimson-600 text-white shadow-lg shadow-crimson-600/30" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}>{b}</button>
                                        ))}
                                    </div>
                                ),
                            })}
                            <div className="grid md:grid-cols-2 gap-5">
                                {F({ k: "hospital", label: "Hospital *", children: <input className="input-premium" value={form.hospital} onChange={set("hospital")} placeholder="e.g. PGIMER" /> })}
                                {F({ k: "city", label: "City *", children: <input className="input-premium" value={form.city} onChange={set("city")} /> })}
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                {F({
                                    k: "urgency", label: "Urgency", children: (
                                        <select className="input-premium" value={form.urgency} onChange={set("urgency")}>
                                            <option value="routine">Routine</option>
                                            <option value="high">High — within 24 hours</option>
                                            <option value="critical">Critical — immediately</option>
                                        </select>
                                    ),
                                })}
                                {F({ k: "neededBy", label: "Needed by", children: <input type="date" min={new Date().toISOString().slice(0, 10)} className="input-premium" value={form.neededBy} onChange={set("neededBy")} /> })}
                            </div>
                            <div className="grid md:grid-cols-3 gap-5">
                                {F({ k: "contactName", label: "Your name *", children: <input className="input-premium" value={form.contactName} onChange={set("contactName")} /> })}
                                {F({ k: "contactPhone", label: "Your phone *", children: <input type="tel" className="input-premium" value={form.contactPhone} onChange={set("contactPhone")} /> })}
                                {F({ k: "contactEmail", label: "Your email", children: <input type="email" className="input-premium" value={form.contactEmail} onChange={set("contactEmail")} /> })}
                            </div>
                            {F({ k: "notes", label: "Notes", children: <textarea rows={3} maxLength={1000} className="input-premium resize-none" value={form.notes} onChange={set("notes")} placeholder="Ward / bed number, any details for donors" /> })}
                            <p className="text-xs text-white/40">By posting you confirm this is a genuine medical need. Your phone number is shared only with donors who respond. Blood must never be paid for.</p>
                            <button disabled={loading} className="w-full py-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-crimson-600 to-crimson-500 hover:from-crimson-500 hover:to-crimson-400 disabled:opacity-50 flex items-center justify-center gap-2">
                                <Droplet className="h-4 w-4" fill="currentColor" /> {loading ? "Posting…" : "Post request & alert donors"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
