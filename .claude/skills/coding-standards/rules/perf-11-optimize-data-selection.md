---
ruleId: PERF-11
title: Optimize data selection and handling
---

## [PERF-11] Optimize data selection and handling

### Reasoning

`useOnyx` supports an optional `selector` to narrow data before it reaches the component. Selectors control both **what** data the component receives and **how** Onyx detects changes:

- **With a selector**: Onyx runs `deepEqual` on the selector output to decide whether to re-render. This guards against unnecessary re-renders when unrelated data changes, but the comparison cost scales with the size of the output.
- **Without a selector**: Onyx uses `shallowEqual` on raw references, which is much cheaper. However, the component will re-render whenever **any** part of the subscribed data changes, since there is no narrowing to filter out irrelevant updates.

This means selectors are a double-edged sword. A well-written selector that returns a primitive or a small object is highly effective — it skips re-renders when unrelated data changes, and `deepEqual` on a small value is trivial. But a poorly-written selector that returns a large object, a full collection, or a non-plain type like `Set`/`Map` makes things worse — it forces an expensive `deepEqual` on every Onyx update with no re-render savings.

**When to use a selector:**
- To pick a few fields from a single Onyx key (reduces re-renders from unrelated field changes)
- To compute a final scalar (boolean, number, string) from a larger dataset

**When NOT to use a selector:**
- To transform or reshape data without reducing its size — subscribe without a selector and transform inline instead
- To extract a large sub-property (e.g., `(data) => data?.reports`) — just access it directly after the hook
- To filter/map entire collections into arrays — the output is still large, `deepEqual` still expensive
- To return `Set` or `Map` — `deepEqual` is extremely slow on these types

### Incorrect

```tsx
// BAD: No selector — component re-renders when any user field changes, even unused ones
function UserProfile({userId}) {
    const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`);
    return <Text>{user?.name}</Text>;
}

// BAD: Selector maps an entire collection — deepEqual must compare every item
const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
    selector: (policies) =>
        Object.fromEntries(
            Object.entries(policies ?? {}).map(([key, policy]) => [
                key,
                {id: policy?.id, name: policy?.name, type: policy?.type},
            ]),
        ),
});

// BAD: Selector extracts a large sub-property without narrowing
const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
    selector: (data) => data?.reports,
});

// BAD: Selector filters/maps a collection into an array — deepEqual on every item
const [archivedReportIdsArray] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
    selector: (data): string[] =>
        Object.entries(data ?? {})
            .filter(([, value]) => value?.isArchived)
            .map(([key]) => key),
});

// BAD: Selector returns a Set — deepEqual is extremely slow on Sets
const [archivedReportIds] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
    selector: (data): Set<string> => {
        const ids = new Set<string>();
        Object.entries(data ?? {}).forEach(([key, value]) => {
            if (value?.isArchived) {
                ids.add(key);
            }
        });
        return ids;
    },
});

// BAD: Selector returns an array when the component only needs a boolean
const [reportSummaries] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
    selector: (reports) =>
        Object.values(reports ?? {}).filter((r) => r?.total === 0),
});
const hasEmptyReports = reportSummaries.length > 0;
```

### Correct

```tsx
// GOOD: Selector picks only the fields the component needs from a single item
function UserProfile({userId}) {
    const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`, {
        selector: (user) => ({
            name: user?.name,
            avatar: user?.avatar,
        }),
    });
    return <Text>{user?.name}</Text>;
}

// GOOD: No selector on collection — shallowEqual is cheap, transform inline
const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
const mappedPolicies = Object.fromEntries(
    Object.entries(policies ?? {}).map(([key, policy]) => [
        key,
        {id: policy?.id, name: policy?.name, type: policy?.type},
    ]),
);

// GOOD: No selector — access the property directly
const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
const reports = reportAttributes?.reports;

// GOOD: No selector — filter and compute Set inline
const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
const archivedReportIds = new Set(
    Object.entries(reportNameValuePairs ?? {})
        .filter(([, value]) => value?.isArchived)
        .map(([key]) => key),
);

// GOOD: Selector computes the final boolean directly
const [hasEmptyReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
    selector: (reports) =>
        Object.values(reports ?? {}).some((r) => r?.total === 0),
});
```

---

### Review Metadata

Flag ONLY when ANY of these are true:

- A component uses `useOnyx` and either:
  - Subscribes to a broad data structure without selecting specific fields, causing re-renders when unrelated fields change
  - Uses a `selector` whose output is still large or complex (e.g., full collection, large mapped/transformed result, `Set`, `Map`), or returns an intermediate data structure that is further reduced by the component
- A selector on a collection references other large external datasets (e.g., another Onyx collection passed via closure) and iterates over them on every change to the subscribed collection, compounding the computation cost on unrelated updates

**DO NOT flag if:**

- The selector returns a primitive value (`boolean`, `string`, `number`, `undefined`)
- The selector returns a small object with only a few fields picked from a single item (not a collection)
- The selector meaningfully reduces a large dataset to a small result (e.g., a primitive or a few items) by iterating over the subscribed collection itself — the `deepEqual` cost on a small result is negligible
- The `useOnyx` call is on a single-item key (not a collection), and the selector picks specific fields
- The data structure is static or the function requires the entire object for valid operations

**Search Patterns** (hints for reviewers):
- `useOnyx`
- `selector`
- `useOnyx.*selector`
- `selector.*=>`
- `new Set\(`
- `new Map\(`
- `Object\.fromEntries`
- `Object\.entries.*\.map`
- `Object\.values.*\.filter`
