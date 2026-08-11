# /zsdocs-prd — Step 2: PRD

Step 2 of the ZarishDocs workflow: define WHAT to build, WHO it's for, and WHY it matters.

The essentials (self-contained — no external files needed):
- Check `docs/research-*.md` first and reuse it (especially its `## Handoff Context` block) instead of re-asking.
- Ask the shared initial questions (product in one sentence, primary user, problem solved and why now), then the user's level path (A/B/C) ONE question at a time.
- Echo back a verification summary and get a "yes" before generating.
- Use the canonical PRD structure, in order, with no renames: Product Overview, Target Users, User Stories, Must-Have Features, Nice-to-Have Features, `## Out of Scope (Not in MVP)`, Success Metrics, UI/UX Direction, Open Questions.
- End with a filled `## Handoff Context` block (`Stage: prd`).
- Write the PRD to `docs/PRD-[AppName]-MVP.md`.

Done? Point the user to the next stage: `/zsdocs-techdesign`.
