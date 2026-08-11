# Testing Strategy

## Frameworks
- **Unit Tests:** TBD — the Tech Design pins no test framework. Agree one in Phase 1 before writing tests (candidates: Node's built-in `node:test`, or Vitest — no framework constraint, vanilla JS).
- **E2E Tests:** TBD — manual browser verification is mandatory for UI work regardless: confirm the folder-write path in Chromium AND the download fallback in Safari/Firefox/mobile.

## Rules & Requirements
- **Coverage:** Unit-test all new utilities, especially pure agent logic (Profiler requirement parsing, citation re-ranking, `sources.config.json` validation). No target % is set.
- **Before Commit:** Always run the agreed test command before verifying a task is complete.
- **Failures:** NEVER skip tests or mock out assertions to make a pipeline pass without Human approval. If an Agent breaks a test, the Agent must fix it.
- **UI verification:** Any UI change must be verified in a real browser before marking complete — static analysis alone is not proof.

## Must-Verify Flows (manual, in addition to any automated tests)
1. Folder write on Chrome/Edge/Opera desktop (File System Access path, no repeated prompts).
2. Download fallback on Safari, Firefox, and a mobile browser — must be surfaced on first load, never silent.
3. Offline: load shell with network off (SW serves shell); live research shows a clear "reconnect" state.
4. Free-tier rate limit: a 429 from Gemini surfaces a friendly "wait a bit" message, not a raw error.
5. Grounding quota accounting: Worker proxy logs which quota bucket a response consumed (grounding vs generation) — the ADR-001 miscount risk.

## Execution
- Command to run all tests: TBD (to be recorded here once the framework is agreed in Phase 1)
- Command to run a single test file: TBD
