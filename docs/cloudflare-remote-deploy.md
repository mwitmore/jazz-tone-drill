# Remote deploy via GitHub (Cursor on phone)

Use this when editing from the **Cursor phone app** with a cloud agent. You push to GitHub; **GitHub Actions** publishes to Cloudflare Pages. No laptop required.

## The secret (one token, many repos)

| Question | Answer |
|---|---|
| **Do I need to store it?** | Yes — once **per GitHub repo** that auto-deploys. |
| **What is it called?** | `CLOUDFLARE_API_TOKEN` (exact spelling, all caps). |
| **Where?** | GitHub → repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. |
| **Same token everywhere?** | Yes. One Cloudflare API token can be pasted into every repo below. |
| **Create token (phone)** | [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Custom Token** → **Account** → **Cloudflare Pages** → **Edit** → **Account resources: All accounts**. |
| **Optional (Cursor only)** | You can also save `CLOUDFLARE_API_TOKEN` in your **Cursor environment secrets** so agents can run `npm run deploy` directly — but GitHub Actions is enough for phone edits. |

**Do not** paste the token in chat or commit it to git.

**Account ID** (not secret): `282fff1786f1c04217c4662922769364` — already in each repo’s deploy workflow when set up.

---

## Sites

### jazz-tone-drill

| | |
|---|---|
| **Live** | https://jazz-tone-drill.pages.dev |
| **GitHub** | [mwitmore/jazz-tone-drill](https://github.com/mwitmore/jazz-tone-drill) |
| **Pages project** | `jazz-tone-drill` |
| **Deploy workflow** | [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) |
| **Secret** | Add `CLOUDFLARE_API_TOKEN` in [repo secrets](https://github.com/mwitmore/jazz-tone-drill/settings/secrets/actions) — **done** |
| **After push to `main`** | Actions runs automatically; hard-refresh the live URL. |

### bitbard.io

| | |
|---|---|
| **Live** | https://bitbard.io |
| **GitHub** | *(your BitBard repo — open in Cursor when editing)* |
| **Pages project** | Check Cloudflare dashboard → **Workers & Pages** → project behind `bitbard.io` |
| **Setup (once per repo)** | Copy [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml); set `--project-name` to your Pages project name. Add `CLOUDFLARE_API_TOKEN` in that repo’s GitHub secrets. |
| **Agent rule** | Add `.cursor/rules/deploy-cloudflare.mdc` (see template below). |

### explore.bitbard.io

| | |
|---|---|
| **Live** | https://explore.bitbard.io |
| **GitHub** | *(your explore BitBard repo)* |
| **Pages project** | Check Cloudflare dashboard → project behind `explore.bitbard.io` |
| **Setup (once per repo)** | Same as bitbard.io — copy workflow, set `--project-name`, add `CLOUDFLARE_API_TOKEN`. |
| **Agent rule** | Add `.cursor/rules/deploy-cloudflare.mdc` (see template below). |

### michaelwitmore.com

| | |
|---|---|
| **Live** | https://michaelwitmore.com |
| **GitHub** | *(your personal site repo)* |
| **Pages project** | Check Cloudflare dashboard → project behind `michaelwitmore.com` |
| **Setup (once per repo)** | Same as above — copy workflow, set `--project-name`, add `CLOUDFLARE_API_TOKEN`. |
| **Agent rule** | Add `.cursor/rules/deploy-cloudflare.mdc` (see template below). |

---

## Workflow template (copy into each repo)

Save as `.github/workflows/deploy.yml`. Change `project-name` and build steps if the repo differs (e.g. not Vite).

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Publish to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: "282fff1786f1c04217c4662922769364"
          command: pages deploy dist --project-name YOUR-PAGES-PROJECT-NAME
```

## Cursor rule template (copy into each repo)

Save as `.cursor/rules/deploy-cloudflare.mdc`:

```markdown
---
description: Deploy to Cloudflare Pages after app changes
alwaysApply: true
---

# Autodeploy to Cloudflare

After a change that affects the live site (not docs-only), ensure it reaches production:

1. Commit and push to `main`.
2. GitHub Actions (`.github/workflows/deploy.yml`) deploys using `CLOUDFLARE_API_TOKEN`.
3. Tell the user the live URL when deploy finishes.

Live URL: https://YOUR-DOMAIN

If Actions is not set up yet, see docs/cloudflare-remote-deploy.md.
```

---

## Phone cheat sheet

1. Edit in Cursor → commit → push to `main`.
2. **GitHub app:** Actions tab → confirm **Deploy to Cloudflare Pages** is green.
3. **Re-run deploy manually:** repo → Actions → **Deploy to Cloudflare Pages** → **Run workflow**.
4. **Add secret (Safari, not GitHub app):** `https://github.com/OWNER/REPO/settings/secrets/actions`
5. Hard-refresh the live site (or clear PWA cache).

---

## iOS note

The GitHub iOS app does **not** expose repository secrets. Use **Safari** for secret setup and manual workflow runs.
