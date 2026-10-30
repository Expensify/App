---
ruleId: PERF-22
title: List rows subscribe to single collection members
---

## [PERF-22] List rows subscribe to single collection members

### Reasoning

Onyx notifies subscribers per key. A write to a collection member notifies that member's subscribers and the collection's subscribers. A row that subscribes to a whole collection re-renders on a write to any member, so one write re-renders every visible row. A row that subscribes to its own member key re-renders only when its own data changes.

### Incorrect

```tsx
// BAD: every row subscribes to the whole report collection to get its own report.
function ReportRow({reportID}: ReportRowProps) {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    // ...
}
```

### Correct

```tsx
// GOOD: the row subscribes only to its own members.
function ReportRow({reportID}: ReportRowProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    // ...
}
```

---

### Review Metadata

**Flag when ALL of these are true:**

- The code is a list row component, or code that `renderItem` calls.
- The row subscribes to a whole collection (`ONYXKEYS.COLLECTION.*` without a member ID), or to a derived map with an entry per record, such as `REPORT_ATTRIBUTES`.
- The row uses only a few members of it, and their IDs come from the row's props or its own data.

**DO NOT flag if:**

- The row subscribes to a member key (`${ONYXKEYS.COLLECTION.X}${id}`), or uses a selector that returns only its own data.
- The row needs the whole collection, for example to search across all members.
- The code is not part of a list row.

**Related:** [PERF-3](perf-3-onyx-list-item-provider.md) for shared data such as personal details, [PERF-21](perf-21-rows-read-own-data.md) when the list reads the data for its rows, [PERF-11](perf-11-optimize-data-selection.md) for selector cost.

**Search Patterns** (hints for reviewers):
- `renderItem`
- `useOnyx\(ONYXKEYS\.COLLECTION\.[A-Z_]+\)`
