# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Task:** Project setup — nothing built yet (Phase 1: Foundation)
**Next Steps:**
1. Initialize the static app shell (folder structure, Service Worker + IndexedDB skeleton, `sources.config.json`)
2. Deploy the Cloudflare Worker proxy and store `GEMINI_API_KEY` as a Worker secret (ADR-001 default path)
3. Lint/test tooling resolved in Tech Design V2 §12 — Prettier + Node `node:test`; wire up `npm test` when the first source files land

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- 2026-08-11 — ADR-001: Hybrid LLM backend — free Cloudflare Worker proxy is the default path (holds `GEMINI_API_KEY` as a secret, CORS scoped to our origin); optional "bring your own key" panel stores the key in `sessionStorage` only. Both paths share the same agent logic.
- 2026-08-11 — ADR-002: Domain-aware research sourcing is a client-side routing config (`sources.config.json`) injected into the grounding prompt as a bias, plus citation re-ranking. Not a hard filter — grounding has no `site:` restriction.
- 2026-08-11 — ADR-003: Use `browser-fs-access` for local file writes (native File System Access API where available, transparent `<input>`/`<a download>` fallback elsewhere). Fallback surfaced on first load, never a silent failure.
- 2026-08-11 — **Model-routing correction:** Research Agent uses **Gemini 2.5 Flash** (free grounding), NOT Gemini 3.x. Verified 2026-08-11: 3.x grounding is paid-only; free grounding is 2.5 Flash/Flash-Lite at 500 RPD (shared). `agent_docs/tech_stack.md` and `docs/TechDesign-*.md` updated to match.
- 2026-08-11 — **Tooling pinned (Tech Design V2 §12):** Prettier for formatting + Node built-in `node:test` (`npm test` → `node --test src/`). Zero build step, zero new runtime deps. Alternatives (Vitest + ESLint) rejected as heavier than the MVP needs.
- 2026-08-11 — **Tech Design V2 resolves all V1 carried-forward items (§16):** exact grounding prompt wording fixed in §9.2 (pinned in `src/agents/prompts.js`); "own key" UI panel explicitly **post-MVP** (the `api.js` `mode: proxy | ownKey` swap ships now); Worker proxy emits `x-zarish-quota-bucket` on every response so grounding vs generation quota is testable (integration test in Phase 1).

## 🐛 Known Issues & Quirks
*(Log current bugs or weird workarounds here)*
- **Gemini 3.x grounding is NOT free** — paid-only (5,000 prompts/mo then $14/1k queries; bills per search query, not per prompt). Free grounding lives on the 2.5 family (2.5 Flash / Flash-Lite, 500 RPD shared). Any doc/claim saying "3.x free grounding" is stale — correct it.
- **Privacy caveat:** Gemini free tier may use prompts/responses to improve Google products ("used to improve our products: Yes"). The app is privacy-first locally, but this must be disclosed to users who bring their own key.
- Grounding-quota vs generation-quota are separate buckets in Google; a client misconfiguration can miscount grounded calls against the wrong (smaller) bucket → the Worker proxy must set the tool-use path correctly and log which quota a response consumed, or rate-limit errors will be mysterious 429s (ADR-001 caveat).
- Cloudflare Worker free quota (100k requests/day) is shared with Pages Functions; resets midnight UTC, while Gemini quota resets midnight Pacific — two different clocks to message around.

## 📜 Completed Phases
- [ ] Initial scaffold
- [ ] Cloudflare Worker proxy deployment
- [ ] `sources.config.json` setup
- [ ] Lint/test tooling configured
- [ ] One-Click Local Folder Access
- [ ] Vibe Translator (Profiler Agent)
- [ ] Live Web Scanner (Research Agent)
- [ ] Auto-Writer (Architect & Writer Agents)
