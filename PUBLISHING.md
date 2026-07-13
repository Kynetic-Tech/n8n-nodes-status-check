# Publishing Guide - Status Check n8n Node

This guide explains how to publish the Status Check n8n community node with npm provenance for n8n verification.

## Prerequisites

1. npm account with 2FA enabled
2. GitHub account
3. Access to `@status-check` npm organization

## Setup Steps

### 1. Move to Separate Repository (Recommended)

For n8n verification, it's best to have a dedicated repository for the node package.

**Steps:**

1. **Create new GitHub repository:**
   - Go to https://github.com/new
   - Repository name: `n8n-nodes-status-check`
   - Owner: `status-check` organization (or your personal account)
   - Public visibility
   - Initialize with README: No (we have one)
   - Create repository

2. **Copy package to new repository:**
   ```bash
   # Clone the new empty repository
   git clone https://github.com/status-check/n8n-nodes-status-check.git
   cd n8n-nodes-status-check

   # Copy all files from the package directory
   cp -r /Library/WebServer/Documents/status-checker-nextjs/n8n-nodes-status-check/* .
   cp -r /Library/WebServer/Documents/status-checker-nextjs/n8n-nodes-status-check/.github .
   cp /Library/WebServer/Documents/status-checker-nextjs/n8n-nodes-status-check/.gitignore .
   cp /Library/WebServer/Documents/status-checker-nextjs/n8n-nodes-status-check/.eslintrc.js .
   cp /Library/WebServer/Documents/status-checker-nextjs/n8n-nodes-status-check/.eslintrc.prepublish.js .

   # Initialize git if needed
   git add .
   git commit -m "feat: initial commit - Status Check n8n community node"
   git branch -M main
   git push -u origin main
   ```

### 2. Configure npm Authentication

You have two options for npm authentication:

#### Option A: Trusted Publishers (Recommended - No secrets needed)

1. Go to https://www.npmjs.com/settings/status-check/packages/@status-check%2Fn8n-nodes-status-check/access
2. Click "Publishing access" tab
3. Add trusted publisher:
   - **Provider**: GitHub Actions
   - **Repository**: `status-check/n8n-nodes-status-check`
   - **Workflow**: `publish.yml`
   - **Environment**: leave blank

This allows GitHub Actions to publish without storing npm tokens.

#### Option B: NPM_TOKEN Secret

1. **Generate npm token:**
   ```bash
   npm token create --type=automation
   ```
   Copy the token (starts with `npm_...`)

2. **Add to GitHub secrets:**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

### 3. Publishing Workflow

#### First-Time Setup

If using Trusted Publishers (Option A), update the workflow file:

```yaml
# .github/workflows/publish.yml
- name: Publish to npm with provenance
  run: npm publish --access public --provenance
  # No NPM_TOKEN needed with Trusted Publishers
```

If using NPM_TOKEN (Option B), the workflow is already configured.

#### Publishing Process

1. **Make your changes** to the node code

2. **Test locally:**
   ```bash
   npm run build
   npm run lint
   ```

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push
   ```

4. **Create a release:**
   ```bash
   npm run release
   ```

   This will:
   - Bump the patch version (1.0.0 → 1.0.1)
   - Create a git tag (v1.0.1)
   - Push the tag to GitHub
   - Trigger the GitHub Actions workflow
   - Publish to npm with provenance

5. **Monitor the workflow:**
   - Go to https://github.com/status-check/n8n-nodes-status-check/actions
   - Watch the "Publish to npm" workflow
   - Verify it completes successfully

#### Manual Version Bumping

For different version types:

```bash
# Patch (1.0.0 → 1.0.1) - bug fixes
npm version patch && git push && git push --tags

# Minor (1.0.0 → 1.1.0) - new features
npm version minor && git push && git push --tags

# Major (1.0.0 → 2.0.0) - breaking changes
npm version major && git push && git push --tags
```

### 4. Verify Provenance

After publishing, verify the provenance statement:

1. Go to https://www.npmjs.com/package/@status-check/n8n-nodes-status-check
2. Look for the "Provenance" section
3. Should show: "Published from GitHub Actions"
4. Click to see the exact commit and workflow run

### 5. Submit for n8n Verification

1. **Go to n8n Creator Portal:**
   - https://creators.n8n.io/ (or current portal URL)

2. **Submit your node:**
   - Package name: `@status-check/n8n-nodes-status-check`
   - Repository: `https://github.com/status-check/n8n-nodes-status-check`
   - npm URL: `https://www.npmjs.com/package/@status-check/n8n-nodes-status-check`

3. **Wait for review:**
   - n8n team will review your node
   - They check: code quality, provenance, documentation, UX guidelines
   - May request changes or improvements

## Troubleshooting

### Workflow fails with "permission denied"

- Check NPM_TOKEN is correctly set in repository secrets
- Or ensure Trusted Publishers is configured correctly

### Provenance not showing on npm

- Verify workflow includes `--provenance` flag
- Check that `id-token: write` permission is set in workflow
- Ensure using `actions/setup-node@v4` or later

### npm publish fails with 403

- Verify you have permission to publish to `@status-check` scope
- Check npm token hasn't expired
- Ensure 2FA is enabled on npm account

### Tag already exists

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Re-create and push
npm version 1.0.0 --force
git push --tags
```

## Alternative: Keep in Monorepo

If you prefer to keep the package in the main repository, update the workflow with path filters:

```yaml
on:
  push:
    tags:
      - 'n8n-v*'  # Use different tag prefix
    paths:
      - 'n8n-nodes-status-check/**'

jobs:
  publish:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: n8n-nodes-status-check
    # ... rest of workflow
```

Then publish with:
```bash
cd n8n-nodes-status-check
npm version patch
git add package.json
git commit -m "chore: bump n8n node version"
git tag n8n-v1.0.1
git push && git push --tags
```

However, this is **not recommended** for n8n verification.

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [npm Provenance Documentation](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Actions npm Publishing](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
