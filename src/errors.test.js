import test from "node:test";
import assert from "node:assert/strict";
import {
  AppError,
  classifyFetchError,
  kindForStatus,
  messageForKind,
} from "./errors.js";

test("kindForStatus maps 429 to quota", () => {
  assert.equal(kindForStatus(429), "quota");
});

test("kindForStatus maps auth statuses", () => {
  assert.equal(kindForStatus(401), "auth");
  assert.equal(kindForStatus(403), "auth");
});

test("kindForStatus maps server errors to upstream", () => {
  assert.equal(kindForStatus(500), "upstream");
});

test("messageForKind returns friendly quota copy", () => {
  assert.match(messageForKind("quota"), /wait a moment/i);
});

test("classifyFetchError passes through AppError untouched", () => {
  const original = new AppError("quota", "wait");
  assert.equal(classifyFetchError(original), original);
});

test("classifyFetchError maps a network TypeError to offline", () => {
  const error = classifyFetchError(new TypeError("failed"));
  assert.equal(error.kind, "offline");
  assert.equal(error.retryable, true);
});

test("classifyFetchError maps a status to the right kind", () => {
  const error = classifyFetchError(new Error("boom"), { status: 429 });
  assert.equal(error.kind, "quota");
});
