---
ruleId: PERF-21
title: List rows read their own Onyx data
---

## [PERF-21] List rows read their own Onyx data

### Reasoning

If a list reads collections and passes members to its rows as props, or puts collections in FlashList `extraData`, then every write to those collections re-renders the list and every row, even rows whose data did not change. If the list passes only IDs and each row reads its own data, a write re-renders only the row that shows it, and the list does not re-render.

### Incorrect

```tsx
// BAD: the list reads collections for its rows and passes them down.
const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

<FlashList
    data={reportIDs}
    extraData={[reports, policies]}
    renderItem={({item}) => (
        <ReportRow
            report={reports?.[`${ONYXKEYS.COLLECTION.REPORT}${item}`]}
            policies={policies}
        />
    )}
/>;
```

### Correct

```tsx
// GOOD: the list passes only the ID, and the row reads its own data.
<FlashList
    data={reportIDs}
    renderItem={({item}) => <ReportRow reportID={item} />}
/>;

function ReportRow({reportID}: ReportRowProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    // ...
}
```

### Not a violation

```tsx
// The list needs the whole collection to sort and filter, and passes only IDs to rows.
const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
const reportIDs = getSortedReportIDs(reports);

<FlashList
    data={reportIDs}
    renderItem={({item}) => <ReportRow reportID={item} />}
/>;
```

---

### Review Metadata

**Flag when ALL of these are true:**

- A list component reads an Onyx collection, or another key that holds data for every record.
- It passes members or the whole value to rows as props, or puts it in `extraData`.
- The row could read that data itself by key, from an ID it already receives.

**DO NOT flag if:**

- The list uses the collection only for its own work, such as sorting or filtering, and passes rows only IDs.
- The value is shared data that every row needs, not the row's own item. See [PERF-3](perf-3-onyx-list-item-provider.md).
- The list is not virtualized and renders only a few fixed items.

**Related:** [PERF-22](perf-22-row-single-member-subscriptions.md) for what the row itself subscribes to.

**Search Patterns** (hints for reviewers):
- `extraData`
- `renderItem`
- `useOnyx\(ONYXKEYS\.COLLECTION\.[A-Z_]+\)`
