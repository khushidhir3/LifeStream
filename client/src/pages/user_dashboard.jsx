import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
    Heart, Droplet, Clock, Award, Shield, ChevronRight, Activity, Star, LogOut, Settings,
    MapPin, Plus, X, Phone, CheckCircle, AlertCircle, Trash2, Search, Home as HomeIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, formatDate, timeAgo } from "../lib/api";
import NotificationBell from "../components/NotificationBell";
import SettingsModal from "../components/SettingsModal";

const URGENCY_STYLE = {
    critical: { card: "border-crimson-600/30 bg-crimson-600/5 hover:bg-crimson-600/10", text: "text-crimson-400", label: "Critical" },
    high: { card: "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10", text: "text-amber-400", label: "High priority" },
    routine: { card: "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]", text: "text-white/40", label: "Routine" },
};

const mapsUrl = (r) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.hospital}, ${r.city}`)}`;

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#101017] p-6 text-white">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-display font-bold text-lg">{title}</h3>
                    <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function UserDashboard() {
    const { user, donor, logout, refresh, setSession } = useAuth();
    const toast = useToast();
    const [isCardFlipped, setIsCardFlipped] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [matches, setMatches] = useState({ data: [], loading: true });
    const [donations, setDonations] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [respondTo, setRespondTo] = useState(null);
    const [respondResult, setRespondResult] = useState(null);
    const [logOpen, setLogOpen] = useState(false);
    const [logForm, setLogForm] = useState({ date: new Date().toISOString().slice(0, 10), location: "", units: 1 });
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        const [m, d, mine] = await Promise.allSettled([
            api("/requests/matches"),
            api("/me/donations"),
            api("/requests/mine"),
        ]);
        setMatches({ data: m.status === "fulfilled" ? m.value.data : [], loading: false });
        if (d.status === "fulfilled") setDonations(d.value.data);
        if (mine.status === "fulfilled") setMyRequests(mine.value.data);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleLogout = () => {
        // Full reload to the home page also clears any in-memory data.
        logout();
        window.location.replace("/");
    };

    const toggleAvailability = async () => {
        try {
            setSession(await api("/me/settings", { method: "PATCH", body: { isAvailable: !donor.isAvailable } }));
            toast.success(donor.isAvailable ? "You're now marked unavailable" : "You're now available to donate");
        } catch (err) { toast.error(err.message); }
    };

    const respond = async (message) => {
        setBusy(true);
        try {
            const res = await api(`/requests/${respondTo.id}/respond`, { method: "POST", body: { message } });
            setRespondResult(res.contact);
            load();
        } catch (err) {
            toast.error(err.message);
            setRespondTo(null);
        } finally { setBusy(false); }
    };

    const logDonation = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await api("/me/donations", { method: "POST", body: logForm });
            toast.success("Donation recorded. Thank you for saving lives!");
            setLogOpen(false);
            setLogForm({ date: new Date().toISOString().slice(0, 10), location: "", units: 1 });
            await Promise.all([load(), refresh()]);
        } catch (err) { toast.error(err.message); } finally { setBusy(false); }
    };

    const deleteDonation = async (d) => {
        if (!window.confirm("Remove this donation from your history?")) return;
        try {
            await api(`/me/donations/${d.id}`, { method: "DELETE" });
            await Promise.all([load(), refresh()]);
        } catch (err) { toast.error(err.message); }
    };

    const updateMyRequest = async (r, status) => {
        try {
            await api(`/requests/${r.id}/status`, { method: "PATCH", body: { status } });
            toast.success(status === "completed" ? "Marked as fulfilled" : "Request cancelled");
            load();
        } catch (err) { toast.error(err.message); }
    };

    const count = donor?.donationCount || 0;
    const badges = [
        { icon: Star, label: "First Drop", color: "from-amber-400 to-yellow-500", unlocked: count >= 1 },
        { icon: Activity, label: "3x Saver", color: "from-crimson-500 to-rose-500", unlocked: count >= 3 },
        { icon: Shield, label: "Gold Hero", color: "from-amber-500 to-orange-600", unlocked: count >= 5 },
    ];
    const nextGoal = count < 1 ? 1 : count < 3 ? 3 : count < 5 ? 5 : 10;
    const level = 1 + badges.filter((b) => b.unlocked).length;

    const eligible = !donor?.nextEligibleDate || new Date(donor.nextEligibleDate) <= new Date();
    const daysLeft = donor?.nextEligibleDate ? Math.ceil((new Date(donor.nextEligibleDate) - Date.now()) / 864e5) : 0;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Top Bar */}
            <header className="glass-dark sticky top-0 z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <Droplet className="h-6 w-6 text-crimson-500" fill="currentColor" />
                        <span className="font-display font-bold text-lg">Donor Portal</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link to="/find-donors" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5"><Search className="h-4 w-4" /> Find donors</Link>
                        <Link to="/" aria-label="Home" className="p-2 rounded-xl bg-white/5 hover:bg-white/10"><HomeIcon className="h-5 w-5 text-white/60" /></Link>
                        <NotificationBell />
                        <button onClick={() => setSettingsOpen(true)} aria-label="Settings" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <Settings className="h-5 w-5 text-white/60" />
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-crimson-600/20 text-crimson-400 rounded-xl hover:bg-crimson-600/30 transition-all text-sm font-medium">
                            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 pt-8">
                <h1 className="text-2xl md:text-3xl font-display font-black">Hello, {user?.firstName || user?.name} 👋</h1>
                <p className="text-white/40 text-sm mt-1">
                    {donor ? (donor.status === "verified" ? "Your donor profile is verified." : "Your donor profile is awaiting verification by our team.") : "Welcome to LifeStream."}
                </p>
            </div>

            {!donor ? (
                <div className="max-w-3xl mx-auto px-6 py-16 text-center">
                    <Droplet className="h-14 w-14 text-crimson-500/40 mx-auto mb-4" />
                    <h2 className="text-2xl font-display font-bold mb-2">No donor profile on this account</h2>
                    <p className="text-white/40 mb-8">You can still request blood or search for donors.</p>
                    <div className="flex justify-center gap-3">
                        <Link to="/request-blood" className="px-6 py-3 bg-crimson-600 rounded-xl font-semibold text-sm hover:bg-crimson-500">Request blood</Link>
                        <Link to="/find-donors" className="px-6 py-3 border border-white/10 rounded-xl font-semibold text-sm hover:bg-white/5">Find donors</Link>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">
                    {/* LEFT: ID Card + Badges */}
                    <div className="space-y-8">
                        <div className="relative group" style={{ perspective: "1000px" }}>
                            <div onClick={() => setIsCardFlipped(!isCardFlipped)} className="relative w-full h-64 cursor-pointer transition-all duration-700" style={{ transformStyle: "preserve-3d", transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                                <div className="absolute inset-0 rounded-3xl p-6 overflow-hidden flex flex-col justify-between" style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.9), rgba(153,27,27,0.95))", backfaceVisibility: "hidden" }}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                                    <div className="flex justify-between items-start z-10">
                                        <div className="min-w-0">
                                            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold opacity-70">LifeStream Donor</h2>
                                            <p className="text-2xl font-display font-bold mt-1 truncate">{donor.name}</p>
                                            <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${donor.status === "verified" ? "bg-white/20" : "bg-black/20"}`}>
                                                {donor.status === "verified" ? "✓ Verified" : "Pending verification"}
                                            </span>
                                        </div>
                                        <Droplet className="h-10 w-10 opacity-30 flex-shrink-0" />
                                    </div>
                                    <div className="flex justify-between items-end z-10">
                                        <div>
                                            <p className="text-xs opacity-60 mb-1">Blood Type</p>
                                            <p className="text-6xl font-display font-black tracking-tighter drop-shadow-md">{donor.bloodType}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-white p-1.5 rounded-xl inline-block mb-2 shadow-inner">
                                                <QRCodeSVG value={`LifeStream Donor ${donor.publicId} | ${donor.name} | ${donor.bloodType} | ${donor.status}`} size={56} fgColor="#991b1b" />
                                            </div>
                                            <p className="text-[10px] font-mono opacity-60 tracking-widest">{donor.publicId}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-center items-center border border-white/10 bg-[#111118]" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
                                    <Shield className="h-10 w-10 text-white/20 mb-4" />
                                    <h3 className="font-display font-bold text-lg text-crimson-400 mb-1">Emergency Info</h3>
                                    <div className="w-10 h-0.5 bg-crimson-600 rounded-full mb-4" />
                                    <p className="text-sm text-white/50">Allergies: {donor.allergies || "None"}</p>
                                    <p className="text-sm text-white/50">Medications: {donor.medications || "None"}</p>
                                    <p className="text-sm text-white/50 text-center">
                                        Contact: {donor.emergencyName ? `${donor.emergencyName}${donor.emergencyRelation ? ` (${donor.emergencyRelation})` : ""} · ${donor.emergencyPhone || "—"}` : "Not added"}
                                    </p>
                                    <button onClick={(e) => { e.stopPropagation(); setSettingsOpen(true); }} className="text-xs text-crimson-400 mt-6 underline">Edit details</button>
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-white/20 mt-3 uppercase tracking-widest">Click card to flip</p>
                        </div>

                        {/* Availability */}
                        <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
                            <div>
                                <p className="font-semibold text-sm">{donor.isAvailable ? "Available to donate" : "Not available"}</p>
                                <p className="text-xs text-white/40 mt-0.5">{donor.isAvailable ? "You'll get alerts for nearby requests" : "You won't receive request alerts"}</p>
                            </div>
                            <button role="switch" aria-checked={donor.isAvailable} onClick={toggleAvailability} className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${donor.isAvailable ? "bg-emerald-500" : "bg-white/15"}`}>
                                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${donor.isAvailable ? "translate-x-5" : ""}`} />
                            </button>
                        </div>

                        {/* Achievements */}
                        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-display font-bold flex items-center gap-2"><Award className="h-5 w-5 text-amber-400" /> Achievements</h2>
                                <span className="text-xs font-bold px-3 py-1.5 bg-crimson-600/20 text-crimson-400 rounded-full">Level {level}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {badges.map((b) => (
                                    <div key={b.label} className={`flex flex-col items-center transition-transform duration-300 hover:scale-105 ${!b.unlocked ? "opacity-40 grayscale" : ""}`}>
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-2 shadow-lg`}>
                                            <b.icon className="h-7 w-7 text-white" fill={b.unlocked ? "currentColor" : "none"} />
                                        </div>
                                        <span className="text-[10px] font-bold text-center text-white/60">{b.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">
                                    <span>Next milestone</span><span>{count}/{nextGoal}</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-crimson-500 to-amber-400 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (count / nextGoal) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: Heart, label: "Lives Impacted", value: count * 3, color: "text-rose-400", bg: "bg-rose-500/10" },
                                { icon: Droplet, label: "Total Donations", value: count, color: "text-crimson-400", bg: "bg-crimson-500/10" },
                                { icon: Activity, label: "Last Donation", value: donor.lastDonationDate ? timeAgo(donor.lastDonationDate) : "Never", color: "text-blue-400", bg: "bg-blue-500/10" },
                                { icon: Clock, label: "Next Eligible", value: eligible ? "Available now" : `In ${daysLeft} days`, color: eligible ? "text-emerald-400" : "text-amber-400", bg: eligible ? "bg-emerald-500/10" : "bg-amber-500/10" },
                            ].map((s) => (
                                <div key={s.label} className="group flex items-center gap-5 p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
                                    <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                        <s.icon className={`h-7 w-7 ${s.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1">{s.label}</p>
                                        <p className="text-2xl font-display font-black">{s.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Urgent Matches */}
                        <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-display font-bold">Requests You Can Help With</h2>
                                    <p className="text-xs text-white/40 mt-1">Compatible with {donor.bloodType}, near {donor.city}</p>
                                </div>
                                <Link to="/request-blood" className="text-xs font-bold text-crimson-400 flex items-center gap-1 hover:text-crimson-300 px-3 py-1.5 rounded-lg hover:bg-crimson-600/10 transition-all">
                                    Request blood <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {matches.loading ? (
                                <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
                            ) : matches.data.length === 0 ? (
                                <div className="text-center py-10">
                                    <CheckCircle className="h-10 w-10 text-emerald-400/50 mx-auto mb-3" />
                                    <p className="text-white/50 text-sm">No open requests near you right now. We'll notify you when someone needs your help.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {matches.data.map((r) => {
                                        const S = URGENCY_STYLE[r.urgency] || URGENCY_STYLE.routine;
                                        return (
                                            <div key={r.id} className={`group p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${S.card}`}>
                                                {r.urgency === "critical" && <div className="absolute top-0 left-0 w-1 h-full bg-crimson-600" />}
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                                    <div className="flex gap-4 items-center">
                                                        <div className={`h-14 w-14 rounded-xl flex items-center justify-center font-display font-black text-xl flex-shrink-0 ${r.urgency === "critical" ? "bg-crimson-600 text-white shadow-lg shadow-crimson-600/30" : "bg-white/5 text-white/70 border border-white/10"}`}>{r.bloodType}</div>
                                                        <div>
                                                            <p className="font-display font-bold text-lg">{r.hospital}</p>
                                                            <p className={`text-xs font-semibold flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 ${S.text}`}>
                                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {S.label}</span>
                                                                <span>• {r.units} unit{r.units > 1 ? "s" : ""}</span>
                                                                <span>• {r.distanceKm != null ? `${r.distanceKm} km` : r.city}</span>
                                                                <span className="text-white/30">• {timeAgo(r.createdAt)}</span>
                                                            </p>
                                                            <p className="text-xs text-white/40 mt-1">For {r.patientName}{r.notes ? ` — ${r.notes}` : ""}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 flex-shrink-0">
                                                        <a href={mapsUrl(r)} target="_blank" rel="noopener noreferrer" className="px-4 py-3 border border-white/10 text-white/60 rounded-xl text-sm hover:bg-white/5 flex items-center gap-1"><MapPin className="h-4 w-4" /> Map</a>
                                                        {r.responded ? (
                                                            <a href={`tel:${r.contactPhone}`} className="px-5 py-3 bg-emerald-600/20 text-emerald-300 border border-emerald-500/20 rounded-xl font-bold text-sm flex items-center gap-2"><Phone className="h-4 w-4" /> {r.contactPhone}</a>
                                                        ) : (
                                                            <button onClick={() => { setRespondTo(r); setRespondResult(null); }} disabled={!eligible || !donor.isAvailable}
                                                                title={!eligible ? "You are not yet eligible to donate again" : !donor.isAvailable ? "Turn on availability to respond" : ""}
                                                                className="px-5 py-3 bg-crimson-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-crimson-600/20 hover:bg-crimson-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
                                                                Respond Now
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Donation history */}
                        <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-display font-bold">Donation History</h2>
                                <button onClick={() => setLogOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500"><Plus className="h-4 w-4" /> Log donation</button>
                            </div>
                            {donations.length === 0 ? (
                                <p className="text-white/40 text-sm text-center py-6">No donations recorded yet. After you donate, log it here to track your eligibility.</p>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {donations.map((d) => (
                                        <div key={d.id} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-crimson-600/15 flex items-center justify-center"><Droplet className="h-4 w-4 text-crimson-400" /></div>
                                                <div>
                                                    <p className="text-sm font-semibold">{formatDate(d.date)}</p>
                                                    <p className="text-xs text-white/40">{d.location || "Location not specified"} · {d.units} unit{d.units > 1 ? "s" : ""}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {d.verified ? <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400">Verified</span> : (
                                                    <button onClick={() => deleteDonation(d)} aria-label="Delete donation" className="text-white/30 hover:text-crimson-400"><Trash2 className="h-4 w-4" /></button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* My requests (shown for any user who created one) */}
            {myRequests.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 pb-12">
                    <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
                        <h2 className="text-xl font-display font-bold mb-6">My Blood Requests</h2>
                        <div className="space-y-4">
                            {myRequests.map((r) => (
                                <div key={r.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">{r.bloodType} for {r.patientName} · {r.hospital}, {r.city}</p>
                                            <p className="text-xs text-white/40 mt-1">{r.publicId} · {r.units} unit(s) · {r.urgency} · <span className="capitalize">{r.status}</span> · {timeAgo(r.createdAt)}</p>
                                        </div>
                                        {["pending", "assigned"].includes(r.status) && (
                                            <div className="flex gap-2">
                                                <button onClick={() => updateMyRequest(r, "completed")} className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30">Mark fulfilled</button>
                                                <button onClick={() => updateMyRequest(r, "cancelled")} className="px-4 py-2 text-xs font-semibold rounded-lg border border-white/10 text-white/50 hover:bg-white/5">Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                    {r.responders.length > 0 && (
                                        <div className="mt-4 grid sm:grid-cols-2 gap-2">
                                            {r.responders.map((x) => (
                                                <div key={x.donorId} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                                    <div>
                                                        <p className="text-sm font-semibold">{x.name} <span className="text-crimson-400">({x.bloodType})</span></p>
                                                        <p className="text-xs text-white/40">{x.message || "Offered to donate"} · {timeAgo(x.at)}</p>
                                                    </div>
                                                    <a href={`tel:${x.phone}`} className="text-xs font-semibold text-emerald-300 flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Call</a>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {respondTo && (
                <Modal title={respondResult ? "Thank you!" : "Respond to request"} onClose={() => setRespondTo(null)}>
                    {respondResult ? (
                        <div className="space-y-4">
                            <p className="text-sm text-white/60">The requester has been notified. Please contact them now to arrange the donation:</p>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-sm">
                                <p><span className="text-white/40">Contact:</span> {respondResult.name}</p>
                                <p><span className="text-white/40">Phone:</span> <a className="text-emerald-300 font-semibold" href={`tel:${respondResult.phone}`}>{respondResult.phone}</a></p>
                                {respondResult.email && <p><span className="text-white/40">Email:</span> {respondResult.email}</p>}
                                <p><span className="text-white/40">Where:</span> {respondResult.hospital}, {respondResult.city}</p>
                            </div>
                            <a href={`tel:${respondResult.phone}`} className="block text-center w-full py-3 bg-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-500">Call now</a>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); respond(e.target.message.value); }} className="space-y-4">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-crimson-600/5 border border-crimson-600/20">
                                <AlertCircle className="h-5 w-5 text-crimson-400 flex-shrink-0" />
                                <p className="text-sm text-white/70">{respondTo.units} unit(s) of <strong>{respondTo.bloodType}</strong> needed at {respondTo.hospital}, {respondTo.city} for {respondTo.patientName}.</p>
                            </div>
                            <textarea name="message" rows={3} maxLength={300} placeholder="Optional message, e.g. 'I can reach in 30 minutes'" className="input-premium resize-none" />
                            <p className="text-xs text-white/40">Your name, blood group and phone number will be shared with the requester.</p>
                            <button disabled={busy} className="w-full py-3 bg-crimson-600 rounded-xl font-semibold text-sm hover:bg-crimson-500 disabled:opacity-50">{busy ? "Sending…" : "I can donate"}</button>
                        </form>
                    )}
                </Modal>
            )}

            {logOpen && (
                <Modal title="Log a donation" onClose={() => setLogOpen(false)}>
                    <form onSubmit={logDonation} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Date</label>
                            <input type="date" required max={new Date().toISOString().slice(0, 10)} value={logForm.date} onChange={(e) => setLogForm((f) => ({ ...f, date: e.target.value }))} className="input-premium" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Blood bank / hospital</label>
                            <input value={logForm.location} onChange={(e) => setLogForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. PGIMER Blood Bank" className="input-premium" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Units</label>
                            <select value={logForm.units} onChange={(e) => setLogForm((f) => ({ ...f, units: Number(e.target.value) }))} className="input-premium">
                                {[1, 2].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <button disabled={busy} className="w-full py-3 bg-crimson-600 rounded-xl font-semibold text-sm hover:bg-crimson-500 disabled:opacity-50">{busy ? "Saving…" : "Save donation"}</button>
                    </form>
                </Modal>
            )}

            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}
