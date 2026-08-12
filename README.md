# ZarishDocs

From vibe to blueprint — private, free, AI-researched tech specs, written straight to your own folder.

A browser-only, zero-cost AI research lab. You type a plain-language app idea, and ZarishDocs researches current tech (cited, official-domain-first), then writes a linked **PRD + ADR + Tech Design** into a folder you choose. No signup, no cloud storage, no telemetry — the only outbound call is the LLM request itself.

## Status

**Phases 1–4 (Foundation + Core + Polish + Launch) — built and deployed.** Static shell with offline Service Worker, all four agents wired to real Gemini via `callLLM` (grounded research), IndexedDB + native file writes, and a 55-test suite (agents + `api.js` + Worker proxy) all pass. Live: Worker proxy at `https://zarishdocs-proxy.zarishsphere.workers.dev` and the Pages app at `https://zarishdocs.pages.dev`. Remaining: the browser verification pass per `REVIEW-CHECKLIST.md` and the live E2E self-test. See `AGENTS.md` → Roadmap and the active goal in `MEMORY.md`.

## Repository Structure

```
zarishdocs/
├── AGENTS.md                  # Master plan for AI assistants (source of truth)
├── MEMORY.md                  # Session memory: decisions, known issues, active goal
├── REVIEW-CHECKLIST.md        # Definition of done (quality + security)
├── agent_docs/                # Detail docs for agents (loaded on demand)
│   ├── tech_stack.md          # Stack, verified versions, model routing, worker proxy
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
│   ├── api.js                 # Model routing + callLLM + error classification + extractJson
│   ├── errors.js              # AppError + error-kind classification (shared by agents + UI)
│   ├── db.js                  # IndexedDB stores (ideas, drafts, settings)
│   ├── file-writer.js         # Native FS API writes + <a download> fallback (ADR-003)
│   └── agents/                # Service modules + shared prompts.js / util.js
│       ├── profiler.js        #   F2 Vibe Translator (3.5 Flash-Lite, ungrounded)
│       ├── research.js        #   F3 Live Web Scanner (3.6 Flash, url_context grounding)
│       ├── architect.js       #   F4 outline builder (3.5 Flash)
│       ├── writer.js          #   F4 doc writer, emits Mermaid .mmd (3.6 Flash)
│       ├── prompts.js         # System prompts (grounding wording pinned, TD §9.2)
│       └── util.js            # Shared helpers (merge findings, sanitize filenames)
├── sw.js                      # Service Worker: offline shell + runtime cache
├── manifest.webmanifest       # PWA manifest
├── icon.svg                   # App icon (used by manifest + SW)
├── worker/                    # Cloudflare Worker LLM proxy (ADR-001)
│   ├── index.js               # Origin check, model whitelist, quota-bucket stamp
│   └── wrangler.toml
├── .github/
│   └── copilot-instructions.md # Thin pointer to AGENTS.md for GitHub Copilot
└── .gitignore
```

## Setup & Commands

- **App:** none required — vanilla JS/HTML/CSS, no build step, no framework. Serve the folder with any static server (`npm run serve` → loopback-only `python3 -m http.server 8080 --bind 127.0.0.1`; plain `python3 -m http.server 8080` for LAN/mobile) and reload after changes. Offline-first: the Service Worker precaches the shell.
- **LLM proxy** (from `worker/`): already deployed — after a Worker change, `wrangler secret put GEMINI_API_KEY` (once) then `wrangler deploy`. `ALLOWED_ORIGIN` (`worker/wrangler.toml`) and `PROXY_ENDPOINT` (`src/api.js`) hold the real live values; only edit them to add a custom domain (then redeploy the Worker).
- **Hosting:** Cloudflare Pages (app) + Cloudflare Workers (proxy) — both free tier, $0.
- **Testing:** `npm test` → `node --test "src/**/*.test.js" "worker/**/*.test.js"` (Node ≥ 22). `npm run check` for a `node --check` syntax pass. `npm run format` / `format:check` (Prettier).

## Notes

- The generated product documents follow the ZarishDocs workflow (research → PRD → Tech Design); each ends with a machine-readable `Handoff Context` block that feeds the next stage — preserve it when editing.
- Mermaid architecture diagrams ship as `.mmd` files alongside the docs (no in-app rendering), so they work in any Markdown viewer.
- **Model routing (Aug 11, 2026):** the 2.5 family is retired for new accounts (404) and `google_search` grounding is quota-blocked on new accounts. Live path: two-step research — 3.5 Flash-Lite URL discovery (no grounding) → 3.6 Flash `url_context` grounding for real citations. Details in `agent_docs/tech_stack.md`.
