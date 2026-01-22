---
allowed-tools: Bash(gh issue view:*),Bash(gh issue comment:*),Bash(gh issue edit:*),Bash(gh api:*),Bash(git log:*),Bash(git show:*),Bash(git blame:*),Bash(git rev-parse:*),Bash(curl*github.com/user-attachments/assets*),Bash(rm screenshot*),Bash(sleep:*),Glob,Grep,Read
description: Investigate a bug issue and post an investigation summary
---

Investigate the bug issue at $ISSUE_URL using the `bug-triage` agent.

The agent will:
- Analyze the issue to identify root cause
- Search the codebase for related code
- Post an Investigation Summary comment
- If Exploratory or High Confidence: add [$75] to title and External label
