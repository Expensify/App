---
ruleId: PERF-17
title: Don't compute expensive args eagerly for conditionally-used callees
---

## [PERF-17] Don't compute expensive args eagerly for conditionally-used callees

### Reasoning

A value derived at component level (a `useOnyx` subscription, a `useMemo` over a collection, an iteration or allocation) is paid on **every render**. When that value exists only to be passed as an argument to a function that runs **conditionally or lazily** - inside a `useCallback` handler, a `useFocusEffect`, an event callback, or a `useState(() => ...)` lazy initializer - the cost is paid continuously while the benefit is realized rarely (or once, or never).

This is doubly wasteful when the argument is a large Onyx collection: the component now holds a live subscription to the whole collection and **re-renders on every mutation to it**, purely to feed a callee that may not execute on this render.

Prefer paying for what you use, in this order:

1. **Pull, don't push.** If the callee is a non-UI util that can reach the data itself (module-scoped `Onyx.connect`/`connectWithoutView`, context), let it - don't make every caller subscribe and pass it in. If the param already has a module fallback, production callers can simply omit it and let tests inject.
2. **Push the derivation inside.** Move the computation behind the condition that needs it, so it runs only on that branch.
3. **Pass a thunk.** `fn(() => expensiveValue)` and invoke it lazily inside the branch - keeps injection/testability without the eager cost.
4. **If a UI subscription is genuinely required, narrow it** with a `useOnyx` selector so the component re-renders only on the slice it uses (see [PERF-11]).

This complements [PERF-13] (hoist iteration-independent calls *out* of loops): here the fix is to push the work *into* the branch that actually needs it, or out of the component entirely.

### Incorrect

```tsx
// BAD: subscribes to the entire 100k-entry collection on every render of an
// always-mounted navigator, only to feed a function that runs ONCE at mount.
function ReportsSplitNavigator() {
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

    const [initialReportID] = useState(() => {
        const initialReport = findLastAccessedReport(ignoreDomainRooms, isOpenOnAdminRoom, undefined, reportNameValuePairs);
        return initialReport?.reportID ?? '';
    });
    // The component now re-renders on every archive/pin/RNVP change, forever,
    // even though `reportNameValuePairs` was only read at mount.
}

// BAD: collection passed to a handler that only fires on a button press
function OnboardingPage() {
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

    const onContinue = useCallback(() => {
        navigateAfterOnboarding(isSmallScreenWidth, canUseDefaultRooms, conciergeReportID, reportNameValuePairs);
    }, [isSmallScreenWidth, canUseDefaultRooms, conciergeReportID, reportNameValuePairs]);
    // Eager subscription + the value sits in the callback's dep array, churning
    // its identity on every collection mutation.
}
```

### Correct

```tsx
// GOOD: the callee is a non-UI util that already reads the collection from a
// module-scoped connection. Don't subscribe in the component at all.
function ReportsSplitNavigator() {
    const [initialReportID] = useState(() => {
        const initialReport = findLastAccessedReport(ignoreDomainRooms, isOpenOnAdminRoom);
        return initialReport?.reportID ?? '';
    });
}

// GOOD: an optional injected param keeps the util testable while production
// callers omit it. Tests pass data explicitly; production pulls from module scope.
function findLastAccessedReport(
    ignoreDomainRooms: boolean,
    openOnAdminRoom = false,
    excludeReportID?: string,
    reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>,
): OnyxEntry<Report> {
    const collection = reportNameValuePairs ?? allReportNameValuePair; // module-scoped fallback
    // ...
}

// GOOD: derivation pushed inside the branch that needs it
function OnboardingPage() {
    const onContinue = useCallback(() => {
        const archived = computeArchivedState(); // runs only on press
        navigateAfterOnboarding(isSmallScreenWidth, canUseDefaultRooms, conciergeReportID, archived);
    }, [isSmallScreenWidth, canUseDefaultRooms, conciergeReportID]);
}
```

---

### Review Metadata

Flag when ALL of these are true:

- A value is produced at component scope via a non-trivial source: a `useOnyx` subscription to a `COLLECTION.*` key, a `useMemo`/inline iteration over a collection, or an allocation (`new Set`/`new Map`/`Object.fromEntries`) over a collection.
- That value's **only** use is being passed as an argument (or sitting in the dep array of a callback that passes it).
- The consumer runs conditionally or lazily, not on every render - i.e. the value is referenced only inside one of:
  - a `useCallback` / event handler
  - a `useFocusEffect`
  - a `useEffect` that runs on an uncommon path (e.g. guarded branch, one-time setup, infrequent trigger)
  - a `useState(() => ...)` lazy initializer
- AND at least one of:
  - the callee is a non-UI util that can source the data itself (module-scoped connection, `connectWithoutView`, or an already-present optional-param-with-fallback), OR
  - the callee uses the value only behind an internal condition that frequently short-circuits before reaching it.

**DO NOT flag if:**

- The produced value is also read during render (e.g. rendered to the UI, or feeds another value used in render) - it's needed eagerly regardless.
- The source is cheap (a primitive, a single-item key, a small static object) - eager computation is fine and more readable.
- The callee is a pure function with no other way to obtain the data and runs on the common path - explicit injection is correct here.
- The value is consumed by a `useEffect` on the common path where the effect legitimately runs whenever its deps change.
- The value is a stable reference that genuinely belongs in a dep array for correctness (not merely to be forwarded).

**Search Patterns** (hints for reviewers):
- `useOnyx\(ONYXKEYS\.COLLECTION\.`
- `useState\(\(\) =>`
- `useFocusEffect`
- `useCallback`
- `new Set\(`
- `new Map\(`
- `Object\.fromEntries`
