# ZarishDocs

From a plain-language app idea to a complete, research-backed tech blueprint — written straight into your own folder.

![ZarishDocs](icon.svg)

ZarishDocs is a free, private "research lab" that runs entirely in your browser. You type your app idea in everyday words. It researches the current technology landscape using live, cited sources (official sources first), then writes you three linked documents: a **Product Requirements Doc (PRD)**, an **Architecture Decision Record (ADR)**, and a **Technical Design**. No account. No cloud storage. No tracking. The only thing that ever leaves your computer is the one research request.

## What you get

| Document | In plain terms |
| --- | --- |
| **PRD** — Product Requirements | What the app should do, who it's for, and what "done" looks like. |
| **ADR** — Architecture Decision Record | The key technology choices and *why* they were made. |
| **Tech Design** | How it's built: architecture, data flow, hosting, and an architecture diagram (`.mmd`, viewable in any Markdown tool). |

Every technical claim in these documents is tied to a live source with the date you accessed it — so you can verify, not just trust.

## Who it's for

Non-technical founders who want to go from idea to a concrete, buildable plan without learning to code first — and without giving up their idea or data to a third party.

## How it works

1. **Describe** your idea in your own words ("A simple booking app for independent trainers...").
2. **Research** — ZarishDocs scans current, official sources and gathers what matters for your idea.
3. **Design** — it turns the research into a complete product + technical blueprint.
4. **Save** — you pick a folder on your own computer and the documents are written there as Markdown files. (On browsers that can't write to a folder directly, the files download instead — never silently lost.)

## Status

**Phases 1–4 (Foundation, Core, Polish, Launch) — built and deployed.**

The app is live at **<https://zarishdocs.pages.dev>** (browser-only, works offline once loaded). All **55 automated tests** pass. What remains is the final human pass: a browser verification check and a live end-to-end test with a real idea — see `REVIEW-CHECKLIST.md` and `MEMORY.md` for the active goal.

## Privacy and cost

- **Free.** Cloudflare's and Gemini's free tiers only — $0.
- **Private.** Everything stays on your device: no signup, no cloud storage, no telemetry. Your folder is yours; files are written locally.
- **Transparent.** The one outbound call (to the LLM) is proxied by a small Cloudflare Worker that injects the API key and validates the request origin. Nothing else ever leaves your browser.

## For developers

No build step, no framework, no backend. Vanilla HTML/CSS/JS in the browser plus one stateless Cloudflare Worker proxy. Zero runtime dependencies.

```
zarishdocs/
├── src/                      # Browser app (ES modules, no build step)
│   ├── app.js                # Orchestrates: Profiler → Research → Architect → Writer
│   ├── api.js                # Model routing + callLLM + error handling
│   ├── errors.js             # Friendly error classification
│   ├── db.js                 # IndexedDB (ideas, drafts, settings)
│   ├── file-writer.js        # Save-to-folder + download fallback
│   └── agents/               # Agent service modules + shared prompts.js/util.js
├── worker/                   # Cloudflare Worker LLM proxy (ADR-001)
│   ├── index.js              # Origin check, model whitelist, quota stamp
│   └── wrangler.toml
├── docs/                     # Product documents (WHAT/HOW source of truth)
│   ├── research-ZarishDocs.md
│   ├── PRD-ZarishDocs-MVP.md
│   └── TechDesign-ZarishDocs-MVP.md
├── agent_docs/               # Detail docs for AI assistants (loaded on demand)
│   ├── tech_stack.md         # Stack, verified model versions, routing
│   ├── code_patterns.md      # Architecture and code conventions
│   ├── project_brief.md
│   ├── product_requirements.md
│   └── testing.md
├── index.html                # App shell (entry point)
├── styles.css                # App styling
├── sw.js                     # Service Worker: offline shell + runtime cache
├── icon.svg                  # App icon / logo (manifest + shell)
├── manifest.webmanifest      # PWA manifest
├── sources.config.json       # Official-source bias rules (ADR-002)
├── SETUP.md                  # How to run and deploy everything
├── AGENTS.md                 # Master plan for AI assistants
├── MEMORY.md                 # Session memory: decisions, known issues, active goal
├── REVIEW-CHECKLIST.md       # Definition of done
├── REPOSITORY-INVENTORY.md   # Every tracked file, with sizes and purposes
├── CHANGELOG.md              # Release history
├── package.json              # Scripts + Prettier (dev) only
├── wrangler.toml             # Root mirror of worker/wrangler.toml for CI deploys
├── scripts/                  # Repo checks (validate.py, etc.)
└── .github/                  # Community files, issue/PR templates, workflows
```

### Commands

- **Run the app:** `npm run serve` (serves this folder at `127.0.0.1:8080`). No build step.
- **Test:** `npm test` (Node ≥ 22) — 55 tests across the agents, `api.js`, and the Worker proxy.
- **Syntax check:** `npm run check`. **Format:** `npm run format` / `format:check` (Prettier).
- **Deploy:** `SETUP.md` covers the Worker proxy (key as a Worker secret) and the Pages app — both Cloudflare, both free.

### Notes for contributors

- The generated documents follow the ZarishDocs workflow (research → PRD → Tech Design) and each ends with a machine-readable `Handoff Context` block — preserve it when editing.
- **Model routing (Aug 2026):** two-step research — 3.5 Flash-Lite URL discovery, then 3.6 Flash `url_context` grounding for real citations. Details and verification notes in `agent_docs/tech_stack.md`.
- Mermaid architecture diagrams ship as `.mmd` files next to the docs (no in-app rendering), so they render in any Markdown viewer.
- Guidance for AI assistants: `AGENTS.md`. Feedback or issues: `.github/` — see `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, and `FAQ.md`.
