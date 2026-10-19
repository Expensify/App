---
ruleId: CONSISTENCY-5
title: Justify ESLint rule disables
---

## [CONSISTENCY-5] Justify ESLint rule disables

### Reasoning

`eslint-disable` comments completely hide violations from the seatbelt baseline — they will never be fixed unless the comment is removed. Because of this, they should only be used for **permanent** suppressions where you are certain the rule genuinely does not apply to that specific case and you don't expect the violation to ever be fixed.

For **temporary** suppressions (e.g. the fix requires a large refactor that is out of scope), prefer widening the seatbelt baseline with `SEATBELT_INCREASE` instead — that keeps the violation visible so it can still be fixed later. See [`LINTING.md`](../../../../contributingGuides/LINTING.md) for full guidance on choosing between the two approaches.

When `eslint-disable` is used, a justification comment is required so that reviewers and future maintainers understand why the rule was deliberately suppressed.

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

**Also consider flagging if:**

- `eslint-disable` is used for what appears to be a temporary/convenience suppression — in those cases, suggest `SEATBELT_INCREASE` as the preferred alternative (see [`LINTING.md`](../../../../contributingGuides/LINTING.md))

**DO NOT flag if:**

- The disablement is justified with a clear comment explaining why the rule is disabled

**Search Patterns** (hints for reviewers):
- `eslint-disable`
- `eslint-disable-next-line`
- `eslint-disable-line`
