---
allowed-tools: Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),Bash(addPrReaction.sh:*),Bash(createInlineComment.sh:*),Bash(checkReactCompilerOptimization.ts:*),Bash(createGeneralComment.sh:*)
description: Review a code contribution pull request
---

Perform a comprehensive PR review using specialized subagents:

## Inline Review (Performance Rules)
Use the code-inline-reviewer agent to:
- Scan all changed source code files
- Create inline comments for specific performance rule violations (PERF-1 through PERF-5)
- Focus on line-specific, actionable feedback

## General Review (Standards & Patterns)
Use the code-general-reviewer agent to:
- Read documented coding standards and architectural patterns
- Review changes against established standards
- Create inline comments for deviations from documented best practices
- Identify exemplary patterns worth documenting

Run both agents in parallel and ensure their feedback is posted to the PR.

<important>
Keep feedback concise.
Both reviewers should only comment on lines within the PR diff.
</important>
