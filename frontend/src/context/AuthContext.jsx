import { createContext, useContext, useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

   useEffect(() => {
  setChecking(false);
}, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post("/auth/login", { email, password });

localStorage.setItem("access_token", data.token);

setUser(data);
            return { ok: true };
        } catch (e) {
            return { ok: false, error: formatApiErrorDetail(e.response?.data?.detail) || e.message };
        }
    };

    const logout = async () => {
        try { await api.post("/auth/logout"); } catch { /* noop */ }
        setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, checking, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
