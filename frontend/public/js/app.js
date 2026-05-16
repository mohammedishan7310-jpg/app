// =================================================================
// Shared helpers used by every HTML page
// =================================================================

// REACT_APP_BACKEND_URL is injected by CRA at build time. In our plain
// HTML pages we hardcode the relative /api path since backend is served
// through the same ingress.
const API = 'https://app-gtvw.onrender.com/api';

// ---- fetch wrapper ----
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(API + path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options,
  });

  if (!res.ok) {
    let detail = "Request failed";
    try { const j = await res.json(); detail = j.detail || detail; } catch {}
    throw new Error(detail);
  }

  return res.json();
}

// ---- toast (tiny replacement for sonner) ----
function toast(message, type = "info") {
    let host = document.getElementById("toast-host");
    if (!host) {
        host = document.createElement("div");
        host.id = "toast-host";
        host.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;";
        document.body.appendChild(host);
    }
    const colors = { info: "#0F172A", success: "#16a34a", error: "#dc2626" };
    const el = document.createElement("div");
    el.style.cssText = `background:${colors[type] || colors.info};color:white;padding:12px 18px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.15);font-size:14px;max-width:340px;`;
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

// ---- auth helpers ----
async function getCurrentUser() {
    try { return await apiFetch("/auth/me"); }
    catch { return null; }
}

async function requireAdmin() {
    const user = await getCurrentUser();
    if (!user) { window.location.href = "/admin-login.html"; return null; }
    return user;
}

async function logout() {
    try { await apiFetch("/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    window.location.href = "/admin-login.html";
}

// ---- shared header + footer injection ----
function renderLayout(active) {
    const headerHTML = `
    <header class="sticky top-0 z-50 backdrop-blur-xl bg-cream/80 border-b border-slate-200" data-testid="site-header">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2.5" data-testid="brand-link">
          <div class="h-9 w-9 rounded-xl bg-ink flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA580C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div class="leading-tight">
            <div class="font-display font-bold text-ink text-base">Azad</div>
            <div class="text-[11px] uppercase tracking-[0.18em] text-ash">Sr. Sec. School</div>
          </div>
        </a>
        <nav class="hidden lg:flex items-center gap-6">
          ${["Home:/", "Admissions:/admissions.html", "Results:/results.html", "Attendance:/attendance.html", "Gallery:/gallery.html", "Contact:/contact.html"]
            .map(s => { const [label, href] = s.split(":");
              const isActive = active === label.toLowerCase();
              return `<a href="${href}" data-testid="nav-${label.toLowerCase()}" class="text-[14px] font-medium transition-colors ${isActive ? "text-saffron" : "text-ink hover:text-saffron"}">${label}</a>`;
            }).join("")}
        </nav>
        <div class="hidden lg:flex items-center gap-3">
          <a href="/admin-login.html" data-testid="nav-admin" class="text-[13px] font-medium text-ash hover:text-saffron transition-colors">Admin</a>
          <a href="/admissions.html" data-testid="apply-cta" class="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-saffron rounded-full hover:bg-saffronDark transition-colors">Apply Now</a>
        </div>
        <button id="mobileMenuToggle" data-testid="mobile-menu-toggle" class="lg:hidden p-2" aria-label="menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
      <div id="mobileMenu" class="lg:hidden border-t border-slate-200 bg-cream hidden">
        <div class="px-4 py-4 flex flex-col gap-1">
          ${["Home:/", "Admissions:/admissions.html", "Results:/results.html", "Attendance:/attendance.html", "Gallery:/gallery.html", "Contact:/contact.html", "Admin:/admin-login.html"]
            .map(s => { const [label, href] = s.split(":");
              const isActive = active === label.toLowerCase();
              return `<a href="${href}" data-testid="mobile-nav-${label.toLowerCase()}" class="px-3 py-3 rounded-lg text-base font-medium ${isActive ? "bg-ink text-cream" : "text-ink hover:bg-slate-100"}">${label}</a>`;
            }).join("")}
          <a href="/admissions.html" class="mt-2 inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-white bg-saffron rounded-full">Apply Now</a>
        </div>
      </div>
    </header>`;

    const footerHTML = `
    <footer class="bg-ink text-cream/90 mt-20" data-testid="site-footer">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div class="md:col-span-2">
          <div class="flex items-center gap-2.5">
            <div class="h-9 w-9 rounded-xl bg-saffron flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div class="leading-tight">
              <div class="font-display font-bold text-white text-base">Azad Sr. Sec. School</div>
              <div class="text-[11px] uppercase tracking-[0.18em] text-saffron">Est. 1993</div>
            </div>
          </div>
          <p class="mt-4 max-w-md text-sm leading-relaxed text-cream/70">A vibrant learning community committed to academic excellence, character building and helping every student discover their potential.</p>
        </div>
        <div>
          <h4 class="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">Quick Links</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/" class="hover:text-saffron transition-colors">Home</a></li>
            <li><a href="/admissions.html" class="hover:text-saffron transition-colors">Admissions</a></li>
            <li><a href="/gallery.html" class="hover:text-saffron transition-colors">Gallery</a></li>
            <li><a href="/contact.html" class="hover:text-saffron transition-colors">Contact</a></li>
            <li><a href="/admin-login.html" class="hover:text-saffron transition-colors">Admin Login</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">Contact</h4>
          <ul class="space-y-3 text-sm text-cream/80">
            <li>WR9R+56Q Azad Public Sr. Sec. School, Surajpole Bazar, Topkhana Hazuri, Jaipur, Rajasthan 302003</li>
            <li>+91 8955383786</li>
            <li>info@azadschool.edu</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs text-cream/60 flex flex-col sm:flex-row justify-between gap-2">
          <span>© ${new Date().getFullYear()} Azad Senior Secondary School. All rights reserved.</span>
          <span>Affiliated to RBSE | Recognized by Ministry of Education</span>
        </div>
      </div>
    </footer>`;

    const headerSlot = document.getElementById("header-slot");
    const footerSlot = document.getElementById("footer-slot");
    if (headerSlot) headerSlot.innerHTML = headerHTML;
    if (footerSlot) footerSlot.innerHTML = footerHTML;

    const btn = document.getElementById("mobileMenuToggle");
    const menu = document.getElementById("mobileMenu");
    if (btn && menu) btn.addEventListener("click", () => menu.classList.toggle("hidden"));
}
