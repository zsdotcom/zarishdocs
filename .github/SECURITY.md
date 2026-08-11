# Security Policy

## Reporting a vulnerability

**Do not open a public issue for security vulnerabilities.**

Use GitHub's private vulnerability reporting: go to the affected repository's **Security**
tab → **Report a vulnerability**. This opens a private advisory visible only to maintainers.

If you cannot use that flow, email: **platform@zarishsphere.com**

Include: affected repo/version, a description of the issue, and reproduction steps if
possible. You will get an acknowledgment as soon as practical — this is a solo-maintainer
project, so response times may vary, but security reports are the highest priority.

## Scope

This applies to all repositories under the `zsdotcom` GitHub organization.

## ZarishDocs-specific notes

- **Secrets:** `GEMINI_API_KEY` lives only as a Cloudflare Worker secret — never in the repo
  or client bundle. The BYO-key path stores the user's key in `sessionStorage` only, never on
  disk. Any advisory touching key handling is high priority.
- **The only outbound call** is the proxied LLM request through the Cloudflare Worker
  (`worker/index.js`). There is no telemetry, analytics, or other network egress — an
  advisory describing unexpected network activity should be treated as critical.
- **Generated docs** carry live, dated citations; a security advisory involving the
  grounding/sourcing pipeline should flag the affected `sources.config.json` routing.
