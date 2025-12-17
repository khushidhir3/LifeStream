import React from "react";
import { Heart, Droplet, Users, Clock } from "lucide-react";

export default function UserDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    🧑‍⚕️ User Dashboard
                </h1>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Logout
                </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-10">
                <StatCard icon={Heart} label="Lives Saved" value="12" />
                <StatCard icon={Droplet} label="Donations Made" value="4" />
                <StatCard icon={Users} label="Matching Requests" value="6" />
                <StatCard icon={Clock} label="Last Donation" value="45 days ago" />
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Upcoming Blood Requests Near You
                </h2>

                <ul className="space-y-4">
                    <li className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">O+ Blood Needed</p>
                            <p className="text-sm text-gray-600">City Hospital • 2 hours ago</p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            Respond
                        </button>
                    </li>

                    <li className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">A- Blood Needed</p>
                            <p className="text-sm text-gray-600">Medical Center • 1 day ago</p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            Respond
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value }) {
    return (
        <div className="bg-white rounded-xl shadow p-6 flex items-center space-x-4">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <Icon className="h-6 w-6 text-red-600" />
            </div>
            <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
