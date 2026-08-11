# Contributing to ZarishDocs

Thanks for your interest. This is a solo-founder, zero-budget open-source project — every
contribution matters and every contributor is treated as a domain expert in their area.

## Before you start

1. Check open issues and discussions to avoid duplicate work.
2. For anything non-trivial, open an issue first to align on approach before writing code.
3. Read `AGENTS.md` before touching code or docs — it is the single source of truth for
   project structure, commands, and the constraints below. Details live in the Context Files
   it lists.

## Pull requests

1. Fork the repo, branch from `main`, use a descriptive branch name (`fix/`, `feat/`, `docs/`).
2. Keep PRs scoped to one change. Reference the related issue.
3. Every PR is reviewed via GitHub PR review — this **is** the governance process (see
   "GitHub as Government" in the ZarishSphere architecture docs).
4. No `latest` tags in any config — pin exact versions.

## Code constraints (read before submitting)

- **Zero runtime dependencies** — ZarishDocs is a browser-only app with no framework and no
  build step. Do not add runtime deps or commit new lockfiles. Prettier is the one allowed
  devDependency. Check `agent_docs/tech_stack.md` before suggesting any dependency.
- **Privacy-first** — no telemetry/analytics, ever; the only outbound call is the proxied LLM
  request. Never log or send user data anywhere.
- **Zero-cost only** — Cloudflare + Gemini free tiers. No paid SDKs, no services without a
  genuine always-free tier.
- **Every technical claim cited** — generated docs tie each claim to a live source with an
  access date (see `sources.config.json` and the Research Agent). No invented citations.
- **Tests** — add tests for new pure logic (`node --test`), run `npm run check`, keep Prettier
  formatting clean (`npm run format`), and run `python scripts/validate.py` before opening a PR.

## Reporting bugs / requesting features

Use the issue templates — they route to the right place automatically.
