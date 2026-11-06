import React from "react";
import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";

// Shared centered card layout used by the smaller auth pages.
export default function AuthShell({ icon: Icon, title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-crimson-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-crimson-800/10 rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <Droplet className="h-8 w-8 text-crimson-500" fill="currentColor" />
                        <span className="text-2xl font-display font-bold text-white">LifeStream</span>
                    </Link>
                </div>
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-crimson-600/10 to-orange-500/5 rounded-[2.5rem] blur-2xl" />
                    <div className="relative glass rounded-3xl p-8 overflow-hidden text-white">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-crimson-600/20 flex items-center justify-center mx-auto mb-4">
                                <Icon className="h-8 w-8 text-crimson-400" />
                            </div>
                            <h2 className="text-2xl font-display font-bold">{title}</h2>
                            {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
