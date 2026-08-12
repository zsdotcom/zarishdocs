import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDiscoveryPayload,
  buildResearchPayload,
  citationsFromResponse,
  parseDiscoveryResponse,
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

test("buildDiscoveryPayload uses Flash-Lite with the domain bias, no tools", () => {
  const payload = buildDiscoveryPayload({ id: "r1", title: "Booking", topic: "npm-package" });
  assert.equal(payload.model, "gemini-3.5-flash-lite");
  assert.equal(payload.tools, undefined);
  const prompt = payload.systemInstruction.parts[0].text;
  assert.equal(prompt.includes("npmjs.com"), true);
  assert.equal(prompt.includes('"urls"'), true);
});

test("parseDiscoveryResponse extracts candidate URLs from the discovery call", () => {
  const response = {
    candidates: [
      {
        content: {
          parts: [
            {
              text: JSON.stringify({
                urls: [
                  { url: "https://www.npmjs.com/package/foo", reason: "docs" },
                  "https://github.com/foo/bar",
                  { url: "not-a-url", reason: "bad" },
                ],
              }),
            },
          ],
        },
      },
    ],
  };
  const urls = parseDiscoveryResponse(response);
  assert.deepEqual(urls, [
    "https://www.npmjs.com/package/foo",
    "https://github.com/foo/bar",
  ]);
});

test("buildResearchPayload uses 3.6 Flash with url_context grounding and the candidate URLs", () => {
  const payload = buildResearchPayload(
    { id: "r1", title: "Booking", topic: "npm-package" },
    ["https://www.npmjs.com/package/foo", "https://github.com/foo/bar"],
  );
  assert.equal(payload.model, "gemini-3.6-flash");
  assert.deepEqual(payload.tools, [{ url_context: {} }]);
  const userText = payload.contents[0].parts[0].text;
  assert.equal(userText.includes("https://www.npmjs.com/package/foo"), true);
  assert.equal(userText.includes("https://github.com/foo/bar"), true);
  assert.equal(payload.generationConfig.responseMimeType, undefined);
});

test("buildResearchPayload injects the domain bias into the prompt", () => {
  const payload = buildResearchPayload({ id: "r1", title: "Booking", topic: "npm-package" }, []);
  const prompt = payload.systemInstruction.parts[0].text;
  assert.equal(prompt.includes("npmjs.com"), true);
  assert.equal(prompt.includes("prioritize official sources"), true);
  assert.equal(prompt.includes("url_context"), true);
});

test("buildResearchPayload falls back to authoritative-sources wording", () => {
  const payload = buildResearchPayload({ id: "r1", title: "Booking", topic: "default" }, []);
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

test("researchIdea runs discovery then grounded research per requirement", async () => {
  const requirement = { id: "scope", title: "Booking flow", topic: "default" };

  const responses = [
    // Discovery call → candidate URLs.
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                { text: JSON.stringify({ urls: [{ url: "https://s.example.com", reason: "docs" }] }) },
              ],
            },
          },
        ],
      }),
      { status: 200 },
    ),
    // Research call → finding with citations.
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
    ),
  ];
  globalThis.fetch = async () => responses.shift();

  const research = await researchIdea({ requirements: [requirement] });
  assert.equal(research.model, "gemini-3.6-flash");
  assert.equal(research.findings.length, 1);
  assert.equal(research.findings[0].citations.length >= 1, true);
});

test("researchIdea retries discovery once when no URLs come back", async () => {
  const requirement = { id: "scope", title: "Booking flow", topic: "default" };
  const discoveryCalls = [];
  const urlsResponse = (urls) =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify({ urls }) }],
            },
          },
        ],
      }),
      { status: 200 },
    );

  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    if (body.model === "gemini-3.5-flash-lite") {
      discoveryCalls.push(body);
      return discoveryCalls.length === 1
        ? urlsResponse([{ url: "not-a-http-url", reason: "bad" }])
        : urlsResponse([{ url: "https://s.example.com", reason: "docs" }]);
    }
    return new Response(
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
  };

  const research = await researchIdea({ requirements: [requirement] });
  assert.equal(discoveryCalls.length, 2);
  assert.equal(research.findings.length, 1);
});

test("researchIdea fails loudly when both discovery attempts return nothing", async () => {
  const requirement = { id: "scope", title: "Booking flow", topic: "default" };
  let discoveryCalls = 0;
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    if (body.model === "gemini-3.5-flash-lite") {
      discoveryCalls++;
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify({ urls: [] }) }],
              },
            },
          ],
        }),
        { status: 200 },
      );
    }
    throw new Error("research must not run with zero candidate URLs");
  };

  await assert.rejects(
    () => researchIdea({ requirements: [requirement] }),
    (error) =>
      error.kind === "upstream" &&
      error.retryable === true &&
      error.message.includes("Could not find source URLs"),
  );
  assert.equal(discoveryCalls, 2);
});
