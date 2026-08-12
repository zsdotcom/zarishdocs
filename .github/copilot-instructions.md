# GitHub Copilot Instructions

Read AGENTS.md first — it is the source of truth for this project: roadmap, commands, rules, and constraints.
Implementation details live in `agent_docs/` and in the top-level design docs under `docs/`; consult them before introducing dependencies or changing architecture.

## Repository shape and current status

ZarishDocs is a browser-only, zero-cost AI research lab. The repository contains the static UI shell (with offline Service Worker + manifest), the Worker proxy, the source-of-truth research/config docs, and source files under `src/`. All four agents are wired to `callLLM` and covered by tests. The app is deployed: Worker proxy at `https://zarishdocs-proxy.zarishsphere.workers.dev` (`GEMINI_API_KEY` secret) and Pages app at `https://zarishdocs.pages.dev` (deployed from the repo root). `PROXY_ENDPOINT` and `ALLOWED_ORIGIN` hold the real values. Still open: browser verification pass per `REVIEW-CHECKLIST.md`.

Important files to check before making changes:
- `AGENTS.md` — current project state, commands, constraints, roadmap, and architectural guardrails.
- `MEMORY.md` — decisions, known issues, active goal, and model-routing notes.
- `REVIEW-CHECKLIST.md` — quality and safety gates expected before a task is marked done.
- `agent_docs/tech_stack.md` — verified stack and model routing facts, including the source-of-truth model selection for research and the Worker proxy note.
- `agent_docs/code_patterns.md` — architecture, service boundaries, naming conventions, offline shell, and testing expectations.
- `docs/TechDesign-ZarishDocs-MVP.md` — source of truth for MVP features and implementation shape.

## Commands

### Build / serve

This project is static HTML/CSS/JS with no build step. The app can be served locally with:
- `npm run serve` or `npm run dev` → `python3 -m http.server 8080 --bind 127.0.0.1`
- Direct static server example: `python3 -m http.server 8080`

### Tests

The repository is pinned to the Node built-in test runner through `package.json`:
- `npm test` → `node --test "src/**/*.test.js" "worker/**/*.test.js"`
- `npm run test:unit` → same as above, for a unit-only invocation
- Single test file example: `node --test src/agents/research.test.js`
- Single test selection using Node’s runner: `node --test --test-name-pattern "..." src/agents/*.test.js`

### Syntax / compatibility checks

- `npm run check` → `node --check` each shipped browser-side module under `src/`, plus `worker/` and `sw.js`

### Formatting

Prettier is wired as the single devDependency (Tech Design §12):
- `npm run format` → `prettier --write` over the repo
- `npm run format:check` → verify only
Do not reformat files you did not touch; the committed `pnpm-lock.yaml` pins Prettier's version.

## Architecture overview

The design is intentionally layered and static:
- UI/orchestration code is entry point and UI-only logic that runs in the browser; it knows how to call the agent service modules but does not directly call Gemini.
- Agent logic lives in `src/agents/` as separate service modules: `profiler.js`, `research.js`, `architect.js`, and `writer.js` (plus shared `prompts.js` and `util.js`). Each exposes a pure `build<X>Payload`, a pure `parse<X>Response` (via `extractJson` in `api.js`), and an async `<X>Operation`.
- Shared API/client boundaries live in `src/api.js` (`DEFAULT_MODELS` routing, `callLLM`, `extractJson`, error classification) and `src/errors.js` (`AppError` + kind mapping).
- Client-side state is intentionally lightweight and browser-native: no framework, no state library, no fetch calls from render code, no backend service up front. Offline shell: `sw.js` + `manifest.webmanifest` + `src/db.js` (IndexedDB).
- Local file writes use `src/file-writer.js`: File System Access API on Chromium desktop, `<a download>` fallback elsewhere (ADR-003 — no `browser-fs-access` dependency).
- The Cloudflare Worker proxy under `worker/` is the only server-side runtime surface. It is stateless, validates origin, forwards the LLM payload, and injects `GEMINI_API_KEY` as a secret.
- Domain-source and grounding configuration lives in `sources.config.json` and is consulted as a research bias and citation re-ranking input; it is not a hard filter.

## Key conventions

Do not change the following without explicit approval or direction from the design docs:
- Preserve the privacy-first, zero-telemetry, browser-only approach.
- Keep secrets out of source control; `GEMINI_API_KEY` must stay in Worker secrets or in session-only browser storage for the optional BYO-key mode.
- Do not introduce new dependencies or frameworks unless the stack decision in `agent_docs/tech_stack.md` explicitly permits them.
- Do not grow the Worker into an application server; keep it as a stateless proxy boundary.
- Preserve the model routing in `agent_docs/tech_stack.md` (source of truth): the 2.5 family is retired; `profiler`/`discovery` -> 3.5 Flash-Lite (ungrounded), `research`/`writer` -> 3.6 Flash (`url_context` grounding), `architect` -> 3.5 Flash.
- Respect the output-artifact and generated-doc conventions described in `agent_docs/code_patterns.md` and `docs/TechDesign-ZarishDocs-MVP.md`.

## Testing and verification expectations

- Unit tests should cover pure logic in the agents (`build<X>Payload`, `parse<X>Response`, `<X>Operation` shapes), `api.js` (`extractJson`, `callLLM`, error classification), and the Worker proxy. Add tests for new pure logic as it lands.
- Any UI-facing work must be manually verified in a real browser context; the checklist in `REVIEW-CHECKLIST.md` calls out Chromium and Safari/Firefox/mobile fallback coverage.
- Rate limit and grounding/LLM model behavior are not to be treated as silent exceptions. Surface friendly messages and keep the failure shape consistent.

## Change discipline

- Plan before coding; build one feature at a time.
- Reuse existing modules and patterns instead of introducing new abstractions.
- Check the active programming goal in `MEMORY.md` before making a substantive change.
- Avoid editing protected directories or infrastructure files without explicit approval.

## Notes for future Copilot sessions

Treat the repository as an MVP foundation that is expected to grow into the browser-only app described in the Tech Design. Keep changes small and align them with the existing static-shell architecture.
