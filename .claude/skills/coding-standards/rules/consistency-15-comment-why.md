---
ruleId: CONSISTENCY-15
title: Commenting "Why"
---

## [CONSISTENCY-15] Commenting "Why"

### Reasoning

Comments should explain *why* the code exists, not what it does. Well-named identifiers already say what the code does, so a comment that only restates the code is dead weight. Comments should also read as something a person actually wrote: plain, natural language, free of the tics that make AI-generated prose stand out, such as em dashes, redundant parentheticals, stacked hyphenated modifiers, arrows, semicolons, and trailing placement on the same line as the code.

### Incorrect

```tsx
// loop through users
users.forEach(processUser);

// This effectively leverages a comprehensive validation mechanism to robustly ensure data integrity

doThing(); // cache the result

// Set a specific domain AM — this exercises the domainAccountManagerID === accountID branch

// When the assigned guide (who is not a policy admin) comments, then it succeeds

// the not-yet-validated user-supplied bank-account number

// peek -> process transition

// retry once; the endpoint is flaky
```

### Correct

```tsx
// we only include active users to avoid reprocessing deactivated ones
users.forEach(processUser);

// rejects malformed input before it reaches the database

// cache the result
doThing();

// Set a specific domain AM to go through the domainAccountManagerID === accountID branch

// The assigned guide isn't a policy admin, but the comment still succeeds

// the bank account number the user supplied, before validation

// the transition from peek to process

// retry once because the endpoint is flaky
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds or modifies a comment
- The comment does at least one of the following:
  - Restates what the code does instead of explaining why it exists
  - Reads as AI-generated prose instead of something a person would naturally say out loud
  - Uses an em dash or en dash
  - Uses a redundant parenthetical that just repeats what the surrounding sentence already says
  - Stacks more than one hyphenated compound modifier in front of a noun
  - Uses `->` instead of writing the relationship in words
  - Uses a semicolon instead of two separate sentences
  - Trails at the end of a code line instead of sitting on its own line directly above it

**DO NOT flag if:**

- The comment is a JSDoc block, which CONSISTENCY-10 covers
- A single, ordinary compound modifier like "well-known" or "high-risk" is used. Only a stacked chain of several modifiers in front of one noun is a violation
- Stating what the code does is genuinely the only way to orient a reader, such as documenting a regex or a bit-flag mask

**Search Patterns** (hints for reviewers):
- Any newly added or modified `//` or `/* */` comment
