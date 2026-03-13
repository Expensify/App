---
allowed-tools: Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),mcp__github_inline_comment__create_inline_comment
description: Review a HelpDot documentation pull request
---

Perform a comprehensive HelpDot documentation review using two specialized subagents. Both reviewers use the **help site governance files** in the repo as the source of truth for rules and scoring:

- **docs/HELPSITE_NAMING_CONVENTIONS.md** — UI referencing, button/tab naming, navigation
- **docs/HELP_AUTHORING_GUIDELINES.md** — Structure, headings, metadata, AI retrieval, validation
- **docs/TEMPLATE.md** — YAML frontmatter, heading guidance, FAQ structure

## Step 1: Inline Review
Use the helpdot-inline-reviewer agent to:
- Scan all changed documentation files
- Create **inline comments** for each governance rule violation using **`mcp__github_inline_comment__create_inline_comment`** (one call per violation)

The agent must use the MCP tool for inline comments. Do not have it return JSON or use Bash to post inline comments.

## Step 2: Summary Review  
Use the helpdot-summary-reviewer agent to:
- Analyze the overall quality of all changes using the governance criteria
- Provide comprehensive assessment with scoring
- Post one top-level PR comment with summary and recommendations (using `gh pr comment`)

Run both agents. Inline comments will appear on the diff from the inline reviewer's MCP tool calls.

<important>
Keep feedback concise.
</important>
