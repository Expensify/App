---
allowed-tools: Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*)
description: Review a HelpDot documentation pull request
---

Perform a comprehensive HelpDot documentation review using subagents:

- helpdot-reviewer

The helpdot-reviewer will analyze all changed files and provide one consolidated review. You must post a single top-level PR comment that summarizes the overall findings.

Post:
1. ONE comprehensive review comment covering all files with overall assessment
2. Specific line issues as inline comments for individual problems

Instruct the agent to only provide noteworthy feedback. Once it finishes, review the feedback and post only the feedback that you also deem noteworthy.

<important>
Keep feedback concise.
</important>
