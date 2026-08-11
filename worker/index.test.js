import test from "node:test";
import assert from "node:assert/strict";
import worker from "./index.js";

const ENV = {
  ALLOWED_ORIGIN: "http://localhost:8080,https://your-site.pages.dev",
  GEMINI_API_KEY: "test-secret",
};

function request({ method = "POST", origin, body, model = "gemini-2.5-flash" } = {}) {
  const payload = body ?? { model, contents: [{ parts: [{ text: "hi" }] }] };
  return new Request("https://worker.example/proxy", {
    method,
    headers: origin ? { Origin: origin } : {},
    body: method === "POST" ? JSON.stringify(payload) : undefined,
  });
}

test("rejects an unknown origin with 403", async () => {
  const response = await worker.fetch(request({ origin: "https://evil.example" }), ENV);
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.equal(body.error.message, "Origin not allowed");
});

test("answers OPTIONS preflight with scoped CORS", async () => {
  const response = await worker.fetch(request({ method: "OPTIONS", origin: "http://localhost:8080" }), ENV);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "http://localhost:8080");
});

test("rejects non-POST methods", async () => {
  const response = await worker.fetch(request({ method: "GET", origin: "http://localhost:8080" }), ENV);
  assert.equal(response.status, 405);
});

test("rejects a model outside the whitelist (SSRF guard)", async () => {
  const response = await worker.fetch(
    request({ origin: "http://localhost:8080", model: "gemini-3-pro" }),
    ENV,
  );
  assert.equal(response.status, 400);
  assert.match((await response.json()).error.message, /Model not allowed/);
});

test("forwards grounded calls and stamps the grounding quota bucket", async () => {
  let upstreamUrl;
  let upstreamKey;
  globalThis.fetch = async (url, init) => {
    upstreamUrl = url;
    upstreamKey = init.headers["x-goog-api-key"];
    return new Response(JSON.stringify({ candidates: [] }), { status: 200 });
  };

  const payload = {
    model: "gemini-2.5-flash",
    contents: [{ parts: [{ text: "hi" }] }],
    tools: [{ google_search: {} }],
  };
  const response = await worker.fetch(request({ origin: "http://localhost:8080", body: payload }), ENV);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-zarish-quota-bucket"), "grounding");
  assert.equal(upstreamKey, "test-secret");
  assert.equal(upstreamUrl.includes("/models/gemini-2.5-flash:generateContent"), true);
});

test("stamps generation bucket when no search tool is present", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ candidates: [] }), { status: 200 });
  const response = await worker.fetch(request({ origin: "http://localhost:8080" }), ENV);
  assert.equal(response.headers.get("x-zarish-quota-bucket"), "generation");
});

test("re-emits upstream 429 with a friendly message and quota header", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: { message: "quota" } }), { status: 429 });
  const response = await worker.fetch(request({ origin: "http://localhost:8080" }), ENV);
  assert.equal(response.status, 429);
  assert.match((await response.json()).error.message, /free-tier rate limit/i);
  assert.equal(response.headers.get("x-zarish-quota-bucket"), "generation");
});

test("rejects invalid JSON bodies", async () => {
  const bad = new Request("https://worker.example/proxy", {
    method: "POST",
    headers: { Origin: "http://localhost:8080", "Content-Type": "application/json" },
    body: "{not json",
  });
  const response = await worker.fetch(bad, ENV);
  assert.equal(response.status, 400);
});
