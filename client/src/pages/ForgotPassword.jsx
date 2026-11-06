import React, { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { api, isEmail } from "../lib/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        if (!isEmail(email)) return setError("Enter a valid email address");
        setLoading(true);
        setError("");
        try {
            setSent(await api("/auth/forgot-password", { method: "POST", body: { email: email.trim() }, auth: false }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell icon={KeyRound} title="Forgot password?" subtitle="We'll email you a link to reset it">
            {sent ? (
                <div className="space-y-5 text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
                    <p className="text-white/70 text-sm">{sent.message} The link expires in 1 hour. Check your spam folder too.</p>
                    {sent.devResetUrl && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
                            <p className="text-amber-300 text-xs font-semibold mb-1">Development mode — email is not configured</p>
                            <a href={sent.devResetUrl} className="text-xs text-amber-200 underline break-all">{sent.devResetUrl}</a>
                        </div>
                    )}
                    <Link to="/login" className="inline-flex items-center gap-2 text-crimson-400 text-sm font-semibold hover:text-crimson-300">
                        <ArrowLeft className="h-4 w-4" /> Back to sign in
                    </Link>
                </div>
            ) : (
                <form onSubmit={submit} noValidate className="space-y-5">
                    {error && (
                        <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-crimson-300 text-sm">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" /> {error}
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <input type="email" autoComplete="email" autoFocus value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" className="input-premium pl-11" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-crimson-600 to-crimson-500 text-white hover:from-crimson-500 hover:to-crimson-400 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2">
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : "Send reset link"}
                    </button>
                    <p className="text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-white/50 text-sm hover:text-white/80">
                            <ArrowLeft className="h-4 w-4" /> Back to sign in
                        </Link>
                    </p>
                </form>
            )}
        </AuthShell>
    );
}
