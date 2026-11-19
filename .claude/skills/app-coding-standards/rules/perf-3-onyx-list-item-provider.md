---
ruleId: PERF-3
title: Use OnyxListItemProvider hooks for shared data in list rows
---

## [PERF-3] Use OnyxListItemProvider hooks for shared data in list rows

### Reasoning

Some data is not the row's own item but is the same for every row, such as the session, betas or the card list. `OnyxListItemProvider` reads each of these keys once above the list and shares it with every row through context, so each row does not need its own subscription.

A provider hook returns the whole value, and every write to that key re-renders every row that uses it. That is fine for small, rarely written keys that the row needs whole. When the row needs only a few records of a large shared key, such as the people it shows, it reads only those records.

### Incorrect

```tsx
// BAD: each row subscribes to the session separately.
const [session] = useOnyx(ONYXKEYS.SESSION);
```

```tsx
// BAD: the row shows two people but reads the whole personal details list,
// so a write to any person re-renders every row.
const personalDetails = usePersonalDetails();
```

### Correct

```tsx
// GOOD: shared data that the row needs whole comes from the provider.
const session = useSession();
```

```tsx
// GOOD: the row reads only the people it shows.
const [personalDetails] = usePersonalDetailsByIDs([report?.ownerAccountID, report?.managerID]);
```

---

### Review Metadata

**Flag when ALL of these are true:**

- The code is a list row component, or code that `renderItem` calls.
- It reads data that is the same for every row, not the row's own item, and either:
    - calls `useOnyx` on a key that has a hook in `OnyxListItemProvider`, or
    - reads the whole personal details list (`usePersonalDetails`, `useAllPersonalDetails`) but uses only a few people whose IDs it knows.

**DO NOT flag if:**

- The code is not part of a list row.
- No `OnyxListItemProvider` hook exists for the key.
- The row needs the whole personal details list, for example to search across all people.
- The data is the row's own item. See [PERF-21](perf-21-rows-read-own-data.md) and [PERF-22](perf-22-row-single-member-subscriptions.md).

**Search Patterns** (hints for reviewers):
- `useOnyx`
- `renderItem`
- `usePersonalDetails\(\)`
- `useAllPersonalDetails`
