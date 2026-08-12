# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Task:** Post-merge hardening of the rearchitected pipeline (2026-08-12). Everything from the review-fix pass is committed and merged to `main` (`2e24b6c`, PR #4): discovery retry/guard, deploy-command + placeholder doc updates, unused-param cleanup, test fixture, plus the CI/ruleset alignment below. Local tree clean, 55/55 tests passing, main CI green. Remaining: live E2E self-test against the deployed proxy + browser verification + Prettier pass.
**Next Steps:**
1. Live E2E research call through the deployed proxy (discovery → `url_context` → citations)
2. Browser verification pass (Chromium + Safari/Firefox/mobile fallback) per REVIEW-CHECKLIST
3. Prettier format pass across touched files (`npm run format`), then `npm test` / `npm run check` / `python3 scripts/validate.py`
4. Optional: review + merge release-please PR #5 (`chore(main): release 1.0.0`) to cut v1.0.0

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- 2026-08-12 — **CI/ruleset alignment (PR #4):** the `main` ruleset required checks named after **workflow names** (`Repo Lint`, `Semantic PR title`, `OSV-Scanner`), but GitHub names checks after **job IDs / `name:` fields**, so those checks could never appear and every PR stayed merge-blocked. Fixes: renamed the repo-lint job to `Repo Lint` (was `validate`); renamed the semantic-pr job to `semantic-pr-title` with `name: Semantic PR title` and switched the trigger `pull_request_target` → `pull_request` (was never running); corrected the ruleset's required check `OSV-Scanner` → `osv-scanner` (case-sensitive match to the SARIF check name). Also fixed the OSV-Scanner reusable-workflow `startup_failure`: the caller must grant `actions: read` at the top level. All 9 workflows now register on `main`.
- 2026-08-12 — **release-please auto-PR:** the merged commit triggered `release-please` → PR #5 (`chore(main): release 1.0.0`, branch `release-please--branches--main--components--zarishdocs`). Expected automation; needs an approval + merge to cut v1.0.0.
- 2026-08-12 — **CodeQL false positives dismissed:** 3 × `js/incomplete-url-substring-sanitization` in `src/agents/research.test.js` (assertions that prompt text contains a domain, not URL-sanitization logic) dismissed as false positives via the code-scanning UI/API.
- 2026-08-12 — **Remote `main` force-reset incident:** mid-session a second session/actor force-reset remote `main` to `1c4339c` (removing the workflow commits + a one-off `.devcontainer/` commit). Nothing was lost — PR #4 restored all workflows/docs/code. The `.devcontainer/` commit is **not** in merged history; recover from that machine's reflog only if it was wanted.
- 2026-08-11 — **Research discovery retry + guard (review fix):** `researchIdea` retries the Flash-Lite discovery call once when it returns zero candidate URLs, then throws a retryable `AppError` instead of running the grounded call with nothing to fetch — the old path let the model answer from memory and pass self-authored citations off as verified sources. Tests added (2 new; suite now 55).
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
- 2026-08-11 — **Model-routing correction 2 (verified live):** the **2.5 family is retired for new accounts** — `gemini-2.5-flash` / `-flash-lite` return 404 NOT_FOUND, and `google_search` grounding returns 429 RESOURCE_EXHAUSTED on every model (both `generateContent` and `interactions`). New path: two-step research — **3.5 Flash-Lite** discovery (plain, no tools, `responseMimeType: JSON` OK) → **3.6 Flash** `url_context` grounding (real `groundingChunks` citations; URLs passed in the **prompt text**, not tool config; **must omit** `responseMimeType` when tools present — else `TOO_MANY_TOOL_CALLS`). Flash-Lite variants return no grounding chunks. `src/api.js` DEFAULT_MODELS updated; Worker `ALLOWED_MODELS` whitelists 3.5-flash / 3.5-flash-lite / 3.6-flash.
- 2026-08-11 — **Deployed live (Phase 4):** Worker proxy `zarishdocs-proxy` live at `https://zarishdocs-proxy.zarishsphere.workers.dev` (Version `f93f3738`, `GEMINI_API_KEY` secret set, `ALLOWED_ORIGIN` = localhost:8080 + `https://zarishdocs.pages.dev`). Pages project `zarishdocs` live — **deploy from the repo root (`.`), NOT `src/`** (SETUP.md §4.5 is wrong: `index.html`/`styles.css`/`sw.js`/`manifest.webmanifest` live at the repo root; `src/` holds only JS modules). Earlier "queued forever" Pages stage was a known Cloudflare display bug, not a real failure.
- 2026-08-11 — **CodeRabbit GitHub App installed org-wide** on `zsdotcom` (installation ID 152605238, `repository_selection: all`) — will auto-review PRs on `zarishdocs`. No further app setup needed.
- 2026-08-11 — **Model-routing correction:** Research Agent uses **Gemini 2.5 Flash** (free grounding), NOT Gemini 3.x. Verified 2026-08-11: 3.x grounding is paid-only; free grounding is 2.5 Flash/Flash-Lite at 500 RPD (shared). `agent_docs/tech_stack.md` and `docs/TechDesign-*.md` updated to match. *(SUPERSEDED 2026-08-11 by correction 2 — 2.5 family retired; retained for history.)*
- 2026-08-11 — **Tooling pinned (Tech Design V2 §12):** Prettier for formatting + Node built-in `node:test` (`npm test` → `node --test src/`). Zero build step, zero new runtime deps. Alternatives (Vitest + ESLint) rejected as heavier than the MVP needs.
- 2026-08-11 — **Tech Design V2 resolves all V1 carried-forward items (§16):** exact grounding prompt wording fixed in §9.2 (pinned in `src/agents/prompts.js`); "own key" UI panel explicitly **post-MVP** (the `api.js` `mode: proxy | ownKey` swap ships now); Worker proxy emits `x-zarish-quota-bucket` on every response so grounding vs generation quota is testable (integration test in Phase 1).

## 🐛 Known Issues & Quirks
*(Log current bugs or weird workarounds here)*
- **Merge blocked until 2026-08-12 — FIXED:** required checks `Repo Lint` / `Semantic PR title` never appeared (GitHub names checks after job IDs, not workflow names) and `OSV-Scanner` was a case-mismatch (`osv-scanner`). Workflow jobs renamed + ruleset context corrected; all required checks now pass on PRs.
- **`docs/TechDesign-ZarishDocs-MVP.md`** still describes the 2.5-family/`google_search` path in places — §13 deploy steps and ALLOWED_ORIGIN are corrected (2026-08-11); the remaining model-routing prose needs a pass (mark as superseded or annotate).
- **SETUP.md §4.5 wrong `wrangler pages deploy src` command — FIXED (2026-08-11)** in `AGENTS.md`/`SETUP.md`/`TechDesign §13`: deploy from the repo root — `wrangler pages deploy . --project-name zarishdocs --branch main --commit-dirty=true`.
- **Placeholder guidance in `worker/wrangler.toml`/`SETUP.md`/docs — FIXED (2026-08-11):** `ALLOWED_ORIGIN` + `PROXY_ENDPOINT` carry the real live values (`zarishdocs-proxy.zarishsphere.workers.dev`, `zarishdocs.pages.dev`); stale refs in README/REPOSITORY-INVENTORY/copilot-instructions/tech_stack cleared.
- **Prettier formatting is NOT yet applied across the codebase** — installed and wired, but no `prettier --write` pass has run yet.
- **Privacy caveat:** Gemini free tier may use prompts/responses to improve Google products ("used to improve our products: Yes"). The app is privacy-first locally, but this must be disclosed to users who bring their own key.
- Grounding-quota vs generation-quota are separate buckets in Google; a client misconfiguration can miscount grounded calls against the wrong (smaller) bucket → the Worker proxy must set the tool-use path correctly and log which quota a response consumed, or rate-limit errors will be mysterious 429s (ADR-001 caveat).
- Cloudflare Worker free quota (100k requests/day) is shared with Pages Functions; resets midnight UTC, while Gemini quota resets midnight Pacific — two different clocks to message around.

## 📜 Completed Phases
- [x] Initial scaffold (static shell + agent pipeline skeleton)
- [x] All four agents wired to `callLLM` (payload builders + response parsers + operations)
- [x] Service Worker + IndexedDB offline shell (Phase 1 last item)
- [x] `sources.config.json` setup
- [x] Lint/test tooling configured (test runner wired, 51 tests passing; Prettier installed)
- [x] Cloudflare Worker proxy deployment (live: `zarishdocs-proxy.zarishsphere.workers.dev`, `GEMINI_API_KEY` secret set, real `ALLOWED_ORIGIN`, Version `f93f3738`)
- [x] Cloudflare Pages deployment (live: `zarishdocs.pages.dev`, deployed from repo root)
- [x] CodeRabbit GitHub App install (org-wide on `zsdotcom`)
- [x] Model-routing rearchitect (2.5 retired → 3.5/3.6 `url_context`; code + tests + Worker whitelist)
- [~] One-Click Local Folder Access (code ready — native FS API + `<a download>` fallback; browser verification pending)
- [~] Vibe Translator (Profiler Agent) — code ready, tested; live E2E pending
- [~] Live Web Scanner (Research Agent) — code ready, tested; live E2E pending
- [~] Auto-Writer (Architect & Writer Agents) — code ready, tested; live E2E pending
