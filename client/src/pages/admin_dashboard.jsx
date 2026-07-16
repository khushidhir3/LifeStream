import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Droplet, AlertCircle, TrendingUp, Shield, LogOut, Search, Edit, Trash2, CheckCircle, Clock, Activity, Plus, Bell, Settings, LayoutDashboard, FileText, Box } from "lucide-react";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", icon: LayoutDashboard, label: "Overview" },
        { id: "donors", icon: Users, label: "Donors" },
        { id: "requests", icon: FileText, label: "Requests" },
        { id: "inventory", icon: Box, label: "Inventory" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 p-6 flex flex-col bg-[#0d0d14]">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-sm">Admin Panel</h2>
                        <p className="text-[10px] text-white/30">LifeStream Control</p>
                    </div>
                </div>

                <nav className="space-y-1 flex-1">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? "bg-crimson-600/10 text-crimson-400 border border-crimson-600/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-crimson-400/60 hover:text-crimson-400 hover:bg-crimson-600/10 transition-all duration-300 mt-4">
                    <LogOut className="h-4 w-4" /> Logout
                </Link>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between">
                    <h1 className="text-lg font-display font-bold capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                            <input placeholder="Search..." className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson-500 w-64 transition-all duration-300" />
                        </div>
                        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative">
                            <Bell className="h-4 w-4 text-white/40" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-crimson-500 rounded-full" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto">
                    {activeTab === "overview" && <Overview />}
                    {activeTab === "donors" && <DonorManagement />}
                    {activeTab === "requests" && <BloodRequests />}
                    {activeTab === "inventory" && <BloodInventory />}
                </div>
            </main>
        </div>
    );
}

function AdminStat({ icon: Icon, label, value, trend, color = "text-crimson-400", bg = "bg-crimson-500/10" }) {
    return (
        <div className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
                {trend && <span className="text-xs text-emerald-400 font-semibold">+{trend}%</span>}
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1">{label}</p>
            <p className="text-2xl font-display font-black">{value}</p>
        </div>
    );
}

function Overview() {
    return (
        <div>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <AdminStat icon={Users} label="Total Donors" value="15,847" trend="12" color="text-blue-400" bg="bg-blue-500/10" />
                <AdminStat icon={Droplet} label="Active Requests" value="47" trend="8" color="text-crimson-400" bg="bg-crimson-500/10" />
                <AdminStat icon={AlertCircle} label="Critical Cases" value="8" color="text-amber-400" bg="bg-amber-500/10" />
                <AdminStat icon={TrendingUp} label="Daily Donations" value="23" trend="15" color="text-emerald-400" bg="bg-emerald-500/10" />
            </div>

            {/* Activity chart placeholder */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <h3 className="font-display font-bold mb-6">Weekly Activity</h3>
                <div className="flex items-end gap-2 h-40">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-gradient-to-t from-crimson-600 to-crimson-400 rounded-lg transition-all duration-500 hover:from-crimson-500 hover:to-crimson-300" style={{ height: `${h}%` }} />
                            <span className="text-[10px] text-white/20">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DonorManagement() {
    const donors = [
        { id: "LS001", name: "Rajesh Kumar", bloodGroup: "O+", location: "Chandigarh", status: "Verified" },
        { id: "LS002", name: "Priya Singh", bloodGroup: "A+", location: "Mohali", status: "Verified" },
        { id: "LS003", name: "Amit Sharma", bloodGroup: "B+", location: "Chandigarh", status: "Pending" },
        { id: "LS004", name: "Neha Patel", bloodGroup: "O+", location: "Panchkula", status: "Verified" },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold">Donor Management</h2>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-crimson-600 text-white rounded-xl text-sm font-semibold hover:bg-crimson-500 transition-all duration-300">
                    <Plus className="h-4 w-4" /> Add Donor
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <AdminStat icon={Users} label="Total Donors" value="15,847" color="text-blue-400" bg="bg-blue-500/10" />
                <AdminStat icon={CheckCircle} label="Verified" value="12,430" color="text-emerald-400" bg="bg-emerald-500/10" />
                <AdminStat icon={Clock} label="Pending" value="3,417" color="text-amber-400" bg="bg-amber-500/10" />
            </div>

            <div className="rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/[0.03] text-white/30 text-[10px] uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Blood Group</th>
                            <th className="p-4 font-semibold">Location</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {donors.map((d) => (
                            <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 font-mono text-sm text-white/60">{d.id}</td>
                                <td className="p-4 font-medium text-sm">{d.name}</td>
                                <td className="p-4"><span className="bg-crimson-600/20 text-crimson-400 px-2.5 py-1 rounded-lg font-bold text-xs">{d.bloodGroup}</span></td>
                                <td className="p-4 text-white/40 text-sm">{d.location}</td>
                                <td className="p-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${d.status === "Verified" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{d.status}</span></td>
                                <td className="p-4 flex gap-3">
                                    <button className="text-blue-400/60 hover:text-blue-400 transition-colors"><Edit className="h-4 w-4" /></button>
                                    <button className="text-crimson-400/60 hover:text-crimson-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BloodRequests() {
    const requests = [
        { id: "REQ-101", patient: "Suresh Rao", type: "O-", hospital: "Fortis Hospital", urgency: "Critical", status: "Pending" },
        { id: "REQ-102", patient: "Anjali Gupta", type: "AB+", hospital: "Max Hospital", urgency: "Routine", status: "Assigned" },
        { id: "REQ-103", patient: "Rahul Verma", type: "A+", hospital: "PGI Chandigarh", urgency: "High", status: "Pending" },
        { id: "REQ-104", patient: "Sneha Das", type: "B-", hospital: "Apollo Clinic", urgency: "Critical", status: "Completed" },
    ];

    return (
        <div>
            <h2 className="text-xl font-display font-bold mb-6">Blood Requests</h2>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <AdminStat icon={AlertCircle} label="Critical" value="12" color="text-crimson-400" bg="bg-crimson-500/10" />
                <AdminStat icon={Clock} label="Pending" value="45" color="text-amber-400" bg="bg-amber-500/10" />
                <AdminStat icon={CheckCircle} label="Completed Today" value="8" color="text-emerald-400" bg="bg-emerald-500/10" />
            </div>

            <div className="rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/[0.03] text-white/30 text-[10px] uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-semibold">Req ID</th>
                            <th className="p-4 font-semibold">Patient</th>
                            <th className="p-4 font-semibold">Type</th>
                            <th className="p-4 font-semibold">Hospital</th>
                            <th className="p-4 font-semibold">Urgency</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {requests.map((r) => (
                            <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 font-mono text-sm text-white/60">{r.id}</td>
                                <td className="p-4 font-medium text-sm">{r.patient}</td>
                                <td className="p-4"><span className="bg-crimson-600/20 text-crimson-400 px-2.5 py-1 rounded-lg font-bold text-xs">{r.type}</span></td>
                                <td className="p-4 text-white/40 text-sm">{r.hospital}</td>
                                <td className="p-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center w-max gap-1 ${r.urgency === "Critical" ? "bg-crimson-500/10 text-crimson-400" : r.urgency === "High" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>
                                    {r.urgency === "Critical" && <AlertCircle className="h-3 w-3" />}{r.urgency}
                                </span></td>
                                <td className="p-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${r.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : r.status === "Assigned" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"}`}>{r.status}</span></td>
                                <td className="p-4">
                                    {r.status !== "Completed" ? (
                                        <button className="text-xs bg-white/5 text-white/60 px-4 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all font-medium">Assign</button>
                                    ) : (
                                        <span className="text-xs text-white/20">Done</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BloodInventory() {
    const bloodTypes = [
        { type: "A+", units: 145, status: "Adequate" }, { type: "A-", units: 12, status: "Low" },
        { type: "B+", units: 210, status: "Good" }, { type: "B-", units: 5, status: "Critical" },
        { type: "AB+", units: 85, status: "Adequate" }, { type: "AB-", units: 2, status: "Critical" },
        { type: "O+", units: 320, status: "Good" }, { type: "O-", units: 18, status: "Low" },
    ];

    const getColor = (s) => {
        if (s === "Good") return { bar: "from-emerald-500 to-emerald-400", badge: "bg-emerald-500/10 text-emerald-400" };
        if (s === "Adequate") return { bar: "from-blue-500 to-blue-400", badge: "bg-blue-500/10 text-blue-400" };
        if (s === "Low") return { bar: "from-amber-500 to-amber-400", badge: "bg-amber-500/10 text-amber-400" };
        return { bar: "from-crimson-600 to-crimson-400", badge: "bg-crimson-500/10 text-crimson-400" };
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold">Blood Inventory</h2>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-crimson-600 text-white rounded-xl text-sm font-semibold hover:bg-crimson-500 transition-all duration-300">
                    <Activity className="h-4 w-4" /> Update Stock
                </button>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
                {bloodTypes.map((b) => {
                    const c = getColor(b.status);
                    return (
                        <div key={b.type} className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                            {b.status === "Critical" && <div className="absolute top-0 left-0 right-0 h-0.5 bg-crimson-600 animate-pulse" />}

                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-crimson-600/20 text-crimson-400 text-2xl font-display font-black px-4 py-2 rounded-xl">
                                    {b.type}
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${c.badge}`}>{b.status}</span>
                            </div>

                            <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1">Available Units</p>
                            <p className="text-3xl font-display font-black mb-4">{b.units}</p>

                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-full rounded-full bg-gradient-to-r ${c.bar}`} style={{ width: `${Math.min((b.units / 200) * 100, 100)}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
