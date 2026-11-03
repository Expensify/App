---
ruleId: CONSISTENCY-15
title: Write comments as plain, natural sentences
---

## [CONSISTENCY-15] Write comments as plain, natural sentences

### Reasoning

Comments should read like something a person actually wrote: plain sentences without the stylistic tics that make prose harder to read, such as stacked hyphenated modifiers, arrows, and trailing placement on the same line as the code.

### Incorrect

```tsx
doThing(); // cache the result

// the not-yet-validated user-supplied bank-account number

// persisted -> processing transition
```

### Correct

```tsx
// Cache the result to avoid reading from the database every time
doThing();

// The bank account number the user supplied, before validation

// SequentialQueue moves the request from persisted to processing
```

---

### Review Metadata

Flag ONLY when BOTH of these are true:

- The changed code adds or modifies a comment
- In its own sentence, not inside a quoted code snippet or string literal it's documenting, the comment does at least one of the following:
  - Stacks more than one hyphenated compound modifier in front of a noun
  - Uses `->` instead of writing the relationship in words
  - Trails at the end of a code line instead of sitting on its own line directly above it

**DO NOT flag if:**

- The arrow appears inside a quoted code example, string literal, or file path the comment is documenting, rather than in the comment's own sentence
- A single, ordinary compound modifier like "well-known" or "high-risk" is used. Only a stacked chain of several modifiers in front of one noun is a violation

**Search Patterns** (hints for reviewers):
- Any newly added or modified `//` or `/* */` comment
