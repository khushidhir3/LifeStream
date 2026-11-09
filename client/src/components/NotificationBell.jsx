import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, Droplet, UserCheck, MessageSquare, Info } from "lucide-react";
import { api, timeAgo } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const ICONS = { request: Droplet, response: MessageSquare, account: UserCheck, info: Info };

export default function NotificationBell({ small = false }) {
    const { unreadNotifications, setUnread, isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api("/notifications", { query: { limit: 30 } });
            setItems(res.data);
            setUnread(res.unread);
        } catch { /* shown as empty list */ } finally {
            setLoading(false);
        }
    }, [setUnread]);

    // Keep the badge fresh while the page is open.
    useEffect(() => {
        if (!isAuthenticated) return undefined;
        const tick = () => api("/notifications/unread-count").then((r) => setUnread(r.unread)).catch(() => {});
        const id = setInterval(tick, 60000);
        return () => clearInterval(id);
    }, [isAuthenticated, setUnread]);

    useEffect(() => {
        if (!open) return undefined;
        load();
        const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
    }, [open, load]);

    const markAll = async () => {
        await api("/notifications/read-all", { method: "PATCH" });
        setItems((list) => list.map((n) => ({ ...n, read: true })));
        setUnread(0);
    };

    const openItem = async (n) => {
        if (!n.read) {
            api(`/notifications/${n.id}/read`, { method: "PATCH" }).catch(() => {});
            setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
            setUnread(Math.max(0, unreadNotifications - 1));
        }
        if (n.link && n.link !== window.location.pathname) { setOpen(false); navigate(n.link); }
    };

    const remove = async (e, n) => {
        e.stopPropagation();
        await api(`/notifications/${n.id}`, { method: "DELETE" });
        setItems((list) => list.filter((x) => x.id !== n.id));
        if (!n.read) setUnread(Math.max(0, unreadNotifications - 1));
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)} aria-label={`Notifications${unreadNotifications ? ` (${unreadNotifications} unread)` : ""}`} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative">
                <Bell className={`${small ? "h-4 w-4" : "h-5 w-5"} text-white/60`} />
                {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-crimson-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#121219] shadow-2xl shadow-black/50 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <p className="font-display font-bold text-sm">Notifications</p>
                        {items.some((n) => !n.read) && (
                            <button onClick={markAll} className="text-xs text-crimson-400 hover:text-crimson-300 flex items-center gap-1">
                                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-[26rem] overflow-y-auto">
                        {loading && !items.length && <p className="p-6 text-center text-white/30 text-sm">Loading…</p>}
                        {!loading && !items.length && (
                            <div className="p-8 text-center">
                                <Bell className="h-8 w-8 text-white/10 mx-auto mb-2" />
                                <p className="text-white/40 text-sm">You're all caught up</p>
                            </div>
                        )}
                        {items.map((n) => {
                            const Icon = ICONS[n.type] || Info;
                            return (
                                <div key={n.id} onClick={() => openItem(n)} className={`group flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/[0.04] ${n.read ? "" : "bg-crimson-600/[0.06]"}`}>
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${n.type === "request" ? "bg-crimson-600/20 text-crimson-400" : "bg-white/5 text-white/50"}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${n.read ? "text-white/70" : "text-white font-semibold"}`}>{n.title}</p>
                                        <p className="text-xs text-white/40 mt-0.5 break-words">{n.message}</p>
                                        <p className="text-[10px] text-white/25 mt-1">{timeAgo(n.createdAt)}</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        {!n.read && <span className="w-2 h-2 rounded-full bg-crimson-500 mt-1" />}
                                        <button onClick={(e) => remove(e, n)} aria-label="Delete notification" className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-crimson-400">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
