# Lovable — nothing to copy

Lovable reads a root-level `AGENTS.md` from your connected GitHub repo on
every message, regardless of session length. The instantiated `AGENTS.md` is
already everything Lovable needs — no adapter file required.

Non-technical users on Lovable's hosted builder typically won't touch
`AGENTS.md` at all. If you want persistent rules without a repo, use
**Project settings → Knowledge** (10,000-char limit) and paste the three-line
pointer there:

> Read AGENTS.md — it is the source of truth for this project. Details live in `agent_docs/`.

Workspace knowledge (applies to every project in the workspace) is a separate
field under the same settings; keep shared rules there and project-specific
rules in project knowledge.
