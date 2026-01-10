# Phase 7 — Release Strategy & Versioning

## Purpose of This Phase

This phase defines:

- How the project is released
- How versions are managed
- How stability is communicated
- When the library is considered production-ready

The goal is to balance fast iteration with developer trust.

---

## Initial Release Status

The project will initially be released as **experimental**.

- Early versions will use `v0.x.x`
- Stability is not guaranteed during this phase
- API changes are expected and allowed

A stable release (`v1.0.0`) will only be published once the maintainer is confident in real-world usage.

Community feedback, especially from experienced developers, is a key input during this phase.

---

## Stability Communication

It will be clearly communicated that:

- Instagram behavior and internal APIs may change at any time
- Such changes can directly affect the library
- Developers must expect occasional breakages during early versions

Transparency is mandatory.

---

## Versioning Policy

The project follows **Semantic Versioning (SemVer)** strictly:

```
MAJOR.MINOR.PATCH

```

This applies even during experimental versions.

---

## Breaking Changes Definition

A change is considered **breaking** if:

- The library no longer works as expected without code changes
- Existing usage patterns fail or behave incorrectly
- Previously supported functionality becomes unusable

Breaking changes must be clearly documented.

---

## Release Cadence

The project follows a **hybrid release strategy**:

- Small, frequent releases for maintenance and platform changes
- Larger releases for new features or significant improvements

This ensures responsiveness without instability.

---

## Handling Platform Breakages

When Instagram changes cause breakage:

- A **hotfix** is prioritized
- The fix may be minimal but functional
- Speed is favored over perfection in these cases

---

## Changelog Policy

The project maintains a **clear and detailed changelog**.

Each release includes:

- What changed
- Why it changed
- Potential impact on existing users

This is non-optional.

---

## Publishing Strategy

Publishing to npm is **automated**.

Automation ensures:

- Consistency
- Reduced human error
- Faster release cycles

Manual intervention is avoided where possible.

---

## Distribution Model

The library is distributed as:

- Source code
- With a build step executed during installation or publishing

This allows flexibility and avoids committing generated artifacts unnecessarily.

---

## Definition of Production Readiness

The library is considered ready for real-world usage when:

- The maintainer actively uses it in a personal production project
- Core functionality remains stable under real conditions
- Breakages are manageable and fixable within reasonable timeframes

Personal usage is the primary validation metric.

---

## Release Checklist

A **release checklist** is required before every release.

This checklist ensures:

- Version correctness
- Documentation updates
- Changelog accuracy
- Overall release quality

---

## Phase Status

**Phase 7 — Release Strategy & Versioning: COMPLETE**

Release philosophy and versioning rules are now locked.

---