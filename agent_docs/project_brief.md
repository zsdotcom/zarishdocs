# Project Brief

- **Product vision:** "From vibe to blueprint" — a private, free, AI-researched tech-spec generator that writes cited PRDs, ADRs, and Tech Designs straight to the user's own folder.
- **Target Audience:** Non-technical founders, hobbyists, and vibe-coders ("Maya") who don't know what an API, ADR, or database migration is — and shouldn't have to.

## Conventions
- **Naming:** kebab-case for files (source and generated docs); PascalCase for classes/components; camelCase for functions/variables; UPPER_SNAKE_CASE for constants and env vars.
- **File Structure:** Layered — `src/` holds the static app (HTML/CSS/JS), agent service modules are separate files, `sources.config.json` holds domain-sourcing rules, the Worker proxy is one portable file. Generated docs go into the user's chosen folder using the numbered ZUSS-aligned layout (`001-research-`, `002-prd-`, `003-tech-design-`, `004-adr-`).

## Key Principles
- Ship the simplest possible solution that solves the user story.
- Plain language first — the UI must never show jargon like "Profiler Agent" to the user; agents are internal.
- Privacy is a feature: no telemetry, no accounts, no cloud storage. The only outbound call is the LLM request.
- Prefer native browser APIs over libraries (`browser-fs-access` is the one sanctioned exception). No framework unless explicitly approved.
- Every technical claim in generated docs must be cited against a live source with an access date — never rely on model memory for versions.
