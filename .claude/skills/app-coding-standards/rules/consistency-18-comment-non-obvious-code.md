---
ruleId: CONSISTENCY-18
title: Comment code that is not self-explanatory
---

## [CONSISTENCY-18] Comment code that is not self-explanatory

### Reasoning

What the next contributor cannot recover from the code is the reason behind it: the constraint, the bug, the API quirk, the deliberate trade-off. `STYLE.md` asks for this on non-obvious optimizations ("leave a code comment explaining the reasoning to aid reviewers and future contributors"), and the same standard holds for any non-obvious branch, workaround, or magic-looking condition. A comment that exists but is too unclear to understand fails the same way as a missing one. `CONSISTENCY-14` covers the opposite failure, a comment that only restates the code.

### Incorrect

```ts
if (report?.isOptimisticReport && !hasPendingAction && lastVisibleActionCreated < cutoff) {
    scheduleCleanup(report);
}
```

### Correct

```ts
// Optimistic reports created before the cutoff never received a server response, so they are
// cleaned up here. Otherwise they linger in Onyx and the LHN shows a report that does not exist.
if (report?.isOptimisticReport && !hasPendingAction && lastVisibleActionCreated < cutoff) {
    scheduleCleanup(report);
}
```

---

### Review Metadata

Flag ONLY when ONE of these is true:

- The changed code adds a non-obvious branch, workaround, magic-looking condition or ordering dependency with no comment explaining why it is needed
- A changed comment is unclear or not correct English to the point that its meaning is ambiguous

**DO NOT flag if:**

- The comment only restates the code. That is `CONSISTENCY-14`
- The comment's wording or punctuation style is the problem. That is `CONSISTENCY-15`
- The comment documents props or JSDoc params (`CONSISTENCY-10`), is a `TODO`/`FIXME` (`CONSISTENCY-11`), a file header description (`CONSISTENCY-13`), or an eslint-disable justification (`CONSISTENCY-5`)
- The code is self-evident and simply has no comment. Absence of a comment is only a violation where the code is genuinely non-obvious
- Minor grammar or phrasing preferences that do not change the meaning
- The code is a test or story

**Search Patterns** (hints for reviewers):
- added conditions combining three or more clauses with no adjacent comment
- `setTimeout`, `requestAnimationFrame`, `InteractionManager` and similar deferral calls with no adjacent comment
- added `//` and `/* */` comments whose meaning is unclear
