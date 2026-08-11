# Tech Stack & Tools

- **Frontend:** Vanilla HTML/CSS/JS — no framework, no build step (static client app, CDN-loaded dependencies)
- **LLM (default):** Gemini Flash-Lite (Profiler Agent — highest daily ceiling, 1,000 req/day) and Gemini Flash 3.x family (Research Agent for grounding; Architect/Writer for final synthesis)
- **Backend:** None — exactly one stateless Cloudflare Worker proxy function that injects `GEMINI_API_KEY` and forwards LLM calls (default path). Optional advanced path: direct browser call with user-supplied key from `sessionStorage`
- **Database:** None — IndexedDB for session/project state; Service Worker cache for the offline app shell
- **Search grounding:** Gemini "Grounding with Google Search" (free 5,000 grounded prompts/month on 3.x family) — no separate search API
- **Local file access:** `browser-fs-access` (ponyfill — native File System Access API where available, `<input type="file">`/`<a download>` fallback elsewhere)
- **Diagrams:** Mermaid.js 11.16.1 (CDN, `mermaid.initialize()`)
- **Semantic search (lazy):** transformers.js + `all-MiniLM-L6-v2` (ONNX, ~23MB, Web Worker, loaded on first use then cached)
- **Styling:** Plain CSS — clean, minimal, trustworthy, quietly technical (PRD design vibe); no UI framework
- **Hosting:** Cloudflare Pages (static app) + Cloudflare Workers (proxy), free tier

## Error Handling Pattern
```javascript
// All LLM calls go through one module. Normalize failures here so the
// UI only ever sees a friendly message + a retryable flag — never a raw
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
    throw new LLMError(res.status, err.message || `LLM request failed (${res.status})`, retryable(res.status));
  }
  return res.json();
}
```

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
