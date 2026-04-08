# CLAUDE.md — PEVC Website

## Project Overview

Ohio State University Private Equity & Venture Capital club website. Provides a public marketing presence (landing, portfolio, team) alongside a full on-site recruiting pipeline (application intake → interview scheduling → offer) and an internal project management portal for members, PMs, and clients.

**Live:** https://pevc.vercel.app/ | **Repo:** https://github.com/nskasam1/PEVC-website (branch: `yuvi`, main: `main`)

### Deployment
The project is deployed to Vercel under `nskasam1`'s account. The GitHub auto-deploy integration is **blocked on Hobby plan** for non-owner commits. To deploy manually:
```sh
export VERCEL_TOKEN=<token from nskasam1>
npx vercel --prod
```
The `.vercel/` folder (created by `vercel link`) maps the local project to `nikhil-kasams-projects/pevc`.

### Commands
```sh
npm run dev        # Vite dev server on port 8080
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint
npm run test       # Vitest (run once)
npm run test:watch # Vitest watch mode
```

### Tech Stack
| Layer | Library | Version |
|-------|---------|---------|
| Framework | React | ^18.3.1 |
| Language | TypeScript | ^5.8.3 |
| Build | Vite + SWC | ^5.4.19 |
| Routing | React Router | ^6.30.1 |
| Styling | Tailwind CSS | ^3.4.17 |
| Components | shadcn/ui (Radix) | various |
| Forms | React Hook Form | ^7.61.1 |
| Validation | Zod | ^3.25.76 |
| Animation | Framer Motion | ^12.34.3 |
| Toasts | Sonner | ^1.7.4 |
| Backend | Supabase | ^2.x |
| Data fetching | TanStack Query | ^5.83.0 (configured, not yet used for API calls) |
| Testing | Vitest + @testing-library/react | ^3.2.4 |

---

## Architecture

### Folder Structure
```
src/
├── App.tsx                    # Root: providers + all 21 routes
├── main.tsx                   # Entry point — mounts to #root
├── index.css                  # Global CSS vars, design tokens, custom utilities
├── pages/                     # One file per route (21 pages)
├── components/
│   ├── Navbar.tsx             # Fixed nav, role-based links, scroll-aware bg, no bell
│   ├── PageWrapper.tsx        # Framer Motion fade-in wrapper for all pages
│   ├── CountUp.tsx            # Animated number counter
│   ├── LogoTicker.tsx         # Horizontal logo scroll animation
│   ├── NavLink.tsx            # Styled router link
│   └── ui/                    # shadcn/ui components (Radix-based, DO NOT EDIT)
├── contexts/
│   ├── AuthContext.tsx        # Real Supabase auth — session, user profile, role
│   └── ProjectContext.tsx     # Project/deliverable CRUD, notifications (in-memory)
├── lib/
│   ├── utils.ts               # cn() helper (clsx + tailwind-merge)
│   ├── supabase.ts            # Supabase client (anon) + supabaseAdmin (service role)
│   ├── database.types.ts      # Full DB schema types — source of truth for all tables
│   ├── applicationStorage.ts  # Legacy localStorage helpers (still used by old Apply flow)
│   └── api/                   # Supabase API layer (one file per domain)
│       ├── applicants.ts      # applicants + applications table CRUD + resume upload
│       ├── recruiting.ts      # round_config + interview_slots CRUD
│       ├── members.ts         # members table CRUD
│       ├── dues.ts            # dues_records CRUD + syncMemberDuesStatus()
│       └── profiles.ts        # Admin profile read/update (uses supabaseAdmin)
├── hooks/
│   ├── use-toast.ts           # Custom toast hook (reducer-based)
│   ├── use-tilt.ts            # 3D card tilt via Framer Motion
│   └── use-mobile.tsx         # Responsive breakpoint hook
└── types/
    └── application.ts         # Legacy types for localStorage recruiting pipeline
```

### Routes (src/App.tsx)
| Path | Component | Access |
|------|-----------|--------|
| `/` | Index | Public |
| `/portfolio` | Portfolio | Public |
| `/team` | Team | Public |
| `/projects` | Projects | Public |
| `/pitch` | PitchUs | Public |
| `/login` | Login | Public |
| `/auth/callback` | AuthCallback | Public (Supabase OAuth/email confirm redirect) |
| `/apply` | Apply | Applicant |
| `/profile` | Profile | Any authenticated |
| `/onboarding` | Onboarding | Any authenticated |
| `/portal` | Portal | PM / Member / Client |
| `/my-projects` | MyProjects | Admin / PM / Member |
| `/my-projects/:id` | ProjectDetail | Admin / PM / Member |
| `/calendar` | CalendarPage | Admin / PM / Member |
| `/dues` | Dues | Member / Admin |
| `/admin/recruiting` | AdminRecruiting | Admin only |
| `/admin/content` | AdminContent | Admin only |
| `/admin/members` | AdminMembers | Admin only |
| `/admin/users` | AdminUsers | Admin only |
| `*` | NotFound | Public |

Route guards are implemented inline with `<Navigate to="/login" replace />` — there is no centralized `ProtectedRoute` component.

### Provider Hierarchy (src/App.tsx)
```
QueryClientProvider
  TooltipProvider
    <Toaster /> (shadcn)
    <Sonner /> (sonner)
    BrowserRouter
      AuthProvider
        ProjectProvider
          <div class="grain bg-background min-h-screen w-full">
            <Navbar />
            <Routes>...</Routes>
```

### Data Flow

**Auth:**
`Login.tsx` → `supabase.auth.signInWithPassword()` → `onAuthStateChange` fires in `AuthContext` → `fetchOrCreateProfile()` loads/upserts `profiles` table row → `user` state set with role. On startup, stale/invalid sessions are detected via `getSession()` error and auto-cleared with `signOut()`. Post-login redirect is to `/profile`.

**Recruiting pipeline (applicant-facing):**
`Apply.tsx` → Supabase API via `src/lib/api/applicants.ts` + `src/lib/api/recruiting.ts`. Fetches `round_config` for essay questions and open/close status. Submits to `applications` table. Uploads resume to Supabase Storage bucket `resumes`. Displays interview slots from `interview_slots` table and allows booking.

**Recruiting pipeline (admin-facing):**
`AdminRecruiting.tsx` → `getAllApplicants()` + `getApplicationsByApplicantIds()` → `advanceApplicant()` / `setApplicantStatus()` to update `applicants` table. `AdminRecruiting.tsx` also manages `round_config` (essay questions, case files, resource links, open/close toggle).

**Members & Dues:**
`AdminMembers.tsx` → `src/lib/api/members.ts`. `Dues.tsx` → `src/lib/api/dues.ts`. Dues status is denormalized onto `members.dues_status` and synced via `syncMemberDuesStatus()` after every pay/unpay.

**Project portal:**
`ProjectContext.tsx` holds all project/deliverable state in memory (no Supabase). Seed data is hardcoded. `MyProjects.tsx` → `ProjectDetail.tsx` reads from context via `useProjects()`. Files are stored in `pevc_files` localStorage key directly from `ProjectDetail.tsx`.

---

## Supabase Schema

**Project URL:** `https://znmmlotfkausikoysssk.supabase.co`

All types are defined in `src/lib/database.types.ts`. Never hand-edit the DB types — update the source table and regenerate or update the types file manually.

| Table | Key columns | Notes |
|-------|-------------|-------|
| `profiles` | `id` (= auth.uid), `email`, `name`, `role`, `avatar_url`, `major`, `grad_year`, `linkedin_url` | Auto-created on signup via trigger or upserted by `fetchOrCreateProfile()`. Role: `admin \| member \| applicant` |
| `members` | `id`, `profile_id`, `name`, `email`, `club_role`, `dues_status`, `dues_amount` | Club roster — separate from auth profiles |
| `applicants` | `id`, `profile_id`, `email`, `name`, `current_round`, `status` | One row per applicant. Rounds: `r0 \| r1 \| r2`. Status: `pending \| accepted \| rejected \| withdrawn` |
| `applications` | `id`, `applicant_id`, `phone`, `school`, `major`, `year`, `gpa`, `linkedin_url`, `resume_url`, `essay_answers` | One row per submitted application. `essay_answers` is JSON array of `EssayAnswer` |
| `round_config` | `id`, `round`, `is_open`, `essay_questions`, `case_file_url`, `resource_links` | One row per round (r0/r1/r2). Controls what applicants see |
| `interview_slots` | `id`, `round`, `slot_datetime`, `is_booked`, `booked_by` | Admins create slots; applicants book them |
| `dues_records` | `id`, `member_id`, `amount`, `due_date`, `paid`, `paid_at`, `notes` | Individual dues transactions |

**Storage buckets:**
- `resumes` — applicant resumes + user avatars. Path pattern: `{userId}/avatar.{ext}` for avatars, `{applicantId}/{timestamp}.{ext}` for resumes.
- `case-files` — admin-uploaded case materials. Path pattern: `{round}/case-{timestamp}.{ext}`.

---

## Conventions & Patterns

### Naming
- **Pages:** PascalCase, one word preferred (`Apply.tsx`, `AdminRecruiting.tsx`)
- **Components:** PascalCase, co-located in `src/components/` or as sub-components inside page files
- **Hooks:** `use-kebab-case.ts` (e.g., `use-tilt.ts`)
- **Types:** PascalCase interfaces. DB row types exported from `src/lib/database.types.ts`. Legacy pipeline types in `src/types/application.ts`
- **API functions:** async named exports in `src/lib/api/*.ts`, one file per domain
- **localStorage keys:** All prefixed with `pevc_` — only used for project portal files and legacy recruiting data
- **CSS utility classes:** kebab-case, defined in `src/index.css` (e.g., `.glow-border`, `.scarlet-input`, `.grain`)

### State Management
- **Global auth state:** `AuthContext` — access via `useAuth()`. Provides `user`, `session`, `isAuthenticated`, `loading`, `login()`, `logout()`, `signUp()`, `updateProfile()`.
- **Global project state:** `ProjectContext` — access via `useProjects()`. All data is in-memory with seed data; nothing persists.
- **Supabase data:** Call functions from `src/lib/api/` directly inside components. TanStack Query is available but not yet wired up.
- **Local component state:** `useState` for UI state (modals, form steps, etc.)
- **Form state:** React Hook Form via `useForm<T>()` with `zodResolver()`. Use `form.trigger(fields[])` for per-step validation in multi-step forms.

### Auth Guards
Always wait for `authLoading` to be `false` before redirecting:
```tsx
if (authLoading) return null;
if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
```
`isAuthenticated` is `!!session` (set as soon as Supabase session exists). `user` (with role) is set slightly after once the profile fetch completes. For role-dependent logic, check `user` not just `isAuthenticated`.

### Forms & Validation
- All new forms should use React Hook Form + Zod.
- Schema per step, merged with `.merge()` into a master schema.
- Wrap every field with shadcn's `<FormField>` → `<FormItem>` → `<FormLabel>` → `<FormControl>` → `<FormMessage>` chain for accessible error display.

### Toasts
There are **two toast systems** in use — be consistent within a file:
- **Sonner** (`import { toast } from "sonner"`) — used in `Apply.tsx`, `applicationStorage.ts`
- **shadcn use-toast** (`import { toast } from "@/hooks/use-toast"`) — used in `AdminRecruiting.tsx`, `Portal.tsx`, `ProjectDetail.tsx`, `Profile.tsx`

### Styling
- Use Tailwind utility classes as primary styling.
- Theme colors via CSS variables: `bg-primary`, `text-primary`, `bg-card`, `text-muted-foreground`, etc.
- Custom utilities from `index.css`: `.scarlet-input` (underline-style input), `.glow-border` (hover glow), `.animated-grid`, `.grain` (texture overlay on root div).
- Dark mode only — no light mode toggle.
- Primary color is scarlet: `hsl(348 90% 46%)`.

### Profile Fields (controlled inputs)
`Profile.tsx` uses controlled inputs (`useState` + `useEffect` to seed from `user`) because `user` loads asynchronously after session restore. Do not use `defaultValue` on profile fields — they won't populate when the user object arrives after render.

### File Uploads
- **Resumes (applicants):** `uploadResume(applicantId, file)` in `src/lib/api/applicants.ts` → Supabase Storage `resumes` bucket → returns public URL stored in `applications.resume_url`.
- **Avatars:** `handleAvatarUpload()` in `Profile.tsx` → Supabase Storage `resumes` bucket → URL stored in `profiles.avatar_url`.
- **Case materials (admin):** `uploadCaseFile(round, file)` in `src/lib/api/recruiting.ts` → Supabase Storage `case-files` bucket → URL stored in `round_config.case_file_url`.
- **Project deliverable files:** `ProjectDetail.tsx` writes directly to `pevc_files` localStorage as base64. This is inconsistent with the Supabase pattern — future cleanup needed.

---

## Environment Variables

Stored in `.env` locally (gitignored) and in Vercel project settings. **Never commit `.env` to git.**

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key — safe for browser, subject to RLS |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS. Used only in `supabaseAdmin` client for admin ops. In production this should move to an Edge Function. |

---

## Auth System

**File:** `src/contexts/AuthContext.tsx`

Real Supabase auth. No mock users. Roles are stored in `profiles.role` (`admin | member | applicant`).

**UserRole type:** `"Guest" | "Applicant" | "Member" | "Admin"` (mapped from DB `admin→Admin`, `member→Member`, `applicant→Applicant`).

Note: old `PM` and `Client` roles from the mock system no longer exist in the DB schema. Navbar still references them in role checks — these are dead branches until the schema is extended.

**Session handling:**
- `onAuthStateChange` keeps session in sync across tabs/refreshes.
- On startup, if `getSession()` returns an error, `signOut()` is called immediately to clear stale tokens — users won't get stuck in a broken logged-in state.
- `isAuthenticated = !!session` (truthy as soon as session exists, before profile loads).

**Post-login redirect (Login.tsx):** Always navigates to `/profile` once `isAuthenticated` is true.

**Navbar links by role:**
- All authenticated: base links (Home, Portfolio, Team, Projects) + Profile icon + Sign Out
- Applicant: + Apply
- Member: + My Projects, Calendar
- Admin: + My Projects, Calendar, Recruiting, CMS
- Unauthenticated: Sign In icon only

---

## localStorage Keys — Active Reference

Most recruiting data has moved to Supabase. The remaining localStorage usage:

| Key | Type | Owner | Purpose |
|-----|------|-------|---------|
| `pevc_files` | `StoredFile[]` | `ProjectDetail.tsx` | Project deliverable file blobs (base64) |
| `pevc_draft` | `Partial<ApplicationFormValues>` | `Apply.tsx` (legacy) | Auto-saved application draft (may be unused after Supabase migration) |

Keys that no longer exist (removed with Supabase migration):
- `pevc_applications`, `pevc_stage_overrides`, `pevc_recruiting_config`, `pevc_essay_prompts`, `pevc_scheduling`, `pevc_profile_complete`

---

## Do Not Touch

- `src/components/ui/` — auto-generated shadcn/ui components. Add new ones via `npx shadcn@latest add <component>`, never hand-edit.
- `src/lib/utils.ts` — only contains `cn()` (clsx + tailwind-merge). Don't add things here.
- `src/lib/database.types.ts` — source of truth for all DB table shapes. If the schema changes, update this file first.
- `vite.config.ts` — path alias `@` → `./src` is relied on everywhere. Don't change.
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` — composite TypeScript config, don't restructure.
- `public/images/PEVCTransparent.png` — the logo. Referenced in `Navbar.tsx`.
- `.env` — never commit. All env vars must also be added to Vercel project settings or deploys will fail.

---

## Known Gotchas

1. **`isAuthenticated` vs `user` timing.** `isAuthenticated` becomes true as soon as the Supabase session is restored, but `user` (with role) is set slightly later after the profile fetch. Always gate role-dependent rendering on `user`, not just `isAuthenticated`. Always wait for `authLoading === false` before redirecting.

2. **Two toast systems.** `sonner` and `@/hooks/use-toast` are both in use. Don't mix within a file — check what the file already imports.

3. **TypeScript is loose.** `tsconfig.json` has `noImplicitAny: false` and `strictNullChecks: false`. Code may have implicit `any` types and null-unsafe access that won't be caught at compile time.

4. **ProjectContext has no persistence.** All project/deliverable data resets on refresh. The 3 seed projects (Acme Corp Due Diligence, TechStart Evaluation, GreenVentures Pipeline) always reappear.

5. **`PM` and `Client` roles are dead.** `AuthContext` `mapDbRole()` only maps `admin→Admin`, `member→Member`, everything else→`Applicant`. Navbar role checks for `PM`, `Member`, `Client` won't fire correctly until the schema/mapping is updated.

6. **`supabaseAdmin` is in the browser bundle.** The service role key is exposed in the client-side bundle via `VITE_SUPABASE_SERVICE_ROLE_KEY`. This is acceptable for a demo but must move to a Supabase Edge Function before any production hardening.

7. **`lovable-tagger` devDependency.** The `componentTagger()` plugin in `vite.config.ts` is from the Lovable.dev platform. Runs only in dev mode. Harmless.

8. **`next-themes` is installed but unused.** No theme toggling is implemented.

9. **`@tanstack/react-query` is configured but unused.** `QueryClientProvider` wraps the app but no `useQuery`/`useMutation` calls exist. Scaffolded for future use.

10. **`vite.config.ts` server port is 8080**, not the default 5173.

11. **`applicationStorage.ts` is partially orphaned.** The file still exists and `Apply.tsx` may reference some of its helpers, but the real data now flows through `src/lib/api/`. Audit before relying on it for new features.

---

## Current State

### Complete
- Public marketing pages (Index, Portfolio, Team, Projects, PitchUs)
- Real Supabase auth — sign up, sign in, session persistence, email confirmation flow
- Profile page — loads user data from Supabase, auto-saves fields on blur, avatar upload to Storage
- Recruiting pipeline (Supabase-backed): application submission, resume upload, round config, interview slot booking
- Admin recruiting: applicant kanban, round advancement, status management
- Admin members: member roster management
- Admin users: user/profile management
- Dues tracking: dues records, pay/unpay, status sync
- Project portal: task management, deliverable tracking, per-deliverable file uploads (localStorage)
- Admin CMS: team members, portfolio companies, partnership projects
- Role-based navigation and access control

### Incomplete / Placeholder
- **Onboarding.tsx** — 3-step UI exists but saves nothing
- **`PM` / `Client` roles** — referenced in Navbar but not mapped in `AuthContext.mapDbRole()`
- **LinkedIn OAuth** — no implementation
- **Calendar page** — Google Calendar iframe embed only; no integration with project deadlines
- **Portal chat** — messaging UI is mocked; no real-time or persistence
- **No tests** — `src/test/example.test.ts` is a placeholder with one trivial assertion
- **ProjectContext** — still in-memory/localStorage; not migrated to Supabase

---

## Changelog

### 2026-04-08
- **Supabase API keys rotated** — migrated from legacy JWT keys to new `sb_publishable_*` / `sb_secret_*` format. `.env` updated locally; Vercel env vars must be updated manually before each deploy.
- **`@supabase/supabase-js` updated** — bumped from 2.100.1 → 2.102.1 to support new key format.
- **RLS infinite recursion fixed** — `profiles` table had a broken RLS policy causing infinite recursion. Fixed by dropping all policies and recreating simple `auth.uid() = id` policies for SELECT, INSERT, UPDATE. Run the SQL in the Supabase SQL editor if setting up fresh.
- **Profiles seeded** — all 4 existing auth users (`yuviatre@gmail.com`, `nikhilsaikasam@gmail.com`, `nkasam06@gmail.com`, `nikhilkasam1@gmail.com`) inserted into `profiles` table with `admin` role via service role client.
- **`Profile.tsx` loading fix** — changed auth guard to wait for both `authLoading` and `user` before redirecting, preventing blank screen on profile page when session restores async.
- **`yuvi` branch merged into `main`** — fast-forward merge, no conflicts.
- **Known gotcha: stale localStorage** — if auth appears broken after key rotation, run `localStorage.clear()` in the browser console and hard refresh.

### 2026-04-07
- **Supabase integration added** — replaced mock localStorage auth with real Supabase auth. `AuthContext` now uses `supabase.auth`, persists sessions, and fetches profile from `profiles` table. All 5 mock users removed.
- **New pages added** — `AdminMembers.tsx`, `AdminUsers.tsx`, `Dues.tsx`, `AuthCallback.tsx`, `NotFound.tsx` (now 21 routes, was 16).
- **New API layer** — `src/lib/api/` with `applicants.ts`, `recruiting.ts`, `members.ts`, `dues.ts`, `profiles.ts`. All Supabase queries go through here.
- **`database.types.ts` added** — full typed schema for all 7 tables. Source of truth for DB shapes.
- **`supabase.ts` added** — exports `supabase` (anon) and `supabaseAdmin` (service role) clients.
- **`Apply.tsx` rewritten** — now calls Supabase API instead of localStorage. Resume uploads to Storage bucket.
- **`AdminRecruiting.tsx` rewritten** — now reads from `applicants`/`applications` tables, not `pevc_applications` localStorage.
- **`Login.tsx` updated** — real sign-in/sign-up with email confirmation flow. Removed mock role selector and `setTimeout` navigation hack.
- **`Profile.tsx` updated** — controlled inputs seeded from async user load; avatar upload to Supabase Storage; fields auto-save on blur.
- **Navbar bell removed** — hardcoded mock notification bell removed entirely.
- **Sign out fixed** — `logout()` is now awaited before `navigate("/")` to prevent session race condition.
- **Stale session handling** — `AuthContext` auto-clears invalid sessions on startup so users aren't stuck without clearing cookies.
- **`.env` gitignored** — added `.env` and `.env.*` to `.gitignore` and removed `.env` from git tracking. Supabase keys should no longer appear in git history going forward.
- **Repo is now public** — changed from private to public on GitHub to allow Vercel Hobby plan deployments from any contributor.
- **Deployment method changed** — GitHub auto-deploy blocked on Hobby plan for non-owner commits; manual CLI deploy via `npx vercel --prod` with `VERCEL_TOKEN` is the current workflow.
- **localStorage keys** — `pevc_applications`, `pevc_stage_overrides`, `pevc_recruiting_config`, `pevc_essay_prompts`, `pevc_scheduling`, `pevc_profile_complete` all removed/superseded by Supabase.
