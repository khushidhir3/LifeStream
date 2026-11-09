// Small fetch wrapper for the LifeStream API.
// VITE_API_URL may be a full URL or just a host (Render passes only the host).
function resolveBase() {
    const raw = import.meta.env.VITE_API_URL;
    if (!raw) return "http://localhost:4000";
    const url = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
    return url.replace(/\/$/, "");
}

export const API_BASE = resolveBase();
const TOKEN_KEY = "ls_token";

export const tokenStore = {
    get: () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY),
    set: (token, remember = true) => {
        tokenStore.clear();
        (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
    },
    // Keep the token wherever it already lives (used after a password change).
    replace: (token) => {
        if (sessionStorage.getItem(TOKEN_KEY)) sessionStorage.setItem(TOKEN_KEY, token);
        else localStorage.setItem(TOKEN_KEY, token);
    },
    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
    },
};

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data || {};
        this.field = data?.field;
    }
}

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export async function api(path, { method = "GET", body, query, auth = true, signal } = {}) {
    let url = `${API_BASE}/api${path}`;
    if (query) {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") params.set(k, v);
        });
        const qs = params.toString();
        if (qs) url += `?${qs}`;
    }
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = auth ? tokenStore.get() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, signal });
    } catch (err) {
        if (err.name === "AbortError") throw err;
        throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
    }

    let data = null;
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }

    if (!res.ok) {
        if (res.status === 401 && token && onUnauthorized) onUnauthorized();
        throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data);
    }
    return data;
}

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Mirrors the backend password policy so users see problems while typing.
export function passwordChecks(pw = "") {
    return [
        { label: "At least 8 characters", ok: pw.length >= 8 },
        { label: "One uppercase letter", ok: /[A-Z]/.test(pw) },
        { label: "One lowercase letter", ok: /[a-z]/.test(pw) },
        { label: "One number", ok: /[0-9]/.test(pw) },
        { label: "One special character", ok: /[^A-Za-z0-9]/.test(pw) },
    ];
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").trim());
export const isPhone = (v) => /^\+?[0-9][0-9\s-]{8,16}$/.test((v || "").trim());

export function timeAgo(date) {
    if (!date) return "Never";
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d} day${d > 1 ? "s" : ""} ago`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo} month${mo > 1 ? "s" : ""} ago`;
    const y = Math.floor(d / 365);
    return `${y} year${y > 1 ? "s" : ""} ago`;
}

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
