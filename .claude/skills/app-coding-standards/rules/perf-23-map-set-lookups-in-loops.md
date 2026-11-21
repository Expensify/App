---
ruleId: PERF-23
title: Build a Map/Set for lookups inside loops
---

## [PERF-23] Build a Map/Set for lookups inside loops

### Reasoning

A linear scan (`.find`, `.some`, `.includes`, `.indexOf`, `.findIndex`, `.filter`) inside a callback or loop over another collection costs O(n × m). On a small test account both lists are short and the code looks fast, but workspaces with thousands of members, tags, categories, cards or expenses freeze the UI when it runs on render, on a tap or on a keystroke. Building a `Map` or `Set` once, before the loop, makes each lookup O(1) and the whole pass O(n + m).

[PERF-13](perf-13-hoist-iterator-calls.md) does not catch this, because the inner scan uses the iterator.

### Incorrect

```ts
// BAD: selectedMembers is scanned once per member
const options = members.map((member) => ({
    ...member,
    isSelected: selectedMembers.some((selected) => selected.accountID === member.accountID),
}));
```

```ts
// BAD: getIOUActionForTransactionID scans every report action for each transaction
const actions = transactions.map((transaction) => getIOUActionForTransactionID(reportActions, transaction.transactionID));
```

```ts
// BAD: includes runs once per transaction
const selected = Object.values(transactions).filter((transaction) => selectedReportIDs.includes(transaction.reportID));
```

### Correct

```ts
// GOOD: build the Set once, look it up per member
const selectedAccountIDs = new Set(selectedMembers.map((selected) => selected.accountID));
const options = members.map((member) => ({...member, isSelected: selectedAccountIDs.has(member.accountID)}));
```

```ts
// GOOD: one index of IOU actions by transaction ID
const iouActionsByTransactionID = getIOUActionsByTransactionID(reportActions);
const actions = transactions.map((transaction) => iouActionsByTransactionID.get(transaction.transactionID));
```

### Keeping behavior unchanged

- `.find` returns the first match, so keep the first entry when building a Map: `if (!map.has(key)) map.set(key, value)`. For `.findLast`, keep the last one.
- If the old comparison normalized values (`normalizeLogin`, `toLowerCase`, decoded names), normalize once when building the Set and once per lookup. Never compare raw values to normalized ones.
- Build the Set from the same source the old code read, including pending and optimistic entries.
- In components and hooks, don't wrap the Set in `useMemo`: React Compiler already memoizes it.

---

### Review Metadata

Flag when ALL of these are true:

- A linear lookup runs inside a callback or loop over another collection (`.map`, `.filter`, `.forEach`, `.reduce`, `.some`, `.every`, `.find`, `.flatMap`, `for...of`, `for`, `while`, a `renderItem`, or a per-row/per-option callback such as `isSelected`).
- The lookup is one of:
  - `.find`, `.findLast`, `.some`, `.every`, `.includes`, `.indexOf`, `.findIndex`, `.filter` on an array that does not change during the loop
  - a helper that scans a collection, such as `getIOUActionForTransactionID`, `getIOUActionForReportID`, `getPolicyExpenseChat`, `getChatByParticipants`, `isPolicyApprover`, `isApproverOfOutstandingPolicyReports`, `getChildTransactions`
- Neither collection is bounded by a small constant.

**DO NOT flag if:**

- One of the collections is always a handful of items, such as a `CONST` list, filter values or a fixed set of options.
- The lookup is already a `Map`, `Set` or object key lookup.
- The loop exits after the first iteration, or runs once outside of any loop.
- The inner array changes inside the loop, so an index would have to be rebuilt on every iteration anyway.

**Fix:** build the `Map` or `Set` once, before the loop, from the same source and with the same normalization the old code used. If the same index is built in many places, use a shared helper such as `getIOUActionsByTransactionID` in `ReportActionsUtils`.

**Related:** [PERF-13](perf-13-hoist-iterator-calls.md) for calls that don't depend on the iterator, [PERF-11](perf-11-optimize-data-selection.md) for selector cost.

**Search Patterns** (hints for reviewers):
- `\.(map|filter|forEach|some|every|reduce|flatMap)\([^)]*=>[^;]*\.(includes|some|find|indexOf|findIndex)\(`
- `isSelected:\s*\w+\.(some|includes|find)\(`
- `getIOUActionFor(TransactionID|ReportID)\(`
- `getPolicyExpenseChat\(`
- `getChatByParticipants\(`
- `isPolicyApprover\(`
