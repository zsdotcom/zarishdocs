# AGENTS.md — Master Plan for ZarishDocs

<!--
Single source of truth for every AI coding assistant on this project.
Keep it lean — details live in the Context Files at the bottom. Update Current State and Roadmap as you build.
-->

## Project Overview & Stack
**App:** ZarishDocs
**Overview:** A browser-only, zero-cost AI research lab that turns a plain-language app idea into a cited, build-ready document set — PRD + ADR + Tech Design — written straight to the user's own folder. No signup, no cloud storage, no telemetry. Built for non-technical founders (persona "Maya") who don't know what an API, ADR, or database migration is.
**Stack:** Vanilla HTML/CSS/JS (no framework, no build step), Gemini Flash-Lite + Flash (3.x family, with Google Search grounding), `browser-fs-access`, Mermaid.js 11.16.1, transformers.js + `all-MiniLM-L6-v2`, Service Worker + IndexedDB, Cloudflare Pages + one Cloudflare Worker proxy
**Critical Constraints:** Privacy-first (no telemetry, no cloud storage, no accounts — the only outbound call is the LLM request itself); $0 running cost (Cloudflare + Gemini free tiers only); File System Access API is Chromium-desktop-only → a visible download fallback is required for Safari/Firefox/mobile, surfaced on first load, never a silent failure; every technical claim in generated docs is tied to a live source with an access date; WCAG 2.1 AA.

## Setup & Commands
Execute these commands for standard development workflows. Do not invent new package manager commands.
- **Setup:** None required for the core app — vanilla JS/HTML/CSS with no build step; Mermaid.js loads via CDN. For the LLM proxy only: install Cloudflare Wrangler (`npm i -g wrangler`) and `wrangler login`.
- **Development:** Serve the static folder with any static server (e.g. `python3 -m http.server 8080`) and reload the page after changes — no dev-server framework exists.
- **Testing:** TBD in Phase 1 — the Tech Design pins no test framework; agree one before writing tests.
- **Linting & Formatting:** TBD in Phase 1 — no linter is pinned in the Tech Design.
- **Build:** None — this is a static client app.
- **Deploy:**
  - Worker proxy: `wrangler secret put GEMINI_API_KEY`, then `wrangler deploy`
  - App: `wrangler pages deploy <folder>`

## Protected Areas 🛡️
Do NOT modify these without explicit human approval:
- **Secrets:** NEVER commit `.env` files or hardcode API keys, tokens, or passwords. The Gemini key lives only as a Cloudflare Worker secret (`GEMINI_API_KEY`). The optional "bring your own key" path stores the user's key in `sessionStorage` only — never on disk, never sent anywhere but Google's endpoint.
- **Infrastructure:** `infrastructure/`, Dockerfiles, and deployment workflows (`.github/workflows/`).
- **Database Migrations:** Existing migration files.
- **Third-Party Integrations:** Payment gateway configuration and auth setup.

## Coding Conventions
- **Formatting:** No formatter pinned in the Tech Design — settle on one in Phase 1 (e.g. Prettier) and use it consistently; do not reformat files you didn't touch.
- **Architecture:** Layered — UI/orchestration handles request/response only; agent logic lives in separate service modules (Profiler / Research / Architect / Writer). Domain-sourcing rules live in `sources.config.json`, not hardcoded. The Worker proxy is a single portable, stateless function.
- **Testing:** All new utilities get unit tests. Core user flows get integration tests. UI work requires manual browser verification.
- **Type Safety:** Validate all external inputs at system boundaries (idea text, user-supplied API key, `sources.config.json`). Avoid untyped globals; define precise interfaces or use `unknown`.

## How I Should Think 🧠
1. **Understand Intent First:** Identify what the user actually needs before answering.
2. **Ask If Unsure:** If critical information is missing, ask ONE specific question before proceeding.
3. **Plan Before Coding:** Propose a brief step-by-step plan and wait for approval before changing more than one file. (If your tool has a plan/reflect mode, use it.)
4. **Execute Incrementally:** Build one feature at a time. Prefer refactoring over rewriting large blocks.
5. **Verify After Changes:** Run tests/linters or manual checks after each logical change; fix failures before moving on (see `REVIEW-CHECKLIST.md`).
6. **Explain Trade-offs:** When recommending something, briefly mention alternatives.
7. **Remember in Files:** Write state and decisions to `MEMORY.md` instead of relying on chat history.
8. **Use Subagents If Available:** If your tool supports subagents or parallel agents, assign roles and require a plan before edits.

## What NOT To Do ⛔
- Do NOT delete files without explicit confirmation.
- Do NOT modify database schemas without a backup plan.
- Do NOT add features not in the current phase.
- Do NOT skip tests for "simple" changes.
- Do NOT bypass failing tests or pre-commit hooks.
- Do NOT use deprecated libraries or patterns.
- Do NOT send any user data anywhere except the proxied/direct Gemini call. No telemetry, no analytics.

## Engineering Constraints 🏗️
- **Type Safety:** Validate external input with a runtime check at the boundary (idea text, API key, config JSON). All functions have typed inputs/outputs. No untyped globals.
- **Architectural Sovereignty:** UI and orchestration layers handle request/response ONLY. Agent/business logic lives in separate service modules. No fetch/Gemini calls from render code.
- **Library Governance:** Check `agent_docs/tech_stack.md` before suggesting new dependencies. Prefer native browser APIs over libraries (`browser-fs-access` is the one sanctioned file-access dependency). No framework unless explicitly approved.
- **Clear Communication:** State issues briefly and fix them — no apology loops or filler. If context is missing, ask ONE specific clarifying question.
- **Workflow Discipline:** Verification must pass before you mark work done (or ask before bypassing). If verification fails, fix it before continuing.

## Current State 📍
**Last Updated:** August 11, 2026
**Working On:** Project setup — nothing built yet
**Recently Completed:** Nothing yet
**Blocked By:** None

## Roadmap 🗺️

### Phase 1: Foundation
- [ ] Initialize project (static app shell, folder structure, Service Worker + IndexedDB skeleton)
- [ ] Deploy the Cloudflare Worker proxy (ADR-001 default path) + `wrangler secret put GEMINI_API_KEY`
- [ ] Set up `sources.config.json` domain mapping (ADR-002)
- [ ] Configure lint/test tooling (TBD — not pinned in Tech Design)

### Phase 2: Core Features (PRD P0)
- [ ] One-Click Local Folder Access — `browser-fs-access` write path + visible download fallback on unsupported browsers (ADR-003)
- [ ] The Vibe Translator (Profiler Agent) — casual text → structured research requirements, no jargon shown
- [ ] The Live Web Scanner (Research Agent) — grounded, official-domain-first research with version verification
- [ ] The Auto-Writer (Architect & Writer Agents) — linked PRD + ADR + Tech Design Markdown with Mermaid diagrams

### Phase 3: Polish
- [ ] Error handling (failed research call, unsupported browser, free-tier rate-limit messaging)
- [ ] Mobile / Safari download-fallback UX pass
- [ ] Performance + accessibility pass (sub-100KB shell; lazy-load the 23MB embedding model; WCAG 2.1 AA)
- [ ] Nice-to-haves if time allows: theme toggle, glossary tooltips

### Phase 4: Launch
- [ ] Security pass (see `REVIEW-CHECKLIST.md`)
- [ ] Deploy to Cloudflare Pages + Worker proxy
- [ ] Self-test with a real idea end-to-end (idea in → cited research → PRD+ADR+TechDesign out)
- [ ] Launch checklist

## Context Files 📚
Load these only when needed — progressive disclosure keeps context lean:
- `agent_docs/tech_stack.md` — Stack details, libraries, setup commands
- `agent_docs/code_patterns.md` — Architecture and code style rules
- `agent_docs/project_brief.md` — Product vision and conventions
- `agent_docs/product_requirements.md` — Feature list and user stories
- `agent_docs/testing.md` — Test strategy and commands
- `MEMORY.md` — Session memory: decisions, known issues, active goal
- `REVIEW-CHECKLIST.md` — Definition of done before marking work complete
- `specs/` — Feature specs and handoff notes created during the build
