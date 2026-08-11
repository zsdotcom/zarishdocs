# Product Requirements

> Filled from `docs/PRD-ZarishDocs-MVP.md`. This is the agent's quick-reference version — keep it short and current.

## Product Summary
- **Product:** ZarishDocs
- **One-liner:** A browser-only, zero-cost AI research lab that turns a plain-language app idea into a cited, build-ready document set (PRD + ADR + Tech Design) written straight to the user's own folder.
- **Target users:** Non-technical founders, hobbyists, and vibe-coders (persona "Maya").

## User Stories
- As a non-technical user, I want to pick a folder once so that my documents save automatically without me manually downloading each file.
- As a non-technical user, I want to describe my idea however I naturally would so that I don't need to learn technical vocabulary first.
- As a non-technical user, I want the tech recommendations to be real and current so that I don't waste time building on outdated advice.
- As a non-technical user, I want a complete, organized document set — not just one file — so that I have everything a coding tool needs to start building.

## Feature List (MoSCoW)

### Must Have (P0 — all four required for launch)
- [ ] One-Click Local Folder Access — `browser-fs-access` direct writes on Chrome/Edge/Opera desktop; clear download fallback on Safari/Firefox/mobile, surfaced on first load
- [ ] The Vibe Translator (Profiler Agent) — casual text → structured research requirements, no jargon shown
- [ ] The Live Web Scanner (Research Agent) — grounded, official-domain-first research with version verification and live citations
- [ ] The Auto-Writer (Architect & Writer Agents) — linked PRD + ADR + Tech Design Markdown files with Mermaid diagrams

### Should Have
- [ ] Advanced settings panel — user-supplied Gemini API key (Tech Design recommends treating this as nice-to-have for MVP; the proxy path alone satisfies P0)

### Could Have
- [ ] Theme toggle (light / dark / high-contrast)
- [ ] Lightweight glossary tooltips (hover definitions for unavoidable technical terms)

### Won't Have (this version)
- Version history / undo for generated docs
- Citation audit trail (`/sources/` folder)
- Staleness re-check trigger
- Portable project export/import (single JSON bundle)
- Self-healing maintenance script
- WebMCP tool exposure (spec still pre-standard)

## Success Metrics
- ≥1 real, usable document set produced end-to-end for an actual project idea (manual self-check — output works without hand-editing)
- 5–10 external testers complete a generation (months 2–3, informal)
- Optional local-only session counter in IndexedDB — informational, never transmitted

## Out of Scope
Anything in "Won't Have" above must NOT be built, even if requested mid-build — the 3-day MVP is the four P0 features plus basic error handling only.
