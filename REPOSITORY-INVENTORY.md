# ZarishDocs — Repository Inventory

Generated: 2026-08-11 · Commit: `1c4339c` (`main`) · Remote: `https://github.com/zsdotcom/zarishdocs.git` (public)

Complete inventory of every tracked file, in hierarchy order, with size, line count, and purpose.

## Summary

| Metric | Value |
| --- | --- |
| Tracked files | 44 |
| Directories | 7 |
| Total source+doc lines | 2,645 |
| Runtime dependencies | 0 |
| Dev dependencies | 1 (`prettier`) |
| Tests passing | 51 / 51 |

## Hierarchy tree (first → last)

```
zarishdocs/
├── agent_docs/                        # Detail docs for AI agents (loaded on demand)
│   ├── code_patterns.md               # Architecture, SW/IndexedDB, naming, testing rules
│   ├── product_requirements.md        # PRD quick-reference (MoSCoW)
│   ├── project_brief.md               # Product vision and conventions
│   ├── tech_stack.md                  # Stack, verified versions, model routing, worker proxy
│   └── testing.md                     # Test strategy and must-verify flows
├── docs/                              # Product documents (source of truth for WHAT/HOW)
│   ├── PRD-ZarishDocs-MVP.md          # Product requirements for the MVP
│   ├── research-ZarishDocs.md         # Pre-PRD research notes
│   └── TechDesign-ZarishDocs-MVP.md   # Technical design (source of truth for HOW)
├── .github/                           # GitHub integration
│   └── copilot-instructions.md        # Copilot guidance → thin adapter to AGENTS.md
├── src/                               # Browser app (ES modules, no build step)
│   ├── agents/                        # Agent service modules + shared helpers
│   │   ├── architect.js               #   F4 outline builder (2.5 Flash)
│   │   ├── architect.test.js          #   4 tests
│   │   ├── profiler.js                #   F2 Vibe Translator (2.5 Flash-Lite)
│   │   ├── profiler.test.js           #   6 tests
│   │   ├── prompts.js                 #   System prompts (grounding wording, TD §9.2)
│   │   ├── research.js                #   F3 Live Web Scanner (2.5 Flash, grounding)
│   │   ├── research.test.js           #   8 tests
│   │   ├── util.js                    #   Shared helpers (merge findings, sanitize filenames)
│   │   ├── writer.js                  #   F4 doc writer (emits Mermaid .mmd)
│   │   └── writer.test.js             #   5 tests
│   ├── api.js                         # Model routing + callLLM + extractJson + error classify
│   ├── api.test.js                    # extractJson/callLLM/classifier tests
│   ├── app.js                         # UI orchestrator: Profiler → Research → Architect → Writer
│   ├── db.js                          # IndexedDB stores (ideas, drafts, settings)
│   ├── errors.js                      # AppError + error-kind mapping
│   ├── errors.test.js                 # AppError classifier tests
│   └── file-writer.js                 # Native FS API writes + <a download> fallback (ADR-003)
├── worker/                            # Cloudflare Worker LLM proxy (ADR-001)
│   ├── index.js                       # Origin check, model whitelist, quota-bucket stamp
│   ├── index.test.js                  # 8 tests (CORS/origin/model/quota)
│   └── wrangler.toml                  # Worker config + ALLOWED_ORIGIN var
├── AGENTS.md                          # Master plan for AI assistants (source of truth)
├── .gitignore                         # Ignore rules
├── icon.svg                           # App icon (manifest + SW)
├── index.html                         # App shell (entry point)
├── manifest.webmanifest               # PWA manifest
├── MEMORY.md                          # Session memory: decisions, known issues, active goal
├── package.json                       # Scripts + Prettier devDep
├── pnpm-lock.yaml                     # Pins Prettier (gitignored-override, committed)
├── .prettierignore                    # Prettier ignore rules
├── .prettierrc                        # Prettier config
├── README.md                          # Project overview + setup
├── REVIEW-CHECKLIST.md                # Definition of done (quality + security)
├── sources.config.json                # Domain → official-source mapping (ADR-002)
├── styles.css                         # App styling (all views)
└── sw.js                              # Service Worker: offline shell + runtime cache
```

## File details (by directory)

### Root

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `AGENTS.md` | 7,938 B | 68 | Master instructions for AI assistants: state, commands, constraints, roadmap |
| `README.md` | 5,224 B | 64 | Project overview, status, repo structure, setup commands |
| `MEMORY.md` | 8,376 B | 51 | Session memory: active goal, ADRs, known issues, completed phases |
| `REVIEW-CHECKLIST.md` | 2,465 B | 35 | Definition of done: quality/security gates before marking work complete |
| `index.html` | 3,862 B | 103 | Static app shell; loads `src/app.js`, registers the Service Worker |
| `styles.css` | 5,724 B | 381 | All view styling (idea input, progress, results, settings) |
| `sw.js` | 2,335 B | 89 | Service Worker: precache shell (`shell-*`), runtime cache (`runtime-*`), offline fallback |
| `manifest.webmanifest` | 403 B | 17 | PWA manifest: name, theme, start URL, icon |
| `icon.svg` | 279 B | 4 | App icon referenced by manifest + SW |
| `sources.config.json` | 575 B | 14 | Domain → official-source bias rules (ADR-002) injected into grounding |
| `package.json` | 787 B | 22 | Scripts (`test`, `test:unit`, `serve`, `dev`, `check`, `format`, `format:check`), Prettier devDep |
| `pnpm-lock.yaml` | 431 B | 24 | Lockfile pinning `prettier@3.9.6` |
| `.gitignore` | 272 B | 26 | Ignore rules (node_modules, .wrangler, secrets, local tool state) |
| `.prettierrc` | 107 B | 7 | Prettier config: 100 cols, semis, double quotes, trailing commas |
| `.prettierignore` | 88 B | 6 | Prettier excludes: `*.md`, `docs/`, `agent_docs/`, node_modules, minified |

### `src/` — Browser application

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `app.js` | 7,827 B | 237 | Orchestrator: validates idea, runs 4 agents in sequence, renders progress, saves results |
| `api.js` | 3,442 B | 113 | `DEFAULT_MODELS` routing, `callLLM`, `extractJson`, `getProxyEndpoint`, `classifyFetchError`, `responseText` |
| `errors.js` | 1,861 B | 53 | `AppError` class + `kindForStatus`/`messageForKind` friendly error mapping |
| `db.js` | 2,851 B | 91 | IndexedDB: `ideas`, `drafts`, `settings` stores; save/load/clear helpers |
| `file-writer.js` | 1,944 B | 58 | `showSaveFilePicker` (Chromium) + `<a download>` fallback (ADR-003); `saveAllDocuments` |
| `api.test.js` | 2,267 B | 66 | 5 tests: extractJson parse/fence/prose, callLLM routing, classifier mapping |
| `errors.test.js` | 1,224 B | 41 | 4 tests: AppError passthrough, network offline, status → kind |

### `src/agents/` — Agent service modules

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `prompts.js` | 2,937 B | 62 | System prompts for all 4 agents (grounding wording pinned, TD §9.2) |
| `util.js` | 1,063 B | 33 | Shared: `mergeFindings` (requirement→finding), `sanitizeFilename` |
| `profiler.js` | 2,079 B | 58 | F2 Vibe Translator: `buildProfilePayload` (2.5 Flash-Lite, no grounding), `parseProfileResponse`, `profileIdea` |
| `research.js` | 3,468 B | 105 | F3 Live Web Scanner: grounded 2.5 Flash payload, citation rank/merge, `researchIdea` |
| `architect.js` | 2,097 B | 58 | F4 outline: `buildArchitectPayload`, `parseArchitectResponse`, `architectDocument` |
| `writer.js` | 3,186 B | 93 | F4 doc writer: full PRD+ADR+TechDesign, `extractMermaid` → `.mmd`, `writeDocuments` |
| `profiler.test.js` | 2,423 B | 67 | 6 tests: validateIdea, payload model, parse/throw, profileIdea shape |
| `research.test.js` | 4,577 B | 132 | 8 tests: payload guard/grounding/bias, rank, citations, parse/merge, researchIdea |
| `architect.test.js` | 2,470 B | 74 | 4 tests: outline defaults, parse, operation calls LLM |
| `writer.test.js` | 2,921 B | 88 | 5 tests: filename scheme, mermaid extraction, parse throw, writeDocuments |

### `worker/` — Cloudflare proxy (ADR-001)

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `index.js` | 4,450 B | 122 | Stateless proxy: Origin validation, POST-only, model whitelist (SSRF guard), `GEMINI_API_KEY` injection, `x-zarish-quota-bucket` stamp |
| `index.test.js` | 3,685 B | 90 | 8 tests: 403 origin, OPTIONS preflight, method guard, model whitelist, quota buckets, 429 re-emit, invalid JSON |
| `wrangler.toml` | 545 B | 12 | Worker config; `ALLOWED_ORIGIN` = localhost + Pages placeholder |

### `agent_docs/` — Agent detail docs (loaded on demand)

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `tech_stack.md` | 4,807 B | 59 | Stack, verified model versions, routing (source of truth before new deps) |
| `code_patterns.md` | 4,647 B | 64 | Architecture, SW/IndexedDB patterns, naming, testing rules |
| `product_requirements.md` | 2,804 B | 45 | PRD quick-reference (MoSCoW priorities) |
| `project_brief.md` | 1,872 B | 16 | Product vision and conventions |
| `testing.md` | 1,848 B | 22 | Test strategy and must-verify flows |

### `docs/` — Product documents (WHAT/HOW source of truth)

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `research-ZarishDocs.md` | 19,240 B | 139 | Pre-PRD market/technical research, cited |
| `PRD-ZarishDocs-MVP.md` | 15,612 B | 234 | Product requirements, features F1–F4, MoSCoW |
| `TechDesign-ZarishDocs-MVP.md` | 27,003 B | 394 | Technical design: architecture, models, grounding, SW/IndexedDB, tooling (§12) |

### `.github/`

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `copilot-instructions.md` | 6,163 B | 81 | Copilot guidance: points to AGENTS.md, repo shape, commands, conventions |

## Largest files

| File | Size | Lines |
| --- | ---: | ---: |
| `docs/TechDesign-ZarishDocs-MVP.md` | 27,003 B | 394 |
| `docs/research-ZarishDocs.md` | 19,240 B | 139 |
| `docs/PRD-ZarishDocs-MVP.md` | 15,612 B | 234 |
| `MEMORY.md` | 8,376 B | 51 |
| `AGENTS.md` | 7,938 B | 68 |
| `src/app.js` | 7,827 B | 237 |

## Notables

- **Only server-side runtime surface:** `worker/index.js` (stateless; never grow into an app server).
- **Zero runtime dependencies**; the only dependency is `prettier` (dev), pinned via committed `pnpm-lock.yaml`.
- **Deployment gaps (documented in `AGENTS.md`/`MEMORY.md`):** `src/api.js` `PROXY_ENDPOINT` is a placeholder; `worker/wrangler.toml` `ALLOWED_ORIGIN` contains `https://your-site.pages.dev`; no browser verification pass has run yet.
