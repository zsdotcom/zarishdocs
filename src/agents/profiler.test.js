import test from "node:test";
import assert from "node:assert/strict";
import { buildProfilePayload, parseProfileResponse, profileIdea, validateIdea } from "./profiler.js";

test("validateIdea returns false for empty text", () => {
  const result = validateIdea("");
  assert.equal(result.ok, false);
  assert.equal(result.error, "Idea is required.");
});

test("validateIdea caps length at 2000 characters", () => {
  assert.equal(validateIdea("x".repeat(2001)).ok, false);
  assert.equal(validateIdea("a sufficiently long idea").ok, true);
});

test("buildProfilePayload uses Flash-Lite without grounding", () => {
  const payload = buildProfilePayload("A scheduling app for consultants.");
  assert.equal(payload.model, "gemini-2.5-flash-lite");
  assert.equal(payload.tools, undefined);
  assert.equal(payload.contents[0].parts[0].text, "A scheduling app for consultants.");
});

test("parseProfileResponse maps requirements to the pipeline shape", () => {
  const text = JSON.stringify({
    summary: "A scheduling app.",
    requirements: [
      { id: "r1", title: "Booking flow", topic: "browser-api" },
      { id: "r2", title: "Unknown thing", topic: "not-a-topic" },
    ],
  });
  const profile = parseProfileResponse(text);
  assert.equal(profile.summary, "A scheduling app.");
  assert.equal(profile.requirements[0].topic, "browser-api");
  assert.equal(profile.requirements[1].topic, "not-a-topic");
});

test("parseProfileResponse throws when no requirements are found", () => {
  assert.throws(() => parseProfileResponse('{"summary": "x", "requirements": []}'), /no requirements/);
});

test("profileIdea creates a research-ready structure", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    summary: "A scheduling app.",
                    requirements: [{ id: "r1", title: "Booking", topic: "default" }],
                  }),
                },
              ],
            },
          },
        ],
      }),
      { status: 200 },
    );

  const profile = await profileIdea("A simple scheduling app for independent consultants.");
  assert.equal(profile.model, "gemini-2.5-flash-lite");
  assert.equal(profile.requirements[0].topic, "default");
  assert.equal(profile.tags.includes("mvp"), true);
});
