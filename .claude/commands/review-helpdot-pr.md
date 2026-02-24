---
allowed-tools: Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),mcp__github_inline_comment__create_inline_comment
description: Review a HelpDot documentation pull request
---

Perform a comprehensive HelpDot documentation review using two specialized subagents:

## Step 1: Inline Review
Use the helpdot-inline-reviewer agent to:
- Scan all changed documentation files
- Create inline comments for specific HelpDot rule violations
- Focus on line-specific, actionable feedback

## Step 2: Summary Review  
Use the helpdot-summary-reviewer agent to:
- Analyze the overall quality of all changes
- Provide comprehensive assessment with scoring
- Post one top-level PR comment with summary and recommendations

Run both agents and ensure their feedback is posted to the PR.

<important>
Keep feedback concise.
</important>
