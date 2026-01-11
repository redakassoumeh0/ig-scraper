# IG-Scraper — Git Strategy & Workflow

> Status: LOCKED (Execution Rulebook)
>
> Applies to: v0.x experimental phase and beyond

This document defines the **official Git strategy** for the IG-Scraper project.

It is designed to:

- Support fast iteration
- Handle frequent Instagram breakages
- Preserve code quality and clarity
- Match a founder-led open-source model

---

## 1. Development Model

### Trunk-Based Development

The project follows a **Trunk-Based Development** model.

- A single long-lived branch: `main`
- All work is merged into `main` via short-lived branches
- `main` is always in a releasable state

This model is intentionally chosen over GitFlow to reduce overhead and enable fast hotfixes.

---

## 2. Branch Strategy

### 2.1 Main Branch

`main`:

- Always stable
- Always buildable
- Eligible for release at any time

No direct commits are allowed to `main`.

---

### 2.2 Feature Branches

All work happens on short-lived branches created from `main`.

Naming convention:

- `feat/<scope>-<short-description>`
- `fix/<scope>-<short-description>`
- `docs/<topic>`
- `chore/<topic>`

Examples:

- `feat/engine-playwright-init`
- `fix/profile-parse-changed`
- `docs/session-model`
- `chore/ci-setup`

Branches should be deleted after merge.

---

### 2.3 Hotfix Branches

Used for urgent fixes caused by Instagram changes.

Naming convention:

- `hotfix/<short-description>`

Rules:

- Branch off directly from `main`
- Keep changes minimal
- Merge back into `main` immediately after validation

---

## 3. Pull Request Workflow

### 3.1 Pull Requests Are Mandatory

All changes must go through a Pull Request.

Even for the founder, PRs act as a quality gate and decision checkpoint.

---

### 3.2 PR Requirements

A Pull Request may only be merged if:

- The branch is up to date with `main`
- CI checks pass:
  - build
  - lint
  - typecheck
- The PR description clearly explains the change

---

### 3.3 Issues & Governance

- The founder may open PRs without an Issue
- External contributors must link PRs to an existing Issue
- Scope-expanding PRs are rejected by default

---

## 4. Commit Convention

The project follows **Conventional Commits**.

Allowed commit types:

- `feat(scope): description`
- `fix(scope): description`
- `docs: description`
- `chore: description`
- `refactor(scope): description`

Examples:

- `feat(api): add IGScraper class skeleton`
- `feat(engine): add playwright chromium lifecycle`
- `fix(profile): handle private restricted profiles`
- `docs: add session model guide`

Commit messages must be clear and intentional.

---

## 5. Releases & Versioning

### 5.1 Versioning Policy

The project follows **Semantic Versioning (SemVer)**.

During the experimental phase:

- Versions are `v0.x.x`
- API changes are allowed but must be documented

---

### 5.2 Release Types

- **Patch (`0.1.x`)**: bug fixes, selector updates, maintenance
- **Minor (`0.x.0`)**: new features without breaking existing API
- **Breaking changes** are allowed in `0.x` but must be explicit

---

### 5.3 Tags

Each release is tagged:

- `v0.1.0`
- `v0.1.1`
- `v0.2.0`

Tags always point to a commit on `main`.

---

## 6. Changelog & Decision Tracking

### 6.1 Changelog

- `CHANGELOG.md` is mandatory for every release
- Each entry must describe:
  - What changed
  - Why it changed
  - Impact on users

---

### 6.2 Decision Log

- Any significant architectural or behavioral change must be recorded
- Prevents repeated discussions and accidental regressions

---

## 7. Continuous Integration (Minimum)

CI runs on every Pull Request:

- Linting
- Type checking
- Build verification

No live Instagram scraping is performed in CI.

---

## 8. Definition of Done (PR-Level)

A Pull Request is considered complete when:

- Code builds successfully
- Public API remains intentional and stable
- Documentation/examples are updated if behavior changes
- No unnecessary complexity is introduced

---

## 9. Final Notes

This strategy prioritizes:

- Speed without chaos
- Stability without stagnation
- Clear ownership and responsibility

All contributors and maintainers are expected to follow this document strictly.
