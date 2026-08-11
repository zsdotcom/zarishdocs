# Code Patterns

## Purpose
This file defines the implementation patterns the agent should follow for this project.
Prefer these patterns over inventing new ones. Fill in each section from the Technical Design document.

## Architecture Pattern
- **Primary pattern:** layered
- **Rule:** UI/orchestration layers handle request/response ONLY. Agent logic (Profiler, Research, Architect, Writer) lives in separate service modules. No fetch or Gemini calls from render code.
- **Rule:** The Cloudflare Worker proxy is a single portable, stateless function — never grow it into an app server.
- **Rule:** Reuse existing modules before creating new abstractions.

## Data Fetching
- **Primary approach:** direct server calls — one API client module that wraps the Worker proxy (default) or direct Gemini call with a user-supplied key (advanced). No query library, no framework data layer.
- **Rule:** Do not assume a specific library. Check `tech_stack.md` for the project's chosen approach before fetching data.
- **Rule:** Keep fetch logic out of render functions.

## State Management
- **Server state:** none — no server-side state; the LLM is stateless request/response.
- **Client state:** IndexedDB for session/project state and embeddings; Service Worker for offline shell. Ephemeral UI state in plain module variables (no state library).
- **Forms:** the "idea chat" is a plain form handler that feeds the Profiler Agent — no form library.
- **Rule:** Prefer the simplest working approach for MVP scope. Do not add a state library if built-in state is sufficient.

## Service Worker Strategy (offline shell)
- One versioned constant `CACHE_V` (manual date/build string — no build step) bumped whenever the shell changes.
- **`shell-v<N>` cache:** precache `index.html`, CSS, app JS, worker files. Cache-first, never revalidate (immutable).
- **`runtime-cdn-v<N>` cache:** Mermaid CDN, stale-while-revalidate — do NOT precache CDN assets at install (Mermaid is ~3.4MB; the 23MB model would blow up install time). Gives offline-after-first-render.
- **`transformers-cache`:** left entirely to transformers.js (automatic) — never touch it.
- Navigation: network-first falling back to shell; `skipWaiting()` only after `addAll` completes; delete old `shell-*` caches in `activate`.
- **Cloudflare Pages gotcha:** `_headers` and `_redirects` are not served as static assets — never include them in `cache.addAll()` or SW registration breaks.

## IndexedDB
- Version the DB (`onupgradeneeded`), handle `onblocked` (another tab open), call `navigator.storage.persist()` to reduce eviction.
- Raw IDB is fine — no `idb`/Dexie dependency needed for the MVP schema.

## Error Handling
- Normalize errors at service/API boundaries — never let raw exceptions reach the UI.
- Never swallow errors silently; always log or surface them.
- Return user-safe messages in the UI; log developer context for debugging.
- Use a consistent error shape across all API responses (see `tech_stack.md`).

## Validation
- Validate all external inputs: idea text (length/non-empty), user-supplied API key (shape only — never echo it), `sources.config.json` (JSON parses and matches the schema).
- Apply runtime validation at system boundaries; trust internal types inside those boundaries.
- Keep validation rules co-located with the relevant contract.

## File and Naming Conventions
- **Files:** kebab-case (app source and generated docs — matches the ZUSS-aligned output: `001-research-<app>.md`, `002-prd-<app>-mvp.md`, `003-tech-design-<app>.md`, `004-adr-<app>-<topic>.md`, `diagrams/<nnn>-<name>.mmd`)
- **Components / classes:** PascalCase
- **Functions / variables:** camelCase
- **Constants / env vars:** UPPER_SNAKE_CASE

## Testing Pattern
- Add unit tests for pure logic and utility functions (Profiler requirement parsing, citation re-ranking, validation).
- Add integration tests for API contracts (proxy request/response shape, grounding-call quota logging) and critical data flows.
- Add E2E tests only for the top user journeys the PRD marks as must-have.
- UI work requires manual browser verification in Chromium AND in a Safari/Firefox/mobile environment to confirm the download fallback.
- Run the test suite after every feature; fix failures before moving on.

## Change Discipline
- Prefer focused, minimal edits over large rewrites.
- Do not introduce new dependencies without checking the existing stack in `tech_stack.md` first.
- Do not change database migrations, infrastructure config, auth flows, or billing code without explicit approval.
- One feature at a time — commit or checkpoint after each working feature.
