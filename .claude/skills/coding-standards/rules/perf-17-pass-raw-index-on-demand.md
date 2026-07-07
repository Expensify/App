---
ruleId: PERF-17
title: Don't create unnecessary intermediate lookup layers
---

## [PERF-17] Don't create unnecessary intermediate lookup layers

### Reasoning

Building a derived lookup structure (`new Set`/`new Map`/`Object.fromEntries` or a hand-built index) from a collection you already hold - just to answer membership/per-element checks downstream - is O(n) construction, often re-run every render, for something the callee can index O(1) straight from the raw source. Pass the raw collection and do the lookup on demand inside the callee instead.

### Examples

#### Incorrect

```tsx
// Archived reports in last-accessed navigation (ReportRouteParamHandler.tsx)
// Builds an intermediate lookup layer from the full collection on every render.
const archivedReportsIDSet = useArchivedReportsIDSet();

useFocusEffect(
    useCallback(() => {
        const report = findLastAccessedReport(ignoreDomainRooms, isOpenOnAdminRoom, undefined, archivedReportsIDSet);
    }, [archivedReportsIDSet, ignoreDomainRooms, isOpenOnAdminRoom]),
);
```

#### Correct

```tsx
// Pass raw collection and index on demand inside the callee.
const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

useFocusEffect(
    useCallback(() => {
        const report = findLastAccessedReport(ignoreDomainRooms, isOpenOnAdminRoom, undefined, reportNameValuePairs);
    }, [reportNameValuePairs, ignoreDomainRooms, isOpenOnAdminRoom]),
);

// inside findLastAccessedReport:
const reportNVP = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
const isArchived = isArchivedReport(reportNVP);
```

#### Incorrect

```tsx
// Distance rates membership in workspace settings (PolicyDistanceRatesPage.tsx)
const selectableRates = useMemo(() => buildSelectableRates(customUnitRates), [customUnitRates]);

// Unnecessary intermediate lookup layer from data already keyed by ID.
const rateIDs = useMemo(() => new Set(Object.keys(selectableRates)), [selectableRates]);

const isSelectable = rateIDs.has(transaction?.comment?.customUnit?.customUnitRateID);
```

#### Correct

```tsx
const selectableRates = useMemo(() => buildSelectableRates(customUnitRates), [customUnitRates]);

const rateID = transaction?.comment?.customUnit?.customUnitRateID;
const isSelectable = !!rateID && !!selectableRates[rateID];
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

- Genuine repeated querying against the intermediate lookup layer is confirmed (for example, `.has(...)` inside a loop or multiple distinct lookup sites). If that evidence is not visible in the diff, confirm it by searching the callee or changed file.
- The raw source isn't already available to the callee and would otherwise need its own expensive fetch.
- The structure meaningfully reshapes data (not just a membership/lookup index) and the callee needs the whole thing.

**Search Patterns** (hints for reviewers):
- `new Set\(`
- `new Map\(`
- `Object\.fromEntries`
- `\.has\(`
- `\.includes\(`
