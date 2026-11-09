import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users, Droplet, AlertCircle, TrendingUp, Shield, LogOut, Search, Edit, Trash2, CheckCircle, Clock, Activity, Plus,
    Settings, LayoutDashboard, FileText, Box, Mail, KeyRound, X, Copy, RefreshCw, UserCog, Ban, Home as HomeIcon, Menu,
} from "lucide-react";
import { api, API_BASE, BLOOD_TYPES, formatDate, timeAgo } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import NotificationBell from "../components/NotificationBell";
import SettingsModal from "../components/SettingsModal";

const COMPATIBLE = { "O-": ["O-"], "O+": ["O+", "O-"], "A-": ["A-", "O-"], "A+": ["A+", "A-", "O+", "O-"], "B-": ["B-", "O-"], "B+": ["B+", "B-", "O+", "O-"], "AB-": ["AB-", "A-", "B-", "O-"], "AB+": BLOOD_TYPES };

const L = ({ children }) => <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">{children}</label>;
const inputCls = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-crimson-500";

function Modal({ title, onClose, children, wide }) {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#101017] p-6 text-white`}>
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-display font-bold text-lg">{title}</h3>
                    <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Pager({ p, onPage }) {
    if (!p || (p.pages || 1) <= 1) return null;
    return (
        <div className="flex items-center justify-end gap-2 mt-4 text-sm">
            <button disabled={p.page <= 1} onClick={() => onPage(p.page - 1)} className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30">Prev</button>
            <span className="text-white/40">Page {p.page} of {p.pages}</span>
            <button disabled={p.page >= p.pages} onClick={() => onPage(p.page + 1)} className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30">Next</button>
        </div>
    );
}

const Empty = ({ cols, text = "Nothing here yet" }) => <tr><td colSpan={cols} className="p-10 text-center text-white/30 text-sm">{text}</td></tr>;

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    useEffect(() => { const t = setTimeout(() => setSearch(searchInput.trim()), 350); return () => clearTimeout(t); }, [searchInput]);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);

    const tabs = [
        { id: "overview", icon: LayoutDashboard, label: "Overview" },
        { id: "donors", icon: Users, label: "Donors" },
        { id: "requests", icon: FileText, label: "Requests" },
        { id: "inventory", icon: Box, label: "Inventory" },
        { id: "users", icon: UserCog, label: "Users" },
        { id: "messages", icon: Mail, label: "Messages" },
        { id: "api", icon: KeyRound, label: "API Keys" },
    ];

    const handleLogout = () => { logout(); window.location.replace("/admin-login"); };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex">
            <aside className={`fixed md:static inset-y-0 left-0 z-40 w-72 border-r border-white/5 p-6 flex flex-col bg-[#0d0d14] transition-transform md:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center"><Shield className="h-5 w-5 text-white" /></div>
                    <div>
                        <h2 className="font-display font-bold text-sm">Admin Panel</h2>
                        <p className="text-[10px] text-white/30">{user?.email}</p>
                    </div>
                </div>
                <nav className="space-y-1 flex-1">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setNavOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? "bg-crimson-600/10 text-crimson-400 border border-crimson-600/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
                            <tab.icon className="h-4 w-4" /> {tab.label}
                        </button>
                    ))}
                </nav>
                <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5"><HomeIcon className="h-4 w-4" /> View website</Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-crimson-400/60 hover:text-crimson-400 hover:bg-crimson-600/10 transition-all duration-300">
                    <LogOut className="h-4 w-4" /> Logout
                </button>
            </aside>
            {navOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setNavOpen(false)} />}

            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-white/5 px-4 md:px-8 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden p-2" onClick={() => setNavOpen(true)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
                        <h1 className="text-lg font-display font-bold">{tabs.find((t) => t.id === activeTab)?.label}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <form onSubmit={(e) => { e.preventDefault(); if (!["donors", "requests", "users"].includes(activeTab)) setActiveTab("donors"); }} className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search donors, requests, users…" className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson-500 w-64" />
                        </form>
                        <NotificationBell small />
                        <button onClick={() => setSettingsOpen(true)} aria-label="Settings" className="p-2 rounded-xl bg-white/5 hover:bg-white/10"><Settings className="h-4 w-4 text-white/40" /></button>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {activeTab === "overview" && <Overview go={setActiveTab} />}
                    {activeTab === "donors" && <DonorManagement search={search} />}
                    {activeTab === "requests" && <BloodRequests search={search} />}
                    {activeTab === "inventory" && <BloodInventory />}
                    {activeTab === "users" && <UserManagement search={search} />}
                    {activeTab === "messages" && <Messages />}
                    {activeTab === "api" && <ApiKeys />}
                </div>
            </main>
            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}

function AdminStat({ icon: Icon, label, value, color = "text-crimson-400", bg = "bg-crimson-500/10", onClick }) {
    return (
        <div onClick={onClick} className={`group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 ${onClick ? "cursor-pointer" : ""}`}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}><Icon className={`h-5 w-5 ${color}`} /></div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1">{label}</p>
            <p className="text-2xl font-display font-black">{value ?? "—"}</p>
        </div>
    );
}

function Overview({ go }) {
    const [s, setS] = useState(null);
    const [err, setErr] = useState("");
    useEffect(() => { api("/admin/stats").then(setS).catch((e) => setErr(e.message)); }, []);
    if (err) return <p className="text-crimson-400">{err}</p>;
    const max = Math.max(1, ...(s?.week || []).map((d) => d.donors + d.requests + d.donations));
    return (
        <div className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AdminStat icon={Users} label="Total Donors" value={s?.donors} color="text-blue-400" bg="bg-blue-500/10" onClick={() => go("donors")} />
                <AdminStat icon={Droplet} label="Open Requests" value={s?.openRequests} onClick={() => go("requests")} />
                <AdminStat icon={AlertCircle} label="Critical Requests" value={s?.criticalRequests} color="text-amber-400" bg="bg-amber-500/10" onClick={() => go("requests")} />
                <AdminStat icon={Clock} label="Pending Verification" value={s?.pending} color="text-purple-400" bg="bg-purple-500/10" onClick={() => go("donors")} />
                <AdminStat icon={CheckCircle} label="Verified Donors" value={s?.verified} color="text-emerald-400" bg="bg-emerald-500/10" />
                <AdminStat icon={TrendingUp} label="Donations Today" value={s?.donationsToday} color="text-emerald-400" bg="bg-emerald-500/10" />
                <AdminStat icon={Activity} label="Fulfilled Today" value={s?.completedToday} color="text-blue-400" bg="bg-blue-500/10" />
                <AdminStat icon={Mail} label="New Messages" value={s?.newMessages} color="text-rose-400" bg="bg-rose-500/10" onClick={() => go("messages")} />
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-display font-bold">Last 7 Days</h3>
                        <div className="flex gap-3 text-[10px] text-white/40">
                            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-crimson-500" /> Donors</span>
                            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-amber-400" /> Requests</span>
                            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-emerald-400" /> Donations</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-3 h-44">
                        {(s?.week || []).map((d) => {
                            const t = d.donors + d.requests + d.donations;
                            return (
                                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end" title={`${d.date}: ${d.donors} donors, ${d.requests} requests, ${d.donations} donations`}>
                                    <span className="text-[10px] text-white/40">{t || ""}</span>
                                    <div className="w-full rounded-lg overflow-hidden flex flex-col-reverse" style={{ height: `${Math.max(3, (t / max) * 100)}%` }}>
                                        <div className="bg-crimson-500" style={{ flex: d.donors }} />
                                        <div className="bg-amber-400" style={{ flex: d.requests }} />
                                        <div className="bg-emerald-400" style={{ flex: d.donations }} />
                                        {!t && <div className="bg-white/10 flex-1" />}
                                    </div>
                                    <span className="text-[10px] text-white/20">{d.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                    <h3 className="font-display font-bold mb-5">Donors by Blood Group</h3>
                    <div className="space-y-3">
                        {BLOOD_TYPES.map((t) => {
                            const n = s?.donorsByBloodType?.[t] || 0;
                            return (
                                <div key={t} className="flex items-center gap-3">
                                    <span className="w-10 text-xs font-bold text-crimson-400">{t}</span>
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-crimson-600 to-crimson-400" style={{ width: `${s?.donors ? (n / s.donors) * 100 : 0}%` }} /></div>
                                    <span className="w-8 text-right text-xs text-white/50">{n}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

const EMPTY_DONOR = { name: "", phone: "", email: "", bloodType: "O+", city: "", state: "", gender: "", lastDonationDate: "", isAvailable: true, status: "verified" };

function DonorManagement({ search }) {
    const toast = useToast();
    const [status, setStatus] = useState("");
    const [bloodType, setBloodType] = useState("");
    const [page, setPage] = useState(1);
    const [res, setRes] = useState({ data: [], pagination: null });
    const [stats, setStats] = useState(null);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [donationFor, setDonationFor] = useState(null);

    const load = useCallback(() => {
        api("/admin/donors", { query: { q: search, status, bloodType, page } }).then(setRes).catch((e) => toast.error(e.message));
        api("/admin/stats").then(setStats).catch(() => {});
    }, [search, status, bloodType, page, toast]);
    useEffect(() => { load(); }, [load]);
    // Go back to page 1 whenever the search changes (React's "adjust state on prop change" pattern).
    const [prevSearch, setPrevSearch] = useState(search);
    if (search !== prevSearch) { setPrevSearch(search); setPage(1); }

    const setDonorStatus = async (d, s) => {
        try { await api(`/admin/donors/${d.id}`, { method: "PATCH", body: { status: s } }); toast.success(`${d.name} marked ${s}`); load(); } catch (e) { toast.error(e.message); }
    };
    const remove = async (d) => {
        if (!window.confirm(`Delete donor ${d.name}? This cannot be undone.`)) return;
        try { await api(`/admin/donors/${d.id}`, { method: "DELETE" }); toast.success("Donor deleted"); load(); } catch (e) { toast.error(e.message); }
    };
    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const body = { ...editing };
            if (editing.id) await api(`/admin/donors/${editing.id}`, { method: "PATCH", body });
            else await api("/admin/donors", { method: "POST", body });
            toast.success(editing.id ? "Donor updated" : "Donor added");
            setEditing(null);
            load();
        } catch (err) { toast.error(err.message); } finally { setSaving(false); }
    };
    const recordDonation = async (e) => {
        e.preventDefault();
        try {
            await api(`/admin/donors/${donationFor.id}/donations`, { method: "POST", body: { date: e.target.date.value, location: e.target.location.value, units: e.target.units.value } });
            toast.success("Donation recorded"); setDonationFor(null); load();
        } catch (err) { toast.error(err.message); }
    };
    const set = (k) => (e) => setEditing((d) => ({ ...d, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

    return (
        <div>
            <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
                <div className="flex gap-2">
                    <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={inputCls + " w-40"}>
                        <option value="">All statuses</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option>
                    </select>
                    <select value={bloodType} onChange={(e) => { setBloodType(e.target.value); setPage(1); }} className={inputCls + " w-32"}>
                        <option value="">All types</option>{BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}
                    </select>
                </div>
                <button onClick={() => setEditing({ ...EMPTY_DONOR })} className="flex items-center gap-2 px-5 py-2.5 bg-crimson-600 text-white rounded-xl text-sm font-semibold hover:bg-crimson-500"><Plus className="h-4 w-4" /> Add Donor</button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <AdminStat icon={Users} label="Total Donors" value={stats?.donors} color="text-blue-400" bg="bg-blue-500/10" />
                <AdminStat icon={CheckCircle} label="Verified" value={stats?.verified} color="text-emerald-400" bg="bg-emerald-500/10" />
                <AdminStat icon={Clock} label="Pending" value={stats?.pending} color="text-amber-400" bg="bg-amber-500/10" />
            </div>
            <div className="rounded-2xl border border-white/5 overflow-x-auto">
                <table className="w-full text-left min-w-[860px]">
                    <thead className="bg-white/[0.03] text-white/30 text-[10px] uppercase tracking-wider">
                        <tr>{["ID", "Name", "Blood", "Contact", "Location", "Last donation", "Status", "Actions"].map((h) => <th key={h} className="p-4 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {res.data.length === 0 && <Empty cols={8} text="No donors match these filters" />}
                        {res.data.map((d) => (
                            <tr key={d.id} className="hover:bg-white/[0.02]">
                                <td className="p-4 font-mono text-xs text-white/50">{d.publicId}</td>
                                <td className="p-4 text-sm font-medium">{d.name}<p className="text-[10px] text-white/30">{d.userId ? "Has account" : "Added by admin"} · {d.donationCount} donations</p></td>
                                <td className="p-4"><span className="bg-crimson-600/20 text-crimson-400 px-2.5 py-1 rounded-lg font-bold text-xs">{d.bloodType}</span></td>
                                <td className="p-4 text-xs text-white/60">{d.phone}<br /><span className="text-white/30">{d.email}</span></td>
                                <td className="p-4 text-white/40 text-sm">{[d.city, d.state].filter(Boolean).join(", ")}</td>
                                <td className="p-4 text-xs text-white/50">{d.lastDonationDate ? formatDate(d.lastDonationDate) : "Never"}<br /><span className={d.available ? "text-emerald-400" : "text-white/30"}>{d.available ? "Available" : "Unavailable"}</span></td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${d.status === "verified" ? "bg-emerald-500/10 text-emerald-400" : d.status === "rejected" ? "bg-crimson-500/10 text-crimson-400" : "bg-amber-500/10 text-amber-400"}`}>{d.status}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-3 items-center">
                                        {d.status !== "verified" && <button title="Verify" onClick={() => setDonorStatus(d, "verified")} className="text-emerald-400/70 hover:text-emerald-400"><CheckCircle className="h-4 w-4" /></button>}
                                        {d.status !== "rejected" && <button title="Reject" onClick={() => setDonorStatus(d, "rejected")} className="text-amber-400/60 hover:text-amber-400"><Ban className="h-4 w-4" /></button>}
                                        <button title="Record donation" onClick={() => setDonationFor(d)} className="text-crimson-300/60 hover:text-crimson-300"><Droplet className="h-4 w-4" /></button>
                                        <button title="Edit" onClick={() => setEditing({ ...d, lastDonationDate: d.lastDonationDate?.slice(0, 10) || "", email: d.email || "" })} className="text-blue-400/60 hover:text-blue-400"><Edit className="h-4 w-4" /></button>
                                        <button title="Delete" onClick={() => remove(d)} className="text-crimson-400/60 hover:text-crimson-400"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pager p={res.pagination} onPage={setPage} />

            {editing && (
                <Modal title={editing.id ? `Edit ${editing.name}` : "Add donor"} onClose={() => setEditing(null)} wide>
                    <form onSubmit={save} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div><L>Full name *</L><input required className={inputCls} value={editing.name} onChange={set("name")} disabled={Boolean(editing.userId)} /></div>
                            <div><L>Phone *</L><input required className={inputCls} value={editing.phone} onChange={set("phone")} /></div>
                            {!editing.id && <div><L>Email</L><input type="email" className={inputCls} value={editing.email} onChange={set("email")} /></div>}
                            <div><L>Blood group *</L><select className={inputCls} value={editing.bloodType} onChange={set("bloodType")}>{BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}</select></div>
                            <div><L>City *</L><input required className={inputCls} value={editing.city} onChange={set("city")} /></div>
                            <div><L>State</L><input className={inputCls} value={editing.state || ""} onChange={set("state")} /></div>
                            <div><L>Gender</L><select className={inputCls} value={editing.gender || ""} onChange={set("gender")}><option value="">—</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                            <div><L>Last donation</L><input type="date" max={new Date().toISOString().slice(0, 10)} className={inputCls} value={editing.lastDonationDate} onChange={set("lastDonationDate")} /></div>
                            <div><L>Status</L><select className={inputCls} value={editing.status} onChange={set("status")}><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select></div>
                        </div>
                        {editing.userId && <p className="text-xs text-white/30">Name and email are managed by the donor's own account.</p>}
                        <label className="flex items-center gap-2 text-sm text-white/60"><input type="checkbox" checked={editing.isAvailable} onChange={set("isAvailable")} /> Available to donate</label>
                        <button disabled={saving} className="w-full py-3 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500 disabled:opacity-50">{saving ? "Saving…" : "Save donor"}</button>
                    </form>
                </Modal>
            )}
            {donationFor && (
                <Modal title={`Record donation — ${donationFor.name}`} onClose={() => setDonationFor(null)}>
                    <form onSubmit={recordDonation} className="space-y-4">
                        <div><L>Date</L><input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} max={new Date().toISOString().slice(0, 10)} className={inputCls} /></div>
                        <div><L>Location</L><input name="location" className={inputCls} placeholder="Blood bank / camp" /></div>
                        <div><L>Units</L><input name="units" type="number" min="1" max="4" defaultValue="1" className={inputCls} /></div>
                        <button className="w-full py-3 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500">Save (marked verified)</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function BloodRequests({ search }) {
    const toast = useToast();
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [res, setRes] = useState({ data: [], pagination: null });
    const [stats, setStats] = useState(null);
    const [assigning, setAssigning] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [creating, setCreating] = useState(false);

    const load = useCallback(() => {
        api("/admin/requests", { query: { q: search, status, page } }).then(setRes).catch((e) => toast.error(e.message));
        api("/admin/stats").then(setStats).catch(() => {});
    }, [search, status, page, toast]);
    useEffect(() => { load(); }, [load]);
    const [prevSearch, setPrevSearch] = useState(search);
    if (search !== prevSearch) { setPrevSearch(search); setPage(1); }

    const update = async (r, body, msg) => {
        try { await api(`/admin/requests/${r.id}`, { method: "PATCH", body }); toast.success(msg); load(); } catch (e) { toast.error(e.message); }
    };
    const openAssign = async (r) => {
        setAssigning(r);
        setCandidates([]);
        try {
            const out = await api("/donors", { query: { compatibleWith: r.bloodType, available: "true", city: r.city, limit: 50 } });
            const all = out.data.length ? out.data : (await api("/donors", { query: { compatibleWith: r.bloodType, available: "true", limit: 50 } })).data;
            const responderIds = new Set(r.responders.map((x) => x.donorId));
            setCandidates(all.sort((a, b) => Number(responderIds.has(b.id)) - Number(responderIds.has(a.id))).map((d) => ({ ...d, responded: responderIds.has(d.id) })));
        } catch (e) { toast.error(e.message); }
    };
    const rebroadcast = async (r) => {
        try { const out = await api(`/admin/requests/${r.id}/rebroadcast`, { method: "POST" }); toast.success(`${out.matchedDonors} donor(s) alerted`); } catch (e) { toast.error(e.message); }
    };
    const remove = async (r) => {
        if (!window.confirm("Delete this request permanently?")) return;
        try { await api(`/admin/requests/${r.id}`, { method: "DELETE" }); load(); } catch (e) { toast.error(e.message); }
    };
    const create = async (e) => {
        e.preventDefault();
        const body = Object.fromEntries(new FormData(e.target));
        try { const out = await api("/admin/requests", { method: "POST", body }); toast.success(`Request created, ${out.matchedDonors} donor(s) alerted`); setCreating(false); load(); } catch (err) { toast.error(err.message); }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={inputCls + " w-44"}>
                    <option value="">All statuses</option><option value="pending">Pending</option><option value="assigned">Assigned</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
                <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-5 py-2.5 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500"><Plus className="h-4 w-4" /> New Request</button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <AdminStat icon={AlertCircle} label="Critical (open)" value={stats?.criticalRequests} />
                <AdminStat icon={Clock} label="Open" value={stats?.openRequests} color="text-amber-400" bg="bg-amber-500/10" />
                <AdminStat icon={CheckCircle} label="Completed Today" value={stats?.completedToday} color="text-emerald-400" bg="bg-emerald-500/10" />
            </div>
            <div className="rounded-2xl border border-white/5 overflow-x-auto">
                <table className="w-full text-left min-w-[960px]">
                    <thead className="bg-white/[0.03] text-white/30 text-[10px] uppercase tracking-wider">
                        <tr>{["Req ID", "Patient", "Type", "Hospital", "Contact", "Urgency", "Status", "Donor", "Actions"].map((h) => <th key={h} className="p-4 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {res.data.length === 0 && <Empty cols={9} text="No requests" />}
                        {res.data.map((r) => (
                            <tr key={r.id} className="hover:bg-white/[0.02] align-top">
                                <td className="p-4 font-mono text-xs text-white/50">{r.publicId}<p className="text-[10px] text-white/25 font-sans">{timeAgo(r.createdAt)}</p></td>
                                <td className="p-4 text-sm font-medium">{r.patientName}<p className="text-[10px] text-white/30">{r.units} unit(s)</p></td>
                                <td className="p-4"><span className="bg-crimson-600/20 text-crimson-400 px-2.5 py-1 rounded-lg font-bold text-xs">{r.bloodType}</span></td>
                                <td className="p-4 text-white/50 text-sm">{r.hospital}<p className="text-[10px] text-white/30">{r.city}</p></td>
                                <td className="p-4 text-xs text-white/60">{r.contactName}<br /><a href={`tel:${r.contactPhone}`} className="text-white/40">{r.contactPhone}</a></td>
                                <td className="p-4">
                                    <select value={r.urgency} onChange={(e) => update(r, { urgency: e.target.value }, "Urgency updated")} className={`text-xs font-semibold rounded-lg px-2 py-1 bg-transparent border border-white/10 ${r.urgency === "critical" ? "text-crimson-400" : r.urgency === "high" ? "text-amber-400" : "text-blue-400"}`}>
                                        <option value="routine">Routine</option><option value="high">High</option><option value="critical">Critical</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    <select value={r.status} onChange={(e) => update(r, { status: e.target.value }, "Status updated")} className="text-xs font-semibold rounded-lg px-2 py-1 bg-transparent border border-white/10 text-white/70 capitalize">
                                        <option value="pending">Pending</option><option value="assigned">Assigned</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="p-4 text-xs">
                                    {r.assignedDonor ? <span className="text-emerald-300">{r.assignedDonor.name} ({r.assignedDonor.bloodType})</span> : <span className="text-white/30">—</span>}
                                    {r.responders.length > 0 && <p className="text-[10px] text-amber-300 mt-1">{r.responders.length} responded</p>}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2 items-center">
                                        {["pending", "assigned"].includes(r.status) && <>
                                            <button onClick={() => openAssign(r)} className="text-xs bg-white/5 text-white/70 px-3 py-1.5 rounded-lg hover:bg-white/10">Assign</button>
                                            <button title="Re-alert matching donors" onClick={() => rebroadcast(r)} className="text-white/40 hover:text-white"><RefreshCw className="h-4 w-4" /></button>
                                        </>}
                                        <button title="Delete" onClick={() => remove(r)} className="text-crimson-400/60 hover:text-crimson-400"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pager p={res.pagination} onPage={setPage} />

            {assigning && (
                <Modal title={`Assign donor — ${assigning.publicId} (${assigning.bloodType})`} onClose={() => setAssigning(null)} wide>
                    <p className="text-xs text-white/40 mb-4">Compatible, available donors{candidates.some((c) => c.city?.toLowerCase() === assigning.city.toLowerCase()) ? ` in ${assigning.city}` : ""}. Donors who responded are listed first. The donor will be notified.</p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {candidates.length === 0 && <p className="text-sm text-white/40 py-6 text-center">No available compatible donors found.</p>}
                        {candidates.map((d) => (
                            <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                <div>
                                    <p className="text-sm font-semibold">{d.name} <span className="text-crimson-400">({d.bloodType})</span> {d.responded && <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">responded</span>}</p>
                                    <p className="text-xs text-white/40">{d.city} · {d.donationCount} donations · {d.verified ? "verified" : "unverified"}</p>
                                </div>
                                <button onClick={async () => { await update(assigning, { assignedDonorId: d.id }, `${d.name} assigned`); setAssigning(null); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-crimson-600 hover:bg-crimson-500">Assign</button>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
            {creating && (
                <Modal title="New blood request" onClose={() => setCreating(false)} wide>
                    <form onSubmit={create} className="grid sm:grid-cols-2 gap-4">
                        <div><L>Patient name *</L><input name="patientName" required className={inputCls} /></div>
                        <div><L>Blood group *</L><select name="bloodType" className={inputCls}>{BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}</select></div>
                        <div><L>Hospital *</L><input name="hospital" required className={inputCls} /></div>
                        <div><L>City *</L><input name="city" required className={inputCls} /></div>
                        <div><L>Units</L><input name="units" type="number" min="1" defaultValue="1" className={inputCls} /></div>
                        <div><L>Urgency</L><select name="urgency" className={inputCls}><option value="routine">Routine</option><option value="high">High</option><option value="critical">Critical</option></select></div>
                        <div><L>Contact name *</L><input name="contactName" required className={inputCls} /></div>
                        <div><L>Contact phone *</L><input name="contactPhone" required className={inputCls} /></div>
                        <div className="sm:col-span-2"><L>Notes</L><input name="notes" className={inputCls} /></div>
                        <button className="sm:col-span-2 py-3 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500">Create & alert donors</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function BloodInventory() {
    const toast = useToast();
    const [rows, setRows] = useState([]);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({});
    const load = useCallback(() => api("/admin/inventory").then((r) => { setRows(r.data); setDraft(Object.fromEntries(r.data.map((x) => [x.bloodType, x.units]))); }).catch((e) => toast.error(e.message)), [toast]);
    useEffect(() => { load(); }, [load]);

    const statusOf = (u) => (u <= 5 ? "Critical" : u <= 20 ? "Low" : u <= 100 ? "Adequate" : "Good");
    const getColor = (s) => ({
        Good: { bar: "from-emerald-500 to-emerald-400", badge: "bg-emerald-500/10 text-emerald-400" },
        Adequate: { bar: "from-blue-500 to-blue-400", badge: "bg-blue-500/10 text-blue-400" },
        Low: { bar: "from-amber-500 to-amber-400", badge: "bg-amber-500/10 text-amber-400" },
        Critical: { bar: "from-crimson-600 to-crimson-400", badge: "bg-crimson-500/10 text-crimson-400" },
    }[s]);

    const save = async () => {
        try {
            await api("/admin/inventory", { method: "PUT", body: { items: Object.entries(draft).map(([bloodType, units]) => ({ bloodType, units: Number(units) })) } });
            toast.success("Stock updated"); setEditing(false); load();
        } catch (e) { toast.error(e.message); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-white/40">Units currently in stock. Public partners can read this via the API.</p>
                {editing ? (
                    <div className="flex gap-2">
                        <button onClick={() => { setEditing(false); load(); }} className="px-5 py-2.5 border border-white/10 rounded-xl text-sm">Cancel</button>
                        <button onClick={save} className="px-5 py-2.5 bg-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-500">Save stock</button>
                    </div>
                ) : (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500"><Activity className="h-4 w-4" /> Update Stock</button>
                )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {rows.map((b) => {
                    const units = editing ? Number(draft[b.bloodType] || 0) : b.units;
                    const s = statusOf(units);
                    const c = getColor(s);
                    return (
                        <div key={b.bloodType} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] relative overflow-hidden">
                            {s === "Critical" && <div className="absolute top-0 left-0 right-0 h-0.5 bg-crimson-600 animate-pulse" />}
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-crimson-600/20 text-crimson-400 text-2xl font-display font-black px-4 py-2 rounded-xl">{b.bloodType}</div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${c.badge}`}>{s}</span>
                            </div>
                            <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1">Available Units</p>
                            {editing ? (
                                <input type="number" min="0" value={draft[b.bloodType]} onChange={(e) => setDraft((d) => ({ ...d, [b.bloodType]: e.target.value }))} className={inputCls + " text-2xl font-black mb-4"} />
                            ) : <p className="text-3xl font-display font-black mb-4">{b.units}</p>}
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${c.bar}`} style={{ width: `${Math.min((units / 200) * 100, 100)}%` }} /></div>
                            <p className="text-[10px] text-white/25 mt-3">{b.updatedAt ? `Updated ${timeAgo(b.updatedAt)}` : "Never updated"}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function UserManagement({ search }) {
    const toast = useToast();
    const { user: me } = useAuth();
    const [page, setPage] = useState(1);
    const [res, setRes] = useState({ data: [], pagination: null });
    const [creating, setCreating] = useState(false);
    const load = useCallback(() => api("/admin/users", { query: { q: search, page } }).then(setRes).catch((e) => toast.error(e.message)), [search, page, toast]);
    useEffect(() => { load(); }, [load]);
    const [prevSearch, setPrevSearch] = useState(search);
    if (search !== prevSearch) { setPrevSearch(search); setPage(1); }

    const patch = async (u, body, msg) => { try { await api(`/admin/users/${u.id}`, { method: "PATCH", body }); toast.success(msg); load(); } catch (e) { toast.error(e.message); } };
    const remove = async (u) => {
        if (!window.confirm(`Delete ${u.email} and all their data?`)) return;
        try { await api(`/admin/users/${u.id}`, { method: "DELETE" }); toast.success("User deleted"); load(); } catch (e) { toast.error(e.message); }
    };
    const create = async (e) => {
        e.preventDefault();
        try { await api("/admin/users", { method: "POST", body: Object.fromEntries(new FormData(e.target)) }); toast.success("User created"); setCreating(false); load(); } catch (err) { toast.error(err.message); }
    };

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-5 py-2.5 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500"><Plus className="h-4 w-4" /> Add user / admin</button>
            </div>
            <div className="rounded-2xl border border-white/5 overflow-x-auto">
                <table className="w-full text-left min-w-[820px]">
                    <thead className="bg-white/[0.03] text-white/30 text-[10px] uppercase tracking-wider">
                        <tr>{["Name", "Email", "Role", "Donor", "Joined", "Last login", "Actions"].map((h) => <th key={h} className="p-4 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {res.data.length === 0 && <Empty cols={7} />}
                        {res.data.map((u) => (
                            <tr key={u.id} className={`hover:bg-white/[0.02] ${u.isActive ? "" : "opacity-50"}`}>
                                <td className="p-4 text-sm font-medium">{`${u.firstName} ${u.lastName}`.trim() || "—"}{!u.isActive && <span className="ml-2 text-[10px] text-crimson-400">disabled</span>}</td>
                                <td className="p-4 text-sm text-white/60">{u.email}</td>
                                <td className="p-4"><span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.role === "admin" ? "bg-purple-500/15 text-purple-300" : "bg-white/5 text-white/50"}`}>{u.role}</span></td>
                                <td className="p-4 text-xs text-white/50">{u.donor ? `${u.donor.bloodType} · ${u.donor.status}` : "—"}</td>
                                <td className="p-4 text-xs text-white/40">{formatDate(u.createdAt)}</td>
                                <td className="p-4 text-xs text-white/40">{timeAgo(u.lastLoginAt)}</td>
                                <td className="p-4">
                                    {u.id !== me.id && (
                                        <div className="flex gap-2">
                                            <button onClick={() => patch(u, { role: u.role === "admin" ? "user" : "admin" }, "Role updated")} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10">{u.role === "admin" ? "Make user" : "Make admin"}</button>
                                            <button onClick={() => patch(u, { isActive: !u.isActive }, u.isActive ? "User disabled" : "User enabled")} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10">{u.isActive ? "Disable" : "Enable"}</button>
                                            <button title="Delete" onClick={() => remove(u)} className="text-crimson-400/60 hover:text-crimson-400"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pager p={res.pagination} onPage={setPage} />
            {creating && (
                <Modal title="Add user" onClose={() => setCreating(false)}>
                    <form onSubmit={create} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div><L>First name *</L><input name="firstName" required className={inputCls} /></div>
                            <div><L>Last name</L><input name="lastName" className={inputCls} /></div>
                        </div>
                        <div><L>Email *</L><input name="email" type="email" required className={inputCls} /></div>
                        <div><L>Temporary password *</L><input name="password" required className={inputCls} placeholder="Min 8 chars, upper, lower, number, symbol" /></div>
                        <div><L>Role</L><select name="role" className={inputCls}><option value="user">User</option><option value="admin">Admin</option></select></div>
                        <button className="w-full py-3 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500">Create</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function Messages() {
    const toast = useToast();
    const [status, setStatus] = useState("");
    const [res, setRes] = useState({ data: [] });
    const [open, setOpen] = useState(null);
    const load = useCallback(() => api("/admin/messages", { query: { status } }).then(setRes).catch((e) => toast.error(e.message)), [status, toast]);
    useEffect(() => { load(); }, [load]);
    const setMsg = async (m, s) => { await api(`/admin/messages/${m.id}`, { method: "PATCH", body: { status: s } }); load(); };
    const remove = async (m) => { if (!window.confirm("Delete this message?")) return; await api(`/admin/messages/${m.id}`, { method: "DELETE" }); setOpen(null); load(); };

    return (
        <div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls + " w-40 mb-6"}>
                <option value="">All</option><option value="new">New</option><option value="read">Read</option><option value="resolved">Resolved</option>
            </select>
            <div className="space-y-3">
                {res.data.length === 0 && <p className="text-white/30 text-sm text-center py-12">No messages</p>}
                {res.data.map((m) => (
                    <div key={m.id} onClick={() => { setOpen(m); if (m.status === "new") setMsg(m, "read"); }} className={`p-5 rounded-2xl border cursor-pointer hover:bg-white/[0.04] ${m.status === "new" ? "border-crimson-600/30 bg-crimson-600/5" : "border-white/5 bg-white/[0.02]"}`}>
                        <div className="flex justify-between gap-3">
                            <p className="font-semibold text-sm">{m.name} <span className="text-white/40 font-normal">· {m.email}</span></p>
                            <span className="text-[10px] text-white/30 whitespace-nowrap">{timeAgo(m.createdAt)}</span>
                        </div>
                        <p className="text-xs text-white/50 mt-1">{m.inquiryType || "General"}{m.subject ? ` — ${m.subject}` : ""}</p>
                        <p className="text-sm text-white/60 mt-2 line-clamp-2">{m.message}</p>
                        <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-white/30">{m.status}</span>
                    </div>
                ))}
            </div>
            {open && (
                <Modal title={open.subject || open.inquiryType || "Message"} onClose={() => setOpen(null)} wide>
                    <p className="text-sm text-white/50 mb-1">From {open.name} · <a className="text-crimson-400" href={`mailto:${open.email}`}>{open.email}</a>{open.phone && <> · <a href={`tel:${open.phone}`}>{open.phone}</a></>}</p>
                    <p className="text-xs text-white/30 mb-4">{new Date(open.createdAt).toLocaleString("en-IN")}</p>
                    <p className="text-sm text-white/80 whitespace-pre-wrap p-4 rounded-xl bg-white/[0.03] border border-white/5">{open.message}</p>
                    <div className="flex gap-2 mt-5">
                        <a href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject || "Your message to LifeStream"}`)}`} className="px-4 py-2 bg-crimson-600 rounded-xl text-sm font-semibold">Reply by email</a>
                        <button onClick={() => { setMsg(open, "resolved"); setOpen(null); }} className="px-4 py-2 bg-emerald-600/20 text-emerald-300 rounded-xl text-sm font-semibold">Mark resolved</button>
                        <button onClick={() => remove(open)} className="px-4 py-2 border border-white/10 rounded-xl text-sm">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function ApiKeys() {
    const toast = useToast();
    const [keys, setKeys] = useState([]);
    const [newKey, setNewKey] = useState(null);
    const [form, setForm] = useState({ name: "", dailyLimit: 1000, canViewContacts: false });
    const load = useCallback(() => api("/admin/api-keys").then((r) => setKeys(r.data)).catch((e) => toast.error(e.message)), [toast]);
    useEffect(() => { load(); }, [load]);

    const create = async (e) => {
        e.preventDefault();
        try { setNewKey(await api("/admin/api-keys", { method: "POST", body: form })); setForm({ name: "", dailyLimit: 1000, canViewContacts: false }); load(); } catch (err) { toast.error(err.message); }
    };
    const patch = async (k, body) => { try { await api(`/admin/api-keys/${k.id}`, { method: "PATCH", body }); load(); } catch (e) { toast.error(e.message); } };
    const remove = async (k) => { if (!window.confirm(`Revoke and delete key "${k.name}"? Apps using it will stop working.`)) return; await api(`/admin/api-keys/${k.id}`, { method: "DELETE" }); load(); };
    const copy = (t) => navigator.clipboard.writeText(t).then(() => toast.success("Copied"));

    return (
        <div className="space-y-8">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <h3 className="font-display font-bold mb-1">Partner API</h3>
                <p className="text-sm text-white/40 mb-5">Issue keys to hospitals, blood banks or apps that integrate with LifeStream. They call <code className="text-crimson-300">/api/v1/*</code> with the header <code className="text-crimson-300">x-api-key</code>. See <code>backend/API.md</code> for the full reference.</p>
                <form onSubmit={create} className="grid sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-2"><L>Partner name *</L><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. City Hospital" className={inputCls} /></div>
                    <div><L>Daily limit</L><input type="number" min="1" value={form.dailyLimit} onChange={(e) => setForm((f) => ({ ...f, dailyLimit: e.target.value }))} className={inputCls} /></div>
                    <button className="py-2.5 bg-crimson-600 rounded-xl text-sm font-semibold hover:bg-crimson-500 flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Create key</button>
                    <label className="sm:col-span-4 flex items-center gap-2 text-sm text-white/60"><input type="checkbox" checked={form.canViewContacts} onChange={(e) => setForm((f) => ({ ...f, canViewContacts: e.target.checked }))} /> Allow this partner to see donor phone numbers and emails (only for vetted partners)</label>
                </form>
            </div>

            <div className="rounded-2xl border border-white/5 overflow-x-auto">
                <table className="w-full text-left min-w-[820px]">
                    <thead className="bg-white/[0.03] text-white/30 text-[10px] uppercase tracking-wider">
                        <tr>{["Name", "Key", "Usage today", "Total calls", "Last used", "Contacts", "Status", ""].map((h) => <th key={h} className="p-4 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {keys.length === 0 && <Empty cols={8} text="No API keys yet" />}
                        {keys.map((k) => (
                            <tr key={k.id} className="hover:bg-white/[0.02]">
                                <td className="p-4 text-sm font-medium">{k.name}<p className="text-[10px] text-white/30">Created {formatDate(k.createdAt)}</p></td>
                                <td className="p-4 font-mono text-xs text-white/50">{k.prefix}…</td>
                                <td className="p-4 text-sm">{k.usageToday} / {k.dailyLimit}</td>
                                <td className="p-4 text-sm text-white/60">{k.requestCount}</td>
                                <td className="p-4 text-xs text-white/40">{timeAgo(k.lastUsedAt)}</td>
                                <td className="p-4"><button onClick={() => patch(k, { canViewContacts: !k.canViewContacts })} className={`text-xs px-2 py-1 rounded-lg ${k.canViewContacts ? "bg-amber-500/15 text-amber-300" : "bg-white/5 text-white/40"}`}>{k.canViewContacts ? "Visible" : "Masked"}</button></td>
                                <td className="p-4"><button onClick={() => patch(k, { active: !k.active })} className={`text-xs px-2 py-1 rounded-lg ${k.active ? "bg-emerald-500/15 text-emerald-300" : "bg-crimson-500/15 text-crimson-300"}`}>{k.active ? "Active" : "Revoked"}</button></td>
                                <td className="p-4"><button title="Delete" onClick={() => remove(k)} className="text-crimson-400/60 hover:text-crimson-400"><Trash2 className="h-4 w-4" /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {newKey && (
                <Modal title="API key created" onClose={() => setNewKey(null)}>
                    <p className="text-sm text-amber-300 mb-3">Copy this key now — for security it will never be shown again.</p>
                    <div className="flex gap-2">
                        <code className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-xs break-all">{newKey.key}</code>
                        <button onClick={() => copy(newKey.key)} aria-label="Copy key" className="px-3 rounded-xl bg-white/10 hover:bg-white/15"><Copy className="h-4 w-4" /></button>
                    </div>
                    <p className="text-xs text-white/40 mt-4">Example:</p>
                    <code className="block mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] break-all">curl -H "x-api-key: {newKey.key}" "{API_BASE}/api/v1/donors?bloodType=O-&amp;city=Chandigarh"</code>
                </Modal>
            )}
        </div>
    );
}
