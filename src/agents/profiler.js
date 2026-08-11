import { DEFAULT_MODELS, callLLM, extractJson, responseText } from "../api.js";
import { PROFILER_SYSTEM } from "./prompts.js";

export function validateIdea(ideaText) {
  const clean = String(ideaText || "").trim();
  if (!clean) {
    return { ok: false, error: "Idea is required." };
  }
  if (clean.length < 12) {
    return { ok: false, error: "Please provide more detail about the app idea." };
  }
  if (clean.length > 2000) {
    return { ok: false, error: "Please keep your idea shorter than 2,000 characters." };
  }
  return { ok: true, value: clean };
}

// F2 (Vibe Translator): Flash-Lite, no grounding.
export function buildProfilePayload(idea) {
  return {
    model: DEFAULT_MODELS.profiler,
    systemInstruction: { parts: [{ text: PROFILER_SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: idea }] }],
    generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
  };
}

export function parseProfileResponse(text) {
  const raw = extractJson(text);
  if (!raw) throw new Error("The profiler returned an unreadable response. Try again.");

  const requirements = (Array.isArray(raw.requirements) ? raw.requirements : []).map(
    (requirement, index) => ({
      id: String(requirement?.id || `requirement-${index + 1}`),
      title: String(requirement?.title || requirement?.capability || "Research requirement"),
      topic: String(requirement?.topic || "default"),
    }),
  );
  if (requirements.length === 0) {
    throw new Error("The profiler found no requirements to research. Try rephrasing your idea.");
  }

  return {
    model: DEFAULT_MODELS.profiler,
    summary: String(raw.summary || ""),
    requirements,
    tags: ["mvp", "research", "technical-design"],
    generatedAt: new Date().toISOString(),
  };
}

export async function profileIdea(ideaText, options = {}) {
  const validation = validateIdea(ideaText);
  if (!validation.ok) throw new Error(validation.error);

  const response = await callLLM(buildProfilePayload(validation.value), options);
  return parseProfileResponse(responseText(response));
}
