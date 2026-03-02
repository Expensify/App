---
name: app-test-build
description: Triggers Expensify/App testBuild.yml workflow via gh CLI, monitors the run, and reports outcome with build comment links. Use when the user asks to create test builds, adhoc builds, or trigger the test build workflow for Expensify/App or Mobile-Expensify PRs.
---

# App Test Build

## Parse inputs

Extract PR URLs from the user's message:
- `Expensify/App/pull/` → `APP_PULL_REQUEST_URL`
- `Expensify/Mobile-Expensify/pull/` → `MOBILE_EXPENSIFY_PULL_REQUEST_URL`

## Trigger

```bash
gh workflow run testBuild.yml \
  --repo Expensify/App \
  --ref <branch|main> \
  -f APP_PULL_REQUEST_URL=<url|''> \
  -f MOBILE_EXPENSIFY_PULL_REQUEST_URL=<url|''> \
  -f REVIEWED_CODE=true \
  -f WEB=<true> \
  -f IOS=<true> \
  -f ANDROID=<true> \
  -f FORCE_NATIVE_BUILD=<false>
```

Defaults (override only when user explicitly requests):
- All platforms: true
- REVIEWED_CODE: always true
- FORCE_NATIVE_BUILD: false
- branch: main

## Monitor

After triggering, wait a few seconds then find the run:

```bash
gh run list --repo Expensify/App --workflow=testBuild.yml --limit 1 --json databaseId,status,url
```

Create a task using TaskCreate with `activeForm: "Building test apps..."` so the user sees progress in the UI. Then run the watch in the background:

```bash
gh run watch <run_id> --repo Expensify/App --exit-status
```

When the background watch completes, mark the task as completed and report results.

## Report results

When the watch completes, **always check actual job conclusions** — do not rely on `gh run watch` output alone:

```bash
gh run view <run_id> --repo Expensify/App --json jobs --jq '.jobs[] | {name, conclusion, steps: [.steps[] | select(.conclusion == "failure") | .name]}'
```

### If any jobs failed

1. List each failed job with its failed step name
2. Triage the failure:
   - **Infra failures** (Setup Node, Setup Ruby, checkout, credentials, runner issues): transient CI issue, offer to re-run
   - **Build failures** (Gradle, Fastlane, compile, lint, bundler): likely a code issue — fetch logs with `gh run view --log-failed` and surface the relevant error

### Fetch build comment

Always fetch the build comment regardless of failures — partial builds (e.g. web succeeded while Android failed) are still useful.

```bash
gh api "repos/Expensify/App/issues/<pr_number>/comments?per_page=100&page=<N>" \
  --jq '[.[] | select(.user.login == "github-actions[bot]" and (.body | test("adhoc")))] | last | .html_url'
```
