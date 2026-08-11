import { DEFAULT_MODELS } from "../api.js";

export function validateResearchPayload(input) {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      error: "Research input is required.",
    };
  }

  if (!Array.isArray(input.requirements) || input.requirements.length === 0) {
    return {
      ok: false,
      error: "At least one research requirement is required.",
    };
  }

  return { ok: true };
}

export async function researchIdea(input) {
  const validation = validateResearchPayload(input);

  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const findings = input.requirements.map((requirement, index) => ({
    requirementId: requirement.id || `requirement-${index}`,
    title: requirement.title || "Research requirement",
    domain: requirement.domain || "default",
    citations: [
      {
        title: "Official source placeholder",
        url: "https://example.com/placeholder-source",
        accessDate: new Date().toISOString().slice(0, 10),
      },
    ],
    summary: `Research finding for ${requirement.title || "the project}"}.`,
  }));

  return {
    model: DEFAULT_MODELS.research,
    findings,
    researchedAt: new Date().toISOString(),
  };
}
