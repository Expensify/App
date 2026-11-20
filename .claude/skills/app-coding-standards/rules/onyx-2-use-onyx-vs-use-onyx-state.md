---
ruleId: ONYX-2
title: useOnyx for single-key reads, useOnyxState for small results derived from multiple keys
---

## [ONYX-2] useOnyx for single-key reads, useOnyxState for small results derived from multiple keys

### Reasoning

`useOnyx` subscribes to one key. `useOnyxState` runs one selector over the store, subscribes to the keys it read through `state`, and re-renders only when the output changes. So a single-key read (A) belongs on `useOnyx`, several `useOnyx` calls reduced to one small value (B) belong in one `useOnyxState`, a `useOnyxState` selector should not return records (C), must not read Onyx outside `state` (D), and should not scan a collection root when it can build member keys (E). See [Choosing between `useOnyx` and `useOnyxState`](../../../../contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md#choosing-between-useonyx-and-useonyxstate).

### Incorrect

```tsx
// BAD (A): the selector reads one key. useOnyx with a selector does the same.
const policyName = useOnyxState((state) => state[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.name);
```

```tsx
import {isPolicyAdmin} from '@libs/ReportUtils';

// BAD (B): two whole records subscribed only to compute one boolean.
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
const isReportPolicyAdmin = isPolicyAdmin(policy);

return <AdminBadge isVisible={isReportPolicyAdmin} />;
```

```tsx
// BAD (C): returns both records, so any field change re-renders, though only two names are shown.
const {report, policy} = useOnyxState((state) => {
    const report = state[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    return {report, policy: state[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`]};
});

return <Text>{`${report?.reportName} · ${policy?.name}`}</Text>;
```

```tsx
// BAD (D): the helper reads the policy from a module-level Onyx connection, so the
// selector never subscribes to it and the result goes stale when the policy changes.
// isAllowedToComment from @libs/ReportUtils reads allPolicies.
const canComment = useOnyxState((state) => isAllowedToComment(state[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]));
```

```tsx
// BAD (E): scans every transaction to find the ones on one report, and re-runs on every transaction write.
const hasPendingExpense = useOnyxState((state) =>
    Object.values(state[ONYXKEYS.COLLECTION.TRANSACTION] ?? {}).some((transaction) => transaction?.reportID === reportID && isPending(transaction)),
);
```

### Correct

```tsx
// GOOD (A): single key, single useOnyx.
const [policyName] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: (policy) => policy?.name});
```

```tsx
import {isPolicyAdmin} from '@libs/ReportUtils';

// GOOD (B): one selector reads both keys and re-renders only when the boolean flips.
const isReportPolicyAdmin = useOnyxState((state) => {
    const report = state[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    return isPolicyAdmin(state[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`]);
});
```

```tsx
// GOOD (C): returns only the two strings the component shows.
const {reportName, policyName} = useOnyxState((state) => {
    const report = state[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    return {reportName: report?.reportName, policyName: state[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`]?.name};
});
```

```tsx
// GOOD (E): builds member keys from IDs it already has, so it subscribes to those transactions only.
const hasPendingExpense = useOnyxState((state) => transactionIDs.some((transactionID) => isPending(state[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`])));
```

### Not a violation

```tsx
// The report itself is rendered, so it has to stay on useOnyx.
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);

return <ReportHeader report={report} policy={policy} />;
```

```tsx
// The loading status decides what renders, and useOnyxState has none.
const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
if (isLoadingOnyxValue(reportResult)) {
    return <FullScreenLoadingIndicator />;
}
```

```tsx
// Each useOnyx already narrows to a scalar, so neither re-renders on unrelated fields.
const [reportName] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: (report) => report?.reportName});
const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});
```

---

### Review Metadata

Terms used below:

- **Small value:** a primitive, an ID, an array of IDs or primitives, or a flat object whose fields are all primitives.
- **Record:** an Onyx value with fields of its own, such as a report, policy or transaction, or an array or keyed object of them.

**Flag A when ALL of these are true:**

- The diff adds or changes a `useOnyxState` call.
- Every code path of its selector reads the same single key from `state`. A collection root (`state[ONYXKEYS.COLLECTION.X]`) counts as one key. `state[a] ?? state[b]` is two keys.
- If the selector is imported, read its definition. Count reads made inside helpers the selector passes `state` to.

**Flag B when ALL of these are true:**

- The diff adds or changes at least one of two or more `useOnyx` calls in the same component or hook.
- At least one of them has no `selector`, or has a selector that returns a record.
- The values those calls return reach the rest of the component only through a small value. Follow each value, and every object or array built from it, through intermediate calls, aliases and destructuring. Do not flag if a record, or an object or array built from one, reaches JSX, a prop, `useState`, a context value, a ref, a hook argument, an event handler, or the return value of the hook. The small value itself may go anywhere.
- The selector may close over props, state, `translate` or any other render value, so needing them is no reason to skip.
- None of the calls' loading status (the second tuple element, `isLoadingOnyxValue`, `status`) is used.

**Flag C when ALL of these are true:**

- The diff adds or changes a `useOnyxState` call.
- Its selector returns a record or an object holding one.
- The component uses only small values from that output, or passes the records to children that could read them by ID.

**Flag D when ALL of these are true:**

- The diff adds or changes a `useOnyxState` call.
- Its selector calls a helper that reads Onyx other than through `state`: a module-level variable filled by `Onyx.connectWithoutView` or `Onyx.connect` (`allPolicies`, `allReports`, `deprecatedReportsTransactions`), or `Onyx.get`. Open the helper and the helpers it calls to check.

**Flag E when ALL of these are true:**

- The diff adds or changes a `useOnyxState` call.
- Its selector reads a collection root and filters or searches it for members.
- The IDs of the members it needs are already available: from props, from another value in the selector, or from a field of a record the selector read.

Increase confidence (not required):

- B: one key is built from a field of another `useOnyx` value, such as `report?.policyID` or `transaction?.reportID`.
- B, C or E: the collection is a hot one (`report_`, `transactions_`, `policy_`, `reportActions_`).

**DO NOT flag if:**

- The code is under `tests/`.
- A: the selector reads `previousState`, which `useOnyx` has no equivalent for.
- B: every `useOnyx` call already narrows to a small value with its selector.
- C: the records must reach the component whole and no child can read them by ID.
- E: the selector needs the whole collection, for example to count or search all members.

**Related:** [PERF-11](perf-11-optimize-data-selection.md) and [PERF-19](perf-19-scalar-collection-selectors.md) cover a selector on one `useOnyx` call. When a `useOnyx` selector would need a second key to reduce its output, that is case B here. [PERF-22](perf-22-row-single-member-subscriptions.md) and [PERF-3](perf-3-onyx-list-item-provider.md) also apply to `useOnyxState` in list rows.

**Search Patterns** (hints for reviewers):
- `useOnyxState\(`
- `state\[ONYXKEYS\.`
- `state\[\`\$\{ONYXKEYS\.COLLECTION\.`
- `useOnyx\(\`\$\{ONYXKEYS\.COLLECTION\.[A-Z_]+\}\$\{[a-z][A-Za-z]*\?\.`
