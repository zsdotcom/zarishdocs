---
description: ZarishDocs step 3 — technical design and stack choice
---

# /zsdocs-techdesign — Step 3: Tech design

Step 3 of the ZarishDocs workflow: plan HOW to build it — stack, architecture, costs, deployment.

The essentials (self-contained — no external files needed):
- Requires `docs/PRD-*.md` — if it's missing, route the user to `/zsdocs-prd` first.
- Ask the user's level path (A/B/C) ONE question at a time: platform, hosting preference, auth needed, budget, biggest worry, and how much AI tooling vs. learning.
- Echo back a verification summary and get a "yes" before generating.
- Use the canonical Tech Design structure: Overview, Goals & Non-Goals, Technical Decisions (2-3 alternatives with pros/cons per decision), Tech Stack, Architecture, Data Model, Security & Privacy, Cost Estimate, Deployment, `## Project Structure`.
- End with a filled `## Handoff Context` block (`Stage: techdesign`, `Chosen stack` + `AI coding tool`).
- Write the doc to `docs/TechDesign-[AppName]-MVP.md`.

Done? Point the user to the next stage: `/zsdocs-agents`.
