---
allowed-tools: Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*)
description: Review a HelpDot documentation pull request
---

Perform a comprehensive HelpDot documentation review using subagents:

- helpdot-reviewer

The helpdot-reviewer will provide structured reviews with scores for each file. You must post these reviews as top-level PR comments using the exact format from the agent.

For each file reviewed, post:
1. The complete structured review (with scores and summary) as a top-level PR comment
2. Specific line issues as inline comments

Instruct the agent to only provide noteworthy feedback. Once it finishes, review the feedback and post only the feedback that you also deem noteworthy.

<important>
Keep feedback concise.
</important>
