import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserLoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            navigate("/home"); // ✅ USER → HOME
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6">User Login</h1>

            <button
                onClick={handleLogin}
                className="px-6 py-3 bg-red-600 text-white rounded-lg"
            >
                {loading ? "Logging in..." : "Login"}
            </button>

            <button
                onClick={() => navigate("/admin-login")}
                className="mt-4 text-red-600 underline"
            >
                Admin Login
            </button>
        </div>
    );
}
