# Inline Comment Patterns

This reference provides proven patterns for creating effective inline comments on GitHub pull requests. These patterns are extracted from production review agents and optimized for clarity, actionability, and developer experience.

## Table of Contents

- [When to Use Inline Comments](#when-to-use-inline-comments)
- [Comment Format Templates](#comment-format-templates)
- [Writing Effective Comments](#writing-effective-comments)
- [Integration with MCP Tool](#integration-with-mcp-tool)

## When to Use Inline Comments

Use inline comments for:

- **Line-specific violations** - Issues tied to a specific line or code block
- **Rule violations** - When code/documentation violates established guidelines
- **Actionable feedback** - When you can suggest a specific fix
- **Teaching moments** - Explaining why something is problematic

**Do NOT use inline comments for:**

- General feedback (use top-level comments instead)
- Overall assessment (use summary comments)
- Approval without issues (use reactions instead)

## Comment Format Templates

### Template 1: Rule-Based Format (with Documentation Links)

Best for structured review rules with documentation.

**Format:**
```markdown
### ❌ [RULE-ID] [(docs)](URL-TO-RULE-DOCS)

[Reasoning explaining why this is a violation]

[Suggested fix with specific code example or guidance]
```

**Example:**
```markdown
### ❌ PERF-1 [(docs)](https://github.com/Expensify/App/blob/main/.claude/agents/code-inline-reviewer.md#perf-1)

Creating new objects with spread operators inside `renderItem` forces React to treat each list item as changed, preventing reconciliation optimizations and causing unnecessary re-renders.

**Suggested fix:**
```tsx
<Component
  item={item}
  isSelected={isSelected}
  shouldAnimateInHighlight={isItemHighlighted}
/>
```
```

**When to use:** Code reviews with numbered rules, performance reviews, security audits.

### Template 2: Issue-Type Format (Simple and Direct)

Best for documentation reviews and general feedback.

**Format:**
```markdown
**[Issue Type]**: [Brief explanation]

[Suggested fix]

[Optional: Why it matters]
```

**Example:**
```markdown
**Terminology violation**: Use "workspace" instead of "policy" to match Expensify standards.

Replace "policy" with "workspace" throughout this section for consistency with current terminology.
```

**When to use:** Documentation reviews, style compliance, simple violations.

### Template 3: Concise Format (Quick Feedback)

Best for obvious issues that need minimal explanation.

**Format:**
```markdown
[Brief issue description]

[One-line fix]
```

**Example:**
```markdown
Missing YAML frontmatter. Add metadata at the top of the file:

```yaml
---
title: Feature Name
description: Brief description
keywords: [feature, related terms]
---
```
```

**When to use:** Formatting issues, missing elements, obvious bugs.

## Writing Effective Comments

### Principles

1. **Be specific** - Point to the exact problem, not general areas
2. **Be actionable** - Provide clear next steps or code examples
3. **Be respectful** - Assume positive intent, focus on the code
4. **Be concise** - Respect the reader's time

### Structure

Every effective inline comment has three parts:

1. **What's wrong** - Clear identification of the issue
2. **Why it matters** - Brief context (can be implicit for obvious issues)
3. **How to fix** - Concrete suggestion with examples

### Code Examples in Comments

**Good:**
```markdown
Use `useMemo` to prevent unnecessary re-renders:

```tsx
const reportData = useMemo(() => ({
    reportID: report.reportID,
    type: report.type,
}), [report.reportID, report.type]);
```
```

**Bad:**
```markdown
Consider memoization here.
```

### Tone and Voice

**Good:**
- "This creates unnecessary re-renders. Consider using..."
- "Missing required field. Add..."
- "This pattern can cause performance issues. Use... instead."

**Bad:**
- "This is wrong."
- "You should know better than to..."
- "Obviously this is a problem."

## Best Practices Summary

### DO:
- ✅ Reference specific lines and code blocks
- ✅ Provide code examples for fixes
- ✅ Explain the "why" behind the issue
- ✅ Link to relevant documentation
- ✅ Use consistent formatting
- ✅ Be respectful and constructive

### DON'T:
- ❌ Make vague suggestions without specifics
- ❌ Critique without offering solutions
- ❌ Use judgmental language
- ❌ Create comments for trivial issues
- ❌ Duplicate feedback across multiple files
- ❌ Over-explain obvious fixes

## Integration with MCP Tool

**⚠️ IMPORTANT: Always use the `mcp__github_inline_comment__create_inline_comment` tool whenever it is available.** This tool provides the best developer experience by placing comments directly on the relevant code lines in the PR interface.

When using the `mcp__github_inline_comment__create_inline_comment` tool:

```
mcp__github_inline_comment__create_inline_comment:
  path: 'src/components/ReportActionsList.tsx'
  line: 128
  body: |
    ### ❌ PERF-1 [(docs)](https://example.com/rules#perf-1)
    
    Creating new objects with spread operators inside `renderItem` prevents React optimizations.
    
    **Suggested fix:**
    ```tsx
    <Component
      item={item}
      isSelected={isSelected}
    />
    ```
```

**Key points:**
- `path`: Full file path from repository root
- `line`: Exact line number where the issue occurs
- `body`: Full comment content (supports Markdown)
- **Always prefer this tool over manual comment descriptions** when providing line-specific feedback

