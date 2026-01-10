# IG-Scraper — Technical Execution Decisions (v0)

> Status: LOCKED (Execution-Ready)
> 
> 
> Scope: Applies to v0.x experimental releases
> 

This document consolidates all **technical execution decisions** agreed upon after completing the planning phases (Phase 0 → Phase 9).

It serves as the **single source of truth** for implementation.

---

## 1. Session Model

### 1.1 Core Principle

The session represents the **authenticated browser state**, not credentials.

The library does **not** manage credentials or persistence automatically.

### 1.2 Session Shape

A session is a plain data object (serializable) representing browser storage state:

- Cookies
- LocalStorage / SessionStorage (as provided by the browser automation layer)

Conceptually equivalent to a Playwright `storageState` object.

### 1.3 Persistence Responsibility

- Session persistence is **fully user-controlled**
- The library never writes session data to disk
- The user decides:
    - Where the session is stored
    - When it is refreshed
    - How it is secured

### 1.4 Security Notes

- Passwords are never stored
- Session data must be treated as sensitive access material

---

## 2. Public API Design

### 2.1 API Style

- **Class-based API**
- Single primary entry point

```tsx
new IGScraper(session, config?)

```

### 2.2 Design Goals

- Minimal surface area
- Clear ownership of lifecycle
- No hidden global state

---

## 3. Client Lifecycle

### 3.1 Lifecycle Model

- The client is **long-lived**
- Designed to be reused across multiple operations

### 3.2 Resource Ownership

- The user is responsible for calling `close()`
- If `close()` is not called:
    - Browser resources may remain open
    - Session data is **not persisted automatically**

No automatic cleanup or persistence is performed by the library.

---

## 4. Data Targets (v0 Scope)

### 4.1 Supported Targets

### Profile

- All available profile-level information
- Public and authenticated-accessible fields only

### Profile Posts (List)

- Surface-level metadata for posts belonging to a profile
- Pagination support (cursor-based)

### Single Post Details

- Full available metadata for a specific post

### 4.2 Private Accounts

- Only data accessible to the authenticated session is returned
- No attempts to bypass privacy restrictions

### 4.3 Explicitly Out of Scope (v0)

- Followers list
- Following list
- Automation actions (likes, comments, posting)

---

## 5. Data Output Strategy

### 5.1 Hybrid Output

All successful extraction operations return:

```tsx
{
  raw: unknown,
  normalized: NormalizedData
}

```

### 5.2 Normalized Data

- Field names are stable and meaningful
- Designed for long-term consumption

### 5.3 Raw Data

- Preserves source fidelity
- Useful for debugging and future evolution

---

## 6. Error Model

### 6.1 Default Behavior

Operations return a **structured result object**, not thrown exceptions.

### 6.2 Result Shape

```tsx
{
  ok: boolean,
  data?: { raw, normalized },
  error?: {
    type: ErrorType,
    message: string,
    cause?: unknown,
    hint?: string,
    retryable?: boolean,
    checkpointUrl?: string
  },
  warnings?: string[],
  meta?: {
    durationMs: number,
    debugId?: string
  }
}

```

### 6.3 Error Types (v0)

- AUTH_REQUIRED
- CHECKPOINT
- RATE_LIMIT
- PRIVATE_RESTRICTED
- NOT_FOUND
- NETWORK
- SCRAPE_FAILED
- PARSE_CHANGED

### 6.4 Strict Mode

An optional configuration flag enables exception-based behavior:

```tsx
{ throwOnError: true }

```

---

## 7. Browser Automation

### 7.1 Tooling

- Playwright
- Chromium only

### 7.2 Defaults

- Headless: `true`
- Browser fingerprint is kept stable per session

---

## 8. Anti-Breakage & Diagnostics

### 8.1 Best-Effort Philosophy

- Partial success is acceptable
- Failures must be explicit and diagnosable

### 8.2 Logging

Configurable log levels:

- silent
- error
- info
- debug

### 8.3 Debug Artifacts (Optional)

When enabled, failures may capture:

- HTML snapshot
- Screenshot

---

## 9. Configuration Surface

A single configuration object is accepted by the constructor.

Supported options include:

- headless
- timeoutMs
- slowMoMs
- locale
- timezone
- logger
- throwOnError

All options have safe defaults.

---

## 10. Testing Strategy (v0)

### 10.1 Scope

- No automated scraping tests against Instagram

### 10.2 Validation

- Manual smoke-test checklist
- Local execution only

### 10.3 CI (Optional)

- Type checking
- Linting

---

## 11. Responsibility & Ethics (Execution-Level)

- Strong warnings are present in documentation
- No runtime enforcement beyond transparency
- The user is fully responsible for usage

The library provides capability, not guarantees.

---

## 12. Status

All decisions in this document are **locked for v0**.

Any change requires:

- A documented decision
- Clear justification
- Awareness of breaking impact

Execution may proceed with confidence.