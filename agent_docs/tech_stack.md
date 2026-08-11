# Tech Stack & Tools

Verified as of August 11, 2026. Before suggesting any new dependency, check this file first.

- **Frontend:** Vanilla HTML/CSS/JS (ES modules) — no framework, no build step. Static client app served from Cloudflare Pages.
- **LLM (model routing):**
  - **Profiler Agent** → Gemini **2.5 Flash-Lite** — highest free-tier daily ceiling, adequate for structured extraction
  - **Research Agent** → Gemini **2.5 Flash** — required for **free** Google-Search grounding (500 RPD, shared with Flash-Lite; see correction below)
  - **Architect / Writer Agents** → Gemini **2.5 Flash** — best quality-to-quota ratio
  - **CORRECTION (2026-08-11):** Gemini **3.x grounding is paid-only** ("Not available" on free tier; 5,000 prompts/mo free then $14/1k queries). The Tech Design's original "3.x family for free grounding" claim is WRONG — free grounding exists only on the 2.5 family (2.5 Flash / Flash-Lite). Do not route grounding calls to 3.x.
- **Backend:** None — exactly one stateless Cloudflare Worker proxy (`worker/index.js`) that injects `GEMINI_API_KEY` (Worker secret), validates Origin, whitelists models, and forwards LLM calls. Optional advanced path: direct browser call with user-supplied key from `sessionStorage`.
- **Database:** None — IndexedDB for session/project state and embeddings (stores `sessions`, `projects`, `settings`, `embeddings`; Tech Design §10.1); Service Worker cache for the offline shell. (Cache API = URL-addressed resources; IndexedDB = structured/searchable data.)
- **Search grounding:** Gemini "Grounding with Google Search" via `"tools": [{"google_search": {}}]` on `generateContent` — returns `groundingMetadata` citations. No separate search API. **Gotcha:** Gemini 3 bills per search query executed, not per prompt; on 2.5 free tier the daily 500-RPD budget is shared between Flash and Flash-Lite.
- **Local file access (ADR-003):** native browser APIs only — File System Access API on Chromium desktop, `<a download>` fallback elsewhere. `src/file-writer.js` exports `isSupported()` (drives the first-load banner), `pickFolder()` (`showDirectoryPicker({ mode: "readwrite" })`), `writeSet(dirHandle, files)`, `downloadFallback(files)`, and `saveFiles(files, { dirHandle, allowPick })`. Filenames are identical on both paths. No `browser-fs-access` dependency.
- **Diagrams:** Mermaid is emitted as plain `.mmd` text files — there is **no in-app rendering**. `src/agents/util.js` `extractMermaid()` pulls ```mermaid blocks out of the writer's Markdown; `writer.js` `diagramFilenames()` saves them under `diagrams/<nnn>-<name>.mmd`. The user opens them in any Markdown/Mermaid viewer. If in-app rendering is ever added, pin Mermaid.js **11.16.1** (backports security fixes — do not downgrade).
- **Semantic search (planned, not yet built):** transformers.js **4.x** (verified 4.2.0) + `all-MiniLM-L6-v2` with `dtype: 'q8'` (~23MB) in a module Web Worker — lazy-loaded, post-MVP (PRD Out of Scope). Model caching is automatic via the Cache API (`transformers-cache`) — never precache it yourself.
- **Hosting:** Cloudflare Pages (static) + Workers (proxy), free tier. Verified 2026 limits: Pages 500 builds/mo, unlimited bandwidth; Workers 100k requests/day **shared** with Pages Functions, 50 subrequests/request.

## Error Handling Pattern
All LLM calls go through one module so the UI only ever sees a friendly message + a retryable flag — never a raw network/CORS/parsing exception, never a silent fail.
- `src/errors.js` — `AppError { kind, message, retryable, status }`. Kinds the UI understands: `quota` (429), `auth` (401/403), `offline`, `unsupported` (no FS access), `validation`, `upstream`. `kindForStatus(status)` and `messageForKind(kind)` keep the mapping in one place; `classifyFetchError(error, { status })` normalizes any fetch failure.
- `src/api.js` — `callLLM(payload, options)` posts to the proxy by default, or directly to Gemini when `options.apiKey` is set; `extractJson(text)` returns a **parsed object** (or `null`), honoring a ```json fence and ignoring prose/mermaid fences; `responseText(response)` joins the model's parts.

## Worker Proxy Sketch (ADR-001 default path)
```toml
# worker/wrangler.toml
name = "zarishdocs-proxy"
main = "index.js"
compatibility_date = "2026-08-01"

[vars]
ALLOWED_ORIGIN = "http://127.0.0.1:8080,http://localhost:8080,https://your-site.pages.dev"
```
Fetch handler: reject non-POST → validate Origin (403 for unknown) → answer `OPTIONS` preflight with scoped `Access-Control-Allow-Origin` + `Vary: Origin` → whitelist the model string (SSRF guard) → inject `env.GEMINI_API_KEY` → forward to `generativelanguage.googleapis.com` → re-emit response with CORS headers, stamping `x-zarish-quota-bucket: grounding|generation` on every response so quota accounting is testable. One Gemini call = one subrequest (well under the 50/request limit); keep CPU under the 10ms free-tier budget (a passthrough is fine). See `worker/index.test.js` for the 8 behavior tests.

## Styling & Component Examples
```html
<!-- No framework: a screen is a plain function that renders into the app root.
     Keep agent logic out of the template — call modules, don't inline them. -->
<div id="app">
  <h1>ZarishDocs — private research lab</h1>
  <button id="choose-folder">Choose your folder</button>
  <textarea id="idea" placeholder="Describe your idea…"></textarea>
  <div id="progress"></div>
</div>
```
