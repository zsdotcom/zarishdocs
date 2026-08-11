# Windsurf — copy the rule, or nothing at all

Windsurf reads a root-level `AGENTS.md` natively. The instantiated `AGENTS.md`
is already everything Windsurf needs.

Optional: copy `rules/zsdocs.md` from this folder to `.windsurf/rules/zsdocs.md`
for an always-on workspace rule that reinforces the pointer (like Cursor's
`.mdc`). Windsurf rule limits are tight (6,000 chars/file, 12,000 total) — the
pointer is well under.

Legacy `.windsurfrules` still loads but is superseded by `.windsurf/rules/` —
delete it if one exists. Global rules live in
`~/.codeium/windsurf/memories/global_rules.md`.
