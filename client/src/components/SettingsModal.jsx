import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, User, Bell, Lock, AlertTriangle, Save } from "lucide-react";
import { api, BLOOD_TYPES, isEmail, isPhone, passwordChecks, tokenStore } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PasswordStrength from "./PasswordStrength";

function Toggle({ checked, onChange, label, desc }) {
    return (
        <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer">
            <div>
                <p className="text-sm font-semibold">{label}</p>
                {desc && <p className="text-xs text-white/40 mt-0.5">{desc}</p>}
            </div>
            <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-emerald-500" : "bg-white/15"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
            </button>
        </label>
    );
}

const L = ({ children }) => <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">{children}</label>;

export default function SettingsModal({ open, onClose, initialTab = "profile" }) {
    const { user, donor, setSession, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [tab, setTab] = useState(initialTab);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState({});
    const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [deletePw, setDeletePw] = useState("");

    useEffect(() => {
        if (!open) return;
        setTab(initialTab);
        setError("");
        setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setDeletePw("");
    }, [open, initialTab]);

    useEffect(() => {
        if (!open) return;
        setProfile({
            firstName: user?.firstName || "", lastName: user?.lastName || "", email: user?.email || "", phone: user?.phone || "",
            bloodType: donor?.bloodType || "", city: donor?.city || "", state: donor?.state || "", address: donor?.address || "",
            zipCode: donor?.zipCode || "", weight: donor?.weight ?? "", lastDonationDate: donor?.lastDonationDate?.slice(0, 10) || "",
            allergies: donor?.allergies || "", medications: donor?.medications || "",
            emergencyName: donor?.emergencyName || "", emergencyRelation: donor?.emergencyRelation || "", emergencyPhone: donor?.emergencyPhone || "",
        });
    }, [open, user, donor]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Wait until the form values are filled in so inputs are always controlled.
    if (!open || profile.firstName === undefined) return null;

    const set = (k) => (e) => { setProfile((p) => ({ ...p, [k]: e.target.value })); setError(""); };

    const saveProfile = async (e) => {
        e.preventDefault();
        if (!profile.firstName.trim()) return setError("First name is required");
        if (!isEmail(profile.email)) return setError("Enter a valid email address");
        if (profile.phone && !isPhone(profile.phone)) return setError("Enter a valid phone number");
        if (donor && !profile.city.trim()) return setError("City is required");
        setSaving(true);
        try {
            const body = donor ? profile : { firstName: profile.firstName, lastName: profile.lastName, email: profile.email, phone: profile.phone };
            setSession(await api("/me", { method: "PATCH", body }));
            toast.success("Profile updated");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const savePref = async (patch) => {
        try {
            setSession(await api("/me/settings", { method: "PATCH", body: patch }));
            toast.success("Settings saved");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwordChecks(pw.newPassword).some((c) => !c.ok)) return setError("New password does not meet the requirements");
        if (pw.newPassword !== pw.confirmPassword) return setError("Passwords do not match");
        setSaving(true);
        try {
            const res = await api("/me/change-password", { method: "POST", body: pw });
            tokenStore.replace(res.token);
            setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
            toast.success("Password changed. Other devices were signed out.");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteAccount = async (e) => {
        e.preventDefault();
        if (!window.confirm("This permanently deletes your account, donor profile and history. Continue?")) return;
        setSaving(true);
        try {
            await api("/me", { method: "DELETE", body: { password: deletePw } });
            logout();
            toast.success("Your account has been deleted");
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Availability & alerts", icon: Bell },
        { id: "security", label: "Password", icon: Lock },
        { id: "danger", label: "Delete account", icon: AlertTriangle },
    ];

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Settings">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl border border-white/10 bg-[#101017] text-white shadow-2xl flex flex-col md:flex-row overflow-hidden">
                <aside className="md:w-56 border-b md:border-b-0 md:border-r border-white/5 p-4 flex md:flex-col gap-1 overflow-x-auto">
                    <p className="hidden md:block font-display font-bold text-lg px-3 py-2 mb-2">Settings</p>
                    {tabs.map((t) => (
                        <button key={t.id} onClick={() => { setTab(t.id); setError(""); }}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${tab === t.id ? "bg-crimson-600/15 text-crimson-300" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                            <t.icon className="h-4 w-4" /> {t.label}
                        </button>
                    ))}
                </aside>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <button onClick={onClose} aria-label="Close settings" className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5">
                        <X className="h-5 w-5" />
                    </button>
                    {error && <div role="alert" className="mb-5 p-3 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-crimson-300 text-sm">{error}</div>}

                    {tab === "profile" && (
                        <form onSubmit={saveProfile} className="space-y-5">
                            <h3 className="text-xl font-display font-bold">Profile</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div><L>First name</L><input className="input-premium" value={profile.firstName} onChange={set("firstName")} /></div>
                                <div><L>Last name</L><input className="input-premium" value={profile.lastName} onChange={set("lastName")} /></div>
                                <div><L>Email</L><input type="email" className="input-premium" value={profile.email} onChange={set("email")} /></div>
                                <div><L>Phone</L><input type="tel" className="input-premium" value={profile.phone} onChange={set("phone")} /></div>
                            </div>
                            {donor && (
                                <>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div><L>Blood group</L>
                                            <select className="input-premium" value={profile.bloodType} onChange={set("bloodType")}>
                                                {BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div><L>Weight (kg)</L><input type="number" min="45" className="input-premium" value={profile.weight} onChange={set("weight")} /></div>
                                        <div><L>Last donation</L><input type="date" max={new Date().toISOString().slice(0, 10)} className="input-premium" value={profile.lastDonationDate} onChange={set("lastDonationDate")} /></div>
                                    </div>
                                    <div><L>Address</L><input className="input-premium" value={profile.address} onChange={set("address")} /></div>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div><L>City</L><input className="input-premium" value={profile.city} onChange={set("city")} /></div>
                                        <div><L>State</L><input className="input-premium" value={profile.state} onChange={set("state")} /></div>
                                        <div><L>PIN code</L><input className="input-premium" value={profile.zipCode} onChange={set("zipCode")} /></div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div><L>Allergies</L><input className="input-premium" value={profile.allergies} onChange={set("allergies")} /></div>
                                        <div><L>Medications</L><input className="input-premium" value={profile.medications} onChange={set("medications")} /></div>
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div><L>Emergency contact</L><input className="input-premium" value={profile.emergencyName} onChange={set("emergencyName")} /></div>
                                        <div><L>Relation</L><input className="input-premium" value={profile.emergencyRelation} onChange={set("emergencyRelation")} /></div>
                                        <div><L>Emergency phone</L><input type="tel" className="input-premium" value={profile.emergencyPhone} onChange={set("emergencyPhone")} /></div>
                                    </div>
                                </>
                            )}
                            <button disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500 disabled:opacity-50">
                                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
                            </button>
                        </form>
                    )}

                    {tab === "notifications" && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-display font-bold mb-2">Availability & alerts</h3>
                            {donor && (
                                <Toggle checked={donor.isAvailable} onChange={(v) => savePref({ isAvailable: v })}
                                    label="Available to donate" desc="When off, you are hidden as 'available' in search and won't get request alerts." />
                            )}
                            <Toggle checked={user.notifyRequests} onChange={(v) => savePref({ notifyRequests: v })}
                                label="Blood request alerts" desc="Get notified when someone nearby needs your blood group." />
                            <Toggle checked={user.notifyEmail} onChange={(v) => savePref({ notifyEmail: v })}
                                label="Email notifications" desc="Also send important alerts (urgent requests, verification) to your email." />
                        </div>
                    )}

                    {tab === "security" && (
                        <form onSubmit={changePassword} className="space-y-5">
                            <h3 className="text-xl font-display font-bold">Change password</h3>
                            <div><L>Current password</L><input type="password" autoComplete="current-password" className="input-premium" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} /></div>
                            <div><L>New password</L><input type="password" autoComplete="new-password" className="input-premium" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} />
                                <PasswordStrength password={pw.newPassword} />
                            </div>
                            <div><L>Confirm new password</L><input type="password" autoComplete="new-password" className="input-premium" value={pw.confirmPassword} onChange={(e) => setPw((p) => ({ ...p, confirmPassword: e.target.value }))} /></div>
                            <button disabled={saving || !pw.currentPassword} className="px-6 py-3 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500 disabled:opacity-50">
                                {saving ? "Updating…" : "Update password"}
                            </button>
                        </form>
                    )}

                    {tab === "danger" && (
                        <form onSubmit={deleteAccount} className="space-y-5">
                            <h3 className="text-xl font-display font-bold text-crimson-400">Delete account</h3>
                            <p className="text-sm text-white/50">This permanently removes your account, donor profile, donation history and notifications. This cannot be undone.</p>
                            <div><L>Enter your password to confirm</L><input type="password" className="input-premium" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} /></div>
                            <button disabled={saving || !deletePw} className="px-6 py-3 bg-crimson-700 rounded-xl text-sm font-semibold hover:bg-crimson-600 disabled:opacity-50">
                                Permanently delete my account
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
