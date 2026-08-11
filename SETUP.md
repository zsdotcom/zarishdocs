# SETUP.md — One-time repo & cloud setup so the first `git push` goes green

Everything that must exist **before** the first push to `zsdotcom/zarishdocs`, so no
workflow run fails and the app works end-to-end. Do this in order; each section is
click-by-click.

**The headline:** this repo needs **zero GitHub Actions secrets**. Every workflow uses
the auto-provisioned `GITHUB_TOKEN`. The only real credential in the whole project is the
Cloudflare `GEMINI_API_KEY` Worker secret (Section 4). Most of this guide is GitHub *settings*
(not secrets) plus the one-time Cloudflare/Google provisioning.

---

## 0. Account checklist (before you start)

| Account | Where | Free tier | Needed for |
|---|---|---|---|
| GitHub | github.com | yes | the repo, Actions, Pages-free workflows |
| Cloudflare | dash.cloudflare.com | yes | Worker proxy + Pages hosting |
| Google (AI Studio) | aistudio.google.com | yes | Gemini API key |

You need write access to `zsdotcom/zarishdocs` (you are the maintainer). Cloudflare and
Google can be the same email — no credit card required anywhere.

---

## 1. GitHub repository settings (required for green CI)

### 1.1 Confirm repo visibility: **Public**
The repo must be **public** — CodeQL, OSV-Scanner, and Scorecard are free only on public
repos (private repos require a paid Advanced Security license; Scorecard `publish_results`
requires public).

1. Go to **Repo → Settings → General → Danger Zone → Change repository visibility**.
2. Select **Public**, click **Change visibility**, confirm.

Current state (verified 2026-08-11): repo is **already public**. Skip if unchanged.

### 1.2 Confirm default branch is `main`
1. **Settings → General → Default branch** → confirm it says `main`. (Already correct.)

### 1.3 Enable Discussions — **required**, otherwise CI fails
The repo-lint workflow runs a broken-link check (`lychee`) on `.github/`, which links to
`https://github.com/zsdotcom/zarishdocs/discussions`. That URL returns **404 until
Discussions is enabled**, and the check fails the push. The issue template
(`ISSUE_TEMPLATE/config.yml`) links there too.

1. Go to **Repo → Settings → General → Features → Discussions**.
2. Tick **Discussions**, then **Save changes**.
3. Confirm the URL `https://github.com/zsdotcom/zarishdocs/discussions` now loads (200).

> A discussion template ships in this repo (`.github/DISCUSSION_TEMPLATE/governance.yml`)
> and is applied automatically.

### 1.4 Allow all Actions (third-party actions are used)
The workflows call third-party marketplace actions (`googleapis/release-please-action`,
`ossf/scorecard-action`, `lycheeverse/lychee-action`, `google/osv-scanner-action`,
`amannn/action-semantic-pull-request`, `actions/stale`). Those need "Allow all".

1. Go to **Repo → Settings → Actions → General → Actions permissions**.
2. Select **Allow all actions and reusable workflows** → **Save**.
3. Under **Workflow permissions**, leave **Read and write permissions** on the default OR
   choose **Read repository contents** — each workflow declares its own exact
   `permissions:` block, so either works. Keep the default if unsure.

### 1.5 (Recommended) enable dependency + secret tooling
These do **not** gate CI, but they're free on public repos and complement OSV-Scanner.

1. **Settings → Code security and analysis**, enable:
   - **Dependabot alerts**
   - **Dependabot security updates** (creates auto-PRs; note the repo-lint
     `Reject stale template-repo references` check is fine with those)
   - **Secret scanning**
   - **Push protection**
   - **Private vulnerability reporting**

### 1.6 (Recommended) create the labels from `labels.yml`
`labels.yml` defines 10 labels (bug, enhancement, docs, question, good-first-issue,
workflow, security, dependencies, stale). They are **not** applied automatically — the
`size/*` labels are created on demand by `pr-size-labeler.yml`, and `stale.yml` creates
`stale` itself, so CI runs even without this step. Apply them for a tidy repo:

```bash
gh label create --source .github/labels.yml --repo zsdotcom/zarishdocs
```
(or use an extension like `github/gh-labeler`). Manual alternative: **Issues → Labels →
New label** ×10 using `color`/`description` from `labels.yml`.

### 1.7 (Recommended) branch protection on `main`
Optional but improves the Scorecard score and prevents bad pushes:

1. **Settings → Branches → Add branch ruleset → New branch rule**.
2. Branch source: `main`. Require a pull request before merging; tick **Require status
   checks to pass**, then select **Repo Lint**, **CodeQL**, **OSV-Scanner**, **Semantic PR
   title** after they've each run once on a PR (checks only appear once they've run).
3. Do **not** lock the branch (workflows need to push the release PR).

> Code owners: `CODEOWNERS` routes reviews to the `@zsdotcom/maintainers` team. The team
> must exist and have at least **Read** access to this repo, or GitHub silently skips the
> assignment (not a CI failure). Team exists at `zsdotcom`; add this repo to it in
> **Settings → Collaborators and teams → Add teams** if not already a member.

---

## 2. GitHub Actions secrets & variables — **none required**

| Secret | Value | Needed? |
|---|---|---|
| `GITHUB_TOKEN` | auto-provisioned by Actions | used by `semantic-pr.yml` + `repo-lint.yml` (lychee) — automatic, do nothing |

There are **no** GitHub secrets or variables to create. `release-please`, `scorecard`,
`codeql`, `osv-scanner`, `greetings`, `stale`, and `pr-size-labeler` all run on the default
token with their self-declared permissions.

Do **not** add `GEMINI_API_KEY` as a GitHub secret — it belongs on Cloudflare (Section 4).

---

## 3. Gemini API key (Google AI Studio)

1. Open **https://aistudio.google.com** and sign in with any Google account.
2. Click **Get API key** in the top bar.
3. Click **Create API key** → pick a Google Cloud project (or "Create API key in new
   project") → **Create API key**.
4. A key like `AIza...` is shown — **copy it once** (it's not shown again in full).
5. Keep it in your password manager. This is the value you'll paste into Cloudflare in
   Section 4.3.

> Free-tier grounding is 2.5-family only (2.5 Flash / Flash-Lite, 500 RPD shared). The
> Worker already whitelists exactly those models — do not use a 3.x-only key setup.

---

## 4. Cloudflare: Worker proxy secret + variables (the app's only credential)

The Worker injects `GEMINI_API_KEY` server-side so no key ever ships in the browser bundle.

### 4.1 Create the Cloudflare account
1. Go to **https://dash.cloudflare.com** → **Sign up** → email + password → verify email.
2. Free plan is fine. No credit card required.

### 4.2 Install and log in with `wrangler`
`wrangler` is the CLI for both the Worker and Pages deploy. Node ≥ 22 is already required.

```bash
npm install -g wrangler
wrangler --version
```

Then authenticate (opens a browser tab):

```bash
wrangler login
```
Click **Allow** on the Cloudflare page. Confirm with:
```bash
wrangler whoami
```
You should see your account email and membership.

### 4.3 Deploy the Worker proxy + set the `GEMINI_API_KEY` secret
Order matters: `wrangler secret put` needs the Worker to already exist, so **deploy
first, then set the secret, then redeploy**.

```bash
cd worker
wrangler deploy          # first deploy creates zarishdocs-proxy
wrangler secret put GEMINI_API_KEY
# paste the AIza... key from Section 3 when prompted
wrangler deploy          # redeploy so the new secret is live
```
- The deploy output prints the Worker URL, e.g. `https://zarishdocs-proxy.<your-subdomain>.workers.dev`.
  **Copy it** — you'll need it in Section 5.
- Verify the secret: `wrangler secret list` shows `GEMINI_API_KEY` (as a fingerprint, not
  the value).

### 4.4 Set the `ALLOWED_ORIGIN` variable (replace the placeholder)
`ALLOWED_ORIGIN` is a plain `[vars]` variable (not a secret) that scopes CORS. It
currently contains the `https://your-site.pages.dev` placeholder, which would return **403
for real browsers** — and its presence makes the docs misleading. Replace it in
`worker/wrangler.toml`:

1. Open `worker/wrangler.toml`.
2. Replace the placeholder with your real Pages origin (get it from Section 4.5, then
   come back):
   ```toml
   ALLOWED_ORIGIN = "http://127.0.0.1:8080,http://localhost:8080,https://zarishdocs.pages.dev"
   ```
   (Keep the `localhost` entries for local dev. If you add a custom domain later, append it.)
3. Redeploy: `cd worker && wrangler deploy`.

### 4.5 Create and deploy the Pages site (the app)
The app is a static folder (`index.html`, `styles.css`, `sw.js`, `src/`). Publish it:

```bash
wrangler pages project create zarishdocs    # once; answer the prompts
wrangler pages deploy src                   # from the repo root
```
- The first `pages deploy` output ends with **`https://zarishdocs.pages.dev`** (or a
  `https://<hash>.zarishdocs.pages.dev` preview URL for non-production).
- For a clean URL, set a **production branch** in **Cloudflare dashboard → Workers &
  Pages → zarishdocs → Settings → Builds & deployments → Production branch = `main`**, then
  deploy from `main` to get the clean domain.
- Optional custom domain: **zarishdocs → Settings → Domains → Add custom domain**.
  If you add one, also append it to `ALLOWED_ORIGIN` (Section 4.4) and redeploy.

### 4.6 Local dev secret file (optional, already gitignored)
For local testing, `wrangler dev` reads secrets from `.dev.vars` in `worker/` (now in
`.gitignore`):

```
# worker/.dev.vars
GEMINI_API_KEY=AIza...
```

---

## 5. Replace the two placeholder URLs in code

Two placeholders keep the app offline. Both are documented as intentional pre-deploy
markers (`PROXY_ENDPOINT` even has a test-safe default), so CI is unaffected — but the app
won't work until they're real.

1. **`src/api.js`** — `PROXY_ENDPOINT` (line ~12):
   ```js
   export const PROXY_ENDPOINT = "https://zarishdocs-proxy.<your-subdomain>.workers.dev";
   ```
   Use the exact Worker URL printed in Section 4.3.

2. **`worker/wrangler.toml`** — `ALLOWED_ORIGIN` (done in Section 4.4).

After both are set, commit and push; the app is live.

---

## 6. What runs on your first push (and how to read it)

Push to `main` and watch **Repo → Actions**. These run on `push`/`pull_request`:

| Workflow | Trigger | Needs | Fails if |
|---|---|---|---|
| **Repo Lint** | push, PR | files present, `validate.py --ci`, lychee links | missing files; stale refs; broken external link (e.g. `discussions` before §1.3) |
| **CodeQL** | push, PR, weekly | public repo (free) | — (config is set) |
| **OSV-Scanner** | push, PR, weekly | `security-events: write` | any known vuln in `pnpm-lock.yaml` (currently clean) |
| **OpenSSF Scorecard** | push, weekly | public repo, `id-token: write` | wrong repo visibility; restricted actions |
| **release-please** | push to main | Conventional Commits | malformed version data (none — `package.json` v0.1.0) |
| **Semantic PR title** | PR | `GITHUB_TOKEN` | PR title not `feat:/fix:/docs:/chore:/...` |
| **PR Size Labeler** | PR | `GITHUB_TOKEN` | — (creates `size/*` labels on demand) |
| **Greetings** | new issue/PR | `GITHUB_TOKEN` | — |
| **Stale** | daily + manual | — | — |

**Expected after a green push:** Repo Lint, CodeQL, OSV-Scanner, Scorecard all ✅.
`release-please` opens a standing "chore(main): release v0.1.0" PR on the first push —
that is correct behavior, not a failure.

### Pre-push smoke test (everything that can run locally)
```bash
npm test                     # 51 tests
npm run check                # node --check over src/ + worker/
python3 scripts/validate.py  # 12 contract checks (same as repo-lint)
```

---

## 7. Troubleshooting: workflow failures you might see

| Symptom | Cause | Fix |
|---|---|---|
| Repo Lint: `404 .../discussions` | Discussions disabled | Enable: Settings → General → Features → Discussions (§1.3) |
| Repo Lint: `Unresolved [your-email]` | placeholder email in SECURITY/CONTRIBUTING | Replace with a real contact (none currently) |
| Repo Lint: `Stale template-repo reference` | old `vibe-*`/part-file strings | Already fixed in this repo; run the grep in the workflow |
| Repo Lint: lychee fails on a link you added | broken external URL | Fix the link; `x.com`/`twitter.com`/`linkedin.com` are excluded by design |
| Scorecard: `repo is private` / can't publish | repo visibility | Make repo public (§1.1) |
| CodeQL: `Advanced Security not enabled` | private repo, no GHAS | Make repo public (§1.1) |
| OSV-Scanner fails | known vuln in `pnpm-lock.yaml` | `npx pnpm up` then commit updated lockfile |
| Semantic PR: title rejected | title not conventional | Rename PR to `feat: ...`, `fix: ...`, `docs: ...`, etc. |
| 403 `Origin not allowed` in browser | `ALLOWED_ORIGIN` missing your origin | Add the exact origin to `worker/wrangler.toml`, redeploy (§4.4) |
| Proxy 401/403 from Gemini | wrong/expired key | `wrangler secret put GEMINI_API_KEY` with a fresh key, redeploy |

---

## 8. Optional (deferred) items in `.github/`

- **`FUNDING.yml`** — intentionally a commented placeholder until a funding model is
  decided. Uncomment + fill when ready; nothing to do now.
- **MCP server token** — a local maintainer convenience only (`.github/MCP-SETUP.md`);
  not a CI credential.
- **Org repo** — community health files here are per-repo; the `zsdotcom/.github` org repo
  is separate and not required for this repo's CI.
