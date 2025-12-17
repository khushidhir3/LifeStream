import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Shield,
    AlertCircle,
    Activity,
    Database,
    BarChart3
} from "lucide-react";

export default function AdminLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        adminCode: "",
        rememberMe: false
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminCode, setShowAdminCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((p) => ({
            ...p,
            [name]: type === "checkbox" ? checked : value
        }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!formData.email) e.email = "Required";
        if (!formData.password) e.password = "Required";
        if (!formData.adminCode) e.adminCode = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            setIsLoading(true);
            setTimeout(() => {
                console.log("ADMIN LOGIN:", formData);
                setIsLoading(false);
                navigate("/admin-dashboard");
            }, 1500);
        }
    };

    const adminFeatures = [
        { icon: Activity, title: "Real-time Monitoring" },
        { icon: Database, title: "Donor Management" },
        { icon: BarChart3, title: "Analytics Dashboard" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 flex items-center justify-center px-4">

            <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">

                {/* LEFT */}
                <div className="hidden lg:block space-y-8 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-600 rounded-xl">
                            <Shield className="h-10 w-10" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">LifeStream Admin</h1>
                            <p className="text-gray-300">Control Panel</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {adminFeatures.map((f, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
                                <div className="h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <p className="font-semibold">{f.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">

                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center h-16 w-16 bg-red-100 rounded-full mb-4">
                            <Shield className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-bold">Admin Login</h2>
                        <p className="text-gray-600">Authorized access only</p>
                    </div>

                    <div className="space-y-5">

                        {/* EMAIL */}
                        <div>
                            <label className="text-sm font-semibold">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 py-3 border rounded-lg"
                                    placeholder="admin@lifestream.com"
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="text-sm font-semibold">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 border rounded-lg"
                                    placeholder="Admin password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* ADMIN CODE */}
                        <div>
                            <label className="text-sm font-semibold">Security Code</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showAdminCode ? "text" : "password"}
                                    name="adminCode"
                                    value={formData.adminCode}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 border rounded-lg"
                                    placeholder="6-digit code"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAdminCode(!showAdminCode)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showAdminCode ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                            {errors.adminCode && <p className="text-sm text-red-600">{errors.adminCode}</p>}
                        </div>

                        {/* REMEMBER */}
                        <div className="flex justify-between text-sm">
                            <label className="flex gap-2">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                Remember device
                            </label>
                            <Link to="/admin-forgot-password" className="text-red-600">
                                Reset password
                            </Link>
                        </div>

                        {/* LOGIN */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg text-white font-semibold ${
                                isLoading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
                            }`}
                        >
                            {isLoading ? "Verifying..." : "Access Admin Panel"}
                        </button>

                        {/* BACK */}
                        <div className="text-center text-sm pt-4 border-t">
                            <p>
                                Not admin?{" "}
                                <Link to="/login" className="text-red-600 font-semibold">
                                    Back to User Login
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
