# Azad Senior Secondary School — Product Requirements

## Original Problem Statement
Create a modern full-stack school website for Azad Senior Secondary School with homepage, admission form, gallery, contact page, admin panel and mobile responsive design.

## User Choices
- Auth: JWT email/password (admin seeded from .env)
- Admission form: save submissions to admin panel only (no emails)
- Gallery: admin uploads via panel (object storage)
- Design: modern & vibrant
- Contact: form + Google Maps embed

## Architecture
- **Backend**: FastAPI + Motor + MongoDB. JWT (httpOnly cookie + token in body), bcrypt password hashing, seeded admin on startup.
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn/ui, sonner toasts, AuthContext.
- **Storage**: Emergent object storage for gallery images, served through `/api/files/{path}`.
- **Design**: Cabinet Grotesk display + IBM Plex Sans body, Navy (#0F172A) + Saffron (#EA580C) palette, cream background.

## User Personas
- **Visiting parent / prospective student** — browses Home/Gallery, reads announcements, submits admission/contact form.
- **School admin** — logs into /admin, reviews admissions (approve/reject), reads contact messages, uploads/deletes gallery images, posts announcements.

## Implemented (May 2026)
- Public site: Home (hero, stats, about, programs, announcements, CTA), Admissions (3-step form), Gallery (category filter), Contact (form + Maps embed)
- Admin: login, dashboard overview with stats, admissions table + status updates, contacts list, gallery upload/delete, announcements CRUD
- Auth: /api/auth/login, /me, /logout with JWT cookies + bcrypt + seeded admin
- Mobile-responsive header + admin nav
- Backend tests: 14/14 passing; Frontend tests: all passing

## Iteration 2 (May 2026) — Frontend rewritten to plain HTML/CSS/JS
- Removed React; site is now multi-page static HTML in `/app/frontend/public/*.html` using Tailwind CDN + vanilla JS
- Shared helpers in `/app/frontend/public/js/app.js`: `apiFetch`, `toast`, `renderLayout`, `getCurrentUser`, `logout`
- Pages: `index.html` (Home), `admissions.html`, `gallery.html`, `contact.html`, `admin-login.html`, `admin.html` (hash-routed tabs)
- All references to "CBSE" replaced with "RBSE"
- Backend unchanged; all flows verified by testing agent (100% pass)

## Iteration 5 (May 2026) — Admin panel mobile UX
- Sidebar converted to **slide-in drawer** on mobile/tablet (< 1024px): hidden by default with `-translate-x-full`, slides in on hamburger tap, dimmed overlay backdrop, close button + auto-close on nav link tap.
- Persistent sidebar on desktop (`lg:translate-x-0 lg:sticky`).
- Mobile top bar redesigned: hamburger (left) + brand (center) + Logout (right).
- Stats grid breakpoints widened: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4` — single column on mobile so no label truncation, 4 cols on wide desktop.
- Removed horizontal-scroll tab strip in favor of drawer nav.
- Verified at 414px: drawer opens, all 7 tab labels visible, stat cards readable, forms full-width.

## Iteration 4 (May 2026) — Mobile responsiveness pass
- Added `html, body { overflow-x: hidden }` on every page to kill stray horizontal scroll
- Home hero rebalanced: text scaled `text-[2rem] sm:text-5xl lg:text-6xl`, padding `pt-16 pb-20 sm:pt-24 sm:pb-32 md:pt-32`, stronger overlay below 640px (vertical gradient via media query)
- All public pages: title sections now `text-3xl sm:text-4xl md:text-5xl lg:text-6xl` and `py-12 sm:py-16 md:py-24`
- Stats strip: smaller numbers + tighter gap on mobile
- CTA section: scaled padding/text down for small screens
- Verified at 414px viewport: no horizontal scroll, hamburger visible, hero readable, forms full-width, stats in 2-column grid

## Iteration 3 (May 2026) — Results + Attendance features
- Backend: added `/api/admin/results` (POST/GET/DELETE) and public `/api/results/lookup`. Auto-computes total, percentage, grade (A+/A/B+/B/C/D/F).
- Backend: added `/api/admin/attendance` (POST/GET/DELETE) and public `/api/attendance/lookup`. Auto-computes percentage and absent_days.
- Backend: case-insensitive lookup via `roll_number_norm`/`student_class_norm`; compound indexes on both collections.
- Frontend: new public pages `/results.html` (printable result card with subject-wise marksheet) and `/attendance.html` (monthly summary + overall %).
- Frontend admin: 2 new tabs (Results, Attendance) with dynamic-subject forms and live percentage preview.
- Header nav updated (Home / Admissions / Results / Attendance / Gallery / Contact + Admin + Apply Now). Breakpoint moved to `lg:` for cleaner mobile nav.
- Tests: 32/32 backend pytest pass (grade boundaries, CRUD, validation, auth gates); 10/10 frontend end-to-end flows pass.

## Backlog
**P1**
- Email notifications on new admission/contact (Resend/SendGrid)
- Faculty/staff page + leadership profiles
- Downloadable prospectus / fee structure PDF

**P2**
- Student portal (results, attendance lookup)
- Multi-language toggle (Hindi/English)
- Brute-force lockout on login (per playbook)
- Replace CORS `*` with explicit origins for production
- Online fee payment (Stripe/Razorpay)

## Test Credentials
See `/app/memory/test_credentials.md`
