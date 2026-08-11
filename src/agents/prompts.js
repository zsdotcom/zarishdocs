// Prompt templates (Tech Design §9). Plain data, versioned here so tests can
// assert the grounding/domain-bias instructions are present.

const JSON_ONLY =
  "Return strict JSON only, with no prose before or after the object.";

export const PROFILER_SYSTEM = `
You translate a plain-language app idea into a structured research brief for a
non-technical founder. The founder will never see this output.

From the user's idea text, extract:
1. a one-line product description,
2. up to 8 key capabilities/facts the research must verify,
3. the topic category for each capability, chosen from: github, cloudflare,
   google-cloud, google-workspace, fhir, npm-package, browser-api,
   w3c-standard, default.

Use ONLY the topics listed; unknown topics map to "default".
${JSON_ONLY}
Return this shape: {"summary": string, "requirements": [{"id": string, "title": string, "topic": string}]}
`.trim();

// §9.2 — ADR-002 domain-bias instruction. `preferredDomains` comes from
// sources.config.json; an empty list yields "Use authoritative sources."
export function researchSystemFor(requirement, preferredDomains) {
  const bias = preferredDomains.length
    ? `When researching "${requirement.title}", prioritize official sources: ${preferredDomains.join(
        ", ",
      )}. Only use other sources if the official docs don't cover this.`
    : "Use authoritative sources.";

  return `
${bias}
For every tool/library/service you recommend, report its current stable
version and release date AS OF TODAY. Ground your answer by fetching the
candidate URLs provided in the user message with the url_context tool — do not
rely on memory. Only cite sources you actually retrieved; return each verified
fact with its source URL and the access date.
${JSON_ONLY}
Return this shape: {"finding": {"title": string, "summary": string, "citations": [{"title": string, "url": string, "accessDate": "YYYY-MM-DD"}]}}
`.trim();
}

// F3 (Live Web Scanner), step 1 — discover candidate source URLs. Runs BEFORE
// the grounded call: url_context can only fetch URLs present in the prompt, so
// the model proposes the candidates, the research step grounds against them.
export function discoverySystemFor(requirement, preferredDomains) {
  const bias = preferredDomains.length
    ? `Prefer URLs on official domains: ${preferredDomains.join(", ")}.`
    : "Prefer authoritative official documentation.";

  return `
Suggest up to 8 real, existing documentation URLs most likely to cover this
requirement. ${bias} Use real, stable URLs (homepages or canonical docs pages) —
do not invent deep links you cannot verify. ${JSON_ONLY}
Return this shape: {"urls": [{"url": string, "reason": string}]}
`.trim();
}

export const ARCHITECT_SYSTEM = `
You receive verified, cited research facts. Structure them into the outline of
a linked document set: PRD, ADR, and Tech Design. Preserve every fact's source
URL and access date — never drop a citation. Flag any claim the research does
not support; do not invent facts.
${JSON_ONLY}
Return this shape: {"prd": {"title": string, "sections": [string]}, "adr": {"title": string, "decision": string, "sections": [string]}, "techDesign": {"title": string, "sections": [string]}}
`.trim();

export const WRITER_SYSTEM = `
Render the outline into three Markdown documents (PRD, ADR, Tech Design) that
cross-reference each other. Rules:
- Every technical claim keeps its citation: [source](url) (accessed YYYY-MM-DD).
- Use Mermaid for architecture/data-flow diagrams; output each diagram both
  inline and as a standalone .mmd file (fenced with \`\`\`mermaid).
- Add a methodology note: "Sources were prioritized by domain, not exclusively
  restricted." to each document.
- Plain language, no unexplained jargon.
${JSON_ONLY}
Return this shape: {"prd": string, "adr": string, "techDesign": string}
`.trim();
