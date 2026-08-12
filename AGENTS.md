# AGENTS.md — ZarishDocs

<!--
Single source of truth for AI assistants on this project. Keep it lean —
details live in the Context Files at the bottom. Update Current State and
Roadmap as you build.
-->

## What this project is

ZarishDocs is a browser-only, zero-cost AI research lab. A user types a plain-language app idea; the app researches it against live, cited sources (official-domain-first) and writes a linked **PRD + ADR + Tech Design** as Markdown into a folder the user picks. Built for non-technical founders. No signup, no cloud storage, no telemetry — the only outbound call is the LLM request.

## Current state

**Phases 1–4: built and deployed.** Working: static app shell (`index.html`, `styles.css`) with offline Service Worker + manifest (`sw.js`, `manifest.webmanifest`, `icon.svg`); all four agents wired to real Gemini through `callLLM` (`src/agents/{profiler,research,architect,writer}.js` + shared `prompts.js`/`util.js`); `src/api.js` (model routing + `callLLM` + error classification); the Worker proxy (`worker/index.js` + `wrangler.toml`, 8 tests); IndexedDB (`src/db.js`) and native file writing (`src/file-writer.js`); `sources.config.json`; `package.json` with **55 passing tests** and Prettier wired.

**Deployed:** the Worker proxy is live at `https://zarishdocs-proxy.zarishsphere.workers.dev` with the `GEMINI_API_KEY` secret set, and the Pages app is live at `https://zarishdocs.pages.dev` (deployed from the repo **root**, not `src/`). `PROXY_ENDPOINT` (`src/api.js`) and `ALLOWED_ORIGIN` (`worker/wrangler.toml`) hold the real values. Still open: the browser verification pass per `REVIEW-CHECKLIST.md` and the live E2E self-test. Check `MEMORY.md` for the active goal before starting work.

## Commands

- **Dev server:** no build step — `npm run serve` (or `dev`) serves the folder at `127.0.0.1:8080`. Loopback-only bind: LAN/mobile testing needs a plain `python3 -m http.server 8080` instead.
- **Testing:** Node's built-in runner — `npm test` → `node --test "src/**/*.test.js" "worker/**/*.test.js"` (Node ≥ 22; needs `npm`, which may not be on PATH here — run `node --test "src/**/*.test.js" "worker/**/*.test.js"` directly). Currently 55 tests pass across the agents, `api.js`, and the Worker proxy. Add tests for new pure logic as it lands.
- **Syntax check:** `npm run check` → `node --check` over the shipped `src/` modules, `worker/`, and `sw.js`.
- **Formatting:** Prettier (devDep, Tech Design §12) — `npm run format` (write) / `npm run format:check`. Run before finishing a change set; do not reformat files you didn't touch.
- **Worker deploy (from `worker/`):** `wrangler secret put GEMINI_API_KEY`, then `wrangler deploy`. App: `wrangler pages deploy . --project-name zarishdocs --branch main --commit-dirty=true` from the repo **root** — `index.html`/`styles.css`/`sw.js`/`manifest.webmanifest` live there, not in `src/`.
- **Worker gotcha:** `worker/wrangler.toml` `ALLOWED_ORIGIN` is a comma-separated list that includes the loopback/localhost origins (local dev) plus `https://zarishdocs.pages.dev`. If you add a custom domain, append it to the list and redeploy the Worker, or production browsers on that origin get a 403.
- **Repo hygiene:** zero **runtime** dependencies — do not `npm install` runtime deps or commit new lockfiles. Prettier is the one allowed devDep; `pnpm-lock.yaml` is committed to pin it (gitignore override). Machine-local files (`.vscode/`, `.mcp.json`) are gitignored; never commit or edit them.

## Architecture (non-obvious)

- **No framework, no build step, no backend.** The only server-side piece is the stateless Cloudflare Worker proxy (`worker/index.js`): it injects the `GEMINI_API_KEY` secret, validates Origin, and forwards to Gemini. It whitelists the model string (SSRF guard) and stamps every response with `x-zarish-quota-bucket` (`grounding` vs `generation`) so quota usage is testable. Never grow it into an app server.
- **Layered:** UI/orchestration handles request/response only. Agent logic lives in separate service modules (Profiler / Research / Architect / Writer). Never call `fetch`/Gemini from render code. Each agent exposes a pure `build<X>Payload`, a pure `parse<X>Response` (via `extractJson` in `api.js`), and an async `<X>Operation` that calls `callLLM`. `prompts.js` holds the system prompts (grounding wording pinned in Tech Design §9.2); `util.js` holds shared helpers.
- **Domain sourcing (ADR-002):** rules live in `sources.config.json`, injected into the grounding prompt as a bias plus citation re-ranking — a strong preference, not a hard filter (Gemini grounding has no `site:` restriction).
- **Local file access (ADR-003):** native File System Access API (`showDirectoryPicker`) on Chromium desktop, `<a download>` fallback elsewhere — no `browser-fs-access` dependency. Surfaced on first load, never a silent failure.
- **Model routing & verified versions:** `agent_docs/tech_stack.md` is the source of truth — check it before suggesting any new dependency. Critical correction 2 (2026-08-11): the **2.5 family is retired for new accounts** (404) and `google_search` grounding is quota-blocked everywhere. Live path: two-step research — **3.5 Flash-Lite** discovery (candidate URLs, no grounding) → **3.6 Flash** `url_context` grounding for real citations. Profiler → 3.5 Flash-Lite; Architect → 3.5 Flash; Writer → 3.6 Flash. `url_context` URLs live in the prompt text; omit `responseMimeType` when tools are present.

## Constraints (don't break these)

- **Privacy:** no telemetry/analytics; the only outbound call is the proxied LLM request. Never log or send user data elsewhere.
- **$0:** Cloudflare + Gemini free tiers only.
- **Secrets:** never commit keys or `.env`. `GEMINI_API_KEY` lives only as a Worker secret; the BYO-key path stores the user's key in `sessionStorage` only — never on disk.
- **Generated docs:** every technical claim tied to a live source with an access date. WCAG 2.1 AA.
- **Protected (explicit approval required):** `infrastructure/`, Dockerfiles, `.github/workflows/`, migration files.
- **No new dependencies** without checking `agent_docs/tech_stack.md`; prefer native browser APIs.

## Workflow

1. Plan before coding — propose a brief step-by-step and wait for approval before changing more than one file. Ask ONE specific question if critical info is missing.
2. Build one feature at a time; prefer refactoring over rewriting.
3. Verify after each change: tests where they exist + manual browser check for UI (Chromium **and** Safari/Firefox/mobile for the download fallback). See `REVIEW-CHECKLIST.md` before marking anything done.
4. Record decisions and state in `MEMORY.md`, not chat history.

## Roadmap

- **Phase 1 — Foundation:** static app shell (done) · SW + IndexedDB shell (done) · deploy Worker proxy + secret (done) · `sources.config.json` (done) · tooling pinned (test runner done; Prettier installed).
- **Phase 2 — Core (PRD P0):** wire agents to real Gemini via the proxy (grounded research) (code done, tests done) · F1 One-Click Local Folder Access (code done) · F2 Vibe Translator (Profiler) (code done) · F3 Live Web Scanner (Research, grounded) (code done) · F4 Auto-Writer (Architect + Writer, Mermaid `.mmd` docs) (code done) — deployed; live E2E self-test pending.
- **Phase 3 — Polish:** error handling (research failure, unsupported browser, 429 messaging) (code done, per-app messaging pending live check) · mobile/Safari fallback UX (code done, pending manual verification) · perf + a11y pass (sub-100KB shell; lazy-load the 23MB embedding model) (pending) · nice-to-haves (theme toggle, glossary tooltips) (pending).
- **Phase 4 — Launch:** security pass · deploy to Pages + Worker (done) · end-to-end self-test with a real idea (pending) · launch checklist.

## Context files (progressive disclosure — load on demand)

- `agent_docs/tech_stack.md` — stack, verified versions, model routing, worker sketch (read before new deps or LLM work)
- `agent_docs/code_patterns.md` — architecture, Service Worker + IndexedDB patterns, naming
- `agent_docs/product_requirements.md` / `agent_docs/project_brief.md` / `agent_docs/testing.md`
- `MEMORY.md` — session memory: decisions, known issues, active goal
- `REVIEW-CHECKLIST.md` — definition of done
- `docs/` — research, PRD, Tech Design (source of truth for WHAT/HOW)
- `.github/copilot-instructions.md` — thin adapter pointing here
