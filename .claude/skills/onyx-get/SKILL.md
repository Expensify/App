---
name: onyx-get
description: Onyx.get() reads the Onyx cache synchronously and never subscribes. Use when writing or reviewing an Onyx read outside render, when a component or hook gains a call into a library function, or when converting a function off forwarded Onyx parameters or module-level caches.
---

## What `Onyx.get()` is for

`Onyx.get(key)` returns what is in the cache right now and never subscribes, so a value read during render is frozen at that render and `useOnyx` stays required for anything a component displays. A collection key returns every member, exactly as `useOnyx` does.

Use it in code that runs on an event: action creators, libraries, network handlers, and callbacks such as `useCallback`, `useEffect` and event handlers.

Before reaching for either, prefer a pure function that receives the data as parameters. `Onyx.get()` is the answer when threading the value through every caller is the only thing the parameter buys.

## The six conditions

A read may live inside the function that uses it only when all six hold.

1. The read site is not reachable during render, and neither is any caller of it.
2. The value does not flow back into rendered output.
3. All reads happen before the first write, or the write is awaited.
4. A key and a value derived from it are not read in a tick that wrote either.
5. The read cannot run before hydration, which rules out module scope and anything reachable from startup.
6. The subscription's only job is to supply this value, and sampling it at event time rather than at last render is the intended behaviour.

## Wrong usages

### 1. Reading during render (condition 1)

```ts
function ReportName({reportID}: Props) {
    const report = Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`); // wrong
    return <Text>{report?.reportName}</Text>;
}
```

The value never updates again, because the read does not subscribe. Use `useOnyx`.

Caught by `no-unsafe-onyx-read` (`noOnyxGetInRender`), but only where the render body is one it recognises: `returnsJSX` matches a top-level `return <JSX>`, so a helper that returns JSX from inside an `if`, or returns an object holding JSX, is not treated as rendering. Classify by position, not by whether lint spoke.

### 2. Reading in a helper that a component or hook calls (conditions 1 and 2)

```ts
// src/libs/ReportUtils.ts
function getOwnerAccountID(reportID: string) {
    return Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)?.ownerAccountID;
}
```

Correct on its own, wrong the moment a hook calls it, and nothing in this file shows that. Either take the value as a parameter here, or keep every caller off the render path.

Lint cannot see this, because the read is written correctly and lint reads one file at a time. Answer it with the forward sweep in [caller-sweep.md](caller-sweep.md), which searches out the call sites and classifies each one by position.

### 3. Reading a key this tick already wrote (condition 3)

```ts
Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
const account = Onyx.get(ONYXKEYS.ACCOUNT); // wrong: isLoading is still the old value
```

`Onyx.merge` and `Onyx.update` apply to the cache a microtask later. `Onyx.set` and `Onyx.mergeCollection` do land immediately, which makes code that depends on the difference fragile rather than safe. Do all the reads before the first write, or `await` the write.

Caught by `no-unsafe-onyx-read` (`noOnyxReadAfterWrite`).

### 4. Reading a source key and a value derived from it in a tick that wrote either (condition 4)

```ts
Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`, transaction);
const t = Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`);  // new revision
const derived = Onyx.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);   // still the old one
```

The set lands at once, the derivation's own write does not, so the two values are a revision apart.

Caught when the write and both reads are in one body. Not caught when the write is in a caller and the reads in a callee, so check this by hand whenever a conversion touches a derived key.

### 5. Reading at module scope, or anywhere reachable from startup (condition 5)

```ts
const preferredLocale = Onyx.get(ONYXKEYS.NVP_PREFERRED_LOCALE); // wrong: runs at import time
```

Module bodies run at import time and the cache hydrates asynchronously, so this returns `undefined` for anything that lives only on disk. It fails silently, as an absent value. Move the read into the function that needs it.

Caught by `no-unsafe-onyx-read` (`noOnyxReadAtModuleScope`).

### 6. Hoisting a read across a deferral (condition 3, in the next tick)

```ts
const report = Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {lastVisibleActionCreated: now});
runAfterTransitions(() => {
    doSomethingWith(report); // wrong: pre-write value, one tick late
});
```

One read block per synchronous stretch, not per function. Code after an `await`, a `runAfterTransitions` or any other deferral runs in a later tick and is meant to see the writes the earlier stretch made, so it does its own reads.

Nothing catches this. The read is before the write, so the order check is satisfied, and the staleness is about which revision the value is. Cover it with a test that asserts the post-write value.

### 7. Reading a value when the intent is what the user saw (condition 6)

A handler that confirms an amount shown in a dialog should act on the value the dialog displayed, not on whatever the cache holds when the tap lands. Conversion changes when the value is sampled, from the caller's last render to the moment the handler runs.

This fails only when the value was **on screen** in the view the handler belongs to. An invisible input to a decision, such as a route, an eligibility check or a request field, is not this case, and event-time is usually the more correct read for it: a permission granted in another tab should take effect on the next tap, not on the next render. So "a handler reads Onyx" is not a condition 6 failure on its own. Say which of the two the value is.

Nothing catches this, and QA cannot stand in for it: the window is one render commit wide, so staging a change inside it by hand is a coin toss. Decide it at review, per call site.

### 8. Deleting a subscription that is a trigger, not a source (condition 6)

```ts
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${id}`);
const build = useCallback(() => compute(report), [report]);
useEffect(() => {
    build();
}, [build]); // the subscription is what re-runs this
```

Ask what each subscription is for. A **source** supplies a value the code reads. A **trigger** schedules work when the key changes, and the value it carries is incidental. Every position check clears a trigger, because nothing renders the value and nothing reads it during render. Convert one and the effect's dependency goes stable, so the effect stops re-running.

The chain hides: a value feeding a `useCallback` that feeds another `useCallback` that reaches an effect's dependency array is the same trigger, and a wrapper such as `useDebounce(useCallback(fn, deps))` swallows a link. `SuggestionMention.tsx` is three links deep, and deleting the subscription there would freeze the mention list until the next keystroke.

Nothing catches the chained form. Walk the identity chain by hand, from the binding to every effect in the file.

### 9. Adding a render-position caller to a function that already reads (condition 1)

```ts
// src/libs/ReportUtils.ts, unchanged
function getOwnerAccountID(reportID: string) {
    return Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)?.ownerAccountID;
}

// src/hooks/useOwnerName.ts, the entire diff
function useOwnerName(reportID: string) {
    return getOwnerAccountID(reportID); // that read is now a render-time read
}
```

Usage 2 from the other side, and the harder one to see: the diff holds no Onyx call, so nothing in it looks like an Onyx change. Every converted read carries this permanently, since the function stays callable from anywhere.

Nothing catches this. The trigger is the added call, not a read, so run the reverse sweep in [caller-sweep.md](caller-sweep.md).

## Running the checks

```bash
npm run lint-changed                       # no-unsafe-onyx-read
npx bun scripts/checkOnyxConnectBypass.ts  # fails on an inline eslint-disable of the rule
```

These cover read position within one file, per-key write ordering including the derived pair, and module scope. Nothing else has a command.

Condition 1's caller half is the sweep in [caller-sweep.md](caller-sweep.md): forward when the diff adds a read, reverse when it adds a call. In CI it is `ONYX-1` in `coding-standards/rules/`.

A read is done when all six conditions are accounted for at that call site, not when the commands are clean. The caller half of 1, plus 4, 6 and the deferral case, are unchecked, so name them one by one, in the PR description for a conversion or in the review comment for a diff: which value each covers, and why it holds here. Silence about a condition is the failure mode, not a pass.
