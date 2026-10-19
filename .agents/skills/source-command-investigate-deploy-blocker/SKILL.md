---
name: "source-command-investigate-deploy-blocker"
description: "Investigate a deploy blocker issue to find the causing PR and recommend resolution"
---

# source-command-investigate-deploy-blocker

Use this skill when the user asks to run the migrated source command `investigate-deploy-blocker`.

## Command Template

Investigate the deploy blocker issue at $ISSUE_URL using the `deploy-blocker-investigator` agent.

The agent will:
- Analyze the issue to determine if it's a frontend (App) or backend bug
- Find the most likely causing PR
- Post a comment with findings and recommendation
- Update labels if appropriate
