---
ruleId: ONYX-1
title: Keep synchronous Onyx reads off the render path and out of a written tick
---

## [ONYX-1] Keep synchronous Onyx reads off the render path and out of a written tick

### Reasoning

`Onyx.get()` reads the cache synchronously and never subscribes. `no-unsafe-onyx-read` catches the shapes of that going wrong which are visible in one file and one function body. Two shapes are not, and this rule is those two.

**A. Position.** A read is a render read when render reaches it, wherever it is written. Lint decides that syntactically: a function is a render body only when it is named like a component or a hook, or has a top-level `return <JSX>` (`returnsJSX`, `eslint-plugin-local-rules/no-unsafe-onyx-read.js:89-105`). So it is silent on a read in a library function a hook calls, and silent on a helper that returns JSX from inside an `if` or a `switch`. Silence is not a verdict. Classify by position.

**B. Tick.** `Onyx.merge` and `Onyx.update` apply a microtask later, so a read after one returns the pre-write value, and a derived key lags every write to its sources whether or not that write landed at once. Lint pairs writes with reads inside a single enclosing body (`callsByBody`, same file, lines 423 and 539). A write in the caller with the read in a callee is the same defect and it is invisible there.

### Incorrect

**A1. The read is correct where it is written, and a hook calls it.**

```ts
// src/libs/ReportOwnerUtils.ts
function getReportOwnerAccountID(reportID: string) {
    return Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)?.ownerAccountID; // fine here
}

// src/hooks/useOwnerName.ts
function useOwnerName(reportID: string) {
    return getReportOwnerAccountID(reportID); // makes that read run during render
}
```

**A2. The function is a render body, and lint does not recognise it.**

```tsx
// Every return is JSX, but each sits inside a switch case, so `returnsJSX` is false and lint says nothing.
function renderReportIcon(reportID: string) {
    const report = Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`); // wrong: this is render

    switch (report?.chatType) {
        case CONST.REPORT.CHAT_TYPE.POLICY_ROOM:
            return <RoomIcon />;
        default:
            return <GenericIcon />;
    }
}

<FlatList renderItem={({item}) => renderReportIcon(item.reportID)} />;
```

**B. The write is in the caller, the read is one call away.**

```ts
// src/libs/actions/Report.ts, the diff
function submitReport(reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED});
    const total = ReportUtils.getReportTotal(reportID);   // pre-write report: merge lands next microtask
    const attributes = ReportUtils.getReportAttributes(reportID); // derived key, one revision behind
}

// src/libs/ReportUtils.ts, untouched by the diff
function getReportTotal(reportID: string) {
    return Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)?.total;
}

function getReportAttributes(reportID: string) {
    return Onyx.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES)?.reports?.[reportID];
}
```

### Correct

```tsx
// A1: the hook subscribes and the helper takes the value.
function useOwnerName(reportID: string) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    return report?.ownerAccountID;
}

// A2: the render body takes the report it draws.
function renderReportIcon(report: OnyxEntry<Report>) { ... }

// B: every read happens before the first write.
function submitReport(reportID: string) {
    const total = ReportUtils.getReportTotal(reportID);
    const attributes = ReportUtils.getReportAttributes(reportID);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED});
}
```

---

### Review Metadata

Search with the Grep tool, not `Bash`: this workflow allows `Bash` only for `gh pr diff`, `gh pr view` and `check-compiler.sh`. A denied command is not an empty result.

#### A. Position. Three triggers, a PR can arrive as any of them.

**A1. Forward, the diff adds a synchronous read to a function.** Flag when ALL are true:

- Some caller reaches it from a render position: a component or hook body at statement level, a `useMemo` callback, a `useOnyx` selector, a `useState` or `useReducer` lazy initializer, an IIFE or an array-method callback evaluated in the body, or a local function the body invokes, as in `MoneyRequestHeader.tsx`
- Comment on the read, naming the calling file and line
- A caller that is itself a plain function is not a verdict: repeat the search on its name, until every path ends in a handler, an effect or an action creator

Callers of a read: Grep `src/` over `**/*.{ts,tsx}` for the function's name, ignoring imports and re-exports. Not exported: its own file only.

**A2. Self, the function holding the read is itself a render body.** No caller search: flag the read. A function is a render body when either holds:

- Any return produces JSX, or an object or array holding JSX, wherever that return sits: inside an `if`, a `switch` case, a `try`, a ternary or an `&&`. Lint only matches a top-level `return <JSX>`, so a branch return is exactly the case it misses
- It is passed as a render callback: `renderItem`, `renderSectionHeader`, `ListHeaderComponent`, `ListEmptyComponent`, `ListFooterComponent`, or any `render*` or `*Component` prop

**A3. Reverse, the diff adds a call, not a read.** Flag when ALL are true:

- The diff adds a call inside a component or a hook
- The callee's file contains a synchronous read: Grep that file for `Onyx.get`
- The added call sits at a render position, not in a handler or an effect
- Comment on the added call

#### B. Tick. Two triggers.

**B1. Forward, the diff adds an un-awaited write.** Writes are `Onyx.merge`, `update`, `set`, `multiSet`, `mergeCollection`, `setCollection` and `clear`. For every call the body makes after that write in the same tick, Grep the callee's file for `Onyx.get`. Flag when the callee reads:

- The written key, or a member of the written collection
- A key derived from it. Derived keys are `ONYXKEYS.DERIVED.*` (`src/ONYXKEYS.ts:1298-1307`); the sources of one are the `dependencies` array in its config under `src/libs/actions/OnyxDerived/configs/`. Grep that directory for the written key. A derived read lags even a write that lands immediately, because the derivation's own write does not
- Comment on the write, naming the callee and the key

A callee that is itself a plain function is not a verdict: repeat on the functions it calls.

**B2. Reverse, the diff adds a read into a function callers already write around.** Grep `src/` for the function's name, then flag any caller that writes Onyx before the call in the same tick, by the B1 key test.

#### DO NOT flag if

Position:

- The read sits in a `useCallback` body, an effect body, an event handler, a promise continuation or a timer that render does not invoke. A `useCallback` and a handler passed as a prop cut both ways, since a component can invoke either during render: read the body holding the call, not the wrapper
- The reading function is not exported, nothing in its own file calls it from a render position, and it is neither a render body by A2 nor passed as a render callback
- The read is `useOnyx`, `Onyx.connect` or `Onyx.connectWithoutView`
- The value only reaches a handler argument or a request field and is never rendered

Tick:

- The write is awaited, or the read runs in its `.then`
- The call runs in a later tick: after an `await`, `runAfterTransitions`, `InteractionManager.runAfterInteractions` or a timer. That stretch is meant to see the write, so re-reading there is the fix, not the defect
- The write and the call are in mutually exclusive branches, or the write's branch returns before the call
- The keys are provably different and the read key is not derived from the written one

**Search Patterns** (hints for reviewers):
- `Onyx.get(`
- `Onyx.merge(`, `Onyx.update(`, `Onyx.set(`, `Onyx.mergeCollection(`
- `ONYXKEYS.DERIVED`
