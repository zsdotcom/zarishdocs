# OpenCode — nothing to install

OpenCode reads `AGENTS.md` natively at the project root (same as Codex and
Cursor). The instantiated `AGENTS.md` is already everything OpenCode needs —
no adapter file required.

Optional: the `commands/` folder in this directory mirrors the Codex prompts.
Copy any of them to `.opencode/commands/` (project-scoped, committed) or
`~/.config/opencode/commands/` (user-level, every project) and invoke with
`/zsdocs-workflow`, `/zsdocs-prd`, etc. Each is a thin wrapper — the docs in
`docs/` remain the source of truth.

Restart OpenCode after copying so it picks the commands up.
