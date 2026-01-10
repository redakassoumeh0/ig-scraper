# Phase 4 — High-Level Technical Decisions

## Purpose of This Phase

This phase defines **general technical direction** without committing to specific tools, libraries, or implementation details.

The goal is to lock a stable, high-level approach that aligns with:

- The project scope
- Long-term maintainability
- Reliability under frequent Instagram changes

---

## Extraction Approach

The project adopts a **Hybrid scraping approach** at a conceptual level.

Meaning:

- The library may use different extraction strategies depending on the reliability and requirements of each target
- No single approach is forced for all use cases

This is a direction, not a tooling commitment.

---

## Data Access Scope (v0)

The initial scope focuses on **authenticated (login-required) data**.

- Login is considered essential for the maintainer’s primary needs
- Public-only mode is not the main target of v0

---

## Authentication Requirement

In v0:

- **Login is mandatory**
- The library is designed around authenticated usage by default

---

## Session Persistence Philosophy

Session persistence is **user-controlled**.

- The library supports the concept of saving and reusing sessions
- The user decides:
    - Whether to persist a session at all
    - Where the session is stored
    - How session storage is managed in their environment

The library does not enforce a storage location or persistence strategy.

---

## Usage Limits (Rate & Throttling Concept)

The library will not enforce usage limits programmatically in code.

Instead:

- The documentation will include clear warnings and guidance about responsible usage
- Responsibility remains with the user

This aligns with transparency and avoids hidden behavior.

---

## Behavior on Breakage / Platform Changes

The project follows a **Best Effort** philosophy.

When Instagram changes break a path:

- The library should attempt to proceed when safe and reasonable
- Failures should be clear and diagnosable
- Partial results are acceptable if documented and communicated properly

---

## Release & Update Strategy

Updates will be handled as follows:

- **Small, frequent updates** when Instagram changes require maintenance fixes
- **Larger releases** for new features, additions, or more significant evolution

This balances stability with fast response to platform changes.

---

## Node Compatibility Direction

The project prioritizes compatibility with **Node.js LTS versions**.

- LTS support is treated as the primary target
- Non-LTS support is not a guarantee

Exact version ranges will be decided later.

---

## Public API Shape (Conceptual)

The project follows a **Hybrid API approach**:

- A simple, high-level API for common use cases
- A more advanced surface for users who need deeper control (when appropriate)

This supports both:

- Ease of use for typical developers
- Flexibility for advanced projects built on top

---

## Data Output Strategy

The library outputs data in a **Hybrid format**:

- Raw output (closer to the source) where useful for fidelity and debugging
- Normalized output where useful for consistency and stability

This provides practicality without hiding reality.

---

## Legal / ToS / Responsibility Positioning

The project will include a **strong, explicit responsibility warning**.

- Users are fully responsible for how they use the library
- Documentation will clearly communicate risks and limitations
- No misleading claims will be made about safety, bans, or compliance

---

## Diagnostics & Logging

The library will provide **clear diagnostic logs**.

Goal:

- Make failures understandable
- Support debugging and maintenance under frequent platform changes
- Reduce guesswork for both maintainers and users

---

## Phase Status

Phase 4 — High-Level Technical Decisions: COMPLETE

All high-level technical direction in this phase is now locked.