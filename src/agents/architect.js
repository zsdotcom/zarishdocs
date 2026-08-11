import { DEFAULT_MODELS, callLLM, extractJson, responseText } from "../api.js";
import { ARCHITECT_SYSTEM } from "./prompts.js";

export function validateArchitectInput(input) {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "A research result is required before the architect can write." };
  }
  if (!Array.isArray(input.findings) || input.findings.length === 0) {
    return { ok: false, error: "At least one research finding is required." };
  }
  return { ok: true };
}

// F4 (Auto-Writer, half 1): verified facts → document outline.
export function buildArchitectPayload(findings) {
  const facts = findings.map((f) => ({
    requirementId: f.requirementId,
    title: f.title,
    summary: f.summary,
    citations: f.citations,
  }));
  return {
    model: DEFAULT_MODELS.architect,
    systemInstruction: { parts: [{ text: ARCHITECT_SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: JSON.stringify(facts, null, 2) }] }],
    generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
  };
}

export function parseArchitectResponse(text, findings) {
  const json = extractJson(text);
  if (!json) throw new Error("The architect returned an unreadable response. Try again.");

  return {
    title: "ZarishDocs MVP Architecture",
    status: "draft",
    decisions: [
      {
        title: json?.adr?.title || "Architecture decisions",
        detail: json?.adr?.decision || "",
      },
    ],
    outlines: {
      prd: json?.prd || { title: "PRD", sections: [] },
      adr: json?.adr || { title: "ADR", sections: [] },
      techDesign: json?.techDesign || { title: "Tech Design", sections: [] },
    },
    requirements: findings.map((f) => ({ id: f.requirementId, title: f.title })),
  };
}

export async function architectDocument(input, options = {}) {
  const validation = validateArchitectInput(input);
  if (!validation.ok) throw new Error(validation.error);

  const response = await callLLM(buildArchitectPayload(input.findings), options);
  return parseArchitectResponse(responseText(response), input.findings);
}
