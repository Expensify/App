---
ruleId: PERF-17
title: Don't pre-build a digest from data you hold; pass the raw source and index on demand
---

## [PERF-17] Don't pre-build a digest from data you hold; pass the raw source and index on demand

### Reasoning

Building a derived lookup structure (`new Set`/`new Map`/`Object.fromEntries` or a hand-built index) from a collection you already hold - just to answer membership/per-element checks downstream - is O(n) construction, often re-run every render, for something the callee can index O(1) straight from the raw source. Pass the raw collection and do the lookup on demand inside the callee instead. In [#94146], replacing a precomputed archived-IDs `Set` with the raw `reportNameValuePairs` collection plus O(1) lookups inside `findLastAccessedReport` cut ~14s on a 100k-report account. This is extra wasteful when the callee runs conditionally/lazily, since the digest is built even when it's never used.

### Incorrect

```tsx
// Builds a Set over the whole ~100k collection (every render) just to do membership checks downstream.
const archivedReportsIDSet = useArchivedReportsIDSet(); // internally: new Set(...) over the collection
const report = findLastAccessedReport(ignoreDomainRooms, isOpenOnAdminRoom, undefined, archivedReportsIDSet);
```

### Correct

```tsx
// Pass the raw collection; index O(1) on demand inside the callee.
const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
const report = findLastAccessedReport(ignoreDomainRooms, isOpenOnAdminRoom, undefined, reportNameValuePairs);

// inside findLastAccessedReport, the per-element check is a direct key lookup:
const isArchived = isArchivedReport(reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`]);
```

---

### Review Metadata

Flag when ALL of these are true:

- A derived lookup structure (`new Set`/`new Map`/`Object.fromEntries`, or a hand-built index object) is constructed from a collection/array the code already holds.
- It is built eagerly - at component scope or on every render (e.g. a hook or `useMemo` over the whole collection) - rather than behind the branch that needs it.
- Its only purpose is membership/lookup checks (`.has(...)`, `.includes(...)`, `[key]`) answerable O(1) directly against the raw source.
- That structure is then passed as a function argument.

Stronger signal (flag with higher confidence) when the callee runs conditionally/lazily - a `useCallback`/event handler, `useFocusEffect`, or a `useState(() => ...)` initializer - since the digest is then built on every render even when the callee, and the lookup, never run.

**DO NOT flag if:**

- The digest is queried repeatedly in a way visible in the diff (e.g. `.has(...)` inside a loop, or several distinct lookup sites against it) - a genuine precompute win. If the usage is a single pass, or the lookup site isn't visible in the diff, default to flagging.
- The raw source isn't already available to the callee and would otherwise need its own expensive fetch.
- The structure meaningfully reshapes data (not just a membership/lookup index) and the callee needs the whole thing.

**Search Patterns** (hints for reviewers):
- `new Set\(`
- `new Map\(`
- `Object\.fromEntries`
- `\.has\(`
- `\.includes\(`
- `useMemo`
- `useOnyx\(ONYXKEYS\.COLLECTION\.`
- `useCallback`
- `useFocusEffect`
- `useState\(\(\) =>`
