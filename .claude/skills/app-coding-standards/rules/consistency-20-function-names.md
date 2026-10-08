---
ruleId: CONSISTENCY-20
title: Name functions with a verb that says what they do
---

## [CONSISTENCY-20] Name functions with a verb that says what they do

### Reasoning

A function name that starts with a verb tells the caller what the function does without a trip to its body. A name made only of nouns or adjectives, such as `reportTotal`, reads as a value, so the reader cannot tell that the function computes something or what it returns. The same goes for a function's JSDoc: when there is one, its first sentence should start with a verb that says what the function returns or does, rather than restate the name. [CONSISTENCY-10](consistency-10-jsdoc.md) covers the rest of the JSDoc format.

### Incorrect

```ts
/** The report total. */
function reportTotal(transactions: Transaction[]): number {
    // ...
}
```

### Correct

```ts
/** Returns the sum of the transaction amounts, in cents. */
function getReportTotal(transactions: Transaction[]): number {
    // ...
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code **declares** a new or renamed function (a function declaration, or an arrow function or function expression assigned to a `const`/`let`)
- The name does not start with a verb, so it reads as a value rather than an action (e.g. `reportTotal`, `policyMembers`)

Also flag a JSDoc that the changed code adds to a function when its first sentence restates the name instead of saying what the function returns or does.

**DO NOT flag if:**

- The function is a React component, a higher-order component (`withX`), or a hook (`useX`)
- The function is an Onyx selector, which ends in `Selector` by convention (e.g. `isQBORefreshTokenExpiringSoonSelector`)
- The function is a conversion that follows the `toX()` / `fromX()` idiom (e.g. `toSafeReturnPath`)
- The name starts with `on` or `handle`, which [CONSISTENCY-12](consistency-12-callback-named-for-action.md) covers
- A parent class, an interface, a library, or another external contract sets the name
- The function already exists and the PR does not rename it
- The file is a test or story

**Search Patterns** (hints for reviewers):
- `function [a-z]` / `const [a-z][A-Za-z]* = (` / `const [a-z][A-Za-z]* = async (`
