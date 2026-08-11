# Using the GitHub MCP Server against `zsdotcom` (maintainer tooling, not repo automation)

This is not something GitHub runs on your behalf — it's a connector you (a human maintainer)
turn on locally so an AI client (Claude Code, Claude Desktop, VS Code Copilot agent mode,
Cursor) can read and act on this org's repos, issues, PRs, Actions runs, and security alerts
through natural-language requests instead of you clicking through the GitHub UI.

Free — it's a connector against your own GitHub account/token, not a hosted paid service.

## Remote (easiest)

Most MCP-capable clients support GitHub's remote server directly:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer YOUR_GITHUB_PAT" }
    }
  }
}
```

## Local (Docker)

```bash
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_PAT \
  -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```

## Token scope

Create a fine-grained PAT scoped to the `zsdotcom` org only, with the minimum permissions you
actually need (contents, issues, pull requests, security_events — add more only as needed).
Don't reuse a broad personal-account PAT for this.

## What this is good for

- "List open bugs across zsdotcom repos labeled `security`."
- "Summarize this week's Dependabot alerts."
- "Draft a reply to this issue, but don't post it — show me first."

## What this is not

A repo automation mechanism — nothing here runs in CI. For unattended in-CI AI behavior (auto
PR review, auto-triage), see `workflows-to-copy-per-repo/claude-pr-assistant.yml`, which is a
separate, paid, opt-in path.

Full reference: `github/github-mcp-server` on GitHub.
