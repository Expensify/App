---
ruleId: PERF-17
title: Don't create unnecessary intermediate lookup layers
---

## [PERF-17] Don't create unnecessary intermediate lookup layers

### Reasoning

Building a derived lookup structure (`new Set`/`new Map`/`Object.fromEntries` or a hand-built index) from a collection you already hold - just to answer membership/per-element checks downstream - is O(n) construction, often re-run every render, for something the callee can index O(1) straight from the raw source. Pass the raw collection and do the lookup on demand inside the callee instead.

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

**Flag when ALL of these are true:**

- A derived lookup structure (`new Set`/`new Map`/`Object.fromEntries`, or a hand-built index object) is constructed from a collection/array the code already holds.
- It is built eagerly - at component scope or on every render (e.g. a hook or `useMemo` over the whole collection) - rather than behind the branch that needs it.
- Its only purpose is membership/lookup checks (`.has(...)`, `.includes(...)`, `[key]`) answerable O(1) directly against the raw source.

Increase confidence (not required):

- The callee runs conditionally/lazily (for example, inside a `useCallback`/event handler, `useFocusEffect`, or a `useState(() => ...)` initializer), so the intermediate lookup layer is rebuilt on every render even when the callee and lookup never run.

**DO NOT flag if:**

- The intermediate lookup layer is queried repeatedly in a way visible in the diff (e.g. `.has(...)` inside a loop, or several distinct lookup sites against it) - a genuine precompute win.
- The raw source isn't already available to the callee and would otherwise need its own expensive fetch.
- The structure meaningfully reshapes data (not just a membership/lookup index) and the callee needs the whole thing.

**Search Patterns** (hints for reviewers):
- `new Set\(`
- `new Map\(`
- `Object\.fromEntries`
- `\.has\(`
- `\.includes\(`
