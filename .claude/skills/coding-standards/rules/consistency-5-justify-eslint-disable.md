---
ruleId: CONSISTENCY-5
title: Justify ESLint rule disables
---

## [CONSISTENCY-5] Justify ESLint rule disables

### Reasoning

ESLint rule disables without justification can mask underlying issues and reduce code quality. Clear documentation ensures team members understand exceptions, promoting better maintainability.

### Incorrect

```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  initializeComponent();
}, []);
```

### Correct

```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps
// Dependencies are intentionally omitted - this effect should only run on mount
useEffect(() => {
  initializeComponent();
}, []);
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- An ESLint rule is disabled (via `eslint-disable`, `eslint-disable-next-line`, etc.)
- The disable statement lacks an accompanying comment explaining the reason

**DO NOT flag if:**

- The disablement is justified with a clear comment explaining why the rule is disabled

**Search Patterns** (hints for reviewers):
- `eslint-disable`
- `eslint-disable-next-line`
- `eslint-disable-line`
