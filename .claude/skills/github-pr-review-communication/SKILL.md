---
name: github-pr-review-communication
description: Guide for posting GitHub PR feedback using inline comments, reactions, and summary comments. Use when Claude needs to provide PR review feedback through line-specific inline comments, PR reactions for approval or top-level summary comments.
---

# GitHub PR Review Communication

This skill provides patterns for effectively communicating PR review feedback on GitHub using three primary methods: inline comments, reactions, and summary comments.

## Communication Methods

### Method 1: Inline Comments (Line-Specific Feedback)

**When to use:** Issues tied to specific lines or code blocks.

**Tool:** `mcp__github_inline_comment__create_inline_comment`

**Required body format (default to plain fences; a plain fence is ``` with a language tag matching the file, e.g., ```ts for TypeScript. Use GitHub `suggestion` fences only when you are certain the exact change is correct and fully scoped to the touched lines):**
```markdown
### ❌ [RULE-ID] [(docs)](URL-TO-RULE-DOCS)

[1–3 sentence reasoning about the violation]

**Suggested fix:**
```tsx
// Plain code fence with matching language (preferred, e.g., ```ts for .ts files)
// If 100% confident and scoped, you may use ```suggestion to allow auto-apply
// Show the corrected snippet for the exact changed line(s)
```
```

**Example:**
```
mcp__github_inline_comment__create_inline_comment:
  path: 'src/components/List.tsx'
  line: 128
  body: |
    ### ❌ PERF-1 [(docs)](https://github.com/Expensify/App/blob/main/.claude/agents/code-inline-reviewer.md#perf-1)
    
    Creating new objects with spread operators inside `renderItem` prevents React optimizations and forces every item to re-render.
    
    **Suggested fix:**
    ```tsx
    <Component item={item} isSelected={isSelected} />
    ```
```

### Method 2: Reactions (Approval Signal)

**When to use:** Reviewed everything, found zero violations, want to signal approval.

**Tool:** `addPrReaction.sh` (available in PATH via workflow setup)

**How to call:**
```bash
addPrReaction.sh 12345
```

**IMPORTANT:** Call the script by name only (no path). The script should be automatically added to PATH by the workflow configuration.

**Critical:** Only add reaction if you:
- ✅ Examined EVERY changed line in EVERY changed file
- ✅ Checked against ALL rules defined in your agent instructions
- ✅ Found ZERO violations
- ✅ Have NO uncertainty

### Method 3: Summary Comments (Overall Assessment)

**When to use:** Need to provide comprehensive overview or general feedback.

**Tool:** `gh pr comment` via Bash

**Example:**
```bash
gh pr comment 12345 --body 'Summary content here'
```

**Critical:** Always use **single quotes** around content to avoid shell escaping issues.

## Decision Tree

```
What type of feedback do I need to provide?

├─ Line-specific violation or issue
│  └─ Use: Inline comment
│
├─ Reviewed everything, no issues found
│  └─ Use: Reaction
│
├─ Overall assessment needed
│  └─ Use: Summary comment
│
└─ Both specific issues + overall context
   └─ Use: Inline comments + Summary comment
```

## Combining Methods

Use these patterns to determine when to combine communication methods:

**Common Patterns:**
- **Inline only** - Code reviews with specific violations found
- **Reaction only** - Reviews finding zero issues across all checks
- **Inline + Summary** - Documentation reviews (inline for line-specific issues, summary for overall assessment and scoring)
- **Summary only** - High-level feedback without line-specific concerns

**Never Combine:**
- ❌ **Reaction + Comments** - If you're creating comments, there are issues; if there are no issues, use reaction only

## Guidelines

### Creating Effective Inline Comments

**DO:**
- ✅ Be specific about the exact issue
- ✅ Provide concrete code examples for fixes
- ✅ Explain why it matters (briefly)
- ✅ Use consistent formatting
- ✅ Create comments immediately when violations found
- ✅ Use plain code fences by default and target exact changed lines
- ✅ Use GitHub `suggestion` fences only when the auto-applied change is exact, minimal, and risk-free

**DON'T:**
- ❌ Make vague suggestions without solutions
- ❌ Over-explain obvious fixes
- ❌ Batch analysis without posting comments
- ❌ Assume the developer knows the context
- ❌ Use GitHub `suggestion` fences when uncertain or when the change spans multiple contexts

### Using Reactions Appropriately

**DO:**
- ✅ Only add when you're absolutely certain
- ✅ Verify you checked ALL files and rules
- ✅ Use as a signal of successful, complete review

**DON'T:**
- ❌ Add when you have any uncertainty
- ❌ Add when you found even one violation
- ❌ Add before finishing complete analysis

### Writing Summary Comments

**DO:**
- ✅ Provide balanced feedback (positive + improvements)
- ✅ Focus on patterns and big picture
- ✅ Be actionable with prioritized recommendations
- ✅ Reference inline comments for specific details

**DON'T:**
- ❌ Repeat what's in inline comments verbatim
- ❌ Make it too long or verbose
- ❌ Be purely critical or purely praise

## Common Pitfalls

### Pitfall 1: Analyzing Without Posting

**Wrong:** "Found 3 violations... [describes them but never calls the tool]"

**Right:** "Found violation at line 10: [Immediately calls mcp tool]"

### Pitfall 2: Shell Escaping Errors

**Wrong:** `gh pr comment --body "Use "workspace" instead"`

**Right:** `gh pr comment --body 'Use "workspace" instead'`

### Pitfall 3: Premature Reactions

**Wrong:** "Checked most files, looks good... adding reaction"

**Right:** Document complete examination of all files and rules before adding reaction.

## Bundled Resources

### `scripts/addPrReaction.sh`
Adds +1 (👍) reaction to PR. Secure, minimal permissions. Always adds "+1" reaction (no reaction type parameter for consistency and security).

**Usage:** `addPrReaction.sh <PR_NUMBER>`

**IMPORTANT:** Call the script by name only, without any path prefix. The workflow automatically adds it to PATH.

**Examples:**
- ✅ **Correct:** `addPrReaction.sh 12345`
- ❌ **Wrong:** `/path/to/addPrReaction.sh 12345`

**Requirement:** Script must be available in PATH (typically added via workflow configuration).

### `references/inline-comment-patterns.md`
Detailed comment format templates, examples by context, and writing guidelines.

**Reference when:** You need additional format guidance beyond the examples in this skill.

## Tips for Effective Reviews

1. **Be Concise:** Keep comments focused and actionable.
2. **Be Consistent:** Use the same format for similar violations.
3. **Be Respectful:** Focus on code, not people.
4. **Be Thorough:** Don't skip files or rules.
5. **Be Timely:** Create comments as you find issues.

## Summary

Three communication methods for PR reviews:

1. **Inline Comments** - Line-specific, actionable feedback via MCP tool
2. **Reactions** - Quick approval signal via `addPrReaction.sh` (only when zero violations)
3. **Summary Comments** - Overall assessment via `gh pr comment`

