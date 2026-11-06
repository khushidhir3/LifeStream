import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setUnauthorizedHandler, tokenStore } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState({ user: null, donor: null, unreadNotifications: 0 });
    const [loading, setLoading] = useState(Boolean(tokenStore.get()));

    const logout = useCallback(() => {
        tokenStore.clear();
        setSession({ user: null, donor: null, unreadNotifications: 0 });
    }, []);

    const refresh = useCallback(async () => {
        if (!tokenStore.get()) { setLoading(false); return null; }
        try {
            const data = await api("/me");
            setSession(data);
            return data;
        } catch (err) {
            if (err.status === 401) logout();
            return null;
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        setUnauthorizedHandler(logout);
        refresh();
    }, [refresh, logout]);

    const applyAuthResponse = useCallback((data, remember = true) => {
        tokenStore.set(data.token, remember);
        setSession({ user: data.user, donor: data.donor, unreadNotifications: data.unreadNotifications || 0 });
    }, []);

    const login = useCallback(async ({ email, password, remember, portal, adminCode }) => {
        const data = await api("/auth/login", { method: "POST", body: { email, password, portal, adminCode }, auth: false });
        applyAuthResponse(data, remember);
        return data;
    }, [applyAuthResponse]);

    const register = useCallback(async (payload) => {
        const data = await api("/auth/register", { method: "POST", body: payload, auth: false });
        applyAuthResponse(data, true);
        return data;
    }, [applyAuthResponse]);

    // Stable helpers so components can safely list them as effect dependencies.
    const mergeSession = useCallback((data) => setSession((s) => ({ ...s, ...data })), []);
    const setUnread = useCallback((n) => setSession((s) => (s.unreadNotifications === n ? s : { ...s, unreadNotifications: n })), []);

    const value = useMemo(() => ({
        ...session,
        loading,
        isAuthenticated: Boolean(session.user),
        isAdmin: session.user?.role === "admin",
        login,
        register,
        logout,
        refresh,
        setSession: mergeSession,
        setUnread,
    }), [session, loading, login, register, logout, refresh, mergeSession, setUnread]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
