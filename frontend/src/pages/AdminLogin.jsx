import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { GraduationCap, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
    const { user, checking, login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);

    if (checking) return <div className="min-h-screen flex items-center justify-center bg-cream"><div className="text-ash">Loading...</div></div>;
    if (user) return <Navigate to="/admin" replace />;

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        const res = await login(email, password);
        setBusy(false);
        if (res.ok) {
            toast.success("Welcome back");
            nav("/admin");
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="min-h-screen bg-cream grain-bg flex items-center justify-center px-4" data-testid="admin-login-page">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2.5 justify-center mb-8">
                    <div className="h-10 w-10 rounded-xl bg-ink flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-saffron" strokeWidth={2.2} />
                    </div>
                    <div className="leading-tight">
                        <div className="font-display font-bold text-ink text-base">Azad Sr. Sec. School</div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-ash">Admin Portal</div>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-5" data-testid="admin-login-form">
                    <div className="flex items-center gap-2 text-saffron">
                        <Lock className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Sign in</span>
                    </div>
                    <h1 className="font-display font-bold text-2xl text-ink">Welcome back, Admin</h1>

                    <label className="block">
                        <span className="block text-sm font-medium text-ink mb-1.5">Email</span>
                        <input data-testid="admin-login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" placeholder="admin@azadschool.edu" />
                    </label>
                    <label className="block">
                        <span className="block text-sm font-medium text-ink mb-1.5">Password</span>
                        <input data-testid="admin-login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" />
                    </label>
                    <button type="submit" disabled={busy} data-testid="admin-login-submit" className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-ink rounded-full hover:bg-ink2 disabled:opacity-60">
                        {busy ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
