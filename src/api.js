export const DEFAULT_MODELS = {
  profiler: "gemini-2.5-flash-lite",
  research: "gemini-2.5-flash",
  architect: "gemini-2.5-flash",
  writer: "gemini-2.5-flash",
};

export function getProxyEndpoint() {
  return "https://zarishdocs-proxy.example.workers.dev";
}

export async function callLLM(payload) {
  const endpoint = getProxyEndpoint();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload?.error?.message || "LLM request failed");
  }

  return response.json();
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
