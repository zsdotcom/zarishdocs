---
description: ZarishDocs workflow router — 5 stages from idea to MVP
---

# /zsdocs-workflow — the 5-stage router

The ZarishDocs workflow turns an app idea into a working MVP in 5 stages. Your job: figure out where the user is and route them to the right stage.

1. Check which of these exist: `docs/research-*.md`, `docs/PRD-*.md`, `docs/TechDesign-*.md`, `AGENTS.md` + `agent_docs/`.
2. The first missing piece is the next stage:

| Stage | Command |
|---|---|
| 1. Research | `/zsdocs-research` |
| 2. PRD | `/zsdocs-prd` |
| 3. Tech design | `/zsdocs-techdesign` |
| 4. Agent setup | `/zsdocs-agents` |
| 5. Build | `/zsdocs-build` |

Nothing exists yet? Welcome the user and start at stage 1. Everything exists? Go straight to stage 5.

Reuse `docs/` documents at every stage — each ends with a `## Handoff Context` block carrying the user's level, app name, platform, budget, and timeline, so never re-ask what a doc already answers.
