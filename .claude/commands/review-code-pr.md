---
allowed-tools: Bash(gh pr diff:*),Bash(gh pr view:*),Bash(check-compiler.sh:*)
description: Run the coding-standards rule linter on a PR diff. Use when user wants to review their changes against our custom rules.
---

Perform a comprehensive PR review using a specialized subagent:

## Inline Review
Use the code-inline-reviewer agent to:
- Scan all changed source code files
- Detect review rule violations with line-specific, actionable feedback

Run the agent. It will return structured JSON with any violations found.

## Output
Return the subagent's violations JSON as your structured output unchanged.
Do NOT post comments or reactions yourself - the workflow handles that.

<important>
Keep feedback concise.
</important>
