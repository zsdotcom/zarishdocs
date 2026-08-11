# /zsdocs-agents — Step 4: Agent-file setup

Step 4 of the ZarishDocs workflow: generate `AGENTS.md` + tool configs so the AI builder stays on track.

The essentials (self-contained — no external files needed):
- Requires `docs/PRD-*.md` and `docs/TechDesign-*.md` — if either is missing, route the user back a stage.
- Instantiate the canonical templates into the project root — fill every `[REPLACE:]` / `[CHOOSE:]` placeholder from the PRD and Tech Design; never rewrite the templates:
  - `templates/AGENTS.md` → `AGENTS.md`
  - `templates/MEMORY.md` → `MEMORY.md`
  - `templates/REVIEW-CHECKLIST.md` → `REVIEW-CHECKLIST.md`
  - `templates/agent_docs/*.md` → `agent_docs/`
- Add the thin tool adapter from `templates/tool-adapters/` for the user's tool (CLAUDE.md, Cursor rule, Antigravity rule, or just point Codex at `AGENTS.md`).

Done? Point the user to the final stage: `/zsdocs-build`.
