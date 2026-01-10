# Contributing to IG-Scraper

Thank you for your interest in contributing to IG-Scraper! This document provides guidelines and instructions for contributing.

## Development Model

IG-Scraper follows **Trunk-Based Development**:

- All work happens on short-lived feature branches
- Branches are merged into `main` via Pull Requests
- `main` is always in a releasable state
- No direct commits to `main`

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ig-scraper.git`
3. Create a branch from `main`: `git checkout -b feat/your-feature`
4. Make your changes
5. Ensure all checks pass (build, lint, typecheck)
6. Commit using [Conventional Commits](#commit-convention)
7. Push and create a Pull Request

## Branch Naming

Follow this convention:

- `feat/<scope>-<description>` - New features
- `fix/<scope>-<description>` - Bug fixes
- `docs/<topic>` - Documentation changes
- `chore/<topic>` - Tooling, dependencies, etc.

Examples:

- `feat/profile-add-verification`
- `fix/post-parse-error`
- `docs/session-model`

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope): description` - New features
- `fix(scope): description` - Bug fixes
- `docs: description` - Documentation changes
- `chore: description` - Tooling, dependencies, etc.
- `refactor(scope): description` - Code refactoring

Examples:

- `feat(api): add IGScraper class skeleton`
- `fix(profile): handle private restricted profiles`
- `docs: add session model guide`

## Pull Request Requirements

Before submitting a PR:

- [ ] Branch is up to date with `main`
- [ ] All CI checks pass (build, lint, typecheck)
- [ ] Code follows project conventions
- [ ] Commit messages follow conventional commits format
- [ ] PR description clearly explains the change
- [ ] Documentation updated if behavior changed

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- No `any` without explicit justification
- Explicit return types for public API methods
- Clear, descriptive variable and function names

### Code Quality

- ESLint and Prettier must pass
- Type checking must pass
- Build must succeed
- Remove commented code and dead code

### Project Structure

- `src/public/` - Public API (only this is exported)
- `src/internal/` - Internal engine and helpers (never exported)
- `src/features/` - Feature-specific extraction modules
- `src/shared/` - Shared utilities and types

**Boundary Rule**: Only `src/public/*` may be exported from `src/index.ts`

## Development Workflow

1. Create feature branch from `main`
2. Make changes following code standards
3. Run `npm run lint` and `npm run typecheck`
4. Run `npm run build` to ensure it compiles
5. Test your changes (manual testing for v0)
6. Commit with conventional commit format
7. Push and create PR
8. Wait for review/approval
9. Merge PR (branch will be deleted after merge)

## Testing (v0 Phase)

During the experimental v0 phase:

- No automated scraping tests against live Instagram
- Manual smoke-test checklist for validation
- Local execution only
- CI runs: build, lint, typecheck (no live Instagram interactions)

## Reporting Issues

When reporting issues (especially breakages):

- Include `debugId` from error response
- Specify error type
- Attach screenshot/HTML artifacts (if enabled)
- Provide steps to reproduce
- Describe expected vs actual behavior

## Scope Guidelines

### In Scope (v0)

- Profile extraction (`getProfile`)
- Profile posts list (`listProfilePosts`)
- Single post details (`getPost`)

### Out of Scope (v0)

- Followers/Following lists
- Automation actions (liking, commenting, posting)
- Growth or engagement automation

## Questions?

If you have questions, please open an issue or start a discussion in the GitHub repository.

Thank you for contributing to IG-Scraper!

