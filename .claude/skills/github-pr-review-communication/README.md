# GitHub PR Review Communication Skill

A Claude Code skill for effective GitHub pull request review communication.

## What This Skill Provides

This skill encapsulates proven patterns for communicating PR review feedback through:

1. **Inline Comments** - Line-specific, actionable feedback using MCP tools
2. **PR Reactions** - Quick approval signals (👍) when no issues found
3. **Summary Comments** - Overall assessment with scoring and recommendations

**Inline comment formatting:** Always start with `### ❌ [RULE-ID] [(docs)](link)` and include a plain code fence for the fix. Target the exact changed lines.

## Structure

```
github-pr-review-communication/
├── SKILL.md                               # Main skill documentation
├── scripts/
│   └── addPrReaction.sh                  # Script to add +1 reactions to PRs
└── references/
    └── inline-comment-patterns.md        # Comment format templates and examples
```

## How to Use

### For GitHub Actions Integration

This skill is pre-configured for this repository with the following setup:

1. **Script availability:** The `addPrReaction.sh` script from `.claude/skills/github-pr-review-communication/scripts/` is automatically available in PATH via workflow configuration

2. **Allowed-tools configuration:** The workflow includes:
   ```yaml
   claude_args: |
     --allowedTools "Bash(gh pr diff:*),Bash(gh pr view:*),Bash(addPrReaction.sh:*),mcp__github_inline_comment__create_inline_comment"
   ```

## Example Usage

### Inline Comment
```
mcp__github_inline_comment__create_inline_comment:
  path: 'src/components/List.tsx'
  line: 128
  body: |
    ### ❌ PERF-1
    
    Creating objects in renderItem prevents React optimizations.
    
    **Fix:** Pass props directly instead of creating new objects.
```

### Reaction (No Issues)
```bash
addPrReaction.sh 12345
```

### Summary Comment
```bash
gh pr comment 12345 --body 'Review summary with scores and recommendations'
```

## Requirements

- **GitHub CLI (`gh`)** - For posting comments and reactions
- **MCP github_inline_comment server** - For inline comment tool
- **GitHub Actions** - For automated reviews (optional)

## Learn More

- See `SKILL.md` for complete documentation
- See `references/inline-comment-patterns.md` for comment format templates and MCP tool integration guidance

