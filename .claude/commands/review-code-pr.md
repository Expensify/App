---
allowed-tools: Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),Bash(addPrReaction.sh:*),Bash(createInlineComment.sh:*)
description: Review a code contribution pull request
---

Perform a comprehensive PR review using a specialized subagent:

## Inline Review
Use the code-inline-reviewer agent to:
- Scan all changed source code files
- Create inline comments for specific review rule violations
- Focus on line-specific, actionable feedback

Run the agent and ensure its feedback is posted to the PR.

<important>
Keep feedback concise.
</important>
