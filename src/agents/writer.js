import { DEFAULT_MODELS, callLLM, extractJson, responseText } from "../api.js";
import { WRITER_SYSTEM } from "./prompts.js";
import { extractMermaid, slugify } from "./util.js";

function firstHeading(markdown) {
  const match = String(markdown || "").match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

export function validateWriterInput(input) {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Architect output is required before writing." };
  }
  return { ok: true };
}

// F4 (Auto-Writer, half 2): outline → three cross-referenced Markdown docs.
export function buildWriterPayload(architecture) {
  return {
    model: DEFAULT_MODELS.writer,
    systemInstruction: { parts: [{ text: WRITER_SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: JSON.stringify(architecture, null, 2) }] }],
    generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
  };
}

export function parseWriterResponse(text) {
  const json = extractJson(text);
  if (!json) throw new Error("The writer returned an unreadable response. Try again.");

  const prd = String(json.prd || "");
  const adr = String(json.adr || "");
  const techDesign = String(json.techDesign || "");
  if (!prd || !adr || !techDesign) {
    throw new Error("The writer did not produce all three documents. Try again.");
  }

  const markdown = `${prd}\n\n${adr}\n\n${techDesign}`;
  return {
    prd: { title: firstHeading(prd) || "Product Requirements Document", content: prd },
    adr: { title: firstHeading(adr) || "Architecture Decision Record", content: adr },
    techDesign: {
      title: firstHeading(techDesign) || "Technical Design Document",
      content: techDesign,
    },
    diagrams: extractMermaid(markdown),
    generatedAt: new Date().toISOString(),
  };
}

// Build the research doc client-side from findings (no extra LLM call) and the
// ZUSS-aligned filenames from §7.2.
export function renderResearchMarkdown(findings) {
  const lines = [
    "# Research — verified facts",
    "",
    "Every claim below was checked against a live source with an access date.",
    "",
  ];
  for (const f of findings || []) {
    lines.push(`## ${f.title}`, "", f.summary || "", "");
    for (const c of f.citations || []) {
      lines.push(`- [${c.title}](${c.url}) (accessed ${c.accessDate})`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function documentFilenames(appName) {
  const slug = slugify(appName);
  return {
    research: `001-research-${slug}.md`,
    prd: `002-prd-${slug}-mvp.md`,
    techDesign: `003-tech-design-${slug}.md`,
    adr: `004-adr-${slug}.md`,
  };
}

export function diagramFilenames(diagrams) {
  return (diagrams || []).map((diagram, index) => ({
    name: `diagrams/${String(index + 1).padStart(3, "0")}-${diagram.name}.mmd`,
    content: diagram.content,
  }));
}

export async function writeDocuments(architecture, options = {}) {
  const validation = validateWriterInput(architecture);
  if (!validation.ok) throw new Error(validation.error);

  const response = await callLLM(buildWriterPayload(architecture), options);
  return parseWriterResponse(responseText(response));
}
