# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Task:** Deploy + verify the now-wired pipeline. All four agents call `callLLM` through real payload builders, the SW + IndexedDB shell and offline manifest are in place, and 51 tests pass (src agents + Worker proxy + api). The app still points at the placeholder `getProxyEndpoint()` URL, so nothing is live until the Worker proxy is deployed and that constant is replaced.
**Next Steps:**
1. Browser verification pass: run the app (Chromium) end-to-end against real Gemini once the endpoint is live; verify download fallback on Safari/Firefox/mobile (REVIEW-CHECKLIST)
2. Deploy the Cloudflare Worker proxy and store `GEMINI_API_KEY` as a Worker secret (ADR-001 default path), then replace the placeholder URL in `src/api.js` `getProxyEndpoint()` and the `ALLOWED_ORIGIN` placeholder in `worker/wrangler.toml` with the real Pages origin
3. Deploy the app shell to Pages (`wrangler pages deploy src`)
4. Prettier format pass over the codebase, then end-to-end self-test with a real idea (Phase 4)

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- 2026-08-11 — **All four agents wired to `callLLM` (2026-08-11).** Each agent now exposes `build<X>Payload` (pure, tested) + `parse<X>Response` (pure, tested) + an async `<X>Operation` that calls the LLM and returns the pipeline shape. `prompts.js` holds the system prompts (grounding wording pinned per Tech Design §9.2); `util.js` holds shared merge/sanitize helpers. `callLLM` runs without an endpoint URL (works when `PROXY_ENDPOINT` is replaced later) and is fully tested.
- 2026-08-11 — **`extractJson` semantics fixed:** it now returns a **parsed object** (or `null`), honors a ```` ```json ```` fence when present, otherwise brace-scans the whole text — so mermaid fences inside a response can't shadow the JSON (this was the bug behind "found no requirements"/"unreadable response" in tests). Callers do `const raw = extractJson(text)` and read fields directly.
- 2026-08-11 — **Native file writes (ADR-003 revised):** dropped `browser-fs-access`. `src/file-writer.js` uses the File System Access API (`showDirectoryPicker`) on Chromium desktop and an `<a download>` fallback everywhere else — no dependency, same UX contract (surfaced on first load, never a silent failure).
- 2026-08-11 — **Mermaid emitted as files, not rendered:** diagrams are written as `.mmd` files under `diagrams/`; no in-app rendering (keeps the shell small, no heavy libs). Tech Design §9.x already describes `.mmd` handoff.
- 2026-08-11 — **SW + IndexedDB shell landed (Phase 1 complete):** `sw.js` (precache shell + runtime stale-while-revalidate + offline navigation fallback), `manifest.webmanifest` + `icon.svg`, and `src/db.js` (IndexedDB with `ideas`, `drafts`, `settings` stores; save/load/clear helpers). `index.html` registers the SW; app shell fully offline-capable.
- 2026-08-11 — **Prettier installed as the repo's first (dev) dependency:** `prettier@3.9.6`, `pnpm-lock.yaml` committed (gitignore overridden). Runtime deps remain zero. `npm run format` (write) and `npm run format:check` wired in `package.json`.
- 2026-08-11 — **Test suite grew 4 → 51:** `npm test` now also runs the Worker proxy tests (`worker/index.test.js`), covering extractJson, both error classifiers, all agent build/parse paths, filename schemes, and the proxy's CORS/origin/model-whitelist/quota-bucket behavior. `npm run check` covers `src/` + `worker/` + `sw.js`.
- 2026-08-11 — **Build state:** static app shell + agent pipeline skeleton landed. `src/app.js` orchestrates Profiler → Research → Architect → Writer; agents validate input and emit the right shapes but return **hardcoded/placeholder data** (research citations point at `https://example.com/placeholder-source`). `src/api.js` `getProxyEndpoint()` is a placeholder URL. Test runner wired: `npm test` → `node --test "src/**/*.test.js"`, 4 tests pass (profiler + research validation/shape). Prettier recorded in Tech Design §12 but not yet in `package.json`.
- 2026-08-11 — ADR-001: Hybrid LLM backend — free Cloudflare Worker proxy is the default path (holds `GEMINI_API_KEY` as a secret, CORS scoped to our origin); optional "bring your own key" panel stores the key in `sessionStorage` only. Both paths share the same agent logic.
- 2026-08-11 — ADR-002: Domain-aware research sourcing is a client-side routing config (`sources.config.json`) injected into the grounding prompt as a bias, plus citation re-ranking. Not a hard filter — grounding has no `site:` restriction.
- 2026-08-11 — ADR-003: Use `browser-fs-access` for local file writes (native File System Access API where available, transparent `<input>`/`<a download>` fallback elsewhere). Fallback surfaced on first load, never a silent failure.
- 2026-08-11 — **Model-routing correction:** Research Agent uses **Gemini 2.5 Flash** (free grounding), NOT Gemini 3.x. Verified 2026-08-11: 3.x grounding is paid-only; free grounding is 2.5 Flash/Flash-Lite at 500 RPD (shared). `agent_docs/tech_stack.md` and `docs/TechDesign-*.md` updated to match.
- 2026-08-11 — **Tooling pinned (Tech Design V2 §12):** Prettier for formatting + Node built-in `node:test` (`npm test` → `node --test src/`). Zero build step, zero new runtime deps. Alternatives (Vitest + ESLint) rejected as heavier than the MVP needs.
- 2026-08-11 — **Tech Design V2 resolves all V1 carried-forward items (§16):** exact grounding prompt wording fixed in §9.2 (pinned in `src/agents/prompts.js`); "own key" UI panel explicitly **post-MVP** (the `api.js` `mode: proxy | ownKey` swap ships now); Worker proxy emits `x-zarish-quota-bucket` on every response so grounding vs generation quota is testable (integration test in Phase 1).

## 🐛 Known Issues & Quirks
*(Log current bugs or weird workarounds here)*
- **`src/api.js` `getProxyEndpoint()` is still a placeholder** — the app is not live until the Worker proxy is deployed and this constant (and the `ALLOWED_ORIGIN` placeholder in `worker/wrangler.toml`) is replaced with the real values.
- **Prettier formatting is NOT yet applied across the codebase** — installed and wired, but no `prettier --write` pass has run yet.
- **Gemini 3.x grounding is NOT free** — paid-only (5,000 prompts/mo then $14/1k queries; bills per search query, not per prompt). Free grounding lives on the 2.5 family (2.5 Flash / Flash-Lite, 500 RPD shared). Any doc/claim saying "3.x free grounding" is stale — correct it.
- **Privacy caveat:** Gemini free tier may use prompts/responses to improve Google products ("used to improve our products: Yes"). The app is privacy-first locally, but this must be disclosed to users who bring their own key.
- Grounding-quota vs generation-quota are separate buckets in Google; a client misconfiguration can miscount grounded calls against the wrong (smaller) bucket → the Worker proxy must set the tool-use path correctly and log which quota a response consumed, or rate-limit errors will be mysterious 429s (ADR-001 caveat).
- Cloudflare Worker free quota (100k requests/day) is shared with Pages Functions; resets midnight UTC, while Gemini quota resets midnight Pacific — two different clocks to message around.

## 📜 Completed Phases
- [x] Initial scaffold (static shell + agent pipeline skeleton)
- [x] All four agents wired to `callLLM` (payload builders + response parsers + operations)
- [x] Service Worker + IndexedDB offline shell (Phase 1 last item)
- [x] `sources.config.json` setup
- [x] Lint/test tooling configured (test runner wired, 51 tests passing; Prettier installed)
- [ ] Cloudflare Worker proxy deployment (code ready + tested; not deployed, no `GEMINI_API_KEY` set, endpoint URL still placeholder)
- [~] One-Click Local Folder Access (code ready — native FS API + `<a download>` fallback; browser verification pending)
- [~] Vibe Translator (Profiler Agent) — code ready, tested; live E2E pending
- [~] Live Web Scanner (Research Agent) — code ready, tested; live E2E pending
- [~] Auto-Writer (Architect & Writer Agents) — code ready, tested; live E2E pending
