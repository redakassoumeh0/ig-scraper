# IG-Scraper — Implementation Plan (Phase-by-Phase) (v0)

> Status: EXECUTION PLAN (READY)
> 
> 
> Scope: From “empty repo” → first usable **v0.x** experimental release
> 
> Assumption: Planning docs already committed; now we implement.
> 

---

## Phase 0 — Repo + Tooling Baseline

### Goals

- Set up a clean TypeScript npm package foundation.
- No scraping logic yet.

### Tasks

- Create `package.json`, `tsconfig.json`, build output (`dist/`)
- Choose bundler/build (simple and boring): `tsup` or `tsc` + `exports`
- Add lint + format (ESLint + Prettier)
- Add `typecheck`, `lint`, `build` scripts
- Add minimal folder structure:
    - `src/public/` (public API boundary)
    - `src/internal/` (engine + helpers)
    - `src/features/` (targets by feature)
    - `src/shared/` (types, utils)
- Add CI workflow (optional but recommended): `lint` + `typecheck` + `build`

### Deliverables

- Working `npm pack`
- `dist/` build generated on build step

### Exit Criteria

- `pnpm build` (or npm/yarn) works locally
- Type exports are correct

---

## Phase 1 — Public API Skeleton (No Real Instagram Yet)

### Goals

- Implement the **exact API shape** from the skeleton document.
- No real scraping; return stubbed “not implemented” errors to validate DX.

### Tasks

- Implement `IGSessionState`, `IGResult<T>`, `IGError`, error types
- Implement `IGScraper` class:
    - constructor(session, config?)
    - `close()`
    - `exportSession()`
    - `validateSession()`
    - `getProfile()`
    - `listProfilePosts()`
    - `getPost()`
- Implement config defaults + logger interface
- Implement internal “result helpers”:
    - `ok(data, meta?)`
    - `fail(error, meta?, warnings?)`

### Deliverables

- Package compiles and exposes the class and types
- Example files can compile against the API

### Exit Criteria

- A consumer TS project can import and call methods
- Methods return structured `IGResult` (even if failure)

---

## Phase 2 — Playwright Engine Foundation (Chromium)

### Goals

- Build the internal engine that owns Playwright lifecycle.
- Still minimal extraction.

### Tasks

- Add Playwright dependency + Chromium install strategy
- Create internal modules:
    - `internal/browser/launchChromium.ts`
    - `internal/browser/createContext.ts` (applies `storageState`)
    - `internal/browser/createPage.ts`
- Apply stable defaults:
    - `headless: true`
    - timeouts
    - locale/timezone
- Add lifecycle ownership:
    - `IGScraper.close()` closes browser/context/page safely
- Implement `exportSession()`:
    - gets latest `storageState` from context
- Implement `validateSession()` (best-effort):
    - navigate to a safe Instagram page
    - detect login status (simple heuristic)

### Deliverables

- A working authenticated browser session runner

### Exit Criteria

- You can launch with a known session and verify “logged in”
- You can export updated session state

---

## Phase 3 — Auth Utilities (Login Helper) (Optional but Practical)

> Note: v0 “Login mandatory” doesn’t mean the library must automate login—
> 
> 
> but having a helper is practical for DX. Keep it optional and explicit.
> 

### Goals

- Provide a developer-friendly way to create a session (if you choose to include it).

### Tasks (if included)

- `IGScraper.createSessionWithLogin(credentials?)` **OR** separate utility `createSession(...)`
- Support manual login flow (recommended):
    - open a headed browser
    - user logs in manually
    - press Enter in terminal (or callback) → export session
- Store nothing automatically

### Deliverables

- A documented way to obtain `IGSessionState`

### Exit Criteria

- You can produce a session from scratch reliably

---

## Phase 4 — Feature: Profile Extraction (getProfile)

### Goals

- Implement `getProfile()` end-to-end.
- Return `{ raw, normalized }`.

### Tasks

- Decide extraction strategy for profile page:
    - Navigate to profile URL
    - Capture raw JSON sources where available
    - Fallback to DOM selectors if needed
- Build normalizer mapping to `IGProfileNormalized`
- Handle private/restricted/not-found cases:
    - `PRIVATE_RESTRICTED`, `NOT_FOUND`, `AUTH_REQUIRED`
- Add warnings for partial fields
- Add minimal debug logging hooks

### Deliverables

- Real profile data returned

### Exit Criteria

- Works for:
    - public profile
    - private profile not accessible
    - private profile accessible (if session follows)
    - not found username

---

## Phase 5 — Feature: Profile Posts List (listProfilePosts)

### Goals

- Implement surface metadata listing with **cursor pagination**.

### Tasks

- Extract a list of posts + cursor
- Normalize into `IGPostSurfaceNormalized[]`
- Support `limit` and `cursor`
- Implement consistent pagination model:
    - `items`
    - `page: { cursor, hasNextPage }`
- Handle cases:
    - no posts
    - private restricted
    - parsing changes

### Deliverables

- Stable surface list retrieval

### Exit Criteria

- You can fetch first page + next page using cursor
- Works on multiple profiles

---

## Phase 6 — Feature: Post Details (getPost)

### Goals

- Implement full post metadata extraction for a specific post.

### Tasks

- Support input by:
    - shortcode
    - URL
- Extract raw payload + normalize into `IGPostDetailNormalized`
- Media normalization:
    - image/video/carousel items
- Optional best-effort extras:
    - hashtags/mentions/locationName (if easy and stable)

### Deliverables

- Full post details retrieval

### Exit Criteria

- Works for:
    - image post
    - video post
    - carousel
    - missing/removed post

---

## Phase 7 — Diagnostics + Anti-Breakage Layer

### Goals

- Make breakages diagnosable and fast to fix.

### Tasks

- Add log levels: silent/error/info/debug
- Add `debugArtifacts` option:
    - screenshot on error
    - HTML snapshot on error
- Standardize “parse changed” detection:
    - if expected source not found → `PARSE_CHANGED`
- Add `debugId` to correlate logs/artifacts

### Deliverables

- Reliable debugging workflow for breakages

### Exit Criteria

- When something fails, you can reproduce and see:
    - what page
    - what was missing
    - screenshot/html evidence

---

## Phase 8 — Docs + Examples (Minimum, Real)

### Goals

- Ship with real docs that match the API.

### Tasks

- README (minimal):
    - Install
    - Quick Start
    - Warnings
    - Link to docs
- Docs pages (minimum):
    - Quick Start
    - Session model (how to obtain and store session)
    - API reference (generated or manual)
    - Troubleshooting
    - Ethics/Risks
- Examples:
    - getProfile
    - listProfilePosts + cursor
    - getPost

### Deliverables

- Users can actually use it safely

### Exit Criteria

- Fresh user can run end-to-end in < 10 minutes

---

## Phase 9 — Release Preparation (v0.x Experimental)

### Goals

- Publish the first experimental release with confidence.

### Tasks

- Changelog entry
- Version bump `0.x.x`
- Release checklist:
    - build ok
    - typecheck ok
    - docs updated
    - examples compile
- Publish automation (CI)

### Deliverables

- `v0.1.0` (or similar) on npm

### Exit Criteria

- Clean release process that you can repeat quickly for hotfixes

---

## Phase 10 — Maintenance Loop (Post-release)

### Goals

- Fast response to Instagram changes.
- Keep API stable.

### Tasks

- Issue templates for breakage reports (include debug artifacts)
- Hotfix workflow:
    - reproduce
    - minimal fix
    - patch release
- Periodic review:
    - selectors/source changes
    - normalize mappings

### Exit Criteria

- Breakage → fix → release is smooth and quick

---

## Recommended Commit Rhythm (Simple)

- `chore: repo baseline`
- `feat(api): implement public skeleton`
- `feat(engine): add playwright chromium lifecycle`
- `feat(profile): implement getProfile`
- `feat(posts): implement listProfilePosts`
- `feat(post): implement getPost`
- `feat(debug): add artifacts + structured diagnostics`
- `docs: add quickstart + examples`
- `release: v0.1.0`

---

إذا بدك، الخطوة الجاية في التنفيذ هي: **Phase 0 + Phase 1** كـ checklist أدق (ملف Tasks) مع structure للملفات (`src/internal/...`) بحيث تبلّش تكتب كود بدون ما توقف كل ساعتين لتقرر “وين أحط هاد الملف”.