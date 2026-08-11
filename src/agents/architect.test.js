import test from "node:test";
import assert from "node:assert/strict";
import {
  architectDocument,
  buildArchitectPayload,
  parseArchitectResponse,
  validateArchitectInput,
} from "./architect.js";

const findings = [
  {
    requirementId: "scope",
    title: "Booking flow",
    summary: "A summary.",
    citations: [{ title: "Docs", url: "https://docs.example.com", accessDate: "2026-08-11" }],
  },
];

test("validateArchitectInput rejects missing research", () => {
  assert.equal(validateArchitectInput(null).ok, false);
  assert.equal(validateArchitectInput({ findings: [] }).ok, false);
  assert.equal(validateArchitectInput({ findings }).ok, true);
});

test("buildArchitectPayload keeps every citation", () => {
  const payload = buildArchitectPayload(findings);
  assert.equal(payload.model, "gemini-3.5-flash");
  assert.equal(payload.tools, undefined);
  const body = payload.contents[0].parts[0].text;
  assert.equal(body.includes("https://docs.example.com"), true);
});

test("parseArchitectResponse builds outlines and decisions", () => {
  const text = JSON.stringify({
    prd: { title: "PRD", sections: ["Problem", "MVP"] },
    adr: { title: "ADR", decision: "Use proxy.", sections: ["Context"] },
    techDesign: { title: "Tech Design", sections: ["Architecture"] },
  });
  const architecture = parseArchitectResponse(text, findings);
  assert.equal(architecture.outlines.prd.sections.includes("Problem"), true);
  assert.equal(architecture.decisions[0].detail, "Use proxy.");
  assert.equal(architecture.requirements[0].id, "scope");
});

test("parseArchitectResponse throws on unreadable text", () => {
  assert.throws(() => parseArchitectResponse("not json", findings), /unreadable response/);
});

test("architectDocument calls the LLM and parses", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    prd: { title: "PRD", sections: ["Problem"] },
                    adr: { title: "ADR", decision: "D.", sections: [] },
                    techDesign: { title: "TD", sections: [] },
                  }),
                },
              ],
            },
          },
        ],
      }),
      { status: 200 },
    );

  const architecture = await architectDocument({ findings });
  assert.equal(architecture.outlines.prd.title, "PRD");
});
