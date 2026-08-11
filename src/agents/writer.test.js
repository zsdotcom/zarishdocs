import test from "node:test";
import assert from "node:assert/strict";
import {
  buildWriterPayload,
  diagramFilenames,
  documentFilenames,
  parseWriterResponse,
  renderResearchMarkdown,
  writeDocuments,
} from "./writer.js";

test("documentFilenames follow the ZUSS naming scheme", () => {
  const names = documentFilenames("My Booking App!");
  assert.equal(names.research, "001-research-my-booking-app.md");
  assert.equal(names.prd, "002-prd-my-booking-app-mvp.md");
  assert.equal(names.techDesign, "003-tech-design-my-booking-app.md");
  assert.equal(names.adr, "004-adr-my-booking-app.md");
});

test("renderResearchMarkdown keeps citations with access dates", () => {
  const markdown = renderResearchMarkdown([
    {
      title: "Booking flow",
      summary: "A summary.",
      citations: [{ title: "Docs", url: "https://docs.example.com", accessDate: "2026-08-11" }],
    },
  ]);
  assert.equal(markdown.includes("https://docs.example.com"), true);
  assert.equal(markdown.includes("2026-08-11"), true);
});

test("buildWriterPayload sends the architecture outline", () => {
  const payload = buildWriterPayload({ title: "T", outlines: {} });
  assert.equal(payload.model, "gemini-2.5-flash");
  assert.equal(payload.tools, undefined);
});

test("parseWriterResponse extracts all three documents and mermaid diagrams", () => {
  const text = JSON.stringify({
    prd: "# PRD\n\nIntro.",
    adr: "# ADR\n\nContext.",
    techDesign:
      "# Tech Design\n\n```mermaid\nflowchart TD\n  A --> B\n```\n\nDone.",
  });
  const docs = parseWriterResponse(text);
  assert.equal(docs.prd.title, "PRD");
  assert.equal(docs.adr.title, "ADR");
  assert.equal(docs.techDesign.title, "Tech Design");
  assert.equal(docs.diagrams.length, 1);
  assert.equal(docs.diagrams[0].content.includes("A --> B"), true);
});

test("parseWriterResponse throws when a document is missing", () => {
  assert.throws(() => parseWriterResponse('{"prd": "# P", "adr": ""}'), /all three documents/);
});

test("diagramFilenames are zero-padded and placed under diagrams/", () => {
  const files = diagramFilenames([{ name: "arch", content: "flowchart TD A" }]);
  assert.equal(files[0].name, "diagrams/001-arch.mmd");
});

test("writeDocuments parses a full LLM response", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    prd: "# PRD\n\nText.",
                    adr: "# ADR\n\nText.",
                    techDesign: "# Tech Design\n\nText.",
                  }),
                },
              ],
            },
          },
        ],
      }),
      { status: 200 },
    );

  const docs = await writeDocuments({ title: "T" });
  assert.equal(docs.prd.title, "PRD");
  assert.equal(docs.techDesign.title, "Tech Design");
});
