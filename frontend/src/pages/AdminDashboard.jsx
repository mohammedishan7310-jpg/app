import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, MessageSquare, Image as ImageIcon, Megaphone, LogOut, GraduationCap, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api, API, formatApiErrorDetail } from "../lib/api";

export default function AdminDashboard() {
    const { user, checking, logout } = useAuth();
    const nav = useNavigate();

    if (checking) return <div className="min-h-screen flex items-center justify-center bg-cream"><div className="text-ash">Loading...</div></div>;
    if (!user) return <Navigate to="/admin/login" replace />;

    const items = [
        { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
        { to: "/admin/admissions", label: "Admissions", icon: Users },
        { to: "/admin/contacts", label: "Contacts", icon: MessageSquare },
        { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
        { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
    ];

    return (
        <div className="min-h-screen flex bg-[#F8FAFC]" data-testid="admin-dashboard">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-ink text-white min-h-screen">
                <Link to="/" className="flex items-center gap-2.5 px-6 h-16 border-b border-white/10">
                    <div className="h-9 w-9 rounded-xl bg-saffron flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-ink" strokeWidth={2.2} />
                    </div>
                    <div className="leading-tight">
                        <div className="font-display font-bold text-white text-sm">Azad School</div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-saffron">Admin</div>
                    </div>
                </Link>
                <nav className="flex-1 px-3 py-6 space-y-1">
                    {items.map(it => (
                        <NavLink key={it.to} to={it.to} end={it.end} data-testid={`sidebar-${it.label.toLowerCase()}`}
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-saffron text-ink" : "text-cream/80 hover:bg-white/10 hover:text-white"}`}>
                            <it.icon className="h-4 w-4" /> {it.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-white/10">
                    <div className="text-xs text-cream/60 mb-2">{user.email}</div>
                    <button onClick={async () => { await logout(); nav("/admin/login"); }} data-testid="admin-logout-btn" className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg">
                        <LogOut className="h-4 w-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 inset-x-0 bg-ink text-white px-4 h-14 flex items-center justify-between z-40">
                <Link to="/" className="font-display font-bold">Azad Admin</Link>
                <button onClick={async () => { await logout(); nav("/admin/login"); }} className="text-cream/80 text-sm">Logout</button>
            </div>

            <main className="flex-1 md:ml-0 mt-14 md:mt-0">
                <div className="md:hidden border-b border-[#E2E8F0] bg-white px-4 py-3 overflow-x-auto flex gap-2">
                    {items.map(it => (
                        <NavLink key={it.to} to={it.to} end={it.end}
                            className={({ isActive }) => `flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${isActive ? "bg-ink text-white" : "bg-cream text-ink border border-[#E2E8F0]"}`}>
                            {it.label}
                        </NavLink>
                    ))}
                </div>
                <Routes>
                    <Route index element={<Overview />} />
                    <Route path="admissions" element={<AdmissionsPanel />} />
                    <Route path="contacts" element={<ContactsPanel />} />
                    <Route path="gallery" element={<GalleryPanel />} />
                    <Route path="announcements" element={<AnnouncementsPanel />} />
                </Routes>
            </main>
        </div>
    );
}

function PageHeader({ title, desc, action }) {
    return (
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
            <div>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-ink">{title}</h1>
                {desc && <p className="text-sm text-ash mt-1">{desc}</p>}
            </div>
            {action}
        </div>
    );
}

function Overview() {
    const [stats, setStats] = useState(null);
    useEffect(() => { api.get("/admin/stats").then(r => setStats(r.data)).catch(() => {}); }, []);
    const cards = [
        { k: "admissions", label: "Total Admissions", icon: Users },
        { k: "pending_admissions", label: "Pending Reviews", icon: Users },
        { k: "contacts", label: "Contact Messages", icon: MessageSquare },
        { k: "gallery_images", label: "Gallery Images", icon: ImageIcon },
        { k: "announcements", label: "Announcements", icon: Megaphone },
    ];
    return (
        <div className="p-6 md:p-10" data-testid="admin-overview">
            <PageHeader title="Dashboard" desc="At-a-glance view of your school operations." />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {cards.map(c => (
                    <div key={c.k} className="bg-white border border-[#E2E8F0] rounded-2xl p-5" data-testid={`stat-${c.k}`}>
                        <c.icon className="h-5 w-5 text-saffron" />
                        <div className="font-display font-bold text-3xl mt-3 text-ink">{stats?.[c.k] ?? "—"}</div>
                        <div className="text-xs text-ash mt-1 uppercase tracking-wider">{c.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdmissionsPanel() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(null);

    const load = () => api.get("/admin/admissions").then(r => setItems(r.data));
    useEffect(() => { load(); }, []);

    const setStatus = async (id, status) => {
        const fd = new FormData(); fd.append("status", status);
        try {
            await api.patch(`/admin/admissions/${id}`, fd);
            toast.success("Status updated"); load(); setOpen(null);
        } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
    };

    return (
        <div className="p-6 md:p-10" data-testid="admin-admissions-panel">
            <PageHeader title="Admissions" desc={`${items.length} application${items.length !== 1 ? "s" : ""}`} />
            <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <tr>
                                <Th>Student</Th><Th>Class</Th><Th>Parent</Th><Th>Phone</Th><Th>Date</Th><Th>Status</Th><Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(a => (
                                <tr key={a.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]" data-testid={`admission-row-${a.id}`}>
                                    <Td><div className="font-medium text-ink">{a.student_name}</div><div className="text-xs text-ash">{a.gender} • {a.date_of_birth}</div></Td>
                                    <Td>{a.class_applying}</Td>
                                    <Td>{a.parent_name}<br /><span className="text-xs text-ash">{a.parent_email}</span></Td>
                                    <Td>{a.parent_phone}</Td>
                                    <Td>{new Date(a.created_at).toLocaleDateString()}</Td>
                                    <Td><StatusBadge status={a.status} /></Td>
                                    <Td>
                                        <button onClick={() => setOpen(a)} className="text-saffronDark hover:underline text-xs font-medium" data-testid={`view-admission-${a.id}`}>View</button>
                                    </Td>
                                </tr>
                            ))}
                            {items.length === 0 && <tr><td colSpan={7} className="text-center text-ash py-12">No applications yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4" onClick={() => setOpen(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="admission-modal">
                        <h3 className="font-display font-bold text-xl text-ink">{open.student_name}</h3>
                        <div className="mt-4 space-y-2 text-sm">
                            <Row k="Class" v={open.class_applying} />
                            <Row k="DOB" v={open.date_of_birth} />
                            <Row k="Gender" v={open.gender} />
                            <Row k="Previous School" v={open.previous_school || "-"} />
                            <Row k="Parent" v={open.parent_name} />
                            <Row k="Email" v={open.parent_email} />
                            <Row k="Phone" v={open.parent_phone} />
                            <Row k="Address" v={open.address} />
                            <Row k="Notes" v={open.message || "-"} />
                            <Row k="Submitted" v={new Date(open.created_at).toLocaleString()} />
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <button onClick={() => setStatus(open.id, "approved")} className="px-4 py-2 text-xs font-semibold bg-saffron text-white rounded-full" data-testid="approve-admission">Approve</button>
                            <button onClick={() => setStatus(open.id, "rejected")} className="px-4 py-2 text-xs font-semibold bg-white border border-[#CBD5E1] text-ink rounded-full" data-testid="reject-admission">Reject</button>
                            <button onClick={() => setStatus(open.id, "pending")} className="px-4 py-2 text-xs font-semibold bg-white border border-[#CBD5E1] text-ink rounded-full">Mark Pending</button>
                            <button onClick={() => setOpen(null)} className="ml-auto px-4 py-2 text-xs text-ash">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ContactsPanel() {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get("/admin/contacts").then(r => setItems(r.data)).catch(() => {}); }, []);
    return (
        <div className="p-6 md:p-10" data-testid="admin-contacts-panel">
            <PageHeader title="Contact Messages" desc={`${items.length} message${items.length !== 1 ? "s" : ""}`} />
            <div className="space-y-3">
                {items.map(c => (
                    <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5" data-testid={`contact-row-${c.id}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="font-display font-semibold text-ink">{c.subject}</div>
                                <div className="text-xs text-ash mt-1">{c.name} • {c.email}{c.phone ? ` • ${c.phone}` : ""}</div>
                            </div>
                            <div className="text-xs text-ash flex-shrink-0">{new Date(c.created_at).toLocaleDateString()}</div>
                        </div>
                        <p className="mt-3 text-sm text-ink whitespace-pre-wrap">{c.message}</p>
                    </div>
                ))}
                {items.length === 0 && <div className="text-center text-ash py-12 bg-white border border-[#E2E8F0] rounded-2xl">No messages yet.</div>}
            </div>
        </div>
    );
}

function GalleryPanel() {
    const [items, setItems] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [category, setCategory] = useState("events");
    const [title, setTitle] = useState("");

    const load = () => api.get("/gallery").then(r => setItems(r.data));
    useEffect(() => { load(); }, []);

    const upload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("category", category);
        fd.append("title", title || file.name);
        setUploading(true);
        try {
            await api.post("/admin/gallery", fd, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("Uploaded"); setTitle(""); load();
        } catch (er) { toast.error(formatApiErrorDetail(er.response?.data?.detail) || "Upload failed"); }
        finally { setUploading(false); e.target.value = ""; }
    };

    const remove = async (id) => {
        if (!confirm("Delete this image?")) return;
        try { await api.delete(`/admin/gallery/${id}`); toast.success("Deleted"); load(); }
        catch (er) { toast.error(formatApiErrorDetail(er.response?.data?.detail)); }
    };

    return (
        <div className="p-6 md:p-10" data-testid="admin-gallery-panel">
            <PageHeader title="Gallery" desc="Upload and manage campus images." />
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6">
                <h3 className="font-display font-semibold text-ink mb-4">Upload new image</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" data-testid="gallery-title-input" className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none text-sm" />
                    <select value={category} onChange={(e) => setCategory(e.target.value)} data-testid="gallery-category-select" className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none text-sm">
                        <option value="events">Events</option>
                        <option value="sports">Sports</option>
                        <option value="classrooms">Classrooms</option>
                        <option value="infrastructure">Infrastructure</option>
                    </select>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-saffron rounded-lg hover:bg-saffronDark" data-testid="gallery-upload-label">
                        <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Choose image"}
                        <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={uploading} data-testid="gallery-upload-input" />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(it => (
                    <div key={it.id} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden group relative" data-testid={`admin-gallery-item-${it.id}`}>
                        <div className="aspect-square overflow-hidden">
                            <img src={`${API}/files/${it.storage_path}`} alt={it.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                            <div className="text-sm font-medium text-ink truncate">{it.title}</div>
                            <div className="text-xs text-ash capitalize">{it.category}</div>
                        </div>
                        <button onClick={() => remove(it.id)} className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`delete-gallery-${it.id}`}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                {items.length === 0 && <div className="col-span-full text-center text-ash py-12 bg-white border border-[#E2E8F0] rounded-2xl">No images yet — upload your first image above.</div>}
            </div>
        </div>
    );
}

function AnnouncementsPanel() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ title: "", body: "", category: "General" });

    const load = () => api.get("/announcements").then(r => setItems(r.data));
    useEffect(() => { load(); }, []);

    const create = async (e) => {
        e.preventDefault();
        if (!form.title || !form.body) { toast.error("Title and body required"); return; }
        try { await api.post("/admin/announcements", form); toast.success("Created"); setForm({ title: "", body: "", category: "General" }); load(); }
        catch (er) { toast.error(formatApiErrorDetail(er.response?.data?.detail)); }
    };

    const remove = async (id) => {
        if (!confirm("Delete this announcement?")) return;
        try { await api.delete(`/admin/announcements/${id}`); toast.success("Deleted"); load(); }
        catch (er) { toast.error(formatApiErrorDetail(er.response?.data?.detail)); }
    };

    return (
        <div className="p-6 md:p-10" data-testid="admin-announcements-panel">
            <PageHeader title="Announcements" desc="Post news, events and achievements." />
            <form onSubmit={create} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6 space-y-4" data-testid="announcement-form">
                <div className="grid md:grid-cols-3 gap-4">
                    <input data-testid="announcement-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="md:col-span-2 px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none text-sm" />
                    <select data-testid="announcement-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none text-sm">
                        <option>General</option><option>Admission</option><option>Event</option><option>Achievement</option>
                    </select>
                </div>
                <textarea data-testid="announcement-body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} placeholder="Body" className="w-full px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none text-sm" />
                <button type="submit" data-testid="announcement-submit" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-ink rounded-full hover:bg-ink2"><Plus className="h-4 w-4" /> Add announcement</button>
            </form>

            <div className="space-y-3">
                {items.map(a => (
                    <div key={a.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-start justify-between gap-3" data-testid={`announcement-row-${a.id}`}>
                        <div>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] bg-saffron/10 text-saffronDark px-2.5 py-1 rounded-full">{a.category}</span>
                            <h3 className="font-display font-bold mt-2 text-ink">{a.title}</h3>
                            <p className="text-sm text-ash mt-1">{a.body}</p>
                            <div className="text-xs text-ash mt-2">{new Date(a.created_at).toLocaleString()}</div>
                        </div>
                        <button onClick={() => remove(a.id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-ash" data-testid={`delete-announcement-${a.id}`}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                {items.length === 0 && <div className="text-center text-ash py-12 bg-white border border-[#E2E8F0] rounded-2xl">No announcements yet.</div>}
            </div>
        </div>
    );
}

const Th = ({ children }) => <th className="px-4 py-3 text-xs font-semibold text-ink uppercase tracking-wider">{children}</th>;
const Td = ({ children }) => <td className="px-4 py-3 align-top">{children}</td>;
const Row = ({ k, v }) => <div className="flex gap-3 text-sm"><span className="text-ash w-32 flex-shrink-0">{k}</span><span className="text-ink">{v}</span></div>;
const StatusBadge = ({ status }) => {
    const map = { pending: "bg-amber-100 text-amber-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-700" };
    return <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${map[status] || "bg-[#F3F4F6] text-ink"}`}>{status}</span>;
};
