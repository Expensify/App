---
allowed-tools: Bash(gh issue view:*),Bash(gh issue comment:*),Bash(gh issue list:*),Bash(gh pr view:*),Bash(gh pr list:*),Bash(gh pr diff:*),Bash(gh api:*),Bash(git log:*),Bash(git show:*),Bash(git blame:*),Bash(removeDeployBlockerLabel.sh:*),Glob,Grep,Read
description: Investigate a deploy blocker issue to find the causing PR and recommend resolution
---

Investigate the deploy blocker issue at $ISSUE_URL using the `deploy-blocker-investigator` agent.

The agent will:
- Analyze the issue to determine if it's a frontend (App) or backend bug
- Find the most likely causing PR
- Post a comment with findings and recommendation
- Update labels if appropriate
