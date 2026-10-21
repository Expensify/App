---
ruleId: PERF-3
title: List rows read their own Onyx data by member key
---

## [PERF-3] List rows read their own Onyx data by member key

### Reasoning

Onyx notifies subscribers per key. A write to a collection member notifies that member's subscribers and the collection's subscribers. This gives two rules for list rows:

1. **A row subscribes to single members, not whole collections.** A row that subscribes to a whole collection re-renders on a write to any member, so one write re-renders every visible row. A row that subscribes to its own member key re-renders only when its own data changes.
2. **The row reads its data, not the list.** If the list reads collections and passes members to rows as props, or puts collections in FlashList `extraData`, then every write to those collections re-renders the list and every row. If each row reads its own data, the list does not re-render, and only the affected row does.

### Incorrect

```tsx
// BAD (rule 1): every row subscribes to the whole report collection to get its own report.
function ReportRow({reportID}: ReportRowProps) {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    // ...
}
```

```tsx
// BAD (rule 2): the list reads collections for its rows and passes them down.
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
// GOOD: the list passes only the ID, and the row reads its own members by key.
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
// Small key that every row needs and that is rarely written. Reading it whole is fine.
const session = useSession();
const cardList = useCardList();
```

---

### Review Metadata

**Flag (rule 1) when ALL of these are true:**

- The code is a list row component, or code that `renderItem` calls.
- The row subscribes to a whole collection (`ONYXKEYS.COLLECTION.*` without a member ID), or to another key that holds data for every record, such as `PERSONAL_DETAILS_LIST` or `REPORT_ATTRIBUTES`.
- The row uses only a few members of it, and their IDs come from the row's props or its own data.

**Flag (rule 2) when ALL of these are true:**

- A list component reads a collection and passes its members or the whole collection to rows as props, or puts it in `extraData`.
- The row could read those members itself by key.

**DO NOT flag if:**

- The row subscribes to a member key (`${ONYXKEYS.COLLECTION.X}${id}`), or uses a selector that returns only its own data.
- The key is small, shared by all rows and rarely written (`SESSION`, `BETAS`, `CARD_LIST`).
- The row or list needs the whole collection, for example to sort, filter or search across all members.
- The code is not part of a list.

**Related:** [PERF-11](perf-11-optimize-data-selection.md) for selector cost, [PERF-19](perf-19-scalar-collection-selectors.md) for collection selectors that should return scalars.

**Search Patterns** (hints for reviewers):
- `renderItem`
- `useOnyx\(ONYXKEYS\.COLLECTION\.[A-Z_]+\)`
- `usePersonalDetails\(\)`
- `useAllPersonalDetails`
- `extraData`
