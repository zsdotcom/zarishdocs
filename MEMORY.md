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
3. Agree on lint/test tooling (Tech Design pins none — settle in Phase 1)

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- 2026-08-11 — ADR-001: Hybrid LLM backend — free Cloudflare Worker proxy is the default path (holds `GEMINI_API_KEY` as a secret, permissive CORS scoped to our origin); optional "bring your own key" panel stores the key in `sessionStorage` only. Both paths share the same agent logic.
- 2026-08-11 — ADR-002: Domain-aware research sourcing is a client-side routing config (`sources.config.json`) injected into the grounding prompt as a bias, plus citation re-ranking. Not a hard filter — grounding has no `site:` restriction.
- 2026-08-11 — ADR-003: Use `browser-fs-access` for local file writes (native File System Access API where available, transparent `<input>`/`<a download>` fallback elsewhere). Fallback surfaced on first load, never a silent failure.

## 🐛 Known Issues & Quirks
*(Log current bugs or weird workarounds here)*
- Grounding-quota vs generation-quota are separate buckets in Google; a client misconfiguration can miscount grounded calls against the wrong (smaller) bucket → the Worker proxy must set the tool-use path correctly and log which quota a response consumed, or rate-limit errors will be mysterious 429s (ADR-001 caveat).
- Carried forward, unverified in practice: exact domain-bias prompt wording; whether the "own key" panel ships in the 3-day MVP (recommended post-MVP); that the Worker correctly separates grounding from generation calls.

## 📜 Completed Phases
- [ ] Initial scaffold
- [ ] Cloudflare Worker proxy deployment
- [ ] `sources.config.json` setup
- [ ] Lint/test tooling configured
- [ ] One-Click Local Folder Access
- [ ] Vibe Translator (Profiler Agent)
- [ ] Live Web Scanner (Research Agent)
- [ ] Auto-Writer (Architect & Writer Agents)
