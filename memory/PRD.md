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
