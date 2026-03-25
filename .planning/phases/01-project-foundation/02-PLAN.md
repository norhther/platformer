---
phase: 01-project-foundation
plan: 02
type: execute
wave: 2
depends_on:
  - "01-project-foundation/01"
files_modified:
  - .github/workflows/deploy.yml
  - vite.config.ts
autonomous: false
requirements:
  - SETUP-02
  - SETUP-03

must_haves:
  truths:
    - "Pushing to `main` branch triggers the GitHub Actions workflow"
    - "GitHub Actions builds the project (`npm run build`) successfully"
    - "Built static files are deployed to the `gh-pages` branch"
    - "Live GitHub Pages URL loads the Phaser canvas in a browser"
  artifacts:
    - path: ".github/workflows/deploy.yml"
      provides: "GitHub Actions CI/CD workflow"
      contains: "gh-pages"
    - path: "vite.config.ts"
      provides: "Vite build config with correct base path for GitHub Pages"
      contains: "base:"
  key_links:
    - from: ".github/workflows/deploy.yml"
      to: "dist/"
      via: "vite build step"
      pattern: "npm run build"
    - from: ".github/workflows/deploy.yml"
      to: "gh-pages branch"
      via: "peaceiris/actions-gh-pages"
      pattern: "peaceiris/actions-gh-pages"
---

<objective>
Create a GitHub repository with an automated GitHub Actions workflow that deploys the game to GitHub Pages on every push to `main`.

Purpose: Every subsequent phase is immediately playable at a live URL without manual deployment steps.
Output: `.github/workflows/deploy.yml` workflow, live GitHub Pages URL serving the Phaser game.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-project-foundation/01-SUMMARY.md
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create GitHub repository and push initial code</name>
  <files>README.md, .gitignore</files>
  <read_first>
    - Check if `.git` directory exists (repo may already be initialized).
    - Check if `.gitignore` exists at project root.
    - Run `gh auth status` to confirm GitHub CLI is authenticated before proceeding.
  </read_first>
  <action>
    **Step 1 — Git init (skip if .git already exists):**
    ```bash
    git init
    git branch -M main
    ```

    **Step 2 — Create .gitignore** (create or overwrite):
    ```
    node_modules/
    dist/
    .DS_Store
    *.local
    ```

    **Step 3 — Create README.md**:
    ```markdown
    # Platformer

    Browser-based pixel art platformer built with Phaser 3 + Vite + TypeScript.

    **Live:** [GitHub Pages URL will appear here after first deploy]

    ## Development

    ```bash
    npm install
    npm run dev      # local dev server
    npm run build    # production build
    ```
    ```

    **Step 4 — Create GitHub repository and push:**
    ```bash
    gh repo create platformer --public --source=. --remote=origin --push
    ```

    If the repo already exists (error "already exists"), add the remote manually and push:
    ```bash
    git remote add origin https://github.com/$(gh api user --jq .login)/platformer.git
    git add -A
    git commit -m "feat: initial Phaser 3 + Vite scaffold"
    git push -u origin main
    ```

    Note: `gh repo create` with `--push` performs the initial commit + push automatically. If the working tree already has commits, it will push the existing history.
  </action>
  <verify>
    <automated>gh repo view --json name,url --jq '"Repo: \(.name) at \(.url)"' 2>&1</automated>
  </verify>
  <acceptance_criteria>
    - `gh repo view` returns repo name `platformer` without error
    - `git remote get-url origin` returns a GitHub URL containing the repo name
    - `git log --oneline -1` shows at least one commit on `main`
    - `.gitignore` contains `node_modules/` and `dist/`
  </acceptance_criteria>
  <done>GitHub repo exists, code is pushed to `main`, remote `origin` is set.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Add GitHub Actions deploy workflow</name>
  <files>.github/workflows/deploy.yml, vite.config.ts</files>
  <read_first>
    - Read `vite.config.ts` to check current `base` value.
    - Check if `.github/workflows/deploy.yml` exists.
    - Run `gh api user --jq .login` to get the GitHub username for the Pages URL.
  </read_first>
  <action>
    **Step 1 — Update vite.config.ts base path.**

    GitHub Pages serves from `https://{username}.github.io/{repo-name}/`. The `base` in vite.config.ts must match the repo name so assets load correctly.

    Get the repo name:
    ```bash
    REPO=$(gh repo view --json name --jq .name)
    echo "Repo: $REPO"
    ```

    Update `vite.config.ts` to set `base` to the repo name:
    ```typescript
    import { defineConfig } from 'vite';

    export default defineConfig({
      base: '/platformer/',   // Replace 'platformer' with actual repo name if different
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
      },
    });
    ```

    If the repo name differs from `platformer`, use the actual name returned by `gh repo view`.

    **Step 2 — Create `.github/workflows/deploy.yml`:**
    ```yaml
    name: Deploy to GitHub Pages

    on:
      push:
        branches:
          - main
      workflow_dispatch:

    permissions:
      contents: write

    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout
            uses: actions/checkout@v4

          - name: Setup Node.js
            uses: actions/setup-node@v4
            with:
              node-version: '20'
              cache: 'npm'

          - name: Install dependencies
            run: npm ci

          - name: Build
            run: npm run build

          - name: Deploy to GitHub Pages
            uses: peaceiris/actions-gh-pages@v3
            with:
              github_token: ${{ secrets.GITHUB_TOKEN }}
              publish_dir: ./dist
              publish_branch: gh-pages
    ```

    **Step 3 — Commit and push the workflow:**
    ```bash
    git add .github/workflows/deploy.yml vite.config.ts
    git commit -m "ci: add GitHub Actions deploy workflow to GitHub Pages"
    git push origin main
    ```

    **Step 4 — Enable GitHub Pages in repo settings:**
    ```bash
    gh api --method POST repos/{owner}/{repo}/pages \
      --field source='{"branch":"gh-pages","path":"/"}' 2>/dev/null || \
    gh api --method PUT repos/{owner}/{repo}/pages \
      --field source='{"branch":"gh-pages","path":"/"}' 2>/dev/null || \
    echo "Pages may already be enabled or needs manual enable — see Step 4 checkpoint"
    ```

    If the API call fails with a 4xx error, note it for the human-verify checkpoint below — GitHub Pages sometimes requires manual enabling via the UI.
  </action>
  <verify>
    <automated>gh run list --limit 1 --json status,conclusion,headBranch --jq '.[0]' 2>&1</automated>
  </verify>
  <acceptance_criteria>
    - `.github/workflows/deploy.yml` exists and contains `peaceiris/actions-gh-pages`
    - `.github/workflows/deploy.yml` contains `publish_dir: ./dist`
    - `vite.config.ts` `base` value matches `/platformer/` (or actual repo name with slashes)
    - `git log --oneline -3` shows the workflow commit on `main`
    - `gh run list --limit 1` shows a run exists for the `main` branch
  </acceptance_criteria>
  <done>Workflow file committed and pushed, GitHub Actions run has been triggered, vite base path updated to match repo name.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify GitHub Actions deploy and live GitHub Pages URL</name>
  <what-built>GitHub Actions workflow deploying Phaser game to GitHub Pages on every push to main</what-built>
  <how-to-verify>
    1. Run `gh run list --limit 3` — confirm the most recent run shows `completed` / `success` status.
       If it shows `in_progress`, wait ~2 minutes and re-run the command.

    2. If the run failed, run `gh run view --log-failed` to see the error, fix it, and push again.

    3. Run `gh api repos/{owner}/{repo}/pages --jq .html_url` to get the live URL.
       If this errors with "Not Found", go to:
       GitHub repo Settings → Pages → Source → select branch `gh-pages`, folder `/`, Save.

    4. Open the live URL in a browser. Confirm:
       - Phaser canvas loads (dark background with "Platformer" text)
       - No 404 errors in browser DevTools console
       - URL ends with `/platformer/` (or your repo name)

    5. Run `gh run list --limit 1 --json conclusion --jq '.[0].conclusion'` — must return `"success"`.
  </how-to-verify>
  <resume-signal>Type "approved" when the live GitHub Pages URL loads the Phaser canvas. If GitHub Pages is not enabled yet, type "pages-manual" and follow the instructions in step 3 above, then re-verify.</resume-signal>
</task>

</tasks>

<verification>
- `.github/workflows/deploy.yml` exists with correct structure
- `gh run list --limit 1 --json conclusion --jq '.[0].conclusion'` returns `"success"`
- `gh api repos/{owner}/{repo}/pages --jq .html_url` returns a valid URL
- Live URL loads Phaser canvas in browser with no console errors
</verification>

<success_criteria>
- Pushing to `main` triggers GitHub Actions within seconds
- Build completes successfully (npm run build, tsc zero errors)
- Game is live at `https://{username}.github.io/platformer/`
- Canvas loads in the browser with no 404 asset errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-project-foundation/02-SUMMARY.md` documenting:
- GitHub repo URL
- Live GitHub Pages URL
- Workflow file location and key config choices
- Any manual steps required (Pages settings, etc.)
- vite.config.ts base path value used
</output>
