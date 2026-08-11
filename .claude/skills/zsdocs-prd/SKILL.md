---
name: zsdocs-prd
description: Create a Product Requirements Document (PRD) for your MVP. Use when the user wants to define product requirements, create a PRD, or says "help me write requirements", "create PRD", or "define my product".
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion
---

# ZarishDocs PRD Generator

You are helping the user create a Product Requirements Document (PRD). This is Step 2 of the ZarishDocs workflow.

## Your Role

Guide the user through defining WHAT they're building, WHO it's for, and WHY it matters. Ask questions one at a time.

## Session Continuity

1. Reuse prior research context instead of restarting in an empty chat.
2. Ask for a compact handoff summary if the user restarted sessions.
3. Preserve key constraints and decisions in a short recap before generating the PRD.

## Naming Policy

Use model family names in examples and recommendations unless the user explicitly asks for exact version names.

## Step 1: Check for Research

First, check if research exists:

1. Look for `docs/research-*.md` (or `*.txt` for backward compatibility) in the project
2. If found, read it and reference insights during Q&A
3. If not found, proceed without it

**Handoff Context block? Read it first.** If the research document ends with a `## Handoff Context` block, pre-fill the app name, user level, platform, budget, and timeline from it, confirm them in one line ("Got it — level B, web app, ~$50/mo, 4 weeks — right?"), and skip the A/B/C question in Step 2 unless the block is missing or unclear. No Handoff Context block? Just ask — older documents won't have it.

Ask the user:
> Do you have research findings from Step 1? If so, I'll reference them. If not, we can still create a great PRD.

## Step 2: Determine Technical Level

Ask:
> **What's your technical background?**
> - **A) Vibe-coder** — Great ideas, limited coding experience
> - **B) Developer** — Experienced programmer
> - **C) Somewhere in between** — Some coding knowledge, still learning

## Step 3: Run the Question Bank

Ask the questions ONE AT A TIME and wait for responses before proceeding. Do NOT generate the PRD until all essential answers are collected.

Start with the shared initial questions for ALL users:

1. What is your product, in one plain sentence?
2. Who is it for — describe the primary user?
3. What problem does it solve, and why does that matter now?

Then follow the path matching the user's level:

- **Level A (Vibe-coder):**
  1. What does the user need to be able to do in the first version?
  2. What absolutely must NOT be in the first version (the tempting extras)?
  3. How will you know it works — what does success look like to you?
  4. What should it look and feel like (simple, friendly, professional)?
  5. Any tools or platforms you already use that it should work with?
  6. What's your budget for tools/hosting per month?
  7. What's your timeline to a working version?

- **Level B (Developer):**
  1. What are the core user flows — can you walk through the main path end to end?
  2. What user roles and permissions exist, if any?
  3. Which integrations and external services are required vs. nice-to-have?
  4. What are the non-functional requirements (perf, uptime, security, privacy, compliance)?
  5. How will success be measured — what metric and what target?
  6. What is the MVP boundary — what's explicitly deferred to v2?
  7. What data does the product store, and what are the privacy implications?

- **Level C (In Between):**
  1. What are the 3-5 features a first version must have?
  2. What are the "nice to have later" features we should leave out of v1?
  3. How will you know the product is working — what metric matters most?
  4. Who else uses it, besides you — do different people need different things?
  5. What's your monthly budget for tools and hosting?
  6. What's your timeline, and what could delay you?

## Step 4: Verification Echo

After ALL questions, summarize:

> **Let me confirm I understand your product:**
>
> **Product:** [Name] - [One-line description]
> **Target User:** [Primary persona]
> **Problem:** [Core problem]
> **Must-Have Features:**
> 1. [Feature 1]
> 2. [Feature 2]
> 3. [Feature 3]
> **Success Metric:** [Primary metric and target]
> **Timeline:** [Launch target]
> **Budget:** [Constraints]
>
> Is this accurate? Should I adjust anything before creating your PRD?

## Step 5: Generate PRD

After confirmation, generate the PRD document tailored to their level.

### PRD Structure

Use this canonical structure — every section, in order, with no renames:

- **Product Overview** — what it is, the problem, why now
- **Target Users** — personas, their needs and pain points
- **User Stories** — one primary story plus feature-level stories
- **Must-Have Features** — the MVP scope (3-5 features, concrete)
- **Nice-to-Have Features** — deferred, listed with rationale
- **## Out of Scope (Not in MVP)** — exactly this heading, for what's deliberately excluded
- **Success Metrics** — the primary metric and target
- **UI/UX Direction** — look and feel, key screens
- **Open Questions** — anything unresolved, as TBD
- **## Handoff Context** — always last: `Stage: prd`, carrying app name, user level, platform, budget, timeline, and source files forward

Replace every [bracketed placeholder]; anything genuinely unknown goes in Open Questions as TBD.

Write the PRD to `docs/PRD-[AppName]-MVP.md`.

## After Completion

Tell the user:

> Your PRD is saved to `docs/PRD-[AppName]-MVP.md`.
>
> **Self-Verification:**
> - Core problem clearly defined?
> - Target user well described?
> - 3-5 must-have features listed?
> - Success metrics defined?
>
> **Next Step:** Run `/zsdocs-techdesign` to create your Technical Design Document.
