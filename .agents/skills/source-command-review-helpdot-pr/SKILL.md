---
name: "source-command-review-helpdot-pr"
description: "Review a HelpDot documentation pull request"
---

# source-command-review-helpdot-pr

Use this skill when the user asks to run the migrated source command `review-helpdot-pr`.

## Command Template

Perform a comprehensive HelpDot documentation review using two specialized subagents. Both reviewers use the **help site governance files** in the repo as the source of truth for rules and scoring:

- **docs/HELPSITE_NAMING_CONVENTIONS.md** — UI referencing, button/tab naming, navigation
- **docs/HELP_AUTHORING_GUIDELINES.md** — Structure, headings, metadata, AI retrieval, validation
- **docs/TEMPLATE.md** — YAML frontmatter, heading guidance, FAQ structure

## Step 1: Inline Review
Use the helpdot-inline-reviewer agent to:
- Scan all changed documentation files
- Create inline comments for violations of the governance rules above
- Focus on line-specific, actionable feedback

## Step 2: Summary Review  
Use the helpdot-summary-reviewer agent to:
- Analyze the overall quality of all changes using the governance criteria
- Provide comprehensive assessment with scoring
- Post one top-level PR comment with summary and recommendations

Run both agents and ensure their feedback is posted to the PR.

<important>
Keep feedback concise.
</important>
