---
allowed-tools: Bash(gh issue view:*),Bash(gh issue edit:*),Bash(gh issue comment:*),Bash(gh issue list:*),Bash(gh pr view:*),Bash(gh pr list:*),Bash(gh api:*),Bash(git -C App log:*),Bash(git -C App show:*),Bash(git -C App blame:*),Glob,Grep,Read
description: Investigate a deploy blocker issue to find the causing PR and recommend resolution
---

# Investigate Deploy Blocker

Investigate a deploy blocker issue to identify the causing PR and recommend a resolution.

## Input

- **REPO**: $REPO
- **ISSUE_NUMBER**: $ISSUE_NUMBER

## Task

Use the `deploy-blocker-investigator` agent to:

1. **Fetch** the issue details from GitHub
2. **Classify** whether this is a frontend (App) or backend (Auth/PHP) bug
3. **Identify** the most likely causing PR by analyzing the StagingDeployCash checklist
4. **Post** a structured comment with ONE clear recommendation:
   - **REVERT**: Create revert PR and cherry-pick to staging
   - **ROLL FORWARD**: Create fix PR if reverting is too disruptive
   - **DEMOTE**: Remove label if not actually blocking
   - **BACKEND BUG**: Remove `DeployBlockerCash` label (not an App issue)
5. **Execute** label changes if this is a backend bug

## Constraints

<important>
- Be decisive — recommend ONE action when confident
- Provide evidence — explain WHY you reached your conclusion
- Protect private code — NEVER quote Auth or Web-Expensify code (output is public)
- No assignee changes — leave assignees untouched
- Backend bugs → remove `DeployBlockerCash` label
- Frontend bugs → do NOT modify labels
</important>

## Available Repositories

You have read access to three repositories in the workspace:

| Repo | Path | Quotable? |
|------|------|-----------|
| App | `App/` | ✅ Yes (open source) |
| Auth | `Auth/` | ❌ No (private) |
| Web-Expensify | `Web-Expensify/` | ❌ No (private) |

Use `Grep` and `Read` to search these repos. Use `git -C App` for git operations on the App repo.
