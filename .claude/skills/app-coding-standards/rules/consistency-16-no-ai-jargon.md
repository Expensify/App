---
ruleId: CONSISTENCY-16
title: No AI-generated jargon in code or comments
---

## [CONSISTENCY-16] No AI-generated jargon in code or comments

### Reasoning

Certain phrases appear constantly in AI-generated code but rarely in code written by engineers. They make the codebase sound like it was written by a chatbot and should be replaced with plain, direct language.

### Banned phrases

| Phrase | Plain substitute |
|--------|-----------------|
| sentinel | placeholder, marker, guard entry |
| fan out | send, make, dispatch, distribute |
| carve out | set aside, exclude, separate |
| defense in depth | extra guard, additional check |
| belt and suspenders / belt-and-suspenders | extra safety check, redundant guard |
| fresh evidence | new data, updated result |

### Incorrect

```ts
// Fan out the request to every matching snapshot.
function getSentinelValue() { ... }
const fanOutRequests = () => { ... }

// Defense in depth: reject the value if it arrived stale.
// Belt-and-suspenders check before writing.
// Uses a sentinel to signal end-of-stream.
```

### Correct

```ts
// Send the request to every matching snapshot.
function getPlaceholderValue() { ... }
const sendDuplicateRequests = () => { ... }

// Additional guard: reject the value if it arrived stale.
// Extra safety check before writing.
// Uses a placeholder to signal end-of-stream.
```

---

### Review Metadata

Flag when any added or modified code — including comments, function names, variable names, type names, or string literals — contains one of the banned phrases above.

**DO NOT flag if:**

- The phrase appears inside a quoted external API name, a third-party library identifier, or a value the codebase does not control (e.g. a server response field name)
- The phrase is in a test description string that is directly testing behavior described by an external spec or API that uses the term
