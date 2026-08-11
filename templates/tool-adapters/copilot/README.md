# GitHub Copilot — AGENTS.md is native, optional pointer below

GitHub Copilot reads a root-level `AGENTS.md` natively (chat, CLI, and code
review). The instantiated `AGENTS.md` is already everything Copilot needs.

Optional: for Copilot-specific tuning that you don't want in the shared
`AGENTS.md`, copy `copilot-instructions.md` from this folder to
`.github/copilot-instructions.md`. It is a thin pointer to `AGENTS.md` — paste
any Copilot-only preferences (path-scoped `.github/instructions/*.instructions.md`,
`.github/prompts/*.prompt.md` for `/name` prompts) around it.

Path-scoped instructions use frontmatter `applyTo` globs; `/name` prompt files
live in `.github/prompts/`. Both coexist with the pointer.
