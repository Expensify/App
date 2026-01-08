---
allowed-tools: Bash(gh issue view:*),Bash(gh issue edit:*),Bash(gh issue comment:*),Bash(gh issue list:*),Bash(gh pr view:*),Bash(gh pr list:*),Bash(gh api:*),Glob,Grep,Read
description: Investigate a deploy blocker issue to find the causing PR and recommend resolution
---

Investigate deploy blocker issue #$ISSUE_NUMBER using the `deploy-blocker-investigator` agent.

The agent will:
- Analyze the issue to determine if it's frontend (App) or backend (Auth/PHP)
- Find the most likely causing PR
- Post a comment with findings and recommendation
- Update labels if appropriate
