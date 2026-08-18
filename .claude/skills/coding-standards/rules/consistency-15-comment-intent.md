---
ruleId: CONSISTENCY-15
title: Comments explain why, and exist wherever the code is not self-explanatory
---

## [CONSISTENCY-15] Comments explain why, and exist wherever the code is not self-explanatory

### Reasoning

A comment that restates the code adds maintenance cost and no information - the code already says what it does. What the next contributor cannot recover from the code is the reason: the constraint, the bug, the API quirk, the deliberate trade-off. `STYLE.md` applies this to non-obvious optimizations ("leave a code comment explaining the reasoning to aid reviewers and future contributors"), and the same standard holds for any non-obvious branch, workaround, or magic-looking condition. Two failure modes are equally worth flagging: a comment that only paraphrases the line below it, and a genuinely non-obvious block with no comment at all.

### Incorrect

```ts
// Increment the counter by one
counter += 1;

// Set the timeout
if (report?.isOptimisticReport && !hasPendingAction && lastVisibleActionCreated < cutoff) {
    scheduleCleanup(report);
}
```

### Correct

```ts
counter += 1;

// Optimistic reports created before the cutoff never received a server response, so they are
// cleaned up here - otherwise they linger in Onyx and the LHN shows a report that does not exist.
if (report?.isOptimisticReport && !hasPendingAction && lastVisibleActionCreated < cutoff) {
    scheduleCleanup(report);
}
```

---

### Review Metadata

Flag ONLY when ONE of these is true:

- The changed code adds a comment that only restates what the adjacent line does, adding no reason, constraint or context
- The changed code adds a non-obvious branch, workaround, magic-looking condition or ordering dependency with no comment explaining why it is needed
- A changed comment is unclear or not correct English to the point that its meaning is ambiguous

**DO NOT flag if:**

- The comment documents props or JSDoc params - that is `CONSISTENCY-13` and `CONSISTENCY-10`
- The comment is a `TODO`/`FIXME` - that is `CONSISTENCY-11`
- The comment is a section header, a file header description (`CONSISTENCY-14`), or an eslint-disable justification (`CONSISTENCY-5`)
- The code is self-evident and simply has no comment - absence of a comment is only a violation where the code is genuinely non-obvious
- Minor grammar or phrasing preferences that do not change the meaning
- The code is a test or story

**Search Patterns** (hints for reviewers):
- added `//` and `/* */` comments in the diff
- added conditions combining three or more clauses with no adjacent comment
- `setTimeout`, `requestAnimationFrame`, `InteractionManager` and similar deferral calls with no adjacent comment
