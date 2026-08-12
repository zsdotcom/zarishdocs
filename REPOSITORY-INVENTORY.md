# ZarishDocs — Repository Inventory

Generated: 2026-08-12 · Commit: `4a29799` (`main`) · Remote: `https://github.com/zsdotcom/zarishdocs.git` (public)

Complete inventory of every tracked file, in hierarchy order, with size, line count, and purpose.

## Summary

| Metric | Value |
| --- | --- |
| Tracked files | 134 |
| Directories | 35 |
| Total source+doc lines | 8,661 |
| Runtime dependencies | 0 |
| Dev dependencies | 1 (`prettier`) |
| Tests passing | 55 / 55 |

## Hierarchy tree (first → last)

```
zarishdocs/
├── .claude/                        # Agent skill definitions (zsdocs-* workflow skills)
│   └── skills/zsdocs-{agents,build,prd,research,techdesign,workflow}/SKILL.md
├── .github/                        # GitHub integration
│   ├── copilot-instructions.md     # Copilot guidance → thin adapter to AGENTS.md
│   ├── CODE_OF_CONDUCT.md          # Contributor expectations
│   ├── CODEOWNERS                  # Default owner for repo-lint/CI paths
│   ├── CONTRIBUTING.md             # How to contribute
│   ├── DISCUSSION_TEMPLATE/        # Discussion category templates
│   ├── FAQ.md                      # Non-technical FAQ
│   ├── FUNDING.yml                 # Sponsor links
│   ├── GOVERNANCE.md               # Project governance
│   ├── ISSUE_TEMPLATE/             # Bug/feature/showcase issue templates
│   ├── labels.yml                  # Issue label definitions
│   ├── MCP-SETUP.md                # MCP server setup for agents
│   ├── PULL_REQUEST_TEMPLATE.md    # PR checklist
│   ├── SECURITY.md                 # Security policy
│   ├── SUPPORT.md                  # Where to get help
│   └── workflows/                  # CI/CD (release-please, repo-lint, codeql, scorecard…)
├── agent_docs/                     # Detail docs for AI agents (loaded on demand)
│   ├── code_patterns.md            # Architecture, SW/IndexedDB, naming, testing rules
│   ├── product_requirements.md     # PRD quick-reference (MoSCoW)
│   ├── project_brief.md            # Product vision and conventions
│   ├── tech_stack.md               # Stack, verified versions, model routing, worker proxy
│   └── testing.md                  # Test strategy and must-verify flows
├── docs/                           # Product documents (source of truth for WHAT/HOW)
│   ├── PRD-ZarishDocs-MVP.md       # Product requirements for the MVP
│   ├── research-ZarishDocs.md      # Pre-PRD research notes
│   └── TechDesign-ZarishDocs-MVP.md # Technical design (source of truth for HOW)
├── examples/                       # End-to-end sample project produced by the workflow
│   └── reddit-to-ai/               # PRD/TechDesign/AGENTS/MEMORY/research for the sample
├── scripts/                        # Repo checks
│   └── validate.py                 # Contract checks for templates + required files
├── src/                            # Browser app (ES modules, no build step)
│   ├── agents/                     # Agent service modules + shared helpers
│   │   ├── architect.js            #   F4 outline builder (3.5 Flash)
│   │   ├── architect.test.js       #   4 tests
│   │   ├── profiler.js             #   F2 Vibe Translator (3.5 Flash-Lite, ungrounded)
│   │   ├── profiler.test.js        #   6 tests
│   │   ├── prompts.js              #   System prompts (grounding wording, TD §9.2)
│   │   ├── research.js             #   F3 Live Web Scanner (3.6 Flash, url_context grounding)
│   │   ├── research.test.js        #   8 tests
│   │   ├── util.js                 #   Shared helpers (merge findings, sanitize filenames)
│   │   ├── writer.js               #   F4 doc writer (emits Mermaid .mmd)
│   │   └── writer.test.js          #   5 tests
│   ├── api.js                      # Model routing + callLLM + extractJson + error classify
│   ├── api.test.js                 # extractJson/callLLM/classifier tests
│   ├── app.js                      # UI orchestrator: Profiler → Research → Architect → Writer
│   ├── db.js                       # IndexedDB stores (ideas, drafts, settings)
│   ├── errors.js                   # AppError + error-kind mapping
│   ├── errors.test.js              # AppError classifier tests
│   └── file-writer.js              # Native FS API writes + <a download> fallback (ADR-003)
├── templates/                      # Starter AGENTS/PRD/TechDesign templates + tool adapters
│   ├── AGENTS.md                   # Starter master plan for new projects
│   ├── MEMORY.md                   # Starter session memory
│   ├── agent_docs/                 # Starter detail docs
│   └── tool-adapters/              # Rules/prompts for Copilot, Cursor, Codex, etc.
├── worker/                         # Cloudflare Worker LLM proxy (ADR-001)
│   ├── index.js                    # Origin check, model whitelist, quota-bucket stamp
│   ├── index.test.js               # 8 tests (CORS/origin/model/quota)
│   └── wrangler.toml               # Worker config + ALLOWED_ORIGIN var
├── AGENTS.md                       # Master plan for AI assistants (source of truth)
├── CHANGELOG.md                    # Release history (release-please)
├── CITATION.cff                    # How to cite ZarishDocs
├── .gitignore                      # Ignore rules
├── icon.svg                        # App icon + brand logo (manifest + SW)
├── index.html                      # App shell (entry point)
├── manifest.webmanifest            # PWA manifest
├── MEMORY.md                       # Session memory: decisions, known issues, active goal
├── package.json                    # Scripts + Prettier devDep
├── pnpm-lock.yaml                  # Pins Prettier (gitignored-override, committed)
├── .prettierignore                 # Prettier ignore rules
├── .prettierrc                     # Prettier config
├── README.md                       # Project overview (non-technical first) + setup
├── REPOSITORY-INVENTORY.md         # This file
├── REVIEW-CHECKLIST.md             # Definition of done (quality + security)
├── SETUP.md                        # Run + deploy everything (app, proxy, secrets, Pages)
├── sources.config.json             # Domain → official-source mapping (ADR-002)
├── styles.css                      # App styling (all views)
├── sw.js                           # Service Worker: offline shell + runtime cache
└── wrangler.toml                   # Root mirror of worker/wrangler.toml for CI deploys
```

## File details (by directory)

### Root

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `AGENTS.md` | 8,835 B | 68 | Master instructions for AI assistants: state, commands, constraints, roadmap |
| `README.md` | 6,556 B | 98 | Non-technical-first overview: what it is, what you get, how it works, dev notes |
| `SETUP.md` | 13,456 B | 286 | End-to-end setup: local run, Worker proxy + secret, Pages deploy, verification |
| `MEMORY.md` | 15,735 B | 68 | Session memory: active goal, ADRs, known issues, completed phases |
| `REVIEW-CHECKLIST.md` | 2,465 B | 35 | Definition of done: quality/security gates before marking work complete |
| `REPOSITORY-INVENTORY.md` | 11,167 B | 170 | This file — inventory of every tracked file |
| `CHANGELOG.md` | 1,026 B | 22 | Release history generated by release-please |
| `CITATION.cff` | 492 B | 18 | Citation metadata for the project |
| `index.html` | 4,055 B | 105 | Static app shell; loads `src/app.js`, registers the Service Worker |
| `styles.css` | 5,654 B | 378 | All view styling (idea input, progress, results, settings) |
| `sw.js` | 2,335 B | 89 | Service Worker: precache shell (`shell-*`), runtime cache (`runtime-*`), offline fallback |
| `manifest.webmanifest` | 403 B | 17 | PWA manifest: name, theme, start URL, icon |
| `icon.svg` | 1,181 B | 29 | Brand icon: ZarishSphere palette (navy→teal gradient, Z + node motif) |
| `sources.config.json` | 575 B | 14 | Domain → official-source bias rules (ADR-002) injected into grounding |
| `package.json` | 787 B | 22 | Scripts (`test`, `test:unit`, `serve`, `dev`, `check`, `format`, `format:check`), Prettier devDep |
| `pnpm-lock.yaml` | 431 B | 24 | Lockfile pinning `prettier@3.9.6` |
| `wrangler.toml` | 663 B | 13 | Root mirror of `worker/wrangler.toml` so Workers Builds CI can deploy from the root |
| `.gitignore` | 328 B | 29 | Ignore rules (node_modules, .wrangler, secrets, local tool state) |
| `.prettierrc` | 107 B | 7 | Prettier config: 100 cols, semis, double quotes, trailing commas |
| `.prettierignore` | 88 B | 6 | Prettier excludes: `*.md`, `docs/`, `agent_docs/`, node_modules, minified |

### `src/` — Browser application

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `app.js` | 7,854 B | 244 | Orchestrator: validates idea, runs 4 agents in sequence, renders progress, saves results |
| `api.js` | 3,790 B | 116 | `DEFAULT_MODELS` routing, `callLLM`, `extractJson`, `getProxyEndpoint`, `classifyFetchError`, `responseText` |
| `errors.js` | 1,861 B | 53 | `AppError` class + `kindForStatus`/`messageForKind` friendly error mapping |
| `db.js` | 2,851 B | 91 | IndexedDB: `ideas`, `drafts`, `settings` stores; save/load/clear helpers |
| `file-writer.js` | 1,930 B | 55 | `showSaveFilePicker` (Chromium) + `<a download>` fallback (ADR-003); `saveAllDocuments` |
| `api.test.js` | 2,267 B | 66 | extractJson/callLLM/classifier tests |
| `errors.test.js` | 1,224 B | 41 | 4 tests: AppError passthrough, network offline, status → kind |

### `src/agents/` — Agent service modules

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `prompts.js` | 3,828 B | 79 | System prompts for all 4 agents (grounding wording pinned, TD §9.2) |
| `util.js` | 1,115 B | 40 | Shared: `mergeFindings` (requirement→finding), `sanitizeFilename`, `extractMermaid` |
| `profiler.js` | 2,079 B | 58 | F2 Vibe Translator: `buildProfilePayload` (3.5 Flash-Lite, ungrounded), `parseProfileResponse`, `profileIdea` |
| `research.js` | 5,878 B | 161 | F3 Live Web Scanner: 3.6 Flash `url_context` grounding, citation rank/merge, `researchIdea` |
| `architect.js` | 2,097 B | 58 | F4 outline: `buildArchitectPayload` (3.5 Flash), `parseArchitectResponse`, `architectDocument` |
| `writer.js` | 3,186 B | 93 | F4 doc writer: full PRD+ADR+TechDesign, `extractMermaid` → `.mmd`, `writeDocuments` |
| `profiler.test.js` | 2,423 B | 67 | 6 tests: validateIdea, payload model, parse/throw, profileIdea shape |
| `research.test.js` | 9,209 B | 284 | 8 tests: payload guard/grounding/bias, rank, citations, parse/merge, researchIdea |
| `architect.test.js` | 2,470 B | 74 | 4 tests: outline defaults, parse, operation calls LLM |
| `writer.test.js` | 2,921 B | 88 | 5 tests: filename scheme, mermaid extraction, parse throw, writeDocuments |

### `worker/` — Cloudflare proxy (ADR-001)

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `index.js` | 4,591 B | 119 | Stateless proxy: Origin validation, POST-only, model whitelist (SSRF guard), `GEMINI_API_KEY` injection, `x-zarish-quota-bucket` stamp |
| `index.test.js` | 3,688 B | 90 | 8 tests: 403 origin, OPTIONS preflight, method guard, model whitelist, quota buckets, 429 re-emit, invalid JSON |
| `wrangler.toml` | 540 B | 12 | Worker config; `ALLOWED_ORIGIN` = loopback origins + live Pages origin |

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

### `.github/` — Community + automation

| File | Size | Lines | Purpose |
| --- | ---: | ---: | --- |
| `copilot-instructions.md` | 6,391 B | — | Copilot guidance: points to AGENTS.md, repo shape, commands, conventions |
| `CODE_OF_CONDUCT.md` | 1,315 B | — | Contributor expectations |
| `CODEOWNERS` | 803 B | — | Default owners for CI/lint paths |
| `CONTRIBUTING.md` | 2,045 B | — | How to contribute |
| `FAQ.md` | 1,510 B | — | Non-technical frequently asked questions |
| `FUNDING.yml` | 235 B | — | Sponsor links |
| `GOVERNANCE.md` | 1,804 B | — | Project governance |
| `labels.yml` | 809 B | — | Issue label definitions |
| `MCP-SETUP.md` | 1,773 B | — | MCP server setup for agent tools |
| `PULL_REQUEST_TEMPLATE.md` | 537 B | — | PR checklist |
| `SECURITY.md` | 1,419 B | — | Security policy |
| `SUPPORT.md` | 566 B | — | Where to get help |
| `workflows/` | — | — | CI/CD: `repo-lint.yml`, `release-please.yml`, `semantic-pr.yml`, `codeql.yml`, `scorecard.yml`, `osv-scanner.yml`, `pr-size-labeler.yml`, `greetings.yml`, `stale.yml` |

### Other directories

| Directory | Files | Purpose |
| --- | ---: | --- |
| `scripts/` | 1 (`validate.py`, 21,893 B) | Repo-lint contract checks: required files, forbidden names, citation/template rules |
| `.claude/` | 8 (6 skills + README) | `zsdocs-*` agent skills: PRD, research, tech design, build, agents, workflow |
| `templates/` | 45 | Starter `AGENTS.md`/`MEMORY.md`/`agent_docs` + `tool-adapters/` for Copilot, Cursor, Codex, Windsurf, Gemini CLI, Lovable, OpenCode, Antigravity |
| `examples/` | 6 | `reddit-to-ai/` sample: full output of the workflow on one idea |

## Largest files

| File | Size | Lines |
| --- | ---: | ---: |
| `scripts/validate.py` | 21,893 B | 515 |
| `docs/TechDesign-ZarishDocs-MVP.md` | 27,003 B | 394 |
| `SETUP.md` | 13,456 B | 286 |
| `docs/research-ZarishDocs.md` | 19,240 B | 139 |
| `docs/PRD-ZarishDocs-MVP.md` | 15,612 B | 234 |
| `MEMORY.md` | 15,735 B | 68 |

## Notables

- **Only server-side runtime surface:** `worker/index.js` (stateless; never grow into an app server). Its root `wrangler.toml` mirror exists only so the Workers Builds CI integration can deploy from the repo root; keep the two configs in sync.
- **Zero runtime dependencies**; the only dependency is `prettier` (dev), pinned via committed `pnpm-lock.yaml`.
- **Deployed:** Worker proxy live at `https://zarishdocs-proxy.zarishsphere.workers.dev` (`GEMINI_API_KEY` secret set); Pages app live at `https://zarishdocs.pages.dev` (deployed from the repo root). `PROXY_ENDPOINT` (`src/api.js`) and `ALLOWED_ORIGIN` (`worker/wrangler.toml`) hold the real values. Still open: browser verification pass per `REVIEW-CHECKLIST.md` and the live E2E self-test.
- **Brand:** `icon.svg` and the CSS palette are drawn from the ZarishSphere banner colors — navy (`#081826` → `#0B2540` → `#0F3B44`), teal `#12B8A3`/`#0F9D8C`, and gold `#F2B705`/`#E0A400`.
