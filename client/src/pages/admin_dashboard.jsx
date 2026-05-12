import React, { useState } from "react";
import {
    Users,
    Droplet,
    AlertCircle,
    TrendingUp,
    Shield,
    LogOut,
    Search,
    Edit,
    Trash2,
    CheckCircle,
    Clock,
    Activity,
    Plus
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
                {activeTab === "donors" && <DonorManagement />}
                {activeTab === "requests" && <BloodRequests />}
                {activeTab === "inventory" && <BloodInventory />}
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

function DonorManagement() {
    const mockDonors = [
        { id: "LS001", name: "Rajesh Kumar", bloodGroup: "O+", location: "Chandigarh", status: "Verified", lastDonation: "90 days ago" },
        { id: "LS002", name: "Priya Singh", bloodGroup: "A+", location: "Mohali", status: "Verified", lastDonation: "120 days ago" },
        { id: "LS003", name: "Amit Sharma", bloodGroup: "B+", location: "Chandigarh", status: "Pending", lastDonation: "Never" },
        { id: "LS004", name: "Neha Patel", bloodGroup: "O+", location: "Panchkula", status: "Verified", lastDonation: "45 days ago" },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Donor Management</h1>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700">
                    <Plus className="h-4 w-4" />
                    <span>Add Donor</span>
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <AdminStat icon={Users} label="Total Donors" value="15,847" />
                <AdminStat icon={CheckCircle} label="Verified Donors" value="12,430" />
                <AdminStat icon={Clock} label="Pending Verification" value="3,417" />
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" placeholder="Search donors..." className="pl-10 pr-4 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500" />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Blood Group</th>
                            <th className="p-4 font-semibold">Location</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {mockDonors.map((donor) => (
                            <tr key={donor.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{donor.id}</td>
                                <td className="p-4">{donor.name}</td>
                                <td className="p-4">
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold text-xs">{donor.bloodGroup}</span>
                                </td>
                                <td className="p-4 text-gray-600">{donor.location}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${donor.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {donor.status}
                                    </span>
                                </td>
                                <td className="p-4 flex space-x-3">
                                    <button className="text-blue-600 hover:text-blue-800" title="Edit"><Edit className="h-4 w-4" /></button>
                                    <button className="text-red-600 hover:text-red-800" title="Delete"><Trash2 className="h-4 w-4" /></button>
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
    const mockRequests = [
        { id: "REQ-101", patient: "Suresh Rao", type: "O-", hospital: "Fortis Hospital", urgency: "Critical", status: "Pending" },
        { id: "REQ-102", patient: "Anjali Gupta", type: "AB+", hospital: "Max Hospital", urgency: "Routine", status: "Assigned" },
        { id: "REQ-103", patient: "Rahul Verma", type: "A+", hospital: "PGI Chandigarh", urgency: "High", status: "Pending" },
        { id: "REQ-104", patient: "Sneha Das", type: "B-", hospital: "Apollo Clinic", urgency: "Critical", status: "Completed" },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Blood Requests</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <AdminStat icon={AlertCircle} label="Critical Requests" value="12" />
                <AdminStat icon={Clock} label="Pending Fulfillment" value="45" />
                <AdminStat icon={CheckCircle} label="Completed Today" value="8" />
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 text-sm">
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
                    <tbody className="divide-y">
                        {mockRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{req.id}</td>
                                <td className="p-4">{req.patient}</td>
                                <td className="p-4">
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold text-xs">{req.type}</span>
                                </td>
                                <td className="p-4 text-gray-600">{req.hospital}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center w-max ${
                                        req.urgency === 'Critical' ? 'bg-red-100 text-red-800' : 
                                        req.urgency === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {req.urgency === 'Critical' && <AlertCircle className="h-3 w-3 mr-1" />}
                                        {req.urgency}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        req.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                        req.status === 'Assigned' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {req.status !== 'Completed' ? (
                                        <button className="text-sm bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700">Assign</button>
                                    ) : (
                                        <span className="text-sm text-gray-400">Done</span>
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
        { type: "A+", units: 145, status: "Adequate" },
        { type: "A-", units: 12, status: "Low" },
        { type: "B+", units: 210, status: "Good" },
        { type: "B-", units: 5, status: "Critical" },
        { type: "AB+", units: 85, status: "Adequate" },
        { type: "AB-", units: 2, status: "Critical" },
        { type: "O+", units: 320, status: "Good" },
        { type: "O-", units: 18, status: "Low" }
    ];

    const getStatusColor = (status) => {
        if (status === 'Good') return 'bg-green-500';
        if (status === 'Adequate') return 'bg-blue-500';
        if (status === 'Low') return 'bg-yellow-500';
        return 'bg-red-600 animate-pulse';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Blood Inventory</h1>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700">
                    <Activity className="h-4 w-4" />
                    <span>Update Stock</span>
                </button>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                {bloodTypes.map((blood) => (
                    <div key={blood.type} className="bg-white rounded-xl shadow p-6 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 ${getStatusColor(blood.status)}`}></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-red-100 text-red-800 text-2xl font-bold px-4 py-2 rounded-lg">
                                {blood.type}
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                                blood.status === 'Critical' ? 'bg-red-100 text-red-800' :
                                blood.status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {blood.status}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-gray-500 text-sm">Available Units</p>
                            <p className="text-3xl font-bold text-gray-900">{blood.units}</p>
                        </div>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full ${getStatusColor(blood.status)}`} 
                                style={{ width: `${Math.min((blood.units / 200) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
