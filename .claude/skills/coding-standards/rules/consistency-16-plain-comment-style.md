---
ruleId: CONSISTENCY-16
title: Write comments as plain, natural sentences
---

## [CONSISTENCY-16] Write comments as plain, natural sentences

### Reasoning

Comments should read like something a person actually wrote: plain sentences without the stylistic tics that make prose harder to read, such as em dashes, redundant parentheticals, stacked hyphenated modifiers, arrows, semicolons, and trailing placement on the same line as the code.

### Incorrect

```tsx
doThing(); // cache the result

// Set the pendingAction to ADD — this exercises the optimistic-update branch before the API responds

// When the assigned guide (who is not a policy admin) comments, then it succeeds

// the not-yet-validated user-supplied bank-account number

// persisted -> processing transition

// retry once; the token had expired
```

### Correct

```tsx
// Cache the result to avoid reading from the database every time
doThing();

// Set the pendingAction to ADD to go through the optimistic-update branch before the API responds

// The assigned guide isn't a policy admin, but the comment still succeeds

// The bank account number the user supplied, before validation

// SequentialQueue moves the request from persisted to processing

// Retry once because the token had expired
```

---

### Review Metadata

Flag ONLY when BOTH of these are true:

- The changed code adds or modifies a comment
- In its own sentence, not inside a quoted code snippet or string literal it's documenting, the comment does at least one of the following:
  - Uses an em dash or en dash
  - Uses a redundant parenthetical that just repeats what the surrounding sentence already says
  - Stacks more than one hyphenated compound modifier in front of a noun
  - Uses `->` instead of writing the relationship in words
  - Uses a semicolon instead of two separate sentences
  - Trails at the end of a code line instead of sitting on its own line directly above it

**DO NOT flag if:**

- The dash, arrow, or semicolon appears inside a quoted code example, string literal, or file path the comment is documenting, rather than in the comment's own sentence
- A single, ordinary compound modifier like "well-known" or "high-risk" is used. Only a stacked chain of several modifiers in front of one noun is a violation

**Search Patterns** (hints for reviewers):
- Any newly added or modified `//` or `/* */` comment
