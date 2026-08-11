import test from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./errors.js";
import { callLLM, extractJson } from "./api.js";

test("extractJson parses a bare object", () => {
  assert.deepEqual(extractJson('{"a": 1}'), { a: 1 });
});

test("extractJson strips prose around the object", () => {
  const raw = "Sure! Here is the result: {\"summary\": \"x\"}. Hope that helps.";
  assert.deepEqual(extractJson(raw), { summary: "x" });
});

test("extractJson handles a fenced json block", () => {
  const raw = "```json\n{\"a\": [1, 2, {\"b\": \"c\"}]}\n```";
  assert.deepEqual(extractJson(raw), { a: [1, 2, { b: "c" }] });
});

test("extractJson returns null when braces are unbalanced", () => {
  assert.equal(extractJson('{"a":'), null);
});

test("extractJson returns null for non-JSON text", () => {
  assert.equal(extractJson("no object here"), null);
});

test("callLLM maps 429 to a quota AppError", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: { message: "Rate limit" } }), { status: 429 });

  await assert.rejects(
    () => callLLM({ model: "gemini-2.5-flash", contents: [] }),
    (error) => error instanceof AppError && error.kind === "quota",
  );
});

test("callLLM returns parsed json on success", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ candidates: [] }), { status: 200 });

  const result = await callLLM({ model: "gemini-2.5-flash", contents: [] });
  assert.deepEqual(result, { candidates: [] });
});

test("callLLM uses the direct Gemini endpoint when an apiKey is given", async () => {
  let calledUrl;
  globalThis.fetch = async (url) => {
    calledUrl = url;
    return new Response(JSON.stringify({ candidates: [] }), { status: 200 });
  };

  await callLLM({ model: "gemini-2.5-flash", contents: [] }, { apiKey: "abc" });
  assert.equal(calledUrl.includes("generativelanguage.googleapis.com"), true);
});

test("callLLM classifies network failure as offline", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };

  await assert.rejects(
    () => callLLM({ model: "gemini-2.5-flash", contents: [] }),
    (error) => error instanceof AppError && error.kind === "offline",
  );
});
