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
- **Primary approach:** one API client module — `src/api.js` `callLLM(payload, options)` wraps the Worker proxy (default) or calls Gemini directly with a user-supplied key (`options.apiKey`, advanced path). No query library, no framework data layer.
- **Rule:** Do not assume a specific library. Check `tech_stack.md` for the project's chosen approach before fetching data.
- **Rule:** Keep fetch logic out of render functions — the only `fetch()` in the browser app is inside `api.js`.

## State Management
- **Server state:** none — no server-side state; the LLM is stateless request/response.
- **Client state:** IndexedDB for session/project state and embeddings; Service Worker for offline shell. Ephemeral UI state in plain module variables (no state library).
- **Forms:** the "idea chat" is a plain form handler that feeds the Profiler Agent — no form library.
- **Rule:** Prefer the simplest working approach for MVP scope. Do not add a state library if built-in state is sufficient.

## Service Worker Strategy (offline shell)
Implemented in `sw.js` — match it exactly.
- One versioned constant `CACHE_V` (manual date/build string — no build step) bumped whenever the shell changes.
- **`shell-<CACHE_V>` cache:** precache the app shell (`./`, `index.html`, `styles.css`, `manifest.webmanifest`, `icon.svg`, all `src/` modules, `sources.config.json`). Cache-first, never revalidate (immutable).
- **`runtime-<CACHE_V>` cache:** same-origin runtime GET responses, stale-while-revalidate. Never intercept cross-origin requests (Gemini proxy, CDNs).
- Navigation: network-first falling back to the shell (`caches.match("./index.html")`); `skipWaiting()` only after `addAll` completes; delete old `shell-*`/`runtime-*` caches in `activate`; `clients.claim()`.
- **Never precache the embedding model** — if the lazy `transformers-cache` is ever added, leave it entirely to transformers.js (automatic).
- **Cloudflare Pages gotcha:** `_headers` and `_redirects` are not served as static assets — never include them in `cache.addAll()` or SW registration breaks.

## IndexedDB
Implemented in `src/db.js` — a tiny promise wrapper over raw IDB (no `idb`/Dexie dependency). DB `zarishdocs` v1, stores: `sessions`, `projects`, `settings`, `embeddings` (Tech Design §10.1).
- Exports: `openDB`, `put/get/getAll/remove`, plus `saveSession`, `saveProject`, `listSessions`, `incrementSessionCount`, `persistStorage`.
- Version via `onupgradeneeded`; handle `onblocked` (another tab open); call `navigator.storage.persist()` (`persistStorage()`) to reduce eviction.
- **The API key never touches IndexedDB** — `sessionStorage` only (ADR-001).

## Error Handling
- Normalize errors at service/API boundaries — never let raw exceptions reach the UI.
- `src/errors.js` defines the single shape: `AppError { kind, message, retryable, status }`, kinds `quota | auth | offline | unsupported | validation | upstream`. `classifyFetchError` turns any fetch failure into an `AppError`; parsers use `extractJson` (returns a parsed object or `null`).
- Never swallow errors silently; always log or surface them.
- Return user-safe messages in the UI (`messageForKind`); log developer context for debugging.

## Validation
- Validate all external inputs: idea text (length/non-empty), user-supplied API key (shape only — never echo it), `sources.config.json` (JSON parses and matches the schema).
- Apply runtime validation at system boundaries; trust internal types inside those boundaries.
- Keep validation rules co-located with the relevant contract.

## File and Naming Conventions
- **Files:** kebab-case (app source and generated docs). Generated output follows the ZUSS-aligned scheme from Tech Design §7.2, built by `writer.js` `documentFilenames()`/`diagramFilenames()`:
  - `001-research-<app>.md`
  - `002-prd-<app>-mvp.md`
  - `003-tech-design-<app>.md`
  - `004-adr-<app>.md`
  - `diagrams/<nnn>-<name>.mmd` (zero-padded)
- **Components / classes:** PascalCase
- **Functions / variables:** camelCase
- **Constants / env vars:** UPPER_SNAKE_CASE

## Agent Module Pattern
Each agent (`src/agents/*.js`) exposes the same three shapes, and tests assert all three:
- a pure `build<X>Payload(...)` → the request body (model, system prompt, contents, generationConfig);
- a pure `parse<X>Response(text)` → the pipeline shape (via `extractJson` + `responseText`);
- an async `<X>Operation(...)` that calls `callLLM` and returns the parsed result.
`prompts.js` holds every system prompt (grounding wording pinned in Tech Design §9.2); `util.js` holds shared helpers (`today`, `slugify`, `extractMermaid`, `uniqueByUrl`).

## Testing Pattern
- Add unit tests for pure logic and utility functions (Profiler requirement parsing, citation re-ranking, validation, extractJson).
- Add integration tests for API contracts (proxy request/response shape, grounding-call quota bucket) and critical data flows — `worker/index.test.js` already covers the proxy.
- Add E2E tests only for the top user journeys the PRD marks as must-have.
- UI work requires manual browser verification in Chromium AND in a Safari/Firefox/mobile environment to confirm the download fallback.
- Run the test suite after every feature (`npm test`); fix failures before moving on.

## Change Discipline
- Prefer focused, minimal edits over large rewrites.
- Do not introduce new dependencies without checking the existing stack in `tech_stack.md` first.
- Do not change database migrations, infrastructure config, auth flows, or billing code without explicit approval.
- One feature at a time — commit or checkpoint after each working feature.
