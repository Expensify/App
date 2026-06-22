---
ruleId: PERF-17
title: Don't compute expensive args eagerly for conditionally-used callees
---

## [PERF-17] Don't compute expensive args eagerly for conditionally-used callees

### Reasoning

An expensive value derived at render (a `useOnyx` `COLLECTION.*` subscription, a collection iteration, a `new Set`/`new Map`/`Object.fromEntries`) is paid every render. If its only use is being passed to a callee that runs lazily (handler, `useFocusEffect`, lazy `useState` initializer), the cost is paid always but the benefit rarely. With Onyx collections it also re-renders the component on every collection mutation. Fix order: (1) pull the data inside the non-UI callee via its module-scoped/`connectWithoutView` access instead of passing it; (2) move the derivation behind the condition; (3) pass a thunk; (4) if a UI subscription is needed, narrow it with a selector ([PERF-11]).

### Incorrect

```tsx
// Subscribes to the whole ~100k collection every render to feed a fn that runs once at mount.
const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
const [initialReportID] = useState(() => findLastAccessedReport(ignoreDomainRooms, isOpenOnAdminRoom, undefined, reportNameValuePairs)?.reportID ?? '');
```

### Correct

```tsx
// Non-UI util reads the collection from its module-scoped fallback; no component subscription.
const [initialReportID] = useState(() => findLastAccessedReport(ignoreDomainRooms, isOpenOnAdminRoom)?.reportID ?? '');
```

---

### Review Metadata

Flag when ALL hold:

- An expensive value is produced at component scope: `useOnyx` on a `COLLECTION.*` key, a collection iteration, or a `new Set`/`new Map`/`Object.fromEntries` over a collection.
- Its only use is being passed as an argument (or sitting in a callback's dep array to be forwarded).
- The consumer runs lazily, not every render: a `useCallback`/event handler, `useFocusEffect`, an uncommon-path `useEffect` (guarded branch, one-time/`[]` setup, infrequent trigger), or a `useState(() => ...)` initializer.
- AND either: the callee can source the data itself (module-scoped/`connectWithoutView`/optional-param-with-fallback), OR it uses the value only behind a condition that usually short-circuits.

DO NOT flag when:

- The value is also read during render (needed eagerly regardless).
- The source is cheap (primitive, single-item key, small static object).
- The callee is pure, runs on the common path, and has no other way to get the data.
- A common-path `useEffect` legitimately consumes it whenever deps change.

Search hints: `useOnyx\(ONYXKEYS\.COLLECTION\.`, `useState\(\(\) =>`, `useFocusEffect`, `useEffect`, `useCallback`, `new Set\(`, `new Map\(`, `Object\.fromEntries`
