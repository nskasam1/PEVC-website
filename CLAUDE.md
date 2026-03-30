# CLAUDE.md — PEVC Website

## Project Overview

Ohio State University Private Equity & Venture Capital club website. Provides a public marketing presence (landing, portfolio, team) alongside a full on-site recruiting pipeline (application intake → interview scheduling → offer) and an internal project management portal for members, PMs, and clients.

**Live:** https://pevc.vercel.app/ | **Repo:** https://github.com/yuvi-atre/PEVC-website (branch: `yuvi`)

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
| Data fetching | TanStack Query | ^5.83.0 (not currently used for API calls) |
| Testing | Vitest + @testing-library/react | ^3.2.4 |

---

## Architecture

### Folder Structure
```
src/
├── App.tsx                    # Root: providers + all 16 routes
├── main.tsx                   # Entry point — mounts to #root
├── index.css                  # Global CSS vars, design tokens, custom utilities
├── pages/                     # One file per route (16 pages)
├── components/
│   ├── Navbar.tsx             # Fixed nav, role-based links, scroll-aware bg
│   ├── PageWrapper.tsx        # Framer Motion fade-in wrapper for all pages
│   ├── CountUp.tsx            # Animated number counter
│   ├── LogoTicker.tsx         # Horizontal logo scroll animation
│   ├── NavLink.tsx            # Styled router link
│   └── ui/                    # 52 shadcn/ui components (Radix-based, DO NOT EDIT)
├── contexts/
│   ├── AuthContext.tsx        # Auth state, mock login, role, profile updates
│   └── ProjectContext.tsx     # Project/deliverable CRUD, notifications
├── lib/
│   ├── utils.ts               # cn() helper (clsx + tailwind-merge)
│   └── applicationStorage.ts  # ALL localStorage I/O for recruiting
├── hooks/
│   ├── use-toast.ts           # Custom toast hook (reducer-based)
│   ├── use-tilt.ts            # 3D card tilt via Framer Motion
│   └── use-mobile.tsx         # Responsive breakpoint hook
└── types/
    └── application.ts         # Shared types for recruiting pipeline
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
| `/apply` | Apply | Applicant |
| `/profile` | Profile | Any authenticated |
| `/onboarding` | Onboarding | Any authenticated |
| `/portal` | Portal | PM / Member / Client |
| `/my-projects` | MyProjects | Admin / PM / Member |
| `/my-projects/:id` | ProjectDetail | Admin / PM / Member |
| `/calendar` | Calendar | Admin / PM / Member |
| `/admin/recruiting` | AdminRecruiting | Admin only |
| `/admin/content` | AdminContent | Admin only |

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
          <div class="grain bg-background">
            <Navbar />
            <Routes>...</Routes>
```

### Data Flow

**Recruiting pipeline (applicant-facing):**
`Login.tsx` → redirects Applicants to `/apply` → `Apply.tsx` renders multi-step form (KYC → Resume → Essays → Review) → `saveApplication()` in `applicationStorage.ts` writes to `pevc_applications` → after submit, `Apply.tsx` shows `ApplicationTracker` component reading from `pevc_stage_overrides` + `pevc_recruiting_config`.

**Recruiting pipeline (admin-facing):**
`AdminRecruiting.tsx` reads `pevc_applications` via `getApplications()` → computes `candidates` with `useMemo` merging `pevc_stage_overrides` → `advance()` writes to `pevc_stage_overrides` + sets `pevc_scheduling` → Configure tab uses `getRecruitingConfig()` / `saveRecruitingConfig()` for deadlines, Calendly URLs, case materials, resources.

**Project portal:**
`ProjectContext.tsx` holds all project/deliverable state in memory (no localStorage). Seed data is hardcoded. `MyProjects.tsx` → `ProjectDetail.tsx` reads from context via `useProjects()`. Files are stored in `pevc_files` localStorage key directly from `ProjectDetail.tsx`.

---

## Conventions & Patterns

### Naming
- **Pages:** PascalCase, one word preferred (`Apply.tsx`, `AdminRecruiting.tsx`)
- **Components:** PascalCase, co-located in `src/components/` or as sub-components inside page files
- **Hooks:** `use-kebab-case.ts` (e.g., `use-tilt.ts`)
- **Types:** PascalCase interfaces, exported from `src/types/application.ts`
- **localStorage keys:** All prefixed with `pevc_` (e.g., `pevc_applications`, `pevc_files`)
- **CSS utility classes:** kebab-case, defined in `src/index.css` (e.g., `.glow-border`, `.scarlet-input`, `.grain`)

### State Management
- **Global auth state:** `AuthContext` — access via `useAuth()`. Provides `user`, `isAuthenticated`, `login()`, `logout()`, `setRole()`, `updateProfile()`.
- **Global project state:** `ProjectContext` — access via `useProjects()`. All data is in-memory with seed data; nothing persists to localStorage.
- **Recruiting persistence:** All handled via `src/lib/applicationStorage.ts` utilities — never write directly to localStorage for recruiting data.
- **Local component state:** `useState` for UI state (modals, form steps, etc.)
- **Form state:** React Hook Form via `useForm<T>()` with `zodResolver()`. Use `form.trigger(fields[])` for per-step validation in multi-step forms.

### Forms & Validation
- All new forms should use React Hook Form + Zod (see `Apply.tsx` for the canonical pattern).
- Schema per step, merged with `.merge()` into a master schema.
- Wrap every field with shadcn's `<FormField>` → `<FormItem>` → `<FormLabel>` → `<FormControl>` → `<FormMessage>` chain for accessible error display.

### Toasts
There are **two toast systems** in use — be consistent within a file:
- **Sonner** (`import { toast } from "sonner"`) — used in `Apply.tsx`, `Profile.tsx`, `applicationStorage.ts`
- **shadcn use-toast** (`import { toast } from "@/hooks/use-toast"`) — used in `AdminRecruiting.tsx`, `Portal.tsx`, `ProjectDetail.tsx`

### Styling
- Use Tailwind utility classes as primary styling.
- Theme colors via CSS variables: `bg-primary`, `text-primary`, `bg-card`, `text-muted-foreground`, etc.
- Custom utilities from `index.css`: `.scarlet-input` (underline-style input), `.glow-border` (hover glow), `.animated-grid`, `.grain` (texture overlay on root div).
- Dark mode only — no light mode toggle.
- Primary color is scarlet: `hsl(348 90% 46%)`.

### File Uploads
- Resume uploads: use `saveResumeFile(file, email)` from `applicationStorage.ts`. Validates PDF-only, <5 MB, converts to base64.
- Case materials (admin): use `readFileAsBase64(file)` from `applicationStorage.ts`. Allows PDF + PPTX, <20 MB.
- All files stored as base64 `data:` URLs in `pevc_files` localStorage array. Download via `<a href={base64Data} download={name}>`.
- Project deliverable files in `ProjectDetail.tsx` use a local `storeFile()` function writing to `pevc_files` directly — inconsistent with the `applicationStorage.ts` pattern. Future cleanup needed.

---

## localStorage Keys — Complete Reference

| Key | Type | Owner | Purpose |
|-----|------|-------|---------|
| `pevc_applications` | `Application[]` | `applicationStorage.ts` | All submitted applications |
| `pevc_files` | `StoredFile[]` | `applicationStorage.ts` + `ProjectDetail.tsx` | Resume + deliverable file blobs |
| `pevc_essay_prompts` | `EssayPrompts` | `applicationStorage.ts` | Admin-editable essay questions |
| `pevc_recruiting_config` | `RecruitingConfig` | `applicationStorage.ts` | Deadlines, Calendly URLs, case materials, resources |
| `pevc_stage_overrides` | `Record<appId, Stage>` | `AdminRecruiting.tsx` + `applicationStorage.ts` | Candidate pipeline advancement |
| `pevc_scheduling` | `string` (stage name) | `AdminRecruiting.tsx` | Legacy webhook simulation trigger (no longer consumed) |
| `pevc_draft` | `Partial<ApplicationFormValues>` | `Apply.tsx` | Auto-saved application draft |
| `pevc_profile_complete` | `string[]` (email list) | `Profile.tsx` + `Login.tsx` | Tracks who has completed profile setup |

---

## Auth System

**File:** `src/contexts/AuthContext.tsx`

Mock auth — no real backend. 5 hardcoded users:
```
admin@pevc.com     / admin     → Admin
pm@pevc.com        / pm        → PM
member@pevc.com    / member    → Member
client@pevc.com    / client    → Client
applicant@pevc.com / applicant → Applicant
```
Any unknown email auto-creates an Applicant account. Password is ignored in `login()` — the `_password` parameter is unused. Auth state lives in React memory only; it resets on page refresh.

**Post-login redirect logic (Login.tsx):**
- Applicant role → `/apply`
- Others → `/portal` if `pevc_profile_complete` contains email, else `/profile`

**Navbar links by role:**
- All authenticated: base links (Home, Portfolio, Team, Projects) + Profile icon
- Applicant: + Apply
- PM / Member / Client: + Portal
- Admin / PM / Member: + My Projects, Calendar
- Admin: + Recruiting, CMS

---

## Do Not Touch

- `src/components/ui/` — auto-generated shadcn/ui components. Add new ones via `npx shadcn@latest add <component>`, never hand-edit.
- `src/lib/utils.ts` — only contains `cn()` (clsx + tailwind-merge). Don't add things here.
- `vite.config.ts` — path alias `@` → `./src` is relied on everywhere. Don't change.
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` — composite TypeScript config, don't restructure.
- `public/images/PEVCTransparent.png` — the logo. Referenced in `Navbar.tsx`.
- `src/types/application.ts` — shared contract between `Apply.tsx`, `AdminRecruiting.tsx`, and `applicationStorage.ts`. Changes here affect all three. Extend carefully.
- The `pevc_` localStorage key namespace — don't introduce new keys without documenting them here.

---

## Known Gotchas

1. **Auth resets on refresh.** `AuthContext` uses `useState` with no persistence. Refreshing the page logs the user out. This is intentional for the demo but means you can't test deep links without re-logging in.

2. **Two toast systems.** `sonner` and `@/hooks/use-toast` are both used. They render in different positions and have different APIs. Don't mix them within a file — check what the file already imports.

3. **TypeScript is loose.** `tsconfig.json` has `noImplicitAny: false` and `strictNullChecks: false`. Code may have implicit `any` types and null-unsafe access that won't be caught at compile time.

4. **ProjectContext has no persistence.** All project/deliverable data is reset on refresh. The 3 seed projects (Acme Corp Due Diligence, TechStart Evaluation, GreenVentures Pipeline) always reappear.

5. **Login.tsx uses `setTimeout(..., 100)` after login.** This is a workaround to allow React state to propagate before navigation. It's fragile but works for mock auth.

6. **`pevc_files` is written from two places.** `applicationStorage.ts:saveResumeFile()` and `ProjectDetail.tsx:storeFile()` both write to `pevc_files` but with slightly different shapes — `applicationStorage.ts` includes `type`, `applicantEmail`, and `base64Data`; `ProjectDetail.tsx` does not. Reading code should handle both shapes.

7. **`lovable-tagger` devDependency.** The `componentTagger()` plugin in `vite.config.ts` is from the Lovable.dev platform. It runs only in development mode and adds metadata to components. It's harmless but can be removed if migrating away from Lovable.

8. **`next-themes` is installed but unused.** No theme toggling is implemented.

9. **`@tanstack/react-query` is configured but unused.** The `QueryClientProvider` wraps the app but no `useQuery` / `useMutation` calls exist. It's scaffolded for future backend integration.

10. **Base64 storage limits.** Files are stored as base64 in localStorage. A 5 MB PDF becomes ~6.7 MB of string data. localStorage quota is typically 5–10 MB per origin. Uploading multiple large files will hit quota. `saveApplication()` and `saveResumeFile()` catch `DOMException` for this case.

11. **`vite.config.ts` server port is 8080**, not the default 5173. Update any firewall rules or browser bookmarks accordingly.

---

## Current State

### Complete
- Public marketing pages (Index, Portfolio, Team, Projects, PitchUs)
- Application form: 4-step wizard (KYC, Resume, Essays, Review) with Zod validation, draft auto-save, duplicate detection
- Application tracker: visual timeline with deadlines, hear-back dates, R1/R2 scheduling/materials
- Admin recruiting pipeline: kanban view, application detail drawer (Sheet), stage advancement
- Admin Configure tab: essay prompt editor, per-stage deadlines, Calendly URLs, case material uploads, resource links
- Project portal: task management, deliverable tracking, per-deliverable file uploads
- Admin CMS: team members, portfolio companies, partnership projects
- Role-based navigation and access control
- Profile setup flow with post-save redirect to portal

### Incomplete / Placeholder
- **Onboarding.tsx** — 3-step UI exists but saves nothing; no persistence or backend hook
- **Profile.tsx** — headshot and resume uploads only capture filename (no actual file storage)
- **Navbar notifications** — bell shows 4 hardcoded mock alerts; no real notification system
- **LinkedIn OAuth** — button exists in `Login.tsx` but has no implementation
- **Calendar page** — embeds a Google Calendar iframe; no integration with project deadlines
- **Portal chat** — messaging UI is mocked; no real-time or persistence
- **`pevc_scheduling` key** — still written in `AdminRecruiting.tsx:advance()` but no longer consumed anywhere; superseded by `pevc_stage_overrides` + `pevc_recruiting_config`
- **No tests** — `src/test/example.test.ts` is a placeholder with one trivial assertion
- **No backend** — everything is localStorage; real deployment would need an API, database, and auth service
