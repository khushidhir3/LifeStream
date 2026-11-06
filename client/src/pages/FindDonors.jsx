import React, { useCallback, useEffect, useRef, useState } from "react";
import { Search, MapPin, Droplet, Phone, Mail, Filter, X, Clock, Award, Navigation, Shield, Building2, Globe, Crosshair, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { api, BLOOD_TYPES, timeAgo } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const DEFAULT_FILTERS = { bloodType: "", mode: "exact", radius: "", availability: "all", city: "" };

function useDebounced(value, ms = 350) {
    const [v, setV] = useState(value);
    useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
    return v;
}

export default function FindDonorsPage() {
    const pageRef = useScrollReveal();
    const navigate = useNavigate();
    const toast = useToast();
    const { isAuthenticated } = useAuth();
    const [tab, setTab] = useState("donors");
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [coords, setCoords] = useState(null);
    const [locating, setLocating] = useState(false);
    const [result, setResult] = useState({ data: [], pagination: { total: 0, page: 1, pages: 1 } });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [contact, setContact] = useState(null);
    const q = useDebounced(searchQuery);
    const city = useDebounced(filters.city);
    const abortRef = useRef(null);

    const query = {
        q,
        [filters.mode === "compatible" ? "compatibleWith" : "bloodType"]: filters.bloodType,
        available: filters.availability === "all" ? "" : filters.availability,
        city,
        lat: coords?.latitude, lng: coords?.longitude,
        radius: coords ? filters.radius : "",
        limit: 24,
    };
    const key = JSON.stringify(query);

    const load = useCallback(async (pageNum) => {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setLoading(true);
        setError("");
        try {
            const res = await api("/donors", { query: { ...JSON.parse(key), page: pageNum }, auth: false, signal: ctrl.signal });
            setResult((prev) => (pageNum > 1 ? { ...res, data: [...prev.data, ...res.data] } : res));
        } catch (err) {
            if (err.name !== "AbortError") setError(err.message);
        } finally {
            if (!ctrl.signal.aborted) setLoading(false);
        }
    }, [key]);

    useEffect(() => { setPage(1); load(1); }, [load]);

    const useMyLocation = () => {
        if (!navigator.geolocation) return toast.error("Your browser doesn't support location");
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setFilters((f) => ({ ...f, radius: f.radius || "25" }));
                setLocating(false);
            },
            () => { setLocating(false); toast.error("Couldn't get your location. Please allow location access."); },
            { enableHighAccuracy: false, timeout: 10000 }
        );
    };

    const clearAll = () => { setFilters(DEFAULT_FILTERS); setSearchQuery(""); setCoords(null); };

    const reveal = async (donor) => {
        if (!isAuthenticated) {
            toast.info("Please sign in to view donor contact details");
            navigate("/login", { state: { from: "/find-donors" } });
            return;
        }
        try {
            setContact(await api(`/donors/${donor.id}/contact`, { method: "POST", body: {} }));
        } catch (err) {
            toast.error(err.message);
        }
    };

    const donors = result.data;

    return (
        <div ref={pageRef} className="bg-[#0a0a0f] text-white overflow-hidden min-h-screen">
            <section className="relative pt-40 pb-12 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-crimson-600/10 rounded-full blur-[120px]" />
                </div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson-600/10 border border-crimson-600/20 mb-8">
                            <Search className="h-4 w-4 text-crimson-500" />
                            <span className="text-crimson-400 text-sm font-medium">Donor Search</span>
                        </div>
                        <h1 className="fade-up stagger-1 text-5xl md:text-7xl font-display font-black tracking-tight mb-4">
                            Find <span className="gradient-text">Donors</span>
                        </h1>
                        <p className="fade-up stagger-2 text-lg text-white/50 max-w-2xl mx-auto">
                            Search registered donors and blood banks near you. Need blood urgently? <Link to="/request-blood" className="text-crimson-400 underline">Post a request</Link> and we'll alert matching donors.
                        </p>
                    </div>

                    <div className="flex justify-center gap-2 mb-6">
                        {[{ id: "donors", label: "Donors", icon: Droplet }, { id: "banks", label: "Blood Banks", icon: Building2 }].map((t) => (
                            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${tab === t.id ? "bg-crimson-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                                <t.icon className="h-4 w-4" /> {t.label}
                            </button>
                        ))}
                    </div>

                    {tab === "donors" && (
                        <div className="max-w-5xl mx-auto">
                            <div className="glass rounded-2xl p-4">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                                        <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, city or area..."
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-crimson-500 focus:ring-2 focus:ring-crimson-500/20 transition-all duration-300" />
                                    </div>
                                    <select value={filters.bloodType} onChange={(e) => setFilters((p) => ({ ...p, bloodType: e.target.value }))} aria-label="Blood type"
                                        className="px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-crimson-500 min-w-[160px]">
                                        <option value="">All Blood Types</option>
                                        {BLOOD_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    <button onClick={useMyLocation} className={`px-5 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${coords ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"}`}>
                                        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />} {coords ? "Near me" : "Use my location"}
                                    </button>
                                    <button onClick={() => setShowFilters(!showFilters)} className={`px-6 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${showFilters ? "bg-crimson-600 text-white" : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"}`}>
                                        <Filter className="h-4 w-4" /> Filters
                                    </button>
                                </div>

                                {showFilters && (
                                    <div className="mt-4 pt-4 border-t border-white/10 grid md:grid-cols-5 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Match</label>
                                            <select value={filters.mode} onChange={(e) => setFilters((p) => ({ ...p, mode: e.target.value }))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-crimson-500">
                                                <option value="exact">Exact blood type</option>
                                                <option value="compatible">All compatible donors</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">City</label>
                                            <input value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))} placeholder="Any city" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-crimson-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Distance</label>
                                            <select value={filters.radius} disabled={!coords} onChange={(e) => setFilters((p) => ({ ...p, radius: e.target.value }))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-crimson-500 disabled:opacity-40" title={coords ? "" : "Use your location first"}>
                                                <option value="">Any distance</option>
                                                <option value="5">Within 5 km</option>
                                                <option value="10">Within 10 km</option>
                                                <option value="25">Within 25 km</option>
                                                <option value="50">Within 50 km</option>
                                                <option value="100">Within 100 km</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Availability</label>
                                            <select value={filters.availability} onChange={(e) => setFilters((p) => ({ ...p, availability: e.target.value }))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-crimson-500">
                                                <option value="all">All Donors</option>
                                                <option value="true">Available now</option>
                                                <option value="false">Not available</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button onClick={clearAll} className="w-full px-4 py-3 border border-white/10 text-white/60 rounded-xl hover:bg-white/5 font-medium text-sm">Clear All</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {tab === "donors" ? (
                <section className="pb-32">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                            <h2 className="text-2xl font-display font-bold">
                                <span className="text-crimson-500">{result.pagination.total}</span> Donor{result.pagination.total === 1 ? "" : "s"} Found
                            </h2>
                            <div className="flex items-center gap-2 text-white/30 text-sm">
                                <MapPin className="h-4 w-4" /> {coords ? "Sorted by distance" : "Available donors first"}
                                {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                            </div>
                        </div>

                        {error && <div className="p-4 mb-6 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-crimson-300 text-sm">{error} <button className="underline ml-2" onClick={() => load(1)}>Retry</button></div>}

                        {loading && donors.length === 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[0, 1, 2].map((i) => <div key={i} className="h-96 rounded-3xl bg-white/[0.03] animate-pulse" />)}</div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {donors.map((donor) => (
                                    <div key={donor.id} className="group relative p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                                        <div className={`absolute top-0 left-0 right-0 h-0.5 ${donor.available ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-gray-500 to-gray-600"}`} />
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-crimson-500 to-crimson-700 flex items-center justify-center text-lg font-bold shadow-lg shadow-crimson-600/20">
                                                {donor.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-display font-bold flex items-center gap-2 truncate">
                                                    {donor.name}
                                                    {donor.verified && <Shield className="h-4 w-4 text-blue-400 flex-shrink-0" fill="currentColor" aria-label="Verified" />}
                                                </h3>
                                                <p className="text-white/30 text-xs">ID: {donor.publicId}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center mb-5">
                                            <div className="px-8 py-3 bg-crimson-600 rounded-2xl shadow-lg shadow-crimson-600/30">
                                                <span className="text-3xl font-display font-black">{donor.bloodType}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <div className="p-3 bg-white/[0.03] rounded-xl text-center border border-white/5">
                                                <Award className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                                                <p className="text-lg font-bold">{donor.donationCount}</p>
                                                <p className="text-white/30 text-[10px] uppercase tracking-wider">Donations</p>
                                            </div>
                                            <div className="p-3 bg-white/[0.03] rounded-xl text-center border border-white/5">
                                                <Clock className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                                                <p className="text-sm font-bold">{donor.lastDonationDate ? timeAgo(donor.lastDonationDate) : "Never"}</p>
                                                <p className="text-white/30 text-[10px] uppercase tracking-wider">Last Donation</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-5">
                                            <div className="flex items-center gap-2 text-white/50 text-sm">
                                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span>{[donor.city, donor.state].filter(Boolean).join(", ")}</span>
                                            </div>
                                            {donor.distanceKm != null && (
                                                <div className="flex items-center gap-2">
                                                    <Navigation className="h-3.5 w-3.5 text-crimson-500 flex-shrink-0" />
                                                    <span className="text-crimson-400 text-sm font-semibold">{donor.distanceKm} km away</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-5 flex flex-wrap gap-2">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${donor.available ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-white/40 border border-white/10"}`}>
                                                {donor.available ? "Available" : !donor.isAvailable ? "Not Available" : `Eligible ${new Date(donor.nextEligibleDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                                            </span>
                                            {!donor.verified && <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Unverified</span>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => reveal(donor)} className="px-4 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-600/30 transition-all">
                                                <Phone className="h-4 w-4" /> Call
                                            </button>
                                            <button onClick={() => reveal(donor)} disabled={!donor.email} className="px-4 py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-emerald-600/30 disabled:opacity-40 transition-all">
                                                <Mail className="h-4 w-4" /> Email
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {result.pagination.page < result.pagination.pages && (
                            <div className="text-center mt-10">
                                <button onClick={() => { const n = page + 1; setPage(n); load(n); }} disabled={loading} className="px-8 py-3 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/5 disabled:opacity-50">
                                    {loading ? "Loading…" : "Load more"}
                                </button>
                            </div>
                        )}

                        {!loading && !error && donors.length === 0 && (
                            <div className="text-center py-24">
                                <Droplet className="h-16 w-16 text-white/10 mx-auto mb-6" />
                                <h3 className="text-2xl font-display font-bold mb-3">No Donors Found</h3>
                                <p className="text-white/40 mb-8">Try widening your search, or post a request so matching donors are alerted.</p>
                                <div className="flex justify-center gap-3">
                                    <button onClick={clearAll} className="px-8 py-4 border border-white/10 rounded-xl font-semibold hover:bg-white/5">Clear Filters</button>
                                    <Link to="/request-blood" className="px-8 py-4 bg-crimson-600 text-white rounded-xl font-semibold hover:bg-crimson-500">Request Blood</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            ) : (
                <BloodBanks />
            )}

            {contact && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setContact(null)} />
                    <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#101017] p-6">
                        <button onClick={() => setContact(null)} aria-label="Close" className="absolute top-4 right-4 text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
                        <h3 className="font-display font-bold text-lg mb-1">Contact {contact.name}</h3>
                        <p className="text-xs text-white/40 mb-5">The donor has been notified that you viewed their details. Please be respectful.</p>
                        <div className="space-y-3">
                            <a href={`tel:${contact.phone}`} className="flex items-center gap-3 p-4 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-300 font-semibold"><Phone className="h-5 w-5" /> {contact.phone}</a>
                            {contact.email && <a href={`mailto:${contact.email}?subject=${encodeURIComponent("Blood donation request via LifeStream")}`} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-600/15 border border-emerald-500/20 text-emerald-300 font-semibold break-all"><Mail className="h-5 w-5 flex-shrink-0" /> {contact.email}</a>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BloodBanks() {
    const toast = useToast();
    const [form, setForm] = useState({ city: "", state: "" });
    const [coords, setCoords] = useState(null);
    const [state, setState] = useState({ loading: false, results: null, source: null, error: "" });

    const search = async (override) => {
        const params = override || (coords ? { lat: coords.latitude, lng: coords.longitude } : form);
        if (!params.lat && !params.city && !params.state) return toast.info("Enter a city or use your location");
        setState((s) => ({ ...s, loading: true, error: "" }));
        try {
            const res = await api("/blood-banks", { query: { ...params, radius: 30 }, auth: false });
            setState({ loading: false, results: res.results, source: res.source, error: "" });
        } catch (err) {
            setState({ loading: false, results: null, source: null, error: err.message });
        }
    };

    const locate = () => {
        navigator.geolocation?.getCurrentPosition(
            (p) => { const c = { latitude: p.coords.latitude, longitude: p.coords.longitude }; setCoords(c); search({ lat: c.latitude, lng: c.longitude }); },
            () => toast.error("Couldn't get your location"),
        );
    };

    return (
        <section className="pb-32">
            <div className="max-w-5xl mx-auto px-6">
                <form onSubmit={(e) => { e.preventDefault(); setCoords(null); search(form); }} className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3 mb-8">
                    <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="City or district (e.g. Chandigarh)" className="flex-1 px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-crimson-500" />
                    <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="State (optional)" className="md:w-56 px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-crimson-500" />
                    <button type="button" onClick={locate} className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold flex items-center justify-center gap-2"><Crosshair className="h-4 w-4" /> Near me</button>
                    <button className="px-6 py-4 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-sm font-semibold flex items-center justify-center gap-2"><Search className="h-4 w-4" /> Search</button>
                </form>

                {state.loading && <div className="text-center py-16 text-white/40"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" /> Searching blood banks…</div>}
                {state.error && <div className="p-4 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-crimson-300 text-sm">{state.error}</div>}
                {state.results && !state.loading && (
                    <>
                        <p className="text-sm text-white/40 mb-4">{state.results.length} result{state.results.length === 1 ? "" : "s"}{state.source && <> · source: {state.source === "data.gov.in" ? "Government of India Open Data" : "OpenStreetMap"}</>}</p>
                        {state.results.length === 0 && <p className="text-center text-white/40 py-12">No blood banks found for that area. Try a nearby larger city.</p>}
                        <div className="grid md:grid-cols-2 gap-4">
                            {state.results.map((b, i) => (
                                <div key={`${b.name}-${i}`} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-crimson-600/15 flex items-center justify-center flex-shrink-0"><Building2 className="h-5 w-5 text-crimson-400" /></div>
                                            <div>
                                                <p className="font-semibold">{b.name}</p>
                                                <p className="text-xs text-white/40 mt-0.5">{[b.address, b.city || b.district, b.state, b.pincode].filter(Boolean).join(", ") || "Address not listed"}</p>
                                                {b.category && <p className="text-[11px] text-white/30 mt-1">{b.category}</p>}
                                            </div>
                                        </div>
                                        {b.distanceKm != null && <span className="text-xs font-semibold text-crimson-400 whitespace-nowrap">{b.distanceKm} km</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {b.phone && <a href={`tel:${b.phone.split(/[,;/]/)[0].trim()}`} className="px-3 py-1.5 rounded-lg bg-blue-600/15 text-blue-300 text-xs font-semibold flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {b.phone.split(/[,;/]/)[0].trim()}</a>}
                                        {b.website && <a href={b.website.startsWith("http") ? b.website : `https://${b.website}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-semibold flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Website</a>}
                                        <a href={b.latitude ? `https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.city || ""}`)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-semibold flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Directions</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
