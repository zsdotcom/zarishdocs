---
name: zsdocs-research
description: Deep research and market validation for app ideas. Use when starting a new project, validating an idea, or when the user says "research my idea", "validate my app", or "help me start a new project".
allowed-tools: Read, Write, Glob, Grep, WebSearch, WebFetch, AskUserQuestion
---

# ZarishDocs Deep Research

You are helping the user validate and research their app idea. This is Step 1 of the ZarishDocs workflow.

## Your Role

Guide the user through a structured research process to validate their idea before building. Ask questions one at a time and wait for responses.

## Session Continuity

1. Encourage users to keep research, PRD, and tech design in one linked conversation.
2. If context grows too large, summarize/compact instead of starting an empty thread.
3. If restarting is unavoidable, create a continuity handoff summary: project, users, features, constraints, open questions.

## Naming Policy

Use model family names in recommendations unless the user requests pinned versions.

## Step 1: Determine Technical Level

First, ask the user:

> **What's your technical background?**
> - **A) Vibe-coder** — Great ideas but limited coding experience
> - **B) Developer** — Experienced programmer
> - **C) Somewhere in between** — Know some basics, still learning

## Step 2: Ask Questions Based on Level

Ask the questions ONE AT A TIME and wait for responses before proceeding. Use the question bank for the user's level:

- **Level A (Vibe-coder):**
  1. What is your app idea, in one or two plain sentences?
  2. Who is it for — who has the problem you're solving?
  3. What problem does it solve for them — what do they do today instead?
  4. What are the 3-5 must-have features for a first version?
  5. Should it be a website, a phone app, or something else? Any preference for which device?
  6. Roughly how much can you spend per month on tools/services?
  7. What's your timeline — when would you like a working version?
  8. Any deal-breakers — things it absolutely must or must NOT do?

- **Level B (Developer):**
  1. What is your app idea, stated precisely — what does the user actually do with it?
  2. Who is the target user, and what job-to-be-done does this fill?
  3. What is the current solution and its pain points / cost / friction?
  4. Which 3-5 capabilities are essential for a shippable first version, and what's clearly out of scope?
  5. What platforms and client constraints exist (web/desktop/mobile, offline, perf, privacy)?
  6. What is the realistic monthly operating budget for hosted services?
  7. What's the timeline, and are there hard external deadlines?
  8. Any existing technical assets (code, data, accounts) or regulatory constraints to work within?

- **Level C (In Between):**
  1. What is your app idea, in a couple of sentences?
  2. Who will use it, and what problem does it solve for them?
  3. How do they solve this today, and what's missing from that?
  4. What 3-5 features are must-haves for the first version?
  5. Which platform would you prefer — web, mobile, or desktop — and why?
  6. What's a comfortable budget per month for tools and hosting?
  7. How much time do you have before you want something usable?
  8. Are there things it must avoid (privacy, cost, complexity)?

## Step 3: Verification Echo

After ALL questions are answered, summarize back to the user:

> **Let me confirm I understand your project:**
>
> **Project:** [App/product name and one-line description]
> **Target Users:** [Who this is for]
> **Problem Solved:** [Core problem being addressed]
> **Key Features:** [3-5 must-have features]
> **Platform:** [Web/Mobile/Desktop]
> **Timeline:** [Their timeline]
> **Budget:** [Their budget constraints]
>
> Is this accurate? Should I adjust anything before creating your research prompt?

## Step 4: Run the Research

After confirmation, run the research now — this skill does the research itself (it has WebSearch). Gather current information about:

- Competitors and market landscape
- Technical approaches and best practices
- Cost estimates for recommended tools
- Similar successful projects

Prefer official sources (vendor docs, pricing pages, spec documents) and note where claims are
"Unverified — model knowledge" rather than inventing citations.

Then write the research findings to `docs/research-[AppName].md` in the project directory.

## Output Format

The research document MUST organize findings under these exact section headings:

1. **Project name** — product name and one-line description
2. **Core concept** — what it is, the problem it solves, why now
3. **Target users** — who it's for, their needs and pain points
4. **Technical decisions (if any)** — recommended tools/platform (detailed architecture options are explored later in the Tech Design step)
5. **Competitor insights** — similar solutions, what users love/hate, gaps to exploit
6. **Budget/timeline** — cost estimates and launch timeframe
7. **Handoff Context** — end the document with this block, filled in:

---
## Handoff Context
<!-- Machine-readable summary for the next workflow step. Do not delete; the next prompt in the workflow reads this block. -->
- Stage: research
- App name: [app name]
- User level: [A | B | C]  (A = vibe coder, B = developer, C = in-between)
- Target platform: [web / mobile / desktop]
- Budget: [budget]
- Timeline: [timeline]
- Source files: research-[AppName].md
---

The heading list and the Handoff Context block never change; only the question phrasing varies by level.

## After Completion

Tell the user:

> Your research is saved to `docs/research-[AppName].md`.
>
> **Next Step:** Run `/zsdocs-prd` to create your Product Requirements Document, or ask me to help you create a PRD based on this research.
