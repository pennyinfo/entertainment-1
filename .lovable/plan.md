
## Plan: Landing, User Sign Up/In, Admin Panels

### Flow
- `/` → Splash screen (existing) → auto-transitions to landing card with two buttons: **Sign In** and **Sign Up**.
- After successful sign in/up → `/welcome` (simple confirmation page with the user's name + details).

### User Sign Up (`/signup`)
Fields:
- Name (text)
- Mobile number (10 digits, validated)
- Panchayath (dropdown, loaded from DB)
- Ward (dropdown, filtered by selected panchayath)

On submit → insert into `users` table. If mobile already exists → show "already registered, please sign in".

### User Sign In (`/signin`)
- Single field: Mobile number
- Lookup row in `users`; if found, store `{ userId, name }` in `localStorage` and redirect to `/welcome`. If not found → "Not registered, please sign up".

### Super Admin (`/super-admin`)
- Login screen: email + password (checked against seeded row in `super_admins` table; plain compare — user explicitly asked no auth check).
- On success, store `superAdminId` in `localStorage`, show dashboard with tabs:
  - **Admins**: list admins, form to add admin (mobile + password)
  - **Panchayaths & Wards**: add/remove panchayaths; add/remove wards under each panchayath
  - **Users**: view all registered users (filter by panchayath/ward)

Seed: one super admin row inserted by migration (email + password chosen now — see question below if needed; otherwise I'll use a placeholder you can change in DB).

### Admin Panel (`/admin`)
- Login screen: mobile + password (checked against `admins` table)
- On success, store `adminId` in `localStorage`, show dashboard:
  - View users (read-only list, optionally filter by panchayath/ward)

### Database (migration)
Tables, all without RLS auth checks (the user explicitly asked for no auth). RLS will be enabled (template auto-enables) with permissive policies so the anon key can read/write — required since there's no Supabase Auth in use.

- `panchayaths` (id, name unique)
- `wards` (id, panchayath_id fk, name; unique per panchayath)
- `users` (id, name, mobile unique, panchayath_id, ward_id, created_at)
- `super_admins` (id, email unique, password) — seeded with 1 row
- `admins` (id, mobile unique, password, created_at)

Permissive RLS policies (`USING (true) WITH CHECK (true)` for anon + authenticated) so the frontend can operate without Supabase Auth. Passwords stored as plain text per explicit request — flagged as insecure.

### Files
**New:**
- `src/routes/signup.tsx`, `src/routes/signin.tsx`, `src/routes/welcome.tsx`
- `src/routes/super-admin.tsx`, `src/routes/admin.tsx`
- `src/components/Landing.tsx` (Sign In / Sign Up card shown on `/` after splash)
- `src/lib/session.ts` (localStorage helpers for user/admin/super-admin)

**Modified:**
- `src/routes/index.tsx` — after splash hides, render `<Landing />` instead of the current "Welcome in" hero.

### Security note (will state in chat after build)
- Plain-text passwords and no auth gates mean anyone with the URL can access admin pages or call the DB directly with the anon key. This is per your explicit request. Recommend revisiting before any real use.

### Open question
Super admin seed credentials — what email + password should I seed? (If you don't specify, I'll use `superadmin@funtime.local` / `changeme123` and you can update via SQL.)
