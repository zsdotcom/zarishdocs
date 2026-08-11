import test from "node:test";
import assert from "node:assert/strict";
import { profileIdea, validateIdea } from "./profiler.js";

test("validateIdea returns false for empty text", () => {
  const result = validateIdea("");

  assert.equal(result.ok, false);
  assert.equal(result.error, "Idea is required.");
});

test("profileIdea creates a research-ready structure", async () => {
  const profile = await profileIdea("A simple scheduling app for independent consultants.");

  assert.equal(profile.model, "gemini-2.5-flash-lite");
  assert.equal(Array.isArray(profile.requirements), true);
  assert.equal(profile.requirements.length >= 1, true);
  assert.equal(profile.tags.includes("mvp"), true);
});
