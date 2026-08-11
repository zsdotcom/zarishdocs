# Product Requirements Document: ZarishDocs MVP

## Product Overview

**App Name:** ZarishDocs
**Tagline:** From vibe to blueprint — private, free, AI-researched tech specs, written straight to your own folder.
**Launch Goal:** Prove the concept works: generate one complete, error-free PRD + ADR + Tech Design set for a real project idea, entirely in-browser, at zero cost. Stretch goal: 5–10 other vibe-coders try it and each successfully export a usable document set.
**Target Launch:** 3 days (MVP tier only — extended feature set is explicitly post-MVP, see Out of Scope)

## Who It's For

### Primary User: Maya, the Non-Technical Founder
A non-technical founder, hobbyist, or creative thinker with a real app idea and zero coding background. She doesn't know what an API, an ADR, or a database migration is — and shouldn't have to.

**Their Current Pain:**
- Raw AI chat (ChatGPT/Claude) gives long, unstructured prose with no files, no citation discipline, and no guarantee the tech advice is current
- Tools that do produce real code (Bolt.new, Lovable, Cursor) assume she already knows what she's building — there's no step that turns a vague idea into a rigorous spec first
- Every existing "AI PRD generator" requires an account, stores her idea in someone else's cloud, and produces one document, not a linked set

**What They Need:**
- A private space to describe an idea in plain, casual language
- Confidence that recommended tech stacks and versions are real and current, not hallucinated
- A clean, linked set of files she can hand directly to a coding tool without further translation

### Example User Story
"Meet Maya, a nurse who wants an app to help fellow night-shift workers swap shifts. She's never coded and doesn't know what 'backend' means. Every time she tries ChatGPT, she gets a wall of text she can't use. She opens ZarishDocs, picks a folder on her laptop, and types her idea in her own words. Within minutes, ZarishDocs researches shift-swap apps, verifies current free-tier tools, and writes a PRD, ADR, and Tech Design straight into her folder — cited and current. She hands the PRD to Bolt.new and starts building that afternoon."

## The Problem We're Solving

Turning a rough idea into a build-ready technical spec currently requires either real technical knowledge or a paid, cloud-hosted tool. Non-technical idea-people are left with two bad options: unstructured AI chat that hallucinates outdated tech and produces no organized files, or complex multi-agent frameworks that require terminal installs and coding literacy. Now is the right time to close this gap specifically because three things became true together in 2026: browser-native local file writing is stable in Chromium, client-side ML makes real semantic search possible without a server, and free-tier LLM APIs plus free serverless edge functions make a genuinely zero-cost pipeline viable.

**Why Existing Solutions Fall Short:**
- **ChatGPT / Claude (raw chat):** No live research, no file output, no folder organization, and it happily invents outdated version numbers
- **Bolt.new / Lovable / Cursor:** Excellent at writing code, but assume the user already knows what to build — no research-to-spec phase
- **CrewAI / AutoGen:** Powerful multi-agent research, but require local terminal installs, coding knowledge, and usually paid cloud APIs
- **ChatPRD, Miro AI PRD, Figma Make, and similar SaaS PRD tools:** Require signup, store the idea in the cloud, produce a single document, and don't do live, cited, domain-aware research first

## User Journey

### Discovery → First Use → Success

1. **Discovery Phase**
   - How they find us: word of mouth among vibe-coder communities, direct link sharing (no marketing budget for MVP)
   - What catches their attention: "no signup, no install, your files never leave your computer"
   - Decision trigger: seeing a real example output (a generated PRD) before committing any time

2. **Onboarding (First 5 Minutes)**
   - Land on: single-page dashboard with a plain-language explanation and a "Choose your folder" button
   - First action: pick a local folder (or accept the download-fallback if on Safari/mobile)
   - Quick win: type the idea in a chat box and see the Profiler Agent immediately reflect it back in structured form

3. **Core Usage Loop**
   - Trigger: user has a new idea, or wants to revise an existing one
   - Action: describe the idea conversationally
   - Reward: watch cited research happen live, then receive organized, linked documents
   - Investment: the growing local folder of research-backed blueprints becomes their own portfolio of validated ideas

4. **Success Moment**
   - "Aha!" moment: opening the generated PRD and realizing it's actually usable — accurate versions, real citations, clean structure
   - Share trigger: handing the PRD straight to Bolt.new/Lovable and having it work without further editing

## MVP Features

### Must Have for Launch

#### 1. One-Click Local Folder Access
- **What:** A single button lets the user pick a folder on their computer where every generated document is written directly, using the File System Access API with an automatic download-based fallback on unsupported browsers
- **User Story:** As a non-technical user, I want to pick a folder once so that my documents save automatically without me manually downloading each file
- **Success Criteria:**
  - [ ] Folder picker works on Chrome/Edge/Opera desktop with direct writes
  - [ ] Safari/Firefox/mobile users get a clear, working "download as files" fallback instead of a silent failure
- **Priority:** P0 (Critical)

#### 2. The Vibe Translator (Profiler Agent)
- **What:** Accepts messy, casual, non-technical text and maps it into structured research requirements without ever showing the user jargon
- **User Story:** As a non-technical user, I want to describe my idea however I naturally would so that I don't need to learn technical vocabulary first
- **Success Criteria:**
  - [ ] Handles free-form, conversational input without requiring a specific format
  - [ ] Produces a structured requirement set the Research Agent can act on
- **Priority:** P0 (Critical)

#### 3. The Live Web Scanner (Research Agent)
- **What:** Performs live, cited research before any document is written, prioritizing official sources per domain (e.g., GitHub's own docs for GitHub-related topics, Cloudflare's own docs for Cloudflare topics) and verifying current stable versions rather than relying on model memory
- **User Story:** As a non-technical user, I want the tech recommendations to be real and current so that I don't waste time building on outdated advice
- **Success Criteria:**
  - [ ] Every technical claim in the output is tied to a live source with an access date
  - [ ] Domain-specific topics pull from official docs for that domain, not generic aggregator sites
- **Priority:** P0 (Critical)

#### 4. The Auto-Writer (Architect & Writer Agents)
- **What:** Combines the research into a clean, linked set of Markdown files (PRD, ADR, Tech Design) written into the user's chosen folder, using Mermaid.js for any diagrams
- **User Story:** As a non-technical user, I want a complete, organized document set — not just one file — so that I have everything a coding tool needs to start building
- **Success Criteria:**
  - [ ] Produces at least PRD + ADR + Tech Design as separate, cross-referenced files
  - [ ] Diagrams render correctly as Mermaid syntax with no manual fixing needed
- **Priority:** P0 (Critical)

### Nice to Have (If Time Allows)
- **Theme toggle**: Light / dark / high-contrast switch for comfortable reading
- **Lightweight glossary tooltips**: Hover definitions for any unavoidable technical term that appears in generated output

## Out of Scope (Not in MVP)
- **Version history / undo for generated docs**: Will add after the core generation pipeline is proven stable
- **Citation audit trail (`/sources/` folder)**: Will add after MVP validates that live-cited research works reliably end to end
- **Staleness re-check trigger**: Will add once there's a real corpus of generated docs worth re-verifying
- **Portable project export/import (single JSON bundle)**: Will add once cross-device use is actually needed
- **Self-healing maintenance script**: Will add once the app has real usage patterns to monitor
- **WebMCP tool exposure**: Deferred — the WebMCP spec itself is still pre-standard as of this research

*Why we're waiting: keeps the 3-day MVP focused on proving the core research-to-blueprint pipeline works at all, before adding polish.*

## How We'll Know It's Working

> **Open tension, flagged rather than silently resolved:** the "no telemetry" non-negotiable conflicts with a generic "track basic analytics" goal. The metrics below are deliberately **local-only and self-checked** — nothing is transmitted anywhere — consistent with the privacy-first constraint.

### Launch Success Metrics (First 30 Days)
| Metric | Target | Measure |
|--------|--------|---------|
| Successful end-to-end generations | ≥1 real, usable document set produced for an actual project idea | Manual self-check — did the output work without hand-editing? |
| Local session count (optional, opt-in) | Informational only | IndexedDB counter, never transmitted, viewable only by the user |

### Growth Metrics (Months 2-3)
| Metric | Target | Measure |
|--------|--------|---------|
| External testers who complete a generation | 5-10 people | Informal, direct feedback (no analytics platform) |

## Look & Feel

**Design Vibe:** Clean, minimal, trustworthy, quietly technical

**Visual Principles:**
1. No dark patterns, no forced signup screens, no fake urgency — the UI should feel like a calm, private workspace
2. Plain language first, technical terms only shown with an optional hover explanation
3. Generous whitespace and a simple layout that doesn't look "techy" or intimidating to a first-time non-coder

**Key Screens/Pages:**
1. **Dashboard / Folder Setup**: One-time folder selection, plain-language explanation of what the app does
2. **Idea Chat**: Where the user describes their idea conversationally to the Profiler Agent
3. **Research & Generation Progress**: Shows live research happening with citations appearing as they're found
4. **Output Review**: Rendered Markdown + diagrams shown before/after saving to the local folder

### Simple Wireframe
```
[Dashboard]
┌─────────────────────────┐
│   ZarishDocs — private  │
│   research lab          │
├─────────────────────────┤
│  [Choose your folder]   │
│                         │
│  "Describe your idea…"  │
│  [ text box ]           │
├─────────────────────────┤
│  Research progress →    │
│  Generated files →      │
└─────────────────────────┘
```

## Technical Considerations

**Platform:** Web (browser-only, no install)
**Responsive:** Yes for the UI itself; true local-folder writing is Chromium desktop only (Chrome/Edge/Opera) — Safari/Firefox/mobile get a working download-based fallback, communicated plainly in-app, not hidden
**Performance:** Page load < 3 seconds for the core app shell; the ML embedding model (~23MB) loads lazily on first use and is cached afterward, not counted against the shell budget
**Accessibility:** WCAG 2.1 AA minimum
**Security/Privacy:** No telemetry, no cloud storage, no account. The only data leaving the browser is the LLM call itself, routed through one small free serverless proxy function (Cloudflare Worker) rather than an ongoing server — this should be stated plainly to the user, not implied to be "no backend at all"
**Scalability:** Not applicable in the traditional sense — this is a single-user, local-first tool with no shared backend to scale

## Quality Standards

**What This App Will NOT Accept:**
- Placeholder content in production ("Lorem ipsum", sample images)
- Broken features — everything listed works or isn't included
- Skipping mobile/Safari fallback testing before launch
- Ignoring accessibility basics
- Silent failures on unsupported browsers — the fallback must be visible and functional, not a dead end

*These standards will be enforced by the AI coding assistant during the build.*

## Budget & Constraints

**Development Budget:** $0
**Monthly Operating:** $0 (Cloudflare Pages + Workers free tier; Gemini free tier for the agents)
**Timeline:** 3 days to MVP
**Team:** Solo builder

## Open Questions & Assumptions
- **Open question:** Which LLM-proxy architecture to build first — the recommended Cloudflare Worker proxy, or the simpler user-supplied-API-key approach? This needs to be decided in the Tech Design step before build begins.
- **Open question:** Exact domain-to-official-source mapping rules for the Research Agent (which official docs to prioritize for which topic categories) — to be detailed in Tech Design.
- **Assumption:** The "no telemetry" constraint means success metrics for MVP are self-reported/manual rather than tracked — accepted as correct for a privacy-first, zero-account tool.
- **Assumption:** 3 days covers the four P0 features only; the extended feature list is explicitly out of scope for this timeline.

## Launch Strategy (Brief)

**Soft Launch:** None — this MVP is a personal proof-of-concept first, not a public launch
**Target Users:** 1 (self), optionally a handful of informal testers after the core pipeline works
**Feedback Plan:** Direct, informal conversation — no analytics platform, consistent with privacy-first design
**Iteration Cycle:** As needed, no fixed cadence for MVP

## Definition of Done for MVP

The MVP is ready to call "working" when:
- [ ] All four P0 features are functional
- [ ] Basic error handling works (failed research call, unsupported browser, etc. all fail gracefully with a clear message)
- [ ] Folder-write path works on Chromium desktop; download fallback works everywhere else
- [ ] One complete user journey works end-to-end: idea in → cited research → PRD+ADR+TechDesign out
- [ ] Local-only session confirmation works (no external analytics — see Open Questions)
- [ ] Self-test with a real idea is complete
- [ ] Deployment to Cloudflare Pages (+ Worker proxy, if that path is chosen) is done

## Next Steps

After this PRD is approved:
1. Create Technical Design Document (Part 3) — resolves the two open architecture questions above
2. Set up development environment
3. Build MVP with AI assistance
4. Self-test with a real idea end-to-end
5. Optionally share with a few testers

---
*Document created: August 11, 2026*
*Status: Draft — Ready for Technical Design*

---
## Handoff Context
<!-- Machine-readable summary for the next workflow step. Do not delete; the next prompt in the workflow reads this block. -->
- Stage: prd
- App name: ZarishDocs
- User level: A (vibe coder)
- Target platform: web
- Budget: $0 (one free Cloudflare Worker proxy function required for LLM calls; not a paid dependency)
- Timeline: 3 days for MVP tier; extended feature set is post-MVP
- Source files: research-ZarishDocs.md → PRD-ZarishDocs-MVP.md
- Carried-forward open decisions for Tech Design: (1) Cloudflare Worker proxy vs. user-supplied API key architecture, (2) domain-to-official-source mapping rules for the Research Agent, (3) Chromium-only local file access needs an explicit, visible fallback UX for Safari/Firefox/mobile
---
