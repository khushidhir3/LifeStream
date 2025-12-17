import React, { useState } from "react";
import {
    Users,
    Droplet,
    AlertCircle,
    TrendingUp,
    Shield,
    LogOut
} from "lucide-react";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-6">
                <h2 className="text-2xl font-bold mb-8 flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-red-500" />
                    <span>Admin Panel</span>
                </h2>

                <nav className="space-y-3">
                    <SidebarButton label="Overview" onClick={() => setActiveTab("overview")} />
                    <SidebarButton label="Donors" onClick={() => setActiveTab("donors")} />
                    <SidebarButton label="Requests" onClick={() => setActiveTab("requests")} />
                    <SidebarButton label="Inventory" onClick={() => setActiveTab("inventory")} />
                </nav>

                <button className="mt-10 flex items-center space-x-2 text-red-400 hover:text-red-300">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {activeTab === "overview" && <Overview />}
                {activeTab === "donors" && <Placeholder title="Donor Management" />}
                {activeTab === "requests" && <Placeholder title="Blood Requests" />}
                {activeTab === "inventory" && <Placeholder title="Blood Inventory" />}
            </main>
        </div>
    );
}

/* ---------------- COMPONENTS ---------------- */

function Overview() {
    return (
        <>
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

            <div className="grid md:grid-cols-4 gap-6">
                <AdminStat icon={Users} label="Total Donors" value="15,847" />
                <AdminStat icon={Droplet} label="Active Requests" value="47" />
                <AdminStat icon={AlertCircle} label="Critical Cases" value="8" />
                <AdminStat icon={TrendingUp} label="Daily Donations" value="23" />
            </div>
        </>
    );
}

function AdminStat({ icon: Icon, label, value }) {
    return (
        <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-3">
                <Icon className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function SidebarButton({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
            {label}
        </button>
    );
}

function Placeholder({ title }) {
    return (
        <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-gray-600">This section will be implemented next.</p>
        </div>
    );
}
