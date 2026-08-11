# research-ZarishDocs.md
## Deep Research: ZarishDocs
### Browser-only AI research lab for turning plain-language app ideas into technical blueprints

**Document type:** Research Report — V1
**Date:** August 11, 2026
**Status:** V1 — Research complete, feeds into Part 2 (PRD generator)

---

## 1. Project name

**ZarishDocs** — a private, zero-cost AI research lab that runs entirely in the browser. A user types their app idea in plain, non-technical language, and a team of AI agents researches current tech, then writes professional-grade blueprints (PRD, ADR, Tech Design) directly to a folder on the user's own computer — no install, no server, no signup.

## 2. Core concept

Turning a rough idea into a build-ready technical spec normally requires either deep technical knowledge or an expensive/complex toolchain. ZarishDocs closes that gap with a translation layer: a Profiler Agent turns casual language into structured requirements, a Research Agent verifies current tech facts against live sources, and Writer/Architect Agents assemble the output as clean, cited Markdown — all client-side, all free.

**Why now:** three trends have converged as of mid-2026 that make a zero-server version of this newly viable:
1. Browser-native local file access (File System Access API) is stable in Chromium browsers, enabling direct-to-disk writes without a backend.
2. Client-side ML (transformers.js + WebAssembly) makes semantic search and embeddings genuinely usable in-browser, not just a novelty.
3. Free-tier LLM APIs (Gemini 2.5/3 family) remain usable for low-volume personal tools, and edge-proxy patterns (Cloudflare Workers) now offer a zero-cost, zero-maintenance way to solve the API-key exposure problem.

## 3. Target users

Pure no-coders and "vibe coders" — non-technical founders, hobbyists, and creative thinkers who don't know what an API, ADR, or database migration is and don't want to learn devops just to get a usable spec. They want to describe an idea conversationally and receive a rigorous document that downstream AI coding tools (Bolt.new, Lovable, Claude Code, Cursor) can build from directly.

## 4. Technical decisions (if any)

> Detailed architecture options (multi-agent orchestration design, embedding model choice, specific folder schemas) are explored later in the Tech Design step. This section covers only what's needed to validate feasibility.

### 4.1 Critical architecture finding — read this first

The single biggest risk to the "100% browser, zero server" premise is **how the app talks to a free-tier LLM API**. Two facts combine to create a hard constraint:

- Google's own guidance is explicit: calling the Gemini API directly from client-side JavaScript is documented as **prototyping-only**, because any API key embedded in browser code can be extracted by users and abused<cite index="19-1">since the key must be stored exclusively on a secure server-side proxy that handles the API call to prevent direct client exposure, and this server-side abstraction is described as the only secure way to use the API from a web browser application</cite>. Google's own developer docs reinforce this: keys compiled into client-side code <cite index="23-1">can be extracted by users, so developers should never expose keys client-side in production and should run a backend proxy server for client-side apps</cite>.
- Separately, direct browser calls to Gemini also hit ordinary **CORS restrictions** in practice, independent of the security concern.

**This means "zero server" cannot mean "literally no compute layer between the browser and Gemini."** However, it does not require breaking the zero-cost or no-maintenance constraints. The realistic fix, confirmed by several independent open-source implementations, is a **free, serverless edge proxy** — typically a single Cloudflare Worker function that injects the API key server-side and forwards the request. This preserves "no server to manage" (it's a stateless edge function, not a VM), preserves zero cost (Cloudflare Workers' free tier covers this volume comfortably), and solves both the CORS and key-exposure problems at once. Multiple open-source reference implementations of exactly this pattern exist and are actively maintained.

**Recommendation:** ZarishDocs should still be described to users as "runs in your browser" (true for the UI, agents, file writes, and research display), but the architecture needs one small, free, serverless proxy function for LLM calls. This is a one-time deploy, not an ongoing server to maintain, and it stays inside every stated constraint (zero cost, zero install for the *user*, no vendor lock-in since the proxy code is portable).

An alternative, more purist option — have each user paste in their own free Gemini API key and accept that it's visible in their own browser's network tab (acceptable risk for a single-user local tool, not for a multi-user public deployment) — is also viable for a personal-use MVP and avoids the proxy step entirely. This should be presented as a build option in the Tech Design step.

### 4.2 Local file access

Chrome, Edge, and Opera support the **File System Access API** (`showDirectoryPicker`, `showSaveFilePicker`) for direct read/write access to a user-chosen folder on disk. As of early-to-mid 2026, this remains **Chromium-only**<cite index="4-1">— it works in Chrome, Edge, and Opera, but not in Firefox or Safari</cite>. More precisely<cite index="10-1">, the File System Access API works in Chrome 86+, Edge 86+, and Opera 72+ on desktop, while Firefox and Safari support only the Origin Private File System and skip the local-disk pickers</cite>. Safari (macOS, iPadOS, and iOS) does not support the picker methods at all, and no mobile browser exposes them<cite index="10-1">, meaning iOS web apps cannot read or write the user's local disk through this API</cite>.

**Implication for ZarishDocs:** the "write straight to a local folder" feature works well on Chrome/Edge/Opera desktop, degrades gracefully to download-based fallback elsewhere. The `browser-fs-access` open-source library is a purpose-built ponyfill for exactly this: it uses the native API where available and <cite index="7-1">transparently falls back to the `<input type="file">` and `<a download>` legacy methods where it isn't</cite>. This should be the recommended library rather than hand-rolling feature detection.

**Recommendation:** Chrome/Edge/Opera desktop as the primary supported environment for true local-folder sync; mobile and Safari users get a "download your project as a zip/JSON" fallback. This should be stated plainly in the app's own UI, not hidden.

### 4.3 Free-tier LLM API for the agents

As of the most recent guidance found (through July 2026), Gemini's free tier offers three stable models with meaningfully different throughput<cite index="14-1">: Gemini 2.5 Pro at 5 requests/minute and 100 requests/day, Gemini 2.5 Flash at 10 RPM and 250 requests/day, and Gemini 2.5 Flash-Lite at 15 RPM and 1,000 requests/day, with all three sharing a 250,000-tokens-per-minute limit and the full 1-million-token context window</cite>. No credit card is required to start<cite index="14-1">, though free-tier prompts and responses may be used to improve Google's products</cite>.

Two caveats worth flagging directly to the user:
- Google **cut free-tier quotas 50–80% in December 2025**<cite index="15-1">, and rate limits are revised by Google without notice, not contractually guaranteed, and vary by region and account verification</cite> — so any numbers here should be treated as directional, not fixed.
- Rate limits apply **per Google Cloud project, not per API key**<cite index="13-1">, so creating multiple keys inside the same project does not multiply the quota — genuinely separate quota pools require separate Cloud projects</cite>.

**Recommendation:** default to **Gemini 2.5 Flash-Lite** for the Research and Profiler agents (highest daily ceiling, adequate for structured extraction tasks), reserve Pro-tier calls (if used at all) for the final Architect/Writer synthesis step where quality matters most and volume is lowest.

### 4.4 Multi-agent orchestration & MCP in the browser

Two relevant, current standards exist and serve different roles:

- **MCP (Model Context Protocol)** — the established standard for how an AI agent calls external tools/data sources, now on spec version 2026-07-28. It is usually server-side, but MCP servers can run as local subprocesses over stdio, which is relevant only if ZarishDocs ever ships a companion desktop/CLI layer — not needed for the pure browser MVP.
- **WebMCP** — a newer, directly relevant browser-native standard. It is a proposed (not yet ratified) W3C Web Machine Learning Community Group API that <cite index="43-1">lets web pages declare JavaScript functions as tools that browser-based AI agents can discover and invoke, using the browser's existing communication, security, and session management infrastructure rather than a new protocol</cite>. Critically, <cite index="45-1">WebMCP does not rely on a separate JSON-RPC server — the web page itself becomes the tool provider, and execution occurs in the same JavaScript environment as the application logic</cite>. It was <cite index="47-1">first announced on February 10, 2026, developed through the W3C Web Machine Learning Community Group, and is explicitly model-agnostic, meaning it works with any AI agent regardless of whether it's powered by Gemini, Claude, ChatGPT, or an open-source model</cite>.

**Recommendation:** ZarishDocs' internal agent-to-agent calls don't need MCP or WebMCP at all for the MVP — that's just JavaScript function calls within one app. Where WebMCP becomes genuinely useful is a **v2 feature**: exposing ZarishDocs' own functions (e.g., "generate a PRD section," "re-verify a citation") as WebMCP tools, so that *other* browser AI agents (a future Chrome AI assistant, etc.) could drive ZarishDocs directly. This satisfies the "MCP protocol" extensibility requirement without adding unneeded complexity now. Treat WebMCP support as a Phase 2 item, not an MVP blocker, since the spec is still pre-standard.

### 4.5 Documentation-as-code / diagram-as-code

**Mermaid.js** is the clear choice for diagram-as-code: it's mature, zero-backend (pure client-side JS/SVG rendering), and can be dropped in via a CDN script tag with no build step<cite index="60-1">, using a script import from jsdelivr and a simple `mermaid.initialize()` call</cite>. Current stable version is **11.16.1** (npm, published within the past week as of this research). No Java, no server-side rendering needed — this fits the RAM/zero-server constraints natively.

### 4.6 Client-side semantic search / embeddings

This is achievable entirely in-browser using **transformers.js** running ONNX models via WebAssembly, with no API calls and no server<cite index="49-1">, using sentence embeddings and cosine similarity, with the pipeline able to run inside a Web Worker so the UI thread stays responsive</cite>. A commonly used model, `all-MiniLM-L6-v2`, is small — <cite index="55-1">about 23MB, loads in seconds, and enables semantic search with no data ever leaving the browser</cite>. Real-world implementations report strong performance at scale: <cite index="51-1">indexing roughly 23,000 embeddings (an entire full-length book) and searching it in under 2 seconds, with query-time indexing being "almost instant on nearly any device"</cite>.

**Performance target reality check:** the stated goals of "sub-100KB gzip bundle" and "sub-50ms semantic search / sub-100ms embedding generation" need to be split into two different budgets:
- The **application bundle** (UI code, agent orchestration logic, file-handling code) can realistically hit sub-100KB gzip if built carefully with no heavy framework.
- The **embedding model itself** (23MB+) is a separate, **lazily-loaded, cached-after-first-use** asset — it cannot be part of a 100KB budget and shouldn't be counted against it. This should be reframed in the Tech Design step as: "sub-100KB core app shell; ML model loads on-demand and is cached via Service Worker/IndexedDB for subsequent offline use." Search latency of sub-50ms for a *query against an already-loaded index* is realistic based on the evidence above; sub-100ms for embedding *generation* of a single short query is also realistic on modern hardware, though first-load model download time (several seconds) should be set as a separate, honestly-communicated expectation.

### 4.7 Offline-first architecture

Standard, mature browser primitives cover this without new research risk: **Service Workers** for asset caching and offline shell delivery, **IndexedDB** for structured local data (project state, citation logs, embeddings index). These are universally supported across modern browsers (unlike File System Access API) and are the correct foundation for the "progressive enhancement" requirement — core UI and previously-generated docs work offline; live research, new AI calls, and diagram CDN loads require connectivity and should fail gracefully with a clear "reconnect to continue" state rather than silently breaking.

### 4.8 Zero-server hosting

Both free hosts under consideration comfortably fit a static, client-heavy app like ZarishDocs:

| | GitHub Pages | Cloudflare Pages |
|---|---|---|
| Bandwidth | Soft cap: <cite index="67-1">100 GB/month</cite> | <cite index="88-1">Unlimited, no credit card, never expires</cite> |
| Site size | <cite index="67-1">1 GB published site</cite> | <cite index="89-1">10 GB storage</cite> |
| Builds | <cite index="67-1">10 builds/hour (soft)</cite> | <cite index="90-1">500 builds/month (~16/day)</cite> |
| Server-side compute | None — <cite index="68-1">purely static, no PHP/Node/Python/database</cite> | Optional via Workers (needed for the LLM proxy, see 4.1) |
| Cost | Free for public repos | Free tier, no card required |

**Recommendation:** **Cloudflare Pages** is the better fit specifically *because* ZarishDocs needs one small Worker function for the LLM proxy (section 4.1) — Pages and Workers live in the same free account with no bandwidth ceiling, avoiding the need to stitch together two separate free services. GitHub Pages remains a fine fallback if the "own API key, no proxy" architecture (4.1 alternative) is chosen instead, since then no compute layer is needed at all.

## 5. Competitor insights

| Tool | What it does | Pricing (2026) | Browser-only? | Relevant gap ZarishDocs fills |
|---|---|---|---|---|
| Raw ChatGPT / Claude chat | User pastes a prompt, gets prose back | Free–$20/mo | Yes (but no file output, no live research, no folder org) | No local file writing, no structured multi-doc output, no citation discipline |
| Bolt.new | In-browser AI app builder on WebContainers, generates working code from prompts | From ~$20–25/mo | Yes, but requires signup + paid credits for real use | Assumes the user already knows what to build; no upstream research/spec phase |
| Lovable | Conversational full-stack app builder with Supabase backend | Free tier + $25/mo Pro | No (cloud-hosted, accounts, credits) | Same gap — jumps straight to code, no dedicated research-to-blueprint step |
| Cursor | AI-assisted IDE, developer-facing | ~$20/mo Pro | No (desktop IDE) | Requires existing coding literacy; not for non-technical users at all |
| CrewAI / AutoGen | Multi-agent orchestration frameworks | Free/open-source, but require local terminal installs, coding knowledge, and often paid cloud LLM APIs to run at scale | No | Exactly the complexity ZarishDocs is designed to hide from a non-coder |
| ChatPRD, Miro AI PRD, Figma Make, RapidNative, Quillbot, Leiga | Various "AI PRD generator" SaaS tools | Free tiers + paid plans | Mostly cloud accounts, no live-research citation discipline, no local-first file ownership | None do live, cited, domain-aware research before writing; none write multi-document sets (PRD+ADR+TechDesign) straight to local disk with zero account required |

**Gap ZarishDocs can credibly own:** no competitor combines all four of (a) zero account/signup, (b) documents written directly to the user's own disk with no cloud storage, (c) research-first with per-domain official-source citation discipline, and (d) multi-document output (PRD + ADR + Tech Design as a linked set, not one document). That combination is the "special sauce" and is not contradicted by anything found in this research.

## 6. Budget/timeline

**Budget: $0, confirmed feasible, with one caveat.** Every component researched (File System Access API, Gemini free tier, transformers.js, Mermaid.js, Cloudflare Pages + Workers, GitHub Pages) has a genuine, no-card-required free tier. The one adjustment from the original zero-server assumption: a single serverless Worker function is needed as an LLM proxy (see 4.1) — this remains $0 on Cloudflare's free plan and requires no ongoing maintenance, but it is a real, if tiny, piece of infrastructure that should be documented honestly rather than described as "no backend at all."

**Hidden constraint to flag:** free-tier Gemini rate limits (5–15 requests/minute, 100–1,000/day depending on model) are real ceilings for a "research-first" tool that may fire several research + writer calls per document. A single ZarishDocs session generating a full PRD+ADR+TechDesign set could plausibly use 10–30 LLM calls; this fits comfortably within daily limits for personal use but would need explicit UI messaging ("research in progress, this respects free-tier rate limits") rather than assuming instant results.

**Timeline: 3 days is aggressive but not unreasonable** for a v1 that covers the "must-have" tier only (dashboard shell, one working agent pipeline, Mermaid + Markdown output, local file write with fallback). The extended feature list (version history, citation audit trail, staleness re-check, portable export, glossary panel) is realistically a post-MVP iteration, not a day-one requirement — this should be reflected in MVP-vs-nice-to-have prioritization in the PRD step.

---
## Handoff Context
<!-- Machine-readable summary for the next workflow step. Do not delete; the next prompt in the workflow reads this block. -->
- Stage: research
- App name: ZarishDocs
- User level: A (vibe coder)
- Target platform: web
- Budget: $0 (free-tier APIs only, no credit cards) — requires one free serverless proxy function (Cloudflare Worker) for LLM calls; not a paid dependency
- Timeline: 3 days for MVP tier; extended feature set is post-MVP
- Source files: research-ZarishDocs.md
- Key open risk carried to Tech Design: File System Access API is Chromium-only (Chrome/Edge/Opera desktop) — needs an explicit fallback UX decision for Safari/Firefox/mobile
- Key architecture decision carried to Tech Design: choose between (a) Cloudflare Worker proxy for Gemini calls [recommended, still $0, still no server to maintain] or (b) user-supplied API key stored client-side only [simpler, but key visible in that user's own browser]
---

*ZarishSphere Foundation · V1 · August 2026*
*License: Apache 2.0 (code) · CC BY 4.0 (documentation)*
*GitHub: https://github.com/zsdotcom*
