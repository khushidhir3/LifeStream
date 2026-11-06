import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

    const show = useCallback((message, type = "success", ms = 4000) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((t) => [...t, { id, message, type }]);
        setTimeout(() => dismiss(id), ms);
    }, [dismiss]);

    const toast = useMemo(() => ({
        success: (m) => show(m, "success"),
        error: (m) => show(m, "error", 6000),
        info: (m) => show(m, "info"),
    }), [show]);

    const styles = {
        success: { icon: CheckCircle, cls: "border-emerald-500/30 text-emerald-300" },
        error: { icon: AlertCircle, cls: "border-crimson-500/40 text-crimson-300" },
        info: { icon: Info, cls: "border-blue-500/30 text-blue-300" },
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-[calc(100%-3rem)]">
                {toasts.map((t) => {
                    const S = styles[t.type];
                    return (
                        <div key={t.id} role="status" className={`flex items-start gap-3 px-4 py-3 rounded-xl border bg-[#14141c]/95 backdrop-blur shadow-2xl ${S.cls}`}>
                            <S.icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-white/80 flex-1">{t.message}</p>
                            <button onClick={() => dismiss(t.id)} className="text-white/30 hover:text-white/70" aria-label="Dismiss">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    return useContext(ToastContext);
}
