import React from "react";
import { Check, X } from "lucide-react";
import { passwordChecks } from "../lib/api";

export default function PasswordStrength({ password }) {
    const checks = passwordChecks(password);
    const passed = checks.filter((c) => c.ok).length;
    const colors = ["bg-crimson-600", "bg-crimson-500", "bg-amber-500", "bg-amber-400", "bg-emerald-500"];
    const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];

    if (!password) return null;
    return (
        <div className="mt-3 space-y-2">
            <div className="flex gap-1">
                {checks.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? colors[passed - 1] : "bg-white/10"}`} />
                ))}
            </div>
            <p className="text-[11px] text-white/40">Strength: <span className="text-white/70 font-semibold">{labels[Math.max(0, passed - 1)]}</span></p>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                {checks.map((c) => (
                    <li key={c.label} className={`flex items-center gap-1.5 text-[11px] ${c.ok ? "text-emerald-400" : "text-white/35"}`}>
                        {c.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} {c.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
