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

### Banned phrases

The following phrases sound natural to AI but are unusual in human-written code. Flag any comment that uses them and suggest a plain substitute.

| Phrase | Plain substitute |
|--------|-----------------|
| fan out | send, make, dispatch, distribute |
| carve out | set aside, exclude, separate |
| defense in depth | extra guard, additional check |
| belt and suspenders (or belt-and-suspenders) | extra safety check, redundant guard |
| fresh evidence | new data, updated result |
| sentinel | placeholder, marker, guard entry |

**Examples of violations:**

```ts
// Fan out the request to every matching snapshot.
// Belt-and-suspenders: also check the flag here.
// Defense in depth: reject the value if it arrived stale.
// Uses a sentinel to signal end-of-stream.
```

**Corrected:**

```ts
// Send the request to every matching snapshot.
// Extra safety check: also verify the flag here.
// Additional guard: reject the value if it arrived stale.
// Uses a placeholder to signal end-of-stream.
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
  - Uses a banned phrase from the list above

**DO NOT flag if:**

- The dash, arrow, or semicolon appears inside a quoted code example, string literal, or file path the comment is documenting, rather than in the comment's own sentence
- A single, ordinary compound modifier like "well-known" or "high-risk" is used. Only a stacked chain of several modifiers in front of one noun is a violation

**Search Patterns** (hints for reviewers):
- Any newly added or modified `//` or `/* */` comment
