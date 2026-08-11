# Tool Adapters — thin pointers, not prompt dumps

**AGENTS.md is the universal contract.** The instantiated `AGENTS.md` at the
project root is the source of truth; Codex reads it natively, and most modern
agents (Claude Code, Cursor, Antigravity, Copilot, Windsurf, Lovable, OpenCode)
do too. This folder holds the tiny per-tool adapter files that point each tool
at it. Every adapter is a pointer — never a copy of AGENTS.md content.

## Where each file goes

| File in this folder | Copy to (in the user's project) | Tool |
|---|---|---|
| `CLAUDE.md` | `CLAUDE.md` (project root) | Claude Code |
| `gemini-cli/GEMINI.md` | `GEMINI.md` (project root) | Gemini CLI |
| `cursor/rules/zsdocs.mdc` | `.cursor/rules/zsdocs.mdc` | Cursor |
| `windsurf/rules/zsdocs.md` | `.windsurf/rules/zsdocs.md` | Windsurf |
| `antigravity/rules/zsdocs.md` | `.agent/rules/zsdocs.md` | Google Antigravity |
| `codex/README.md` | — nothing to copy — | Codex (reads `AGENTS.md` natively) |
| `opencode/README.md` | — nothing to copy — | OpenCode (reads `AGENTS.md` natively) |
| `copilot/copilot-instructions.md` | `.github/copilot-instructions.md` | GitHub Copilot (optional — Copilot reads `AGENTS.md` natively) |
| `lovable/README.md` | — nothing to copy — | Lovable (reads root `AGENTS.md`) |
| `opencode/commands/zsdocs-workflow.md` | `.opencode/commands/zsdocs-workflow.md` | OpenCode |
| `cursor/commands/zsdocs-workflow.md` | `.cursor/commands/zsdocs-workflow.md` | Cursor |
| `cursor/commands/zsdocs-research.md` | `.cursor/commands/zsdocs-research.md` | Cursor |
| `cursor/commands/zsdocs-prd.md` | `.cursor/commands/zsdocs-prd.md` | Cursor |
| `cursor/commands/zsdocs-techdesign.md` | `.cursor/commands/zsdocs-techdesign.md` | Cursor |
| `cursor/commands/zsdocs-agents.md` | `.cursor/commands/zsdocs-agents.md` | Cursor |
| `cursor/commands/zsdocs-build.md` | `.cursor/commands/zsdocs-build.md` | Cursor |
| `antigravity/workflows/zsdocs-workflow.md` | `.agent/workflows/zsdocs-workflow.md` | Google Antigravity |
| `antigravity/workflows/zsdocs-research.md` | `.agent/workflows/zsdocs-research.md` | Google Antigravity |
| `antigravity/workflows/zsdocs-prd.md` | `.agent/workflows/zsdocs-prd.md` | Google Antigravity |
| `antigravity/workflows/zsdocs-techdesign.md` | `.agent/workflows/zsdocs-techdesign.md` | Google Antigravity |
| `antigravity/workflows/zsdocs-agents.md` | `.agent/workflows/zsdocs-agents.md` | Google Antigravity |
| `antigravity/workflows/zsdocs-build.md` | `.agent/workflows/zsdocs-build.md` | Google Antigravity |
| `codex/prompts/zsdocs-workflow.md` | `~/.codex/prompts/zsdocs-workflow.md` (user-level) | Codex |
| `codex/prompts/zsdocs-research.md` | `~/.codex/prompts/zsdocs-research.md` (user-level) | Codex |
| `codex/prompts/zsdocs-prd.md` | `~/.codex/prompts/zsdocs-prd.md` (user-level) | Codex |
| `codex/prompts/zsdocs-techdesign.md` | `~/.codex/prompts/zsdocs-techdesign.md` (user-level) | Codex |
| `codex/prompts/zsdocs-agents.md` | `~/.codex/prompts/zsdocs-agents.md` (user-level) | Codex |
| `codex/prompts/zsdocs-build.md` | `~/.codex/prompts/zsdocs-build.md` (user-level) | Codex |
| `opencode/commands/zsdocs-research.md` | `.opencode/commands/zsdocs-research.md` | OpenCode |
| `opencode/commands/zsdocs-prd.md` | `.opencode/commands/zsdocs-prd.md` | OpenCode |
| `opencode/commands/zsdocs-techdesign.md` | `.opencode/commands/zsdocs-techdesign.md` | OpenCode |
| `opencode/commands/zsdocs-agents.md` | `.opencode/commands/zsdocs-agents.md` | OpenCode |
| `opencode/commands/zsdocs-build.md` | `.opencode/commands/zsdocs-build.md` | OpenCode |

The `zsdocs-*` files above are optional slash-command shortcuts — one per
workflow stage (research → build), mirroring the Claude Code skills in
`.claude/skills/`. Each is a thin wrapper that defers to the root `part*.md`
files as the single source of truth. Invoke with `/zsdocs-research` etc. in
Cursor, Antigravity, and OpenCode, or `/prompts:zsdocs-research` in Codex
(restart the tool after copying so it picks the prompts up; Codex prompts are
user-level only, so they work in every project but can't live inside one).

## Notes

- **Cursor:** the `.mdc` frontmatter (`description`, `alwaysApply: true`) makes
  the rule load in every chat. Legacy `.cursorrules` still works but is
  deprecated — delete it if one exists.
- **Windsurf:** reads `AGENTS.md` natively; `rules/zsdocs.md` is an optional
  always-on workspace rule (`trigger: always_on`). Legacy `.windsurfrules`
  still loads but is superseded by `.windsurf/rules/`. Global rules live in
  `~/.codeium/windsurf/memories/global_rules.md`.
- **Antigravity:** current versions read `AGENTS.md` natively; the
  `.agent/rules/` file is an always-on workspace rule that reinforces it.
  Global (all-project) rules live in `~/.gemini/GEMINI.md`.
- **Gemini CLI:** its native context file is `GEMINI.md`, not `AGENTS.md` —
  copy `gemini-cli/GEMINI.md` to the project root, or point Gemini CLI at
  `AGENTS.md` via `context.fileName` in `~/.gemini/settings.json`. See
  `gemini-cli/README.md`.
- **GitHub Copilot:** reads root-level `AGENTS.md` natively; the optional
  `copilot-instructions.md` pointer is only for Copilot-specific tuning.
  Path-scoped rules live in `.github/instructions/`, `/name` prompts in
  `.github/prompts/`. See `copilot/README.md`.
- **Lovable:** reads root-level `AGENTS.md` from the connected repo; no file
  to copy. Hosted users can paste a pointer into Project Knowledge instead.
  See `lovable/README.md`.
- **Codex / OpenCode:** see `codex/README.md` / `opencode/README.md`. Optional:
  personal reusable prompts in `~/.codex/prompts/`, or project commands in
  `.opencode/commands/`.
