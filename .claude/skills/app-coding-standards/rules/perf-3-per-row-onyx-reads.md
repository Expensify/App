---
ruleId: PERF-3
title: Read per-row Onyx data by key in list items
---

## [PERF-3] Read per-row Onyx data by key in list items

### Reasoning

A list row re-renders when any value it reads changes. If a row reads a whole collection, the whole `PERSONAL_DETAILS_LIST`, or a derived map, then a write to any member re-renders every visible row, even rows whose data did not change. A row that reads only its own member key, or a selector that returns a primitive, re-renders only when its own data changes.

Since Onyx 3.0.117, subscriptions live in one store keyed by Onyx key. A write to a member notifies only that member's subscribers and the collection's subscribers, so one keyed subscription per row is cheap and wakes only for that row. `useOnyx` without a selector now compares by reference, so a write that rebuilds a value with the same contents still notifies. `OnyxListItemProvider` hooks are built on `useOnyx` without a selector, so a provider over a large or often-rebuilt key re-renders every row that consumes it.

The list can cause the same problem. If it reads collections and passes them to rows as props, or puts them in FlashList `extraData`, then every write to those collections re-renders every row.

### Incorrect

```tsx
// BAD: every row subscribes to every report and every person.
function ReportRow({reportID}: ReportRowProps) {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const personalDetails = usePersonalDetails();
    const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    // ...
}
```

```tsx
// BAD: the list reads collections for its rows, and extraData re-renders all rows on any write.
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
// GOOD: the row reads its own member keys and only the people it shows.
function ReportRow({reportID}: ReportRowProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [personalDetails] = usePersonalDetailsByIDs([report?.ownerAccountID, report?.managerID]);
    // ...
}
```

```tsx
// GOOD: when the row needs only one field, a primitive selector skips writes to the other fields.
const [chatReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: (report) => report?.chatReportID});
```

### Not a violation

```tsx
// Small key that every row needs and that is rarely written. A provider hook is fine here.
const session = useSession();
const cardList = useCardList();
```

---

### Review Metadata

**Flag when ALL of these are true:**

- The code is a list row component, or code that `renderItem` calls.
- The row reads a collection key (`ONYXKEYS.COLLECTION.*`) without a member ID, `PERSONAL_DETAILS_LIST` in full (`usePersonalDetails`, `useAllPersonalDetails`), or a derived map such as `REPORT_ATTRIBUTES`, and the selector does not narrow it to this row's data.
- The row uses only a few members of that value, and their IDs come from the row's props or its own data.

**Also flag** a list component that reads a collection only to pass members or the whole collection to rows, or puts it in `extraData`, when the row could read those members by key.

**DO NOT flag if:**

- The row reads a member key (`${ONYXKEYS.COLLECTION.X}${id}`), or uses a selector that returns a primitive or this row's members only.
- The key is small, shared by all rows and rarely written (`SESSION`, `BETAS`, `CARD_LIST`), whether read through a provider hook or `useOnyx`.
- The row needs the whole value, for example to search across all members.
- The code is not part of a list row.

**Related:** [PERF-11](perf-11-optimize-data-selection.md) for selector cost, [PERF-19](perf-19-scalar-collection-selectors.md) for collection selectors that should return scalars.

**Search Patterns** (hints for reviewers):
- `renderItem`
- `useOnyx\(ONYXKEYS\.COLLECTION\.[A-Z_]+\)`
- `usePersonalDetails\(\)`
- `useAllPersonalDetails`
- `extraData`
