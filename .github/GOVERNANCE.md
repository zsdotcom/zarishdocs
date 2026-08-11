# Governance

This document describes how decisions are made for ZarishDocs.

## Scope

Governance applies to:
- Application code (`src/`, `worker/`, `sw.js`, `index.html`)
- Product documents (`docs/*`, `agent_docs/*`)
- Workflow resources (`.claude/skills/*`, `templates/*`, `examples/*`)
- Community health files and automation (`.github/*`)

## Roles

### Maintainer
- Reviews and merges pull requests
- Curates roadmap direction
- Resolves disputes and final tie-break decisions

### Contributor
- Proposes changes through issues, discussions, and pull requests
- Helps improve code, prompts, docs, examples, and workflows

## Decision-making model

We use a pragmatic, lightweight model:
- Small changes: maintainer discretion after normal PR review
- Significant changes (architecture, the workflow contract, breaking behavior): discussed first in Discussions or an issue
- Default approach: seek consensus, but avoid blocking progress indefinitely

## Change categories

- **Editorial:** typo fixes, clarity improvements, link updates
- **Operational:** workflow/action updates, policy docs, checklist updates
- **Structural:** major contract or architecture changes (e.g. the agent pipeline, the Worker
  proxy, the grounding prompt wording pinned in Tech Design §9.2)

Structural changes should include:
- Rationale
- Migration notes (if behavior changes)
- Updated references in docs

## Release and maintenance cadence

- Primary cadence: monthly maintenance updates
- Urgent fixes: shipped as needed (broken links, security clarifications, major regressions)

## Conduct and enforcement

Community behavior follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security and sensitive reports

Security issues must follow [SECURITY.md](SECURITY.md) and should not be filed as public issues.
