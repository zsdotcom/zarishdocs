# AGENTS.md — ZarishDocs

<!--
Single source of truth for AI assistants on this project. Keep it lean —
details live in the Context Files at the bottom. Update Current State and
Roadmap as you build.
-->

## What this project is

ZarishDocs is a browser-only, zero-cost AI research lab. A user types a plain-language app idea; the app researches it against live, cited sources (official-domain-first) and writes a linked **PRD + ADR + Tech Design** as Markdown into a folder the user picks. Built for non-technical founders. No signup, no cloud storage, no telemetry — the only outbound call is the LLM request.

## Current state

**Phase 1: Foundation — nothing built yet.** There is no `src/`, no `package.json`, no tests. What exists: agent instruction docs (`agent_docs/`), the build-ready Tech Design V2 (`docs/TechDesign-ZarishDocs-MVP.md`), the Worker proxy scaffold (`worker/`), `sources.config.json`, and the workflow files (`MEMORY.md`, `REVIEW-CHECKLIST.md`, `README.md`). Check `MEMORY.md` for the active goal before starting work.

## Commands

- **Dev server:** no build step — serve the folder with `python3 -m http.server 8080` and reload. No dev-server framework exists.
- **Testing:** pinned to Node's built-in runner — `node --test src/` via `npm test` (Tech Design §12) — but **not runnable yet**: no `package.json` exists. Wire it up when the first `src/` files land; don't claim tests pass before that.
- **Formatting:** Prettier (Tech Design §12). Run before finishing a change set; do not reformat files you didn't touch.
- **Worker deploy (from `worker/`):** `wrangler secret put GEMINI_API_KEY`, then `wrangler deploy`. App: `wrangler pages deploy src`.
- **Worker gotcha:** `worker/wrangler.toml` has `ALLOWED_ORIGIN = "https://your-site.pages.dev"` (placeholder). It must be set to the real Pages origin before any deploy, or every browser request gets a 403.

## Architecture (non-obvious)

- **No framework, no build step, no backend.** The only server-side piece is the stateless Cloudflare Worker proxy (`worker/index.js`): it injects the `GEMINI_API_KEY` secret, validates Origin, and forwards to Gemini. Never grow it into an app server.
- **Layered:** UI/orchestration handles request/response only. Agent logic lives in separate service modules (Profiler / Research / Architect / Writer). Never call `fetch`/Gemini from render code.
- **Domain sourcing (ADR-002):** rules live in `sources.config.json`, injected into the grounding prompt as a bias plus citation re-ranking — a strong preference, not a hard filter (Gemini grounding has no `site:` restriction).
- **Local file access (ADR-003):** `browser-fs-access` — File System Access API on Chromium desktop, `<a download>` fallback elsewhere. Surfaced on first load, never a silent failure.
- **Model routing & verified versions:** `agent_docs/tech_stack.md` is the source of truth — check it before suggesting any new dependency. Critical correction (2026-08-11): free Google-Search grounding is **2.5-family only** (2.5 Flash / Flash-Lite, 500 RPD shared); **Gemini 3.x grounding is paid-only**. Research Agent must use 2.5 Flash; Profiler → 2.5 Flash-Lite; Writer → 2.5 Flash.

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

- **Phase 1 — Foundation:** static app shell (SW + IndexedDB skeleton) · deploy Worker proxy + secret · `sources.config.json` (done) · tooling pinned (done, Tech Design §12).
- **Phase 2 — Core (PRD P0):** F1 One-Click Local Folder Access · F2 Vibe Translator (Profiler) · F3 Live Web Scanner (Research, grounded) · F4 Auto-Writer (Architect + Writer, Mermaid docs).
- **Phase 3 — Polish:** error handling (research failure, unsupported browser, 429 messaging) · mobile/Safari fallback UX · perf + a11y pass (sub-100KB shell; lazy-load the 23MB embedding model) · nice-to-haves (theme toggle, glossary tooltips).
- **Phase 4 — Launch:** security pass · deploy to Pages + Worker · end-to-end self-test with a real idea · launch checklist.

## Context files (progressive disclosure — load on demand)

- `agent_docs/tech_stack.md` — stack, verified versions, model routing, worker sketch (read before new deps or LLM work)
- `agent_docs/code_patterns.md` — architecture, Service Worker + IndexedDB patterns, naming
- `agent_docs/product_requirements.md` / `agent_docs/project_brief.md` / `agent_docs/testing.md`
- `MEMORY.md` — session memory: decisions, known issues, active goal
- `REVIEW-CHECKLIST.md` — definition of done
- `docs/` — research, PRD, Tech Design (source of truth for WHAT/HOW)
- `.github/copilot-instructions.md` — thin adapter pointing here
