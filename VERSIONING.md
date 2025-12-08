# Versioning Guide

This document describes the comprehensive versioning system implemented in the Fictional News Generator application.

> **TL;DR**: Use `npm run version:patch` to bump version and create a tag locally, then use `npm run release:patch` to push both commits and tags. For direct releases, use `npm run release:patch` on main branch.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Semantic Versioning](#semantic-versioning)
- [Conventional Commits](#conventional-commits)
- [Version Bumping](#version-bumping)
- [Release Process](#release-process)
- [Automated Systems](#automated-systems)
- [Version Access](#version-access)
- [Docker Image Versioning](#docker-image-versioning)
- [Troubleshooting](#troubleshooting)

## Overview

The Fictional News Generator uses a comprehensive, automated versioning system that:

✅ **Single Source of Truth**: Version defined in `package.json` only
✅ **Semantic Versioning**: Follows [SemVer](https://semver.org/) (MAJOR.MINOR.PATCH)
✅ **Conventional Commits**: Standardized commit message format
✅ **Automated Changelog**: Generated from commit history
✅ **GitHub Releases**: Automatically created with release notes
✅ **Docker Images**: Tagged with version numbers and multi-platform support
✅ **Automated Testing**: Tests run before building Docker images (patch releases skip tests)
✅ **PR-Friendly**: Version bumps can be included in pull requests
✅ **Flexible Workflows**: Supports both feature branch and direct release workflows

### Key Features

- **Feature Branch Support**: Bump versions in feature branches without triggering releases
- **Controlled Tag Pushing**: Tags created locally, pushed when ready
- **Separate Commands**: `version:*` for local bumps, `release:*` for pushing
- **Dual Workflow**: Choose between PR-based or direct release workflows
- **Conditional Testing**: Patch releases skip tests, major/minor releases run full test suite

## Quick Start

### For Pull Requests (Recommended)

When working on a feature branch and want to include version bump in your PR:

```bash
# 1. Create your feature branch
git checkout -b feature/my-awesome-feature

# 2. Make changes with conventional commits
git commit -m "feat(article): add AI-powered article generation"
git commit -m "fix(ui): resolve button alignment issue"

# 3. Bump version (creates tag locally, doesn't push it)
npm run version:minor  # or patch/major
# This creates a single clean commit with just the version bump

# 4. Push your branch (tag stays local)
git push origin feature/my-awesome-feature

# 5. Create PR and get it merged

# 6. After PR is merged, push both commits and tag to trigger release
git checkout main
git pull
git push --follow-tags
# Or use: npm run release:patch (which will push commits and tags)
# GitHub Actions will automatically generate CHANGELOG.md and create the release
```

### For Direct Releases (From Main Branch)

When you want to release immediately without a PR:

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull

# 2. Make your changes with conventional commits
git commit -m "feat(api): add new endpoint"

# 3. Bump version and release immediately
npm run release:minor  # or release:patch/release:major

# GitHub Actions will automatically:
# - Run tests (skipped for patch releases)
# - Create a GitHub Release
# - Build Docker images (multi-platform)
# - Update CHANGELOG.md
```

### Which Workflow Should I Use?

| Situation | Use |
|-----------|-----|
| Working in a team with PRs | **Feature Branch Workflow** |
| Small hotfix that needs immediate release | **Direct Release Workflow** |
| New feature that needs review | **Feature Branch Workflow** |
| Documentation updates | **Feature Branch Workflow** |
| Emergency security fix | **Direct Release Workflow** |

## Semantic Versioning

We follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR** (1.x.x): Breaking changes that require user action
- **MINOR** (x.1.x): New features that are backwards-compatible
- **PATCH** (x.x.1): Bug fixes that are backwards-compatible

### Examples

| Version Change | Type | Example |
|---------------|------|---------|
| 1.0.0 → 2.0.0 | MAJOR | Removed Node 18 support, now requires Node 20+ |
| 1.0.0 → 1.1.0 | MINOR | Added AI-powered article generation feature |
| 1.0.0 → 1.0.1 | PATCH | Fixed authentication token expiration issue |

## Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Commit Types

| Type | Description | Version Impact | Example |
|------|-------------|----------------|---------|
| `feat` | New feature | MINOR | `feat(article): add AI generation` |
| `fix` | Bug fix | PATCH | `fix(auth): resolve token expiration` |
| `docs` | Documentation | None | `docs(readme): update installation` |
| `style` | Code style/formatting | None | `style(ui): fix button alignment` |
| `refactor` | Code refactoring | None | `refactor(api): simplify error handling` |
| `perf` | Performance improvement | PATCH | `perf(db): optimize article queries` |
| `test` | Test changes | None | `test(auth): add login tests` |
| `build` | Build system changes | None | `build(deps): update dependencies` |
| `ci` | CI/CD changes | None | `ci(actions): add release workflow` |
| `chore` | Maintenance tasks | None | `chore(deps): update dependencies` |
| `revert` | Revert previous commit | Depends | `revert: revert "feat: add feature"` |

### Breaking Changes

For breaking changes (MAJOR version bump), add `!` after type:

```bash
feat!: remove Node 18 support

BREAKING CHANGE: Node 20 is now the minimum required version.
Update your environment before upgrading.
```

### Commit Scope

Recommended scopes for this project:

- `article`: Article generation and management
- `auth`: Authentication and authorization
- `ui`: User interface components
- `api`: API endpoints
- `ai`: AI integration (Anthropic, OpenAI, Google)
- `db`: Database and Prisma
- `template`: Template extraction and management
- `i18n`: Internationalization
- `docker`: Docker and deployment
- `ci`: CI/CD workflows
- `analytics`: Analytics and reporting

### Good Commit Examples

✅ **GOOD:**
```bash
feat(article): add AI-powered article generation
fix(auth): resolve JWT token expiration issue
docs(api): add JSDoc comments to article endpoints
refactor(ui): extract ArticleCard component for reusability
perf(db): add index on article slug column for faster lookups
test(auth): add unit tests for JWT token validation
ci(actions): add automated release workflow
build(deps): update dependencies to latest versions
```

❌ **BAD:**
```bash
Added new feature                    # Missing type, unclear
Fixed bug                            # Too vague
Update                               # No context
feat: Added new feature.             # Should be imperative, no period
FIX: bug fix                         # Type should be lowercase
feature: new game mode               # Type should be 'feat' not 'feature'
```

### Commit Message Validation

**Note**: This project currently does not have automated commit message validation via Husky or commitlint hooks. However, following the conventional commit format is strongly recommended and may be enforced in future versions.

Best practices:
- Follow conventional commit format manually
- Review commit messages before pushing
- Use PR reviews to catch non-conventional commits

## Version Bumping

### Two Workflows: Feature Branch vs Main Branch

This project supports two different versioning workflows:

#### 1. Feature Branch Workflow (for Pull Requests)

**Use when**: Working on a feature branch and want to include version bump in your PR.

```bash
# Bump version (creates tag but doesn't push)
npm run version:patch  # or minor/major

# The CHANGELOG.md will be updated automatically
# Commit the changes to your branch
git add CHANGELOG.md
git commit --amend --no-edit

# Push your branch (but not the tag yet)
git push origin your-branch-name
```

**What happens**:
1. Version in `package.json` is bumped
2. Git commit is created with message: `chore: bump version to vX.X.X`
3. Git tag is created locally (e.g., `v1.0.1`)
4. **Tag is NOT pushed** (stays local until you push it)
5. **CHANGELOG.md is NOT updated locally** (generated by GitHub Actions when tag is pushed)

**When to push the tag**:
- Push the tag **only after your PR is merged to main**:
  ```bash
  # After PR is merged, fetch and checkout main
  git checkout main
  git pull

  # Push commits and tags together
  git push --follow-tags
  # Or push the tag separately: git push origin v1.0.1
  ```

#### 2. Main Branch Workflow (Direct Release)

**Use when**: Working directly on main branch and ready to release immediately.

```bash
# Bump version AND push commits/tags in one command
npm run release:patch  # or release:minor/release:major
```

**What happens**:
1. Version in `package.json` is bumped
2. Git commit is created with message: `chore(release): bump version to X.X.X`
3. Git tag is created (e.g., `v1.0.1`)
4. **Commits and tags are automatically pushed** to GitHub
5. **Release workflow is triggered** immediately
6. **GitHub Actions generates CHANGELOG.md** and creates the release
7. **Docker images are built** (multi-platform)

### Manual Version Bump Commands

```bash
# For feature branches (doesn't push):
npm run version:patch   # 1.0.0 → 1.0.1 (Bug fixes)
npm run version:minor   # 1.0.0 → 1.1.0 (New features)
npm run version:major   # 1.0.0 → 2.0.0 (Breaking changes)

# For main branch (pushes commits and tags):
npm run release:patch   # Bump + push
npm run release:minor   # Bump + push
npm run release:major   # Bump + push
```

### What Happens During Version Bump

**Local version bump (`npm run version:*`)**:
1. Updates `package.json` and `package-lock.json` with new version
2. Creates git commit with message: `chore(release): bump version to X.X.X`
3. Creates git tag (e.g., `v1.0.1`)
4. Tag stays local (not pushed)

**Release (`npm run release:*`)**:
1. Runs the version bump steps above
2. Pushes commits and tags to GitHub

**When tag is pushed to GitHub**:
- GitHub Actions release workflow is triggered
- Tests run (skipped for patch releases)
- **CHANGELOG.md is generated/updated** automatically from git log
- GitHub Release is created with release notes
- Docker build workflow is triggered
- Multi-platform Docker images are built and published
- Documentation is updated and committed back to main

### NPM Configuration

**Note**: This project currently does not use a `.npmrc` file for version configuration. Version bumping uses custom npm scripts that:

- Use `--no-git-tag-version` flag to prevent npm's automatic tagging
- Create tags manually with `v` prefix (e.g., `v1.0.1`)
- Separate version bumping from tag pushing for better control

This approach allows version bumps in feature branches without triggering releases prematurely.

### Automatic Dependency Installation

**Note**: This project does not currently use npm lifecycle hooks like `preversion`. Version bumping is done through custom scripts that handle the entire process.

### Changelog Generation

The CHANGELOG.md is **automatically generated by GitHub Actions** when you push a version tag. You don't need to update it locally:

- ✅ Changelog is generated from conventional commits on the server
- ✅ Automatically committed back to main branch
- ✅ Prevents merge conflicts and local git issues
- ✅ Single source of truth maintained by CI/CD

This means your local version bump is just a single clean commit with the version change in `package.json`.

### Automatic Version Detection

**Note**: This project currently uses manual version selection via npm scripts. You choose whether to run `version:patch`, `version:minor`, or `version:major` based on your changes.

Best practice - choose based on your changes:
- Any `feat` commits since last release → MINOR bump
- Any `fix` commits since last release → PATCH bump
- Any `feat!` or `BREAKING CHANGE` → MAJOR bump

## Release Process

### Option A: Release from Feature Branch (Recommended for PRs)

1. **Create feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes** with conventional commits:
   ```bash
   git commit -m "feat(article): add new AI provider integration"
   git commit -m "fix(ui): resolve styling issue"
   ```

3. **Bump version before merging**:
   ```bash
   npm run version:patch  # or minor/major
   # This creates a clean commit with just the version bump
   ```

4. **Push branch** (tag stays local):
   ```bash
   git push origin feature/my-feature
   # Note: The tag is created locally but NOT pushed yet
   ```

5. **Create and merge PR**

6. **After merge, push tag** to trigger release:
   ```bash
   git checkout main
   git pull
   git push origin v1.x.x  # Replace with your version
   # This triggers GitHub Actions to generate changelog and create release
   ```

### Option B: Direct Release from Main Branch

1. **Ensure you're on main**:
   ```bash
   git checkout main
   git pull
   ```

2. **Make changes** with conventional commits:
   ```bash
   git commit -m "feat(article): add new AI provider integration"
   git commit -m "fix(ui): resolve styling issue"
   ```

3. **Bump version and release**:
   ```bash
   npm run release:patch  # or release:minor/release:major
   ```

4. **Automation takes over**:
   - Tag pushed to GitHub
   - GitHub Actions triggered
   - **CHANGELOG.md generated** from conventional commits
   - GitHub Release created with release notes
   - Docker images built and published
   - Updated documentation committed back to main

### What Gets Released

Each release includes:

- **GitHub Release** with auto-generated notes
- **CHANGELOG.md** with detailed changes
- **Docker Images** tagged with version
- **Git Tag** for version reference

## Automated Systems

### GitHub Actions Workflows

#### 1. Release Workflow (`.github/workflows/release.yml`)

**Trigger**: Git tags matching `v*` (e.g., `v1.0.1`)

**Actions**:
- Generates/updates CHANGELOG.md
- Creates GitHub Release with notes
- Links to Docker images
- Commits updated docs

#### 2. Docker Build Workflow (`.github/workflows/docker-build.yml`)

**Trigger**: Git tags matching `v*`, pushes to main/develop

**Actions**:
- Builds Docker images (multi-platform)
- Tags with semantic versions
- Pushes to GitHub Container Registry
- Links to release

### Automatic Changelog Generation

Changelogs are generated from conventional commits:

```bash
# Generate changelog for upcoming release
npm run changelog

# Regenerate entire changelog
npm run changelog:all
```

The changelog groups commits by type:
- **Features** (`feat`)
- **Bug Fixes** (`fix`)
- **Performance Improvements** (`perf`)
- **Breaking Changes** (`BREAKING CHANGE`)

## Version Access

### Via API Endpoints

```bash
# Health check (includes version)
curl http://localhost:3000/health

# Response:
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-12-08T12:00:00.000Z"
}

# Version endpoint (includes database info)
curl http://localhost:3000/api/version

# Response:
{
  "version": "1.0.0",
  "database": {
    "version": "1.0.0",
    "migrations": [...],
    "lastMigration": "..."
  }
}
```

### In Application Code

The version is available via the `APP_VERSION` constant imported from `package.json`:

```typescript
// In src/server/index.ts
const APP_VERSION = JSON.parse(readFileSync('./package.json', 'utf-8')).version;
```

### Environment Variables

The application version is read from `package.json` at runtime, not from environment variables. This ensures the version is always accurate and matches the deployed code.

## Docker Image Versioning

Docker images are automatically tagged with multiple formats:

```bash
# Specific version
ghcr.io/ndsrf/fakenews:1.0.0

# Major.Minor
ghcr.io/ndsrf/fakenews:1.0

# Major only
ghcr.io/ndsrf/fakenews:1

# Latest stable
ghcr.io/ndsrf/fakenews:latest

# Branch name
ghcr.io/ndsrf/fakenews:main
ghcr.io/ndsrf/fakenews:develop

# Git SHA
ghcr.io/ndsrf/fakenews:sha-abc1234
```

### Pull Specific Version

```bash
# Pull exact version
docker pull ghcr.io/ndsrf/fakenews:1.0.0

# Pull latest 1.x.x version
docker pull ghcr.io/ndsrf/fakenews:1

# Pull latest stable
docker pull ghcr.io/ndsrf/fakenews:latest
```

## Troubleshooting

### Commit Message Rejected

**Error**: `commit message doesn't follow conventional commits format`

**Solution**: Fix commit message format:
```bash
# Bad
git commit -m "Added feature"

# Good
git commit -m "feat(article): add AI-powered generation"
```

### Version Bump in Feature Branch Issues

**Issue**: "I bumped version in my feature branch and it triggered a release prematurely"

**Solution**: When working in feature branches, use the regular version commands (without `:push`):
```bash
# In feature branch - creates tag locally but doesn't push
npm run version:patch

# Push your branch (not the tag)
git push origin your-branch-name

# After PR is merged, push the tag from main
git checkout main
git pull
git push origin v1.x.x
```

**Prevention**: Use `version:*` commands for local bumps, `release:*` only when ready to publish.

### Tag Already Exists

**Issue**: `tag 'v1.x.x' already exists`

**Solution**: If you need to change the version:
```bash
# Delete local tag
git tag -d v1.x.x

# Delete remote tag (if already pushed)
git push --delete origin v1.x.x

# Bump to correct version
npm run version:patch
```

### Version Bump Failed

**Error**: `Failed to push tags to remote`

**Solution**: Tags are not automatically pushed unless you use the `release:*` variant:
```bash
# This creates tag but doesn't push (safe for feature branches)
npm run version:patch

# This pushes commits and tags immediately (use on main branch only)
npm run release:patch
```

### Merge Conflicts in CHANGELOG.md

**Issue**: CHANGELOG.md has merge conflicts when merging feature branch

**Solution**: CHANGELOG.md is generated by GitHub Actions after the tag is pushed. If you encounter this:
```bash
# The CHANGELOG.md in your branch can be safely ignored or removed
# GitHub Actions will regenerate it from scratch when the tag is pushed

# Resolve conflict by accepting GitHub Actions version
git checkout --theirs CHANGELOG.md
git add CHANGELOG.md
git commit -m "chore: resolve changelog merge conflict"
```

**Prevention**: With the current setup, CHANGELOG.md is only updated by GitHub Actions, so local conflicts should be rare.

### Release Not Triggered After Pushing Tag

**Issue**: Pushed tag but GitHub Actions didn't create release

**Solution**: 
1. Check that tag follows the pattern `v*` (e.g., `v1.0.1`, not `1.0.1`)
2. Verify GitHub Actions has necessary permissions
3. Check Actions tab on GitHub for any errors
4. Manually trigger release if needed:
   ```bash
   # Delete and recreate tag
   git tag -d v1.x.x
   git push --delete origin v1.x.x
   npm run release:patch
   ```

### Docker Image Not Found

**Error**: `unable to find image 'ghcr.io/ndsrf/fakenews:1.0.1'`

**Solution**: Wait for GitHub Actions to complete building the image (usually 5-10 minutes after pushing tag). Check Actions tab on GitHub.

### Version Mismatch

**Issue**: UI shows different version than package.json

**Solution**: Rebuild the application to inject new version:
```bash
npm run build
```

### Changelog Not Updating

**Issue**: Changelog.md not showing new commits

**Solution**: Changelog is generated by GitHub Actions from git log. Ensure:
- Tags are pushed correctly
- GitHub Actions workflow completed successfully
- Check the Actions tab on GitHub for any errors

### Husky Hooks Not Working

**Issue**: Commits not being validated

**Solution**: This project currently does not have Husky hooks installed. If you want to add them:
```bash
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

### CHANGELOG Missing Recent Versions

**Issue**: CHANGELOG.md doesn't include recent version releases

**Solution**: The changelog is generated by GitHub Actions. To fix:
1. Check that the release workflow completed successfully in GitHub Actions
2. Pull the latest changes from main: `git pull origin main`
3. If still missing, the workflow may need to be re-run

**Note**: CHANGELOG.md is automatically generated and committed by GitHub Actions when a version tag is pushed.

## Best Practices

1. **Write descriptive commit messages** that explain the "why" not just the "what"
2. **Use appropriate commit types** based on the change impact
3. **Add breaking change footer** for any incompatible changes
4. **Keep commits atomic** - one logical change per commit
5. **Test before releasing** - ensure all tests pass
6. **Review changelog** before creating release
7. **Document breaking changes** in commit message and release notes
8. **Use scopes consistently** for better changelog organization
9. **Follow semantic versioning strictly** for predictable releases
10. **Communicate breaking changes** to users in advance
11. **Use feature branch workflow for PRs** - bump version in branch, push tag after merge
12. **Never use `release:*` variants in feature branches** - only use on main branch for immediate releases
13. **Leverage conditional testing** - patch releases skip tests for faster iteration

## Additional Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [commitlint](https://commitlint.js.org/)
- [Husky](https://typicode.github.io/husky/)

## Support

For questions about versioning:
- Check this document first
- Review [README.md](README.md) for project overview
- See [CHANGELOG.md](CHANGELOG.md) for version history (generated by releases)
- Create an issue on GitHub for support
