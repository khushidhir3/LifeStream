import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import AuthShell from "../components/AuthShell";
import PasswordStrength from "../components/PasswordStrength";
import { api, passwordChecks } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const navigate = useNavigate();
    const toast = useToast();
    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (passwordChecks(form.password).some((c) => !c.ok)) return setError("Please choose a stronger password");
        if (form.password !== form.confirmPassword) return setError("Passwords do not match");
        setLoading(true);
        setError("");
        try {
            const res = await api("/auth/reset-password", { method: "POST", body: { token, ...form }, auth: false });
            toast.success(res.message);
            navigate("/login", { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <AuthShell icon={AlertCircle} title="Invalid link" subtitle="This reset link is missing or broken">
                <Link to="/forgot-password" className="block text-center w-full py-4 rounded-xl font-semibold text-sm bg-crimson-600 text-white hover:bg-crimson-500">Request a new link</Link>
            </AuthShell>
        );
    }

    return (
        <AuthShell icon={ShieldCheck} title="Set a new password" subtitle="Choose a strong password you haven't used before">
            <form onSubmit={submit} noValidate className="space-y-5">
                {error && (
                    <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-crimson-300 text-sm">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{error} {error.includes("expired") && <Link to="/forgot-password" className="underline">Request a new link</Link>}</span>
                    </div>
                )}
                <div>
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">New password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <input type={show ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="input-premium pl-11 pr-12" placeholder="••••••••" />
                        <button type="button" aria-label="Toggle password visibility" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <PasswordStrength password={form.password} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Confirm password</label>
                    <input type={show ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} className="input-premium" placeholder="••••••••" />
                    {form.confirmPassword && form.confirmPassword !== form.password && <p className="text-crimson-400 text-xs mt-1">Passwords do not match</p>}
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-crimson-600 to-crimson-500 text-white hover:from-crimson-500 hover:to-crimson-400 disabled:opacity-50 transition-all duration-300">
                    {loading ? "Updating..." : "Update password"}
                </button>
            </form>
        </AuthShell>
    );
}
