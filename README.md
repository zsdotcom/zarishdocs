# ZarishDocs

From vibe to blueprint — private, free, AI-researched tech specs, written straight to your own folder.

A browser-only, zero-cost AI research lab. You type a plain-language app idea, and ZarishDocs researches current tech (cited, official-domain-first), then writes a linked **PRD + ADR + Tech Design** into a folder you choose. No signup, no cloud storage, no telemetry — the only outbound call is the LLM request itself.

## Status

**Phase 1 (Foundation) — partially built.** Static app shell, agent pipeline skeleton, Worker proxy, and test suite are in place (4 tests pass). The agents still emit placeholder data — wiring them to real Gemini is Phase 2. Build plan: `AGENTS.md` → Roadmap; active goal: `MEMORY.md`.

## Repository Structure

```
zarishdocs/
├── AGENTS.md                  # Master plan for AI assistants (source of truth)
├── MEMORY.md                  # Session memory: decisions, known issues, active goal
├── REVIEW-CHECKLIST.md        # Definition of done (quality + security)
├── agent_docs/                # Detail docs for agents (loaded on demand)
│   ├── tech_stack.md          # Stack, verified versions, worker proxy sketch
│   ├── code_patterns.md       # Architecture, SW/IndexedDB, naming, testing rules
│   ├── project_brief.md       # Product vision and conventions
│   ├── product_requirements.md # PRD quick-reference (MoSCoW)
│   └── testing.md             # Test strategy and must-verify flows
├── docs/                      # Product documents (source of truth for WHAT/HOW)
│   ├── research-ZarishDocs.md
│   ├── PRD-ZarishDocs-MVP.md
│   └── TechDesign-ZarishDocs-MVP.md
├── sources.config.json        # Domain → official-source mapping (ADR-002)
├── src/                       # Browser app (no build step, ES modules)
│   ├── app.js                 # Orchestration: Profiler → Research → Architect → Writer
│   ├── api.js                 # Model routing + callLLM + getProxyEndpoint
│   └── agents/                # Service modules (profiler, research, architect, writer)
├── worker/                    # Cloudflare Worker LLM proxy (ADR-001)
│   ├── index.js
│   └── wrangler.toml
├── .github/
│   └── copilot-instructions.md # Thin pointer to AGENTS.md for GitHub Copilot
└── .gitignore
```

## Setup & Commands

- **App:** none required — vanilla JS/HTML/CSS, no build step, no framework. Serve the folder with any static server (e.g. `python3 -m http.server 8080`) and reload the page after changes.
- **LLM proxy** (from `worker/`): install Wrangler once (`npm i -g wrangler`), `wrangler login`, then `wrangler secret put GEMINI_API_KEY` and `wrangler deploy`.
- **Hosting:** Cloudflare Pages (app) + Cloudflare Workers (proxy) — both free tier, $0.
- **Testing / linting:** `npm test` (Node's built-in `node:test`, runs `node --test "src/**/*.test.js"`; Node ≥ 22) + Prettier for formatting — pinned in Tech Design §12. `npm run check` for a `node --check` syntax pass.

## Notes

- The generated product documents follow the vibe-coding workflow (research → PRD → Tech Design); each ends with a machine-readable `Handoff Context` block that feeds the next stage — preserve it when editing.
- **Model-routing correction (Aug 11, 2026):** free Google-Search grounding lives on the Gemini 2.5 family (2.5 Flash / Flash-Lite), not Gemini 3.x — 3.x grounding is paid-only. Details in `agent_docs/tech_stack.md`.
