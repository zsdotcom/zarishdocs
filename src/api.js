import { AppError, classifyFetchError } from "./errors.js";

// Model routing, verified live 2026-08-11. Gemini 2.5 models are retired for
// new users (404); free Google-Search grounding is quota-blocked on new
// accounts. Current models: 3.6-flash / 3.5-flash return url_context grounding
// chunks, 3.5-flash-lite does not — hence research uses 3.6-flash.
export const DEFAULT_MODELS = {
  profiler: "gemini-3.5-flash-lite",
  discovery: "gemini-3.5-flash-lite",
  research: "gemini-3.6-flash",
  architect: "gemini-3.5-flash",
  writer: "gemini-3.6-flash",
};

// The deployed Worker proxy URL (see SETUP.md §4.3). The app is live once this
// is the real proxy; the placeholder kept local dev + tests working pre-deploy.
export const PROXY_ENDPOINT = "https://zarishdocs-proxy.zarishsphere.workers.dev";

const GEMINI_DIRECT = "https://generativelanguage.googleapis.com/v1beta";

export function getProxyEndpoint() {
  return PROXY_ENDPOINT;
}

// ADR-001 hybrid backend: proxy by default; pass options.apiKey to bypass the
// proxy and call Gemini directly (advanced "bring your own key" path). The key
// is expected to come from sessionStorage only — never disk.
export async function callLLM(payload, options = {}) {
  const apiKey = options.apiKey;
  let endpoint = getProxyEndpoint();
  const headers = { "Content-Type": "application/json" };
  if (apiKey) {
    endpoint = `${GEMINI_DIRECT}/models/${payload.model}:generateContent`;
    headers["x-goog-api-key"] = apiKey;
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw classifyFetchError(error);
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const upstreamMessage =
      errorPayload?.error?.message || `LLM request failed (${response.status})`;
    const kind = response.status === 429 ? "quota" : "upstream";
    throw new AppError(kind, upstreamMessage, {
      retryable: kind === "upstream",
      status: response.status,
    });
  }

  return response.json();
}

// Extract a JSON object from an LLM text response and parse it. A ```json
// fence is honored when present; otherwise the first balanced {…} block is
// used, so prose and non-json fences (e.g. mermaid) around the result are
// ignored. Returns null when no valid object is found.
export function extractJson(text) {
  if (typeof text !== "string" || !text.includes("{")) return null;
  const jsonFence = text.match(/```json\s*\n?([\s\S]*?)```/i);
  const candidate = jsonFence ? jsonFence[1] : text;
  const start = candidate.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(candidate.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export function responseText(response) {
  return (response?.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("");
}

export function normalizeIdea(ideaText) {
  const trimmed = String(ideaText || "").trim();

  if (trimmed.length < 12) {
    throw new Error("Please describe your idea in a little more detail.");
  }

  if (trimmed.length > 2000) {
    throw new Error("Please keep your idea shorter than 2,000 characters.");
  }

  return trimmed;
}
