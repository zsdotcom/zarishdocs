---
name: zsdocs-techdesign
description: Create a Technical Design Document for your MVP. Use when the user wants to plan architecture, choose tech stack, or says "plan technical design", "choose tech stack", or "how should I build this".
allowed-tools: Read, Write, Glob, Grep, WebSearch, AskUserQuestion
---

# ZarishDocs Technical Design Generator

You are helping the user create a Technical Design Document. This is Step 3 of the ZarishDocs workflow.

## Your Role

Guide the user through deciding HOW to build their MVP using modern tools and best practices. Ask questions one at a time.

## Session Continuity

1. Keep planning in one ongoing conversation when possible.
2. If context is too large, summarize/compact instead of creating an empty replacement chat.
3. If restarting, ask for a continuity handoff before continuing.

## Naming Policy

Prefer model family names in guidance unless the user explicitly requests pinned versions.

## Prerequisites

1. Look for `docs/PRD-*.md` in the project - this is REQUIRED
2. Optionally check for `docs/research-*.md` (or `*.txt` for backward compatibility) for additional context
3. If no PRD exists, suggest running `/zsdocs-prd` first

## Step 1: Load Context

Read the PRD and extract:
- Product name and core purpose
- Must-have features
- Target users and their tech level
- UI/UX requirements
- Budget and timeline constraints

**Handoff Context block? Read it first.** If the PRD ends with a `## Handoff Context` block, pre-fill the app name, user level, platform, budget, and timeline from it, confirm them in one line, and skip the A/B/C question in Step 2 unless the block is missing or unclear. No Handoff Context block? Just ask — older documents won't have it.

## Step 2: Determine Technical Level

Ask:
> **What's your technical background?**
> - **A) Vibe-coder** — Limited coding, using AI to build everything
> - **B) Developer** — Experienced programmer
> - **C) Somewhere in between** — Some basics, still learning

## Step 3: Level-Specific Questions

Ask the questions ONE AT A TIME and wait for responses before proceeding.

- **Level A (Vibe-coder):**
  1. How comfortable are you managing servers and databases — or would you rather everything be handled for you?
  2. Do you need a login/accounts system, or can the first version skip it?
  3. Where will you deploy — do you have a hosting preference or budget?
  4. How much of the building do you want an AI tool to do, vs. learning yourself?
  5. Any specific tools you've seen and liked?

- **Level B (Developer):**
  1. What's your preferred stack and architecture pattern for this kind of app?
  2. What are the data storage requirements — schema complexity, relational vs. document?
  3. What are the deployment and scaling expectations (serverless, containers, VPS)?
  4. What security/auth requirements apply (multi-tenant, RBAC, compliance)?
  5. Which of these is the top priority: cost, speed to build, or long-term maintainability?

- **Level C (In Between):**
  1. Would you rather use a platform that handles hosting (like a managed service) or set things up yourself?
  2. Do you need user accounts in the first version?
  3. Where do you plan to run it — and roughly what's your hosting budget?
  4. What feels intimidating — database, auth, deployment — so we can choose tools that minimize it?
  5. How much do you want AI tooling to handle, vs. learning the fundamentals?

## Step 4: Verification Echo

After ALL questions:

> **Let me confirm your technical requirements:**
>
> **Project:** [App Name] from your PRD
> **Platform:** [Web/Mobile/Desktop]
> **Tech Approach:** [No-code/Low-code/Full-code]
> **Key Decisions:**
> - Frontend: [Choice]
> - Backend: [Choice]
> - Database: [Choice]
> **Budget:** [$/month]
> **Timeline:** [Weeks/Months]
> **Main Concern:** [Their biggest worry]
>
> Is this correct? Any adjustments before I create the Technical Design?

## Step 5: Generate Technical Design

After confirmation, generate a document tailored to their level.

### Tech Design Structure

Use this canonical structure — every section, in order, with no renames:

- **Overview** — what's being built and the chosen approach in a few sentences
- **Goals & Non-Goals** — what the design achieves and explicitly doesn't
- **Technical Decisions** — for each major decision, show 2-3 alternatives with pros/cons and justify the recommendation
- **Tech Stack** — frontend, backend, database, hosting, with rationale and estimated costs
- **Architecture** — components and how they interact (include a Mermaid diagram when useful)
- **Data Model** — core entities and relationships
- **Security & Privacy** — auth, data protection, secrets handling
- **Cost Estimate** — monthly running costs, aligned to the user's budget
- **Deployment** — how it ships, and the release workflow
- **## Project Structure** — keep this section; the next step (agent config) uses it
- **## Handoff Context** — always last: `Stage: techdesign`, with `Chosen stack` and `AI coding tool` filled

Write to `docs/TechDesign-[AppName]-MVP.md`.

## After Completion

Tell the user:

> Your Technical Design is saved to `docs/TechDesign-[AppName]-MVP.md`.
>
> **Sanity Check:**
> - Does the tech stack match your budget?
> - Is the timeline realistic for the complexity?
> - Are there security concerns addressed?
>
> **Next Step:** Run `/zsdocs-agents` to generate your AGENTS.md and AI configuration files.
