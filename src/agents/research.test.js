import test from "node:test";
import assert from "node:assert/strict";
import { researchIdea, validateResearchPayload } from "./research.js";

test("validateResearchPayload blocks inputs without requirements", () => {
  const result = validateResearchPayload({});

  assert.equal(result.ok, false);
});

test("researchIdea produces citations and findings", async () => {
  const research = await researchIdea({
    requirements: [
      {
        id: "scope",
        title: "Booking flow",
      },
    ],
  });

  assert.equal(research.model, "gemini-2.5-flash");
  assert.equal(Array.isArray(research.findings), true);
  assert.equal(research.findings[0].citations.length >= 1, true);
});
