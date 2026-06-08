---
ruleId: OVERENG-1
title: Track future work in a GitHub issue, not a TODO comment
---

## [OVERENG-1] Track future work in a GitHub issue, not a TODO comment

### Reasoning

Per `OVERENGINEERING.md`, future work should be captured in a GitHub issue, not left as a `TODO`/`FIXME` comment in the code. In-code TODOs are invisible to planning, never prioritized, and rot silently in the codebase.

### Incorrect

```tsx
// TODO: handle the offline case here later
function submit() {
    return API.write('SubmitReport', params);
}
```

### Correct

The deferred work lives as a GitHub issue on the board - the code carries no marker for it at all:

```tsx
function submit() {
    return API.write('SubmitReport', params);
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds a comment containing `TODO` or `FIXME`
- The comment describes deferred/future work (which belongs in a GitHub issue, not in the code)

**DO NOT flag if:**

- `TODO`/`FIXME` appears in a string literal, test fixture, or third-party/generated code rather than an authored code comment
- The token is part of an unrelated identifier (e.g. a variable literally named `todo` in a tasks feature)

**Search Patterns** (hints for reviewers):
- `// TODO` / `/* TODO` / `// FIXME`
