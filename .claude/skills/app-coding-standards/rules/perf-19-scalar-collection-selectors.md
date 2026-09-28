---
ruleId: PERF-19
title: Collection selectors return only what the consumer uses
---

## [PERF-19] Collection selectors return only what the consumer uses

### Reasoning

`useOnyx` runs `deepEqual` on a selector's output whenever the input reference changes. For a collection key such as `policy_`, `report_` or `transaction_`, that reference changes on **every write to any member of the collection**, so the compare runs constantly and its cost scales with the size of whatever the selector returns.

A selector that returns an array or map of records when the consumer only reads an ID and a `length > 1` check pays that compare for nothing. On a large account the collection can hold thousands of records, so a single compare costs tens of milliseconds and a render cycle that triggers several of them costs hundreds. Returning the scalars removes the compare entirely.

When the component also needs one full record, subscribe to that single member key separately. A single-key subscription without a selector compares by reference, so the extra subscription costs nothing.

This is a narrower case than [PERF-11](perf-11-optimize-data-selection.md), which covers selector sizing in general. PERF-19 applies only when the fix is provable from the code you can see: nothing the component keeps from the selector output is an object, and every function needed to produce the scalars is already reachable from the selector. If either is untrue, this rule does not apply.

### Incorrect

```tsx
// BAD: the selector returns every matching report, so useOnyx deep-compares all of them
// on each report_ update. The component only asks whether there are any.
const [reportsWithErrors] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
    selector: (reports) => Object.values(reports ?? {}).filter((report) => !!report?.errors),
});
const hasErrors = reportsWithErrors.length > 0;
```

```tsx
// BAD: the array is passed whole into a util, but the component only keeps an ID off the result,
// and the other usage is a length check. Nothing derived from the array escapes as an object,
// so the whole chain can move into the selector.
const [activeReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
    selector: (reports) => getActiveReports(reports),
});
const defaultReportID = pickDefaultReport(activeReports, activeWorkspaceID)?.reportID;
const hasMultipleActiveReports = activeReports.length > 1;
```

### Correct

```tsx
// GOOD: the selector returns the boolean, so there is nothing expensive left to compare.
const [hasErrors] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
    selector: (reports) => Object.values(reports ?? {}).some((report) => !!report?.errors),
});
```

```tsx
// GOOD: the whole chain moved into the selector, which now returns two scalars.
const [reportSelection] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
    selector: (reports) => {
        const activeReports = getActiveReports(reports);
        return {
            defaultReportID: pickDefaultReport(activeReports, activeWorkspaceID)?.reportID,
            hasMultipleActiveReports: activeReports.length > 1,
        };
    },
});

// The one record the component renders comes from a single-member subscription, which compares by reference.
const [defaultReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportSelection?.defaultReportID)}`);
```

### Not a violation

```tsx
// The report objects are rendered, so they have to escape the selector. Nothing to reduce.
const [activeReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: getActiveReports});

return <SelectionList sections={[{data: activeReports.map(toListItem)}]} />;
```

```tsx
// Single-item key, not a collection. Picking a few fields here is already the right shape.
const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`, {
    selector: (user) => ({name: user?.name, avatar: user?.avatar}),
});
```

---

### Review Metadata

**Flag when ALL of these are true:**

- The `useOnyx` call subscribes to a collection key (`ONYXKEYS.COLLECTION.*`, or a derived key whose value is a collection) **and** passes a `selector`. The selector may be inline or imported from `src/selectors/*`. If it is imported, read its definition before judging its return shape.
- The selector returns an object graph: an array of Onyx records, a keyed object of records, or an object with nested records. A scalar or a flat record of primitives is already correct.
- **Nothing derived from the selector output escapes as an object or array.** For every usage site of the output, follow it through intermediate calls to what the component finally keeps, and flag only if all of them end in a scalar. Include aliases and re-destructuring.
    - Escapes: the branch ends in JSX, a prop, `useState`, a context value, a ref, or the return value of an exported hook in the file.
    - Does not escape: the output is passed whole into a util and the component only reads a scalar off that util's result, because the whole chain can move into the selector.
- **Every function needed to compute the scalars is already reachable from the selector**: defined in the file, imported into it, or exported from a module the file already imports. Moving the chain into the selector must not require new branching, a new data source, or an Onyx value the selector does not already receive. A named wrapper that only calls those reachable functions and returns their scalar results counts as reachable; logic those functions do not already provide does not.

Increase confidence (not required):

- The collection is a hot one (`policy_`, `report_`, `transaction_`, `transaction_draft_`), so the compare runs on a high-frequency write path.
- The selector output feeds a `useMemo`/`useCallback` dependency array only through a scalar (`x.length`, `x?.id`), which makes the reduction mechanical.

**DO NOT flag if:**

- Any branch of the data flow ends with the objects themselves: rendered in a list, passed as a prop, stored in state, or returned from an exported hook.
- The chain cannot be traced. If the output goes into a callee whose body is not in the diff, search the callee; if what it yields still cannot be confirmed, do not flag.
- The key is a single-item key rather than a collection. Picking a few fields from one record is already the correct pattern.
- Computing the scalars needs logic that does not exist yet, a value the selector has no access to, or a new Onyx subscription to feed the selector itself.
- The selector already returns scalars and the object graph comes from a separate single-member subscription.

**Overlap with PERF-11:** PERF-19 is the narrower case. When both match the same line, report PERF-19 only.

**Search Patterns** (hints for reviewers):
- `useOnyx\(ONYXKEYS\.COLLECTION`
- `selector: \(`
- `selector: [a-z][A-Za-z]*Selector`
- `Object\.(values|entries|keys)\(.*\)\.(filter|map)`
- `OnyxCollection<`
