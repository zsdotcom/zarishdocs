# Testing Strategy

## Frameworks
- **Unit + integration tests:** Node's built-in `node:test` — pinned in Tech Design §12. `npm test` runs `node --test "src/**/*.test.js" "worker/**/*.test.js"`. Currently **51 tests pass** across the agents, `api.js`/`errors.js`, and the Worker proxy. (Node ≥ 22; if `npm` is not on PATH, run the `node --test ...` command directly.)
- **Syntax check:** `npm run check` → `node --check` over the shipped `src/` modules, `worker/`, and `sw.js`.
- **Formatting:** Prettier — `npm run format` (write) / `npm run format:check`; run before finishing a change set, without reformatting files you didn't touch.
- **E2E Tests:** manual browser verification is mandatory for UI work regardless: confirm the folder-write path in Chromium AND the download fallback in Safari/Firefox/mobile.

## Rules & Requirements
- **Coverage:** Unit-test all new utilities, especially pure agent logic (Profiler requirement parsing, citation re-ranking, `extractJson`, `sources.config.json` validation). No target % is set.
- **Before Commit:** Always run the agreed test command before verifying a task is complete.
- **Failures:** NEVER skip tests or mock out assertions to make a pipeline pass without Human approval. If an Agent breaks a test, the Agent must fix it.
- **UI verification:** Any UI change must be verified in a real browser before marking complete — static analysis alone is not proof.

## Must-Verify Flows (manual, in addition to any automated tests)
1. Folder write on Chrome/Edge/Opera desktop (File System Access path, no repeated prompts).
2. Download fallback on Safari, Firefox, and a mobile browser — must be surfaced on first load, never silent.
3. Offline: load shell with network off (SW serves shell); live research shows a clear "reconnect" state.
4. Free-tier rate limit: a 429 from Gemini surfaces a friendly "wait a bit" message, not a raw error.
5. Grounding quota accounting: the Worker proxy stamps `x-zarish-quota-bucket: grounding|generation` on every response — assert the header for both tool-use paths (covered automatically in `worker/index.test.js`; re-check live).

## Execution
- Run all tests: `npm test` (→ `node --test "src/**/*.test.js" "worker/**/*.test.js"`)
- Run a single test file: `node --test src/agents/research.test.js`
- Run a named test: `node --test --test-name-pattern "<name>" src/agents/writer.test.js`
