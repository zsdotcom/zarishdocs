# Tech Stack & Tools

Verified as of August 11, 2026. Before suggesting any new dependency, check this file first.

- **Frontend:** Vanilla HTML/CSS/JS (ES modules) — no framework, no build step. Static client app served from Cloudflare Pages.
- **LLM (model routing):**
  - **Profiler Agent** → Gemini **2.5 Flash-Lite** — highest free-tier daily ceiling, adequate for structured extraction
  - **Research Agent** → Gemini **2.5 Flash** — required for **free** Google-Search grounding (500 RPD, shared with Flash-Lite; see correction below)
  - **Architect / Writer Agents** → Gemini **2.5 Flash** — best quality-to-quota ratio
  - **CORRECTION (2026-08-11):** Gemini **3.x grounding is paid-only** ("Not available" on free tier; 5,000 prompts/mo free then $14/1k queries). The Tech Design's original "3.x family for free grounding" claim is WRONG — free grounding exists only on the 2.5 family (2.5 Flash / Flash-Lite). Do not route grounding calls to 3.x.
- **Backend:** None — exactly one stateless Cloudflare Worker proxy (`worker/index.js`) that injects `GEMINI_API_KEY` (Worker secret) and forwards LLM calls. Optional advanced path: direct browser call with user-supplied key from `sessionStorage`.
- **Database:** None — IndexedDB for session/project state and embeddings; Service Worker cache for the offline shell. (Cache API = URL-addressed resources; IndexedDB = structured/searchable data.)
- **Search grounding:** Gemini "Grounding with Google Search" via `"tools": [{"google_search": {}}]` on `generateContent` — returns `groundingMetadata` citations. No separate search API. **Gotcha:** Gemini 3 bills per search query executed, not per prompt; on 2.5 free tier the daily 500-RPD budget is shared between Flash and Flash-Lite.
- **Local file access:** `browser-fs-access` 0.38.x (ponyfill — native File System Access API on Chromium 86+/105+, `<input type="file">`/`<a download>` fallback elsewhere). Use its exported `supported` flag to drive the download-fallback UI. Quirk: legacy (non-FS-Access) save cannot throw — use `legacySetup`; `directoryOpen()` returns the directory handle for empty dirs.
- **Diagrams:** Mermaid.js **11.16.1** via CDN `https://cdn.jsdelivr.net/npm/mermaid@11.16.1/dist/mermaid.min.js`. 11.16.1 backports security fixes — do not downgrade. `mermaidAPI.setConfig()` is deprecated; use `mermaid.initialize()`.
- **Semantic search (lazy):** transformers.js **4.x** (verified 4.2.0) + `all-MiniLM-L6-v2` with `dtype: 'q8'` (~23MB). Model caching is automatic via the Cache API (`transformers-cache`) — never precache it yourself. Load in a module Web Worker, singleton `pipeline()`, `progress_callback` → postMessage for the loading UI.
- **Hosting:** Cloudflare Pages (static) + Workers (proxy), free tier. Verified 2026 limits: Pages 500 builds/mo, unlimited bandwidth; Workers 100k requests/day **shared** with Pages Functions, 50 subrequests/request.

## Error Handling Pattern
```javascript
// All LLM calls go through one module. Normalize failures here so the UI
// only ever sees a friendly message + a retryable flag — never a raw
// network/CORS exception, and never a silent fail.
async function callLLM(payload) {
  const res = await fetch(config.endpointFor(payload), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // 429 from Gemini free tier = quota exhausted → tell the user to wait,
    // not "something broke".
    throw new LLMError(res.status, err.message || `LLM request failed (${res.status})`, isRetryable(res.status));
  }
  return res.json();
}
```

## Worker Proxy Sketch (ADR-001 default path)
```toml
# worker/wrangler.toml
name = "zarishdocs-proxy"
main = "index.js"
compatibility_date = "2026-08-01"
```
Fetch handler: validate Origin (403 for unknown) → handle `OPTIONS` preflight with scoped `Access-Control-Allow-Origin: <your Pages origin>` + `Vary: Origin` → inject `env.GEMINI_API_KEY` → forward to `generativelanguage.googleapis.com` → re-emit response with CORS headers. One Gemini call = one subrequest (well under the 50/request limit); keep CPU under the 10ms free-tier budget (a passthrough is fine). Log which quota bucket a response consumed (grounding vs generation) — see `MEMORY.md` known issue.

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
