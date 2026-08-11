# FAQ

## What is this repository?

ZarishDocs is a browser-only, zero-cost AI research lab. A user types a plain-language app
idea and ZarishDocs researches it against live, cited sources (official-domain-first), then
writes a linked **PRD + ADR + Tech Design** as Markdown into a folder the user picks. This
repository also hosts the ZarishDocs workflow that the app automates: the skills
(`.claude/skills/`), the instantiable templates (`templates/`), and a worked example
(`examples/reddit-to-ai/`).

## Is this free to use?

Yes. It is open source under Apache 2.0 (code) · CC BY 4.0 (documentation). See the
[Tech Design](../docs/TechDesign-ZarishDocs-MVP.md).

## Can I use this commercially?

Yes. Apache 2.0 allows commercial usage, modification, and redistribution under the license
terms.

## Where should I start?

Start with [README.md](../README.md), then [AGENTS.md](../AGENTS.md) for the project's
source of truth. To run the app: serve the folder (`npm run serve`) and open `127.0.0.1:8080`.

## Where do I ask questions?

Use [GitHub Discussions](https://github.com/zsdotcom/zarishdocs/discussions) if enabled,
otherwise open an issue with the "question" label.

## Where do I report bugs or request features?

Use [GitHub Issues](https://github.com/zsdotcom/zarishdocs/issues) and choose the relevant
template.

## How do I report security issues?

Do not open a public issue. Use private reporting via
[Security Advisories](https://github.com/zsdotcom/zarishdocs/security/advisories/new).
