---
allowed-tools: Bash(gh issue view:*),Bash(gh issue edit:*),Bash(gh issue comment:*),Bash(gh issue list:*),Bash(gh pr view:*),Bash(gh pr list:*),Bash(gh api:*)
description: Investigate a deploy blocker issue to find the causing PR and recommend resolution
---

Investigate a deploy blocker issue using the deploy-blocker-investigator agent.

The agent will:
1. Analyze the issue to determine if it's a frontend (App) or backend (Auth/PHP) bug
2. Find the most likely causing PR from the StagingDeployCash checklist
3. Post a structured recommendation with ONE clear resolution path:
   - **Revert**: Create a revert PR and cherry-pick to staging
   - **Roll Forward**: Create a fix PR if reverting is too disruptive
   - **Demote**: Remove the label if it's not actually blocking
4. If it's a backend bug, remove the DeployBlockerCash label
5. If it's a front-end bug that can be fixed in the App repo, remove the DeployBlocker label
