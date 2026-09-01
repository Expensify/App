---
ruleId: CONSISTENCY-15
title: Commenting "Why"
---

## [CONSISTENCY-15] Commenting "Why"

### Reasoning

Comments should explain *why* the code exists, not what it does. Well-named identifiers already say what the code does, so a comment that only restates the code is dead weight.

### Incorrect

```tsx
// loop through users
users.forEach(processUser);
```

### Correct

```tsx
// We only include active users to avoid reprocessing deactivated ones
users.forEach(processUser);
```

---

### Review Metadata

Flag ONLY when BOTH of these are true:

- The changed code adds or modifies a comment
- The comment restates what the code does instead of explaining why it exists

**DO NOT flag if:**

- The comment is a JSDoc `@param` or `@returns` description, where stating what the parameter or return value is is the expected content, not a why explanation
- Stating what the code does is genuinely the only way to orient a reader, such as documenting a regex or a bit-flag mask

**Search Patterns** (hints for reviewers):
- Any newly added or modified `//` or `/* */` comment that only restates the code below it
