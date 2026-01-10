# Phase 6 — Developer Experience (DX) & Usage Flow

## Purpose of This Phase

This phase defines the **developer experience** of the library from discovery to long-term usage.

The goal is to ensure:

- Fast understanding
- Minimal friction
- Clear failure modes
- Confidence in long-term maintenance

No implementation details are defined here.

---

## Discovery & First Contact

The primary discovery flow is:

1. GitHub repository
2. npm package page
3. Documentation website

This order reflects how most developers will encounter the library.

---

## First 60 Seconds Expectations

Within the first minute, a developer should clearly understand:

- What the library helps with
- How simple it is to use
- The core features it provides
- What it can do
- What it explicitly does not do

Clarity at this stage is critical for trust.

---

## Getting Started Philosophy

The onboarding experience prioritizes **minimalism**.

- Fewer steps over exhaustive explanation
- A working mental model as quickly as possible

Advanced concepts are intentionally deferred.

---

## Documentation Entry Points

The documentation provides:

- A **Quick Start** for immediate usage
- An **Advanced Usage** section for deeper control and understanding

Both are available from the beginning.

---

## Core Usage Scenario

The primary usage scenario is:

> Easily extracting all available data from any Instagram account that the user has access to.
> 

This scenario defines the core value of the library.

---

## State Management Model

The library follows a **Hybrid state model**:

- Some internal state may be managed by the engine (e.g., session lifecycle)
- Users retain control and can inject or manage state where needed

This balances simplicity with flexibility.

---

## Error & Failure Handling

When failures occur, the library returns:

- A structured result object
- Explicit status indicators
- Clear error information

This avoids silent failures and improves diagnosability.

---

## Error Classification

Errors are categorized into meaningful types, such as:

- Authentication-related errors
- Network or connectivity errors
- Scraping or extraction errors

Categorization improves developer understanding and handling.

---

## Learning & Progression

Developers are encouraged to learn through:

1. Structured documentation
2. Simple, focused examples

Examples complement the docs rather than replacing them.

---

## Troubleshooting & Common Mistakes

From the initial release, documentation includes:

- Common mistakes
- Troubleshooting guidance

This reduces repetitive issues and support overhead.

---

## Trust & Project Health Signals

Developer confidence is built through:

- Frequent updates
- Visible maintainer activity
- Responsiveness to issues and discussions

These signals indicate an actively maintained project.

---

## Handling Breakages

When Instagram changes cause breakage, the developer experience should be:

- The cause is understandable
- Next steps are clear
- It is evident that a fix is planned or in progress
- Developers are encouraged to contribute if possible

Transparency is prioritized over false stability.

---

## Phase Status

**Phase 6 — Developer Experience (DX): COMPLETE**

The developer journey and interaction model are now clearly defined and locked.