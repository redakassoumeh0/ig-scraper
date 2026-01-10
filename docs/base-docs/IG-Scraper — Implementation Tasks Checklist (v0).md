# IG-Scraper — Implementation Tasks Checklist (v0)

> Status: Execution Tasks (Granular)
> 
> 
> Format: Checklists you can commit as `docs/implementation/tasks-v0.md`
> 

---

## Phase 0 — Repo + Tooling Baseline

### 0.1 Repository scaffolding

- [ ]  Initialize repo (public, main branch)
- [ ]  Add `.gitignore` (Node + Playwright + OS junk)
- [ ]  Add `.editorconfig`
- [ ]  Add `.nvmrc` (Node LTS target)
- [ ]  Add `LICENSE`
- [ ]  Add `CODE_OF_CONDUCT.md`
- [ ]  Add `CONTRIBUTING.md`
- [ ]  Add `.github/ISSUE_TEMPLATE/` (bug, feature request)
- [ ]  Add `.github/pull_request_template.md`

### 0.2 Package setup

- [ ]  Create `package.json` with:
    - [ ]  name: `ig-scraper`
    - [ ]  version: `0.0.0`
    - [ ]  type: `module` (or keep CJS if you prefer; decide once)
    - [ ]  `exports` planned (root export only for v0)
    - [ ]  `files`: include `dist`, exclude sources
- [ ]  Add TypeScript
- [ ]  Add build tool (choose one):
    - [ ]  Option A: `tsup`
    - [ ]  Option B: `tsc` + dual output (only if you really need)
- [ ]  Add scripts:
    - [ ]  `build`
    - [ ]  `dev` (watch)
    - [ ]  `typecheck`
    - [ ]  `lint`
    - [ ]  `format`
    - [ ]  `test` (placeholder, optional)
- [ ]  Add ESLint + Prettier
- [ ]  Add `tsconfig.json` (strict)

### 0.3 Project structure (real folders)

- [ ]  Create:
    - [ ]  `src/public/`
    - [ ]  `src/internal/`
    - [ ]  `src/features/`
    - [ ]  `src/shared/`
- [ ]  Create `src/index.ts` (re-export public API only)
- [ ]  Add boundary rule (simple discipline):
    - [ ]  Only `src/public/*` may be exported from `src/index.ts`
    - [ ]  Everything else is internal and not part of the contract

### 0.4 CI (recommended)

- [ ]  Add `.github/workflows/ci.yml`:
    - [ ]  install
    - [ ]  lint
    - [ ]  typecheck
    - [ ]  build

### Exit checklist (Phase 0)

- [ ]  `npm pack` produces a valid tarball
- [ ]  `npm run build` succeeds
- [ ]  `npm run lint` + `npm run typecheck` succeed

---

## Phase 1 — Public API Skeleton (No Instagram Logic)

### 1.1 Public types (public contract)

Create these files:

- [ ]  `src/public/types/session.ts`
    - [ ]  `IGStorageState`
    - [ ]  `IGSessionState`
- [ ]  `src/public/types/result.ts`
    - [ ]  `IGResult<T>`
    - [ ]  helpers shape (types only)
- [ ]  `src/public/types/error.ts`
    - [ ]  `IGErrorType`
    - [ ]  `IGError`
- [ ]  `src/public/types/pagination.ts`
    - [ ]  `IGPagination`
    - [ ]  `IGPagedResult<T>`
- [ ]  `src/public/types/models.ts`
    - [ ]  `IGProfileNormalized`
    - [ ]  `IGPostSurfaceNormalized`
    - [ ]  `IGPostDetailNormalized`
    - [ ]  enums: access/media types

### 1.2 Config + logger (public)

- [ ]  `src/public/config/logger.ts`
    - [ ]  `IGLogLevel`
    - [ ]  `IGLogger`
- [ ]  `src/public/config/config.ts`
    - [ ]  `IGScraperConfig` (with defaults defined later in internal)

### 1.3 IGScraper class (public)

- [ ]  `src/public/IGScraper.ts`
    - [ ]  constructor(session, config?)
    - [ ]  `close()`
    - [ ]  `exportSession()`
    - [ ]  `validateSession()`
    - [ ]  `getProfile()`
    - [ ]  `listProfilePosts()`
    - [ ]  `getPost()`

### 1.4 Internal “result helpers” (internal only)

- [ ]  `src/internal/result/ok.ts` (returns `IGResult` ok)
- [ ]  `src/internal/result/fail.ts` (returns `IGResult` fail)
- [ ]  `src/internal/result/time.ts` (duration measurement helper)

### 1.5 Temporary stub behavior (until engine exists)

- [ ]  All methods return `ok:false` with:
    - [ ]  `error.type = SCRAPE_FAILED`
    - [ ]  clear `message = "Not implemented yet"`
    - [ ]  `meta.durationMs` filled

### 1.6 Export surface (root)

- [ ]  `src/index.ts` exports:
    - [ ]  `IGScraper`
    - [ ]  all public types (session/result/error/models/config)

### Exit checklist (Phase 1)

- [ ]  A consumer TS project can import `IGScraper`
- [ ]  Methods compile and return structured `IGResult`
- [ ]  No internal modules exported by accident

---

## Phase 2 — Playwright Engine Foundation (Chromium)

### 2.1 Add Playwright

- [ ]  Add dependency: Playwright
- [ ]  Decide install strategy:
    - [ ]  include Chromium in install (default)
    - [ ]  document system install alternative (later docs)

### 2.2 Internal engine modules

Create:

- [ ]  `src/internal/engine/types.ts`
    - [ ]  internal engine state types: browser/context/page references
- [ ]  `src/internal/engine/defaults.ts`
    - [ ]  config defaults: headless/timeout/locale/timezone
- [ ]  `src/internal/engine/launch.ts`
    - [ ]  launch Chromium with stable options
- [ ]  `src/internal/engine/context.ts`
    - [ ]  create context with `storageState`
    - [ ]  apply locale/timezone
- [ ]  `src/internal/engine/page.ts`
    - [ ]  create page + apply timeouts
- [ ]  `src/internal/engine/lifecycle.ts`
    - [ ]  safe close (idempotent)
    - [ ]  handle partial init failures safely

### 2.3 Integrate engine into IGScraper lifecycle

- [ ]  `IGScraper` constructor:
    - [ ]  validate session object shape (light validation)
    - [ ]  store config merged with defaults
- [ ]  lazy initialization strategy (recommended):
    - [ ]  do not launch browser in constructor
    - [ ]  launch on first call that needs it
- [ ]  `close()`:
    - [ ]  closes page/context/browser safely
    - [ ]  multiple calls do not throw

### 2.4 exportSession()

- [ ]  Implement `exportSession()`:
    - [ ]  ensure engine initialized
    - [ ]  return context `storageState` wrapped in `IGSessionState`
    - [ ]  update `updatedAt`

### 2.5 validateSession()

- [ ]  Implement best-effort:
    - [ ]  go to a safe IG URL
    - [ ]  detect logged-in vs not (simple heuristic)
- [ ]  Return `IGResult<{ valid: boolean }>`
- [ ]  If not valid:
    - [ ]  return `AUTH_REQUIRED` (not exception)

### Exit checklist (Phase 2)

- [ ]  With a valid session, `validateSession()` returns `ok:true` and `valid:true`
- [ ]  `exportSession()` returns a usable storage snapshot
- [ ]  `close()` reliably frees resources

---

## Phase 3 — Optional Session Creation Helper (Manual Login Flow)

> Keep it optional and explicit.
> 

### 3.1 Decide inclusion

- [ ]  Decide: include helper in v0 or postpone to docs-only guidance

### 3.2 If included: implement helper (public or separate export)

- [ ]  Add `src/public/session/createSession.ts` (or similar)
- [ ]  Flow:
    - [ ]  launch **headed** browser
    - [ ]  open IG login page
    - [ ]  user logs in manually
    - [ ]  user confirms via callback (or prompt)
    - [ ]  return `IGSessionState` (storageState)
- [ ]  Never store credentials or write files

### Exit checklist (Phase 3)

- [ ]  You can create a session from scratch with manual login
- [ ]  Session works with `new IGScraper(session).validateSession()`

---

## Phase 4 — Feature: Profile Extraction (`getProfile`)

### 4.1 Feature module structure

- [ ]  Create `src/features/profile/`
    - [ ]  `extract.ts` (raw extraction)
    - [ ]  `normalize.ts`
    - [ ]  `types.ts` (internal)
    - [ ]  `index.ts` (internal)

### 4.2 Input handling

- [ ]  Support input:
    - [ ]  `{ username }`
    - [ ]  `{ url }`
- [ ]  Normalize to a canonical profile URL internally

### 4.3 Extraction strategy (best-effort)

- [ ]  Navigate to profile page
- [ ]  Attempt primary data source (structured payload)
- [ ]  Fallback to DOM selectors if needed
- [ ]  Capture `raw` (whatever source you used)

### 4.4 Normalization

- [ ]  Map to `IGProfileNormalized`
- [ ]  Set:
    - [ ]  `access` and `isPrivate` consistently
    - [ ]  `fetchedAt`

### 4.5 Error mapping

- [ ]  `NOT_FOUND` when username invalid/not found
- [ ]  `PRIVATE_RESTRICTED` when private and not accessible
- [ ]  `AUTH_REQUIRED` when session invalid
- [ ]  `PARSE_CHANGED` when expected data source missing after load

### 4.6 Warnings

- [ ]  Add warnings when fields are partially missing but still ok

### Exit checklist (Phase 4)

- [ ]  Public profile works
- [ ]  Private inaccessible returns `PRIVATE_RESTRICTED`
- [ ]  Not found returns `NOT_FOUND`
- [ ]  Session invalid returns `AUTH_REQUIRED`

---

## Phase 5 — Feature: Profile Posts List (`listProfilePosts`)

### 5.1 Feature module structure

- [ ]  Create `src/features/profile-posts/`
    - [ ]  `extract.ts`
    - [ ]  `normalize.ts`
    - [ ]  `pagination.ts` (cursor handling)
    - [ ]  `index.ts`

### 5.2 Pagination contract

- [ ]  Implement cursor-based pagination:
    - [ ]  accept `cursor`
    - [ ]  return `page.cursor` + `page.hasNextPage`

### 5.3 Surface model normalization

- [ ]  Normalize list items into `IGPostSurfaceNormalized`
- [ ]  Ensure:
    - [ ]  `mediaType`
    - [ ]  `createdAt` best-effort
    - [ ]  `fetchedAt`

### 5.4 Limits

- [ ]  Implement `limit` with safe default and max cap (doc later)

### 5.5 Error mapping

- [ ]  Same mapping rules as profile where relevant
- [ ]  `PARSE_CHANGED` when pagination fields missing

### Exit checklist (Phase 5)

- [ ]  First page returns items + cursor (when available)
- [ ]  Next page works using cursor
- [ ]  Handles no-posts case cleanly

---

## Phase 6 — Feature: Post Details (`getPost`)

### 6.1 Feature module structure

- [ ]  Create `src/features/post/`
    - [ ]  `extract.ts`
    - [ ]  `normalize.ts`
    - [ ]  `index.ts`

### 6.2 Input handling

- [ ]  Support input:
    - [ ]  `{ shortcode }`
    - [ ]  `{ url }`
- [ ]  Normalize internally to a canonical post URL

### 6.3 Extraction

- [ ]  Navigate to post page
- [ ]  Primary structured source first
- [ ]  Fallback selectors if needed
- [ ]  Capture `raw`

### 6.4 Normalization

- [ ]  Normalize into `IGPostDetailNormalized`
- [ ]  Media list:
    - [ ]  IMAGE/VIDEO/CAROUSEL
    - [ ]  keep array stable (even if 1 item)
- [ ]  Best-effort extras:
    - [ ]  hashtags
    - [ ]  mentions
    - [ ]  locationName (optional)

### 6.5 Error mapping

- [ ]  `NOT_FOUND` when post removed/invalid
- [ ]  `PRIVATE_RESTRICTED` when inaccessible
- [ ]  `AUTH_REQUIRED` when session invalid
- [ ]  `PARSE_CHANGED` when structure changed

### Exit checklist (Phase 6)

- [ ]  Image post works
- [ ]  Video post works
- [ ]  Carousel works
- [ ]  Removed post returns `NOT_FOUND`

---

## Phase 7 — Diagnostics + Anti-Breakage

### 7.1 Logger implementation

- [ ]  Add internal default logger (respects `IGLogLevel`)
- [ ]  Ensure no noisy logs in default `info` unless needed

### 7.2 Debug artifacts (optional)

- [ ]  Add internal artifact writer behind config flag:
    - [ ]  screenshot on error
    - [ ]  HTML snapshot on error
- [ ]  Include `debugId` in:
    - [ ]  logs
    - [ ]  result meta
    - [ ]  artifact filenames

### 7.3 Standardize “parse changed”

- [ ]  Create helper: `assertOrParseChanged(condition, details)`
- [ ]  Always return `PARSE_CHANGED` with helpful hint

### Exit checklist (Phase 7)

- [ ]  When an extraction fails, you can get:
    - [ ]  readable error type
    - [ ]  debugId
    - [ ]  artifacts (if enabled)

---

## Phase 8 — Docs + Examples (Minimum Real)

### 8.1 README (minimal)

- [ ]  Install
- [ ]  Quick Start (1 example)
- [ ]  High-visibility warnings
- [ ]  Link to docs

### 8.2 Docs pages (minimum set)

- [ ]  Quick Start
- [ ]  Session Model (how to obtain/store securely)
- [ ]  API Reference (based on skeleton)
- [ ]  Troubleshooting
- [ ]  Ethics & Risks

### 8.3 Examples

- [ ]  Example: getProfile
- [ ]  Example: listProfilePosts with cursor
- [ ]  Example: getPost

### Exit checklist (Phase 8)

- [ ]  A developer can run end-to-end in < 10 minutes
- [ ]  Docs match the real API exactly

---

## Phase 9 — Release Prep (v0.x Experimental)

### 9.1 Release checklist

- [ ]  Version bump to `0.1.0`
- [ ]  Update changelog
- [ ]  Ensure:
    - [ ]  build ok
    - [ ]  typecheck ok
    - [ ]  lint ok
    - [ ]  examples compile
    - [ ]  docs updated

### 9.2 Publish automation

- [ ]  CI publishes to npm on tag
- [ ]  Tag strategy defined (`v0.1.0`)

### Exit checklist (Phase 9)

- [ ]  `0.1.0` published
- [ ]  GitHub release notes created

---

## Phase 10 — Maintenance Loop (Post-release)

### 10.1 Breakage reporting workflow

- [ ]  Issue template asks for:
    - [ ]  debugId
    - [ ]  error type
    - [ ]  screenshot/html (if enabled)
    - [ ]  steps to reproduce

### 10.2 Hotfix workflow

- [ ]  reproduce
- [ ]  minimal fix
- [ ]  patch release (`0.1.x`)

### Exit checklist (Phase 10)

- [ ]  Breakage → fix → release is repeatable and fast

---

## “Start Here” (Next Action)

If you want the *best first execution step*:

- [ ]  Execute Phase 0 fully
- [ ]  Then Phase 1 fully
- [ ]  Only after that start Phase 2 (Playwright engine)