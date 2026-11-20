---
ruleId: PERF-23
title: Derived values keep their reference when nothing changed
---

## [PERF-23] Derived values keep their reference when nothing changed

### Reasoning

After a `compute` returns, the derived value engine compares the result with the current value by reference. If it is the same object, the write is skipped. If it is a new object, even one equal to the old one, the engine rewrites the whole key and notifies every subscriber, and every `useOnyx(key)` without a selector re-renders. A `compute` that rebuilds an object or array on each run therefore wakes all subscribers for a write that changed nothing, for example when a report is marked as read. Return `currentValue` when nothing changed, and reuse the unchanged entries of nested values.

### Incorrect

```ts
// BAD: a new object on every compute, even when every entry is the same.
compute: ([reports], {currentValue}) => {
    const attributes: Record<string, ReportAttributes> = {};
    for (const [key, report] of Object.entries(reports ?? {})) {
        attributes[key] = getReportAttributes(report);
    }
    return attributes;
},
```

### Correct

```ts
// GOOD: a flat value keeps its reference when it is shallow equal.
compute: ([personalDetailsList], {currentValue}) => {
    const guideAccountIDs = getGuideAccountIDs(personalDetailsList);
    return currentValue && shallowEqual(currentValue, guideAccountIDs) ? currentValue : guideAccountIDs;
},

// GOOD: nested entries are reused and the old value is returned when none changed.
compute: ([reports], {currentValue}) => {
    const attributes = getAttributes(reports);
    if (!currentValue) {
        return attributes;
    }
    return reuseUnchanged(attributes, currentValue, deepEqual);
},

// GOOD: nothing relevant changed, so return early.
compute: ([reports], {currentValue, sourceValues}) => {
    if (currentValue && !sourceValues?.[ONYXKEYS.COLLECTION.REPORT]) {
        return currentValue;
    }
    // ...
},
```

---

### Review Metadata

**Flag when ALL of these are true:**

- The code is the `compute` of a `createOnyxDerivedValueConfig` (`src/libs/actions/OnyxDerived/configs`).
- It returns an object or array that it builds from `currentValue` (for example `{...currentValue}`) or from scratch.
- It can run again with a result equal to `currentValue`, for example on an incremental update that touches one entry, and it has no path that returns `currentValue` or reuses the unchanged entries.

**DO NOT flag if:**

- The value changes on every compute by design, for example it holds a timestamp or a counter.
- The returned value is a primitive.
- The compute already returns `currentValue` on the no-change path, or reuses the unchanged entries with `reuseUnchanged`.

**Related:** [PERF-5](perf-5-shallow-comparison.md) for shallow comparison in components, [PERF-11](perf-11-optimize-data-selection.md) for selectors.

**Search Patterns** (hints for reviewers):
- `createOnyxDerivedValueConfig`
- `\{\.\.\.currentValue`
- `currentValue`
