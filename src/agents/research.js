import { DEFAULT_MODELS, callLLM, extractJson, responseText } from "../api.js";
import { discoverySystemFor, researchSystemFor } from "./prompts.js";
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

// F3 (Live Web Scanner), step 1 — URL discovery. Plain generation (Flash-Lite):
// given the requirement + preferred domains, propose candidate source URLs.
// Grounding happens in step 2; discovery itself needs no grounding.
export function buildDiscoveryPayload(requirement) {
  const topic = requirement.topic || "default";
  const detail = requirement.detail ? ` ${requirement.detail}` : "";
  return {
    model: DEFAULT_MODELS.discovery,
    systemInstruction: {
      parts: [{ text: discoverySystemFor(requirement, preferredDomainsFor(topic)) }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: `Requirement: ${requirement.title}.${detail}` }],
      },
    ],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
  };
}

export function parseDiscoveryResponse(response) {
  const json = extractJson(responseText(response));
  const urls = Array.isArray(json?.urls) ? json.urls : [];
  return urls
    .map((entry) => (typeof entry === "string" ? entry : entry?.url))
    .filter((url) => typeof url === "string" && /^https?:\/\//.test(url))
    .slice(0, 8);
}

// F3 (Live Web Scanner), step 2 — grounded research. url_context tool fetches
// the candidate URLs supplied in the prompt and returns real groundingChunks
// citations. responseMimeType must NOT be JSON here: constraining the output
// type while tool-calling trips the model into TOO_MANY_TOOL_CALLS.
export function buildResearchPayload(requirement, candidateUrls) {
  const topic = requirement.topic || "default";
  const detail = requirement.detail ? ` ${requirement.detail}` : "";
  const urls = (candidateUrls || []).join("\n");
  return {
    model: DEFAULT_MODELS.research,
    systemInstruction: {
      parts: [{ text: researchSystemFor(requirement, preferredDomainsFor(topic)) }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Research this requirement: ${requirement.title}.${detail}\nCandidate sources to ground your answer from:\n${urls}`,
          },
        ],
      },
    ],
    tools: [{ url_context: {} }],
    generationConfig: { temperature: 0.2 },
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
    const discoveryResponse = await callLLM(
      buildDiscoveryPayload(requirement),
      options,
    );
    const candidateUrls = parseDiscoveryResponse(discoveryResponse);
    const response = await callLLM(
      buildResearchPayload(requirement, candidateUrls),
      options,
    );
    findings.push(parseResearchResponse(response, requirement));
  }

  return {
    model: DEFAULT_MODELS.research,
    findings,
    researchedAt: new Date().toISOString(),
  };
}
