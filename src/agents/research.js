import { DEFAULT_MODELS, callLLM, extractJson, responseText } from "../api.js";
import { researchSystemFor } from "./prompts.js";
import { today, uniqueByUrl } from "./util.js";
import sourcesConfig from "../../sources.config.json" with { type: "json" };

const DOMAINS = sourcesConfig.domains || {};

export function preferredDomainsFor(topic) {
  return DOMAINS[topic] || DOMAINS.default || [];
}

export function validateResearchPayload(input) {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Research input is required." };
  }
  if (!Array.isArray(input.requirements) || input.requirements.length === 0) {
    return { ok: false, error: "At least one research requirement is required." };
  }
  return { ok: true };
}

// F3 (Live Web Scanner): 2.5 Flash with google_search grounding + domain bias.
export function buildResearchPayload(requirement) {
  const topic = requirement.topic || "default";
  const detail = requirement.detail ? ` ${requirement.detail}` : "";
  return {
    model: DEFAULT_MODELS.research,
    systemInstruction: {
      parts: [{ text: researchSystemFor(requirement, preferredDomainsFor(topic)) }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: `Research this requirement: ${requirement.title}.${detail}` }],
      },
    ],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
  };
}

// Grounding metadata from the API: real source URLs + titles.
export function citationsFromResponse(response) {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks
    .map((chunk) => ({
      title: chunk?.web?.title || "Source",
      url: chunk?.web?.uri || "",
      accessDate: today(),
    }))
    .filter((citation) => citation.url);
}

// ADR-002: preferred-domain sources first, off-domain kept but secondary.
export function rankCitations(citations, preferredDomains) {
  if (!preferredDomains?.length) return citations;
  const score = (citation) =>
    preferredDomains.some((domain) => citation.url.includes(domain)) ? 0 : 1;
  return [...citations].sort(
    (a, b) => score(a) - score(b) || a.url.localeCompare(b.url),
  );
}

export function parseResearchResponse(response, requirement) {
  const text = responseText(response);
  const json = extractJson(text);
  const modelCitations = (json?.finding?.citations || [])
    .filter((c) => c && c.url)
    .map((c) => ({
      title: c.title || "Source",
      url: c.url,
      accessDate: c.accessDate || today(),
    }));

  const citations = rankCitations(
    uniqueByUrl([...citationsFromResponse(response), ...modelCitations]),
    preferredDomainsFor(requirement.topic),
  );

  return {
    requirementId: requirement.id,
    title: json?.finding?.title || requirement.title,
    summary:
      json?.finding?.summary ||
      `Research finding for ${requirement.title}.`,
    citations,
  };
}

export async function researchIdea(input, options = {}) {
  const validation = validateResearchPayload(input);
  if (!validation.ok) throw new Error(validation.error);

  const findings = [];
  for (const requirement of input.requirements) {
    const response = await callLLM(buildResearchPayload(requirement), options);
    findings.push(parseResearchResponse(response, requirement));
  }

  return {
    model: DEFAULT_MODELS.research,
    findings,
    researchedAt: new Date().toISOString(),
  };
}
