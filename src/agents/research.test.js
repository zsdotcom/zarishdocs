import test from "node:test";
import assert from "node:assert/strict";
import {
  buildResearchPayload,
  citationsFromResponse,
  parseResearchResponse,
  preferredDomainsFor,
  rankCitations,
  researchIdea,
  validateResearchPayload,
} from "./research.js";

test("validateResearchPayload blocks inputs without requirements", () => {
  assert.equal(validateResearchPayload({}).ok, false);
  assert.equal(validateResearchPayload({ requirements: [] }).ok, false);
  assert.equal(validateResearchPayload({ requirements: [{ id: "a" }] }).ok, true);
});

test("preferredDomainsFor reads from sources.config.json", () => {
  assert.deepEqual(preferredDomainsFor("npm-package"), ["npmjs.com", "github.com"]);
  assert.deepEqual(preferredDomainsFor("unknown-topic"), []);
});

test("buildResearchPayload uses 2.5 Flash with google_search grounding", () => {
  const payload = buildResearchPayload({ id: "r1", title: "Booking", topic: "npm-package" });
  assert.equal(payload.model, "gemini-2.5-flash");
  assert.deepEqual(payload.tools, [{ google_search: {} }]);
});

test("buildResearchPayload injects the domain bias into the prompt", () => {
  const payload = buildResearchPayload({ id: "r1", title: "Booking", topic: "npm-package" });
  const prompt = payload.systemInstruction.parts[0].text;
  assert.equal(prompt.includes("npmjs.com"), true);
  assert.equal(prompt.includes("prioritize official sources"), true);
});

test("buildResearchPayload falls back to authoritative-sources wording", () => {
  const payload = buildResearchPayload({ id: "r1", title: "Booking", topic: "default" });
  assert.equal(payload.systemInstruction.parts[0].text.includes("Use authoritative sources."), true);
});

test("rankCitations puts preferred domains first", () => {
  const citations = [
    { url: "https://thirdparty.example.com/a" },
    { url: "https://docs.npmjs.com/b" },
    { url: "https://other.example.com/c" },
  ];
  const ranked = rankCitations(citations, ["npmjs.com"]);
  assert.equal(ranked[0].url, "https://docs.npmjs.com/b");
});

test("citationsFromResponse reads groundingMetadata chunks", () => {
  const response = {
    candidates: [
      {
        groundingMetadata: {
          groundingChunks: [
            { web: { title: "NPM Docs", uri: "https://docs.npmjs.com" } },
            { web: { title: "Other", uri: "" } },
          ],
        },
      },
    ],
  };
  const citations = citationsFromResponse(response);
  assert.equal(citations.length, 1);
  assert.equal(citations[0].url, "https://docs.npmjs.com");
});

test("parseResearchResponse merges, dedupes and ranks citations", () => {
  const response = {
    candidates: [
      {
        groundingMetadata: {
          groundingChunks: [{ web: { title: "Docs", uri: "https://docs.npmjs.com" } }],
        },
        content: {
          parts: [
            {
              text: JSON.stringify({
                finding: {
                  title: "Booking",
                  summary: "Summary here.",
                  citations: [
                    { title: "Docs", url: "https://docs.npmjs.com", accessDate: "2026-08-11" },
                    { title: "Blog", url: "https://blog.example.com", accessDate: "2026-08-11" },
                  ],
                },
              }),
            },
          ],
        },
      },
    ],
  };
  const finding = parseResearchResponse(response, { id: "r1", title: "Booking", topic: "npm-package" });
  assert.equal(finding.requirementId, "r1");
  assert.equal(finding.citations.length, 2);
  assert.equal(finding.citations[0].url, "https://docs.npmjs.com");
});

test("researchIdea produces findings per requirement", async () => {
  const requirement = { id: "scope", title: "Booking flow", topic: "default" };
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    finding: {
                      title: "Booking",
                      summary: "Summary.",
                      citations: [{ title: "S", url: "https://s.example.com", accessDate: "2026-08-11" }],
                    },
                  }),
                },
              ],
            },
          },
        ],
      }),
      { status: 200 },
    );

  const research = await researchIdea({ requirements: [requirement] });
  assert.equal(research.model, "gemini-2.5-flash");
  assert.equal(research.findings.length, 1);
  assert.equal(research.findings[0].citations.length >= 1, true);
});
