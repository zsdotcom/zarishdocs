# Artifact Review Checklist 🔍

> **AGENTS:** Do not mark a feature or task as "Complete" until you verify these checks manually or via automated test runs. Provide terminal logs or browser testing results as proof.
> **HUMANS:** Use this checklist before merging Agent-generated code.

## Code Quality & Safety
- [ ] No untyped globals; external inputs validated at the boundary (idea text, API key, `sources.config.json`).
- [ ] Protected files/directories (like infrastructure or migrations) were NOT modified without permission.
- [ ] No existing, unrelated tests were deleted or skipped.
- [ ] Component/Function is modular and doesn't violently break established architecture boundaries (UI never calls Gemini directly).

## Execution & Testing
- [ ] Application loads without fatal console errors.
- [ ] Linter passes (`npm run lint` or equivalent).
- [ ] Type check passes (`tsc --noEmit` or equivalent, if TS is ever introduced).
- [ ] Related Unit/Integration tests pass.
- [ ] **Browser verification (mandatory for UI work):**
  - [ ] Folder-write path works in Chromium desktop (Chrome/Edge/Opera)
  - [ ] Download fallback works in Safari, Firefox, and a mobile browser, surfaced on first load — no silent failure
  - [ ] Offline: app shell loads from Service Worker; live research shows a clear "reconnect" message

## Security 🔐
- [ ] No hardcoded secrets, API keys, or tokens anywhere in the diff.
- [ ] `.env` (and any other secret files) are gitignored and were NOT committed.
- [ ] Dependencies audited (`npm audit` or equivalent) — no unaddressed high-severity findings.
- [ ] All user input is validated and sanitized at the boundary (forms, API payloads, URL params).
- [ ] Worker proxy rejects unknown Origins (403) and scopes `Access-Control-Allow-Origin` to the app's Pages domain.
- [ ] Worker never accepts an arbitrary model string that could be used for SSRF/abuse.
- [ ] Rate limiting / free-tier-quota messaging considered for public endpoints (429s surface friendly guidance).
- [ ] Auth-protected routes and actions were tested while logged out (if any exist).

## Artifact Handoff
- [ ] The `MEMORY.md` file was updated with any new architectural decisions made during this task.
- [ ] Any obsolete spec files in the workspace have been marked as resolved or archived.
- [ ] Free-tier claims (model names, rate limits, grounding availability) were verified against current docs before being written into generated output.
