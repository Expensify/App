---
ruleId: ONYX-1
title: Keep Onyx reads off the render path and out of a written tick
---

## [ONYX-1] Keep Onyx reads off the render path and out of a written tick

### Reasoning

`await OnyxUtils.get()` reads a key once and never subscribes. Most ways that goes wrong are already caught before review, so this rule is only the rest.

Do not re-check these, they are enforced:

| Already enforced | By what |
|---|---|
| Read during render, or at module scope | `no-unsafe-onyx-read` |
| Read after an un-awaited write **in the same function body** | `no-unsafe-onyx-read`, via its `callsByBody` map |
| Reading a `CONST.SEARCH.SNAPSHOT_ONYX_KEYS` key | the `ReadableOnyxKey` parameter type, and `@libs/OnyxUtils.get` at runtime for a key that is only a `string` until then |
| Reading straight off `react-native-onyx` instead of `@libs/OnyxUtils` | `no-unsafe-onyx-read` |
| A forgotten `await` whose value is then used | `tsc`, since the value is a `Promise` |
| Mutating a read result held in a `const` | `no-unsafe-onyx-read` |

What is left is what none of them can see: anything that crosses a file boundary, anything only visible as a diff, and dataflow after the read.

**A. Position.** A read is a render read when render reaches it, wherever it is written. Lint decides that syntactically: a function is a render body only when it is named like a component or a hook, or has a top-level `return <JSX>` (the `returnsJSX` check in `eslint-plugin-local-rules/no-unsafe-onyx-read.js`). So it is silent on a read in a library function a hook calls, on a helper that returns JSX from inside an `if` or a `switch`, and on a function handed to a child as a prop, because the body that invokes it is in another file. Silence is not a verdict. Classify by position.

**B. Tick.** Awaiting the read does not wait for a pending write, and cannot: The read samples the cache when it is called, and the Promise defers delivery rather than the read. Treat every write as deferred. Which writes land before returning is version-dependent, so do not exempt one by name. A derived key lags every write to its sources either way. Lint pairs writes with reads inside a single enclosing body, via the `callsByBody` map in that same rule file. A write in the caller with the read in a callee is the same defect, invisible there.

**C. Trigger.** A `useOnyx` binding whose value is only forwarded still re-renders the component when its key changes, and sometimes that re-render is the point: an effect keyed on the value, or a dependency array carrying it. Replacing such a binding with a read in the same body deletes the trigger. The finished file looks correct, so this shape is only visible in the diff.

**D. Output.** A read is also wrong when its value reaches the screen on a later hop: parked in state, in a ref, or in a module variable a component renders. The rendered value is then a snapshot that never updates. A1 and A3 catch the caller-is-render case; this is the stash-then-render case.

### Incorrect

**A1. The read is correct where it is written, and a hook calls it.**

```ts
// src/libs/ReportOwnerUtils.ts
async function getReportOwnerAccountID(reportID: string) {
    return (await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`))?.ownerAccountID; // fine here
}

// src/hooks/useOwnerName.ts
function useOwnerName(reportID: string) {
    return getReportOwnerAccountID(reportID); // hands render a Promise, and tsc is happy with that
}
```

**A2. The function is a render body, and lint does not recognize it.**

```tsx
// Every return is JSX, but each sits inside a switch case, so `returnsJSX` is false and lint says nothing.
async function renderReportIcon(reportID: string) {
    const report = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`); // wrong: this is render

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
async function submitReport(reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED});
    const total = await ReportUtils.getReportTotal(reportID);   // pre-write report: the await does not wait for the merge
    const attributes = await ReportUtils.getReportAttributes(reportID); // derived key, one revision behind
}

// src/libs/ReportUtils.ts, untouched by the diff
async function getReportTotal(reportID: string) {
    return (await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`))?.total;
}

async function getReportAttributes(reportID: string) {
    return (await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES))?.reports?.[reportID];
}
```

**C. The subscription was the trigger, and the diff deleted it.**

```diff
 function useReportSeen(reportID: string) {
-    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
     useEffect(() => {
-        markReportSeen(report);
+        OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`).then(markReportSeen); // never re-runs when the report changes
-    }, [report]);
+    }, [reportID]);
 }
```

**D. The value is stashed at event time and rendered afterwards.**

```tsx
function ReportTitle({reportID}: {reportID: string}) {
    const [title, setTitle] = useState<string>();
    // The title renders below, so it has to stay reactive. This freezes it at the moment of the tap.
    const onPress = async () => setTitle((await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`))?.reportName);
    return <Text onPress={onPress}>{title}</Text>;
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

// B: every read is awaited before the first write. Awaiting the write instead works just as well.
async function submitReport(reportID: string) {
    const total = await ReportUtils.getReportTotal(reportID);
    const attributes = await ReportUtils.getReportAttributes(reportID);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED});
}

// B, the other half: a read in a deferred continuation stays there. Hoisting it above the write freezes it,
// and the actions arriving while the callback waits are lost.
function replaceReport(reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[actionID]: null});
    TransitionTracker.runAfterTransitions({
        callback: async () => {
            const action = (await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`))?.[actionID];
            if (action && !action.isOptimisticAction) { ... }
        },
    });
}

// C: the effect re-runs on the key, so the subscription stays.
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
useEffect(() => markReportSeen(report), [report]);

// D: anything rendered stays on useOnyx.
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
return <Text>{report?.reportName}</Text>;
```

---

### Review Metadata

Search with the Grep tool, not `Bash`: this workflow allows `Bash` only for `gh pr diff`, `gh pr view` and `check-compiler.sh`. A denied command is not an empty result.

#### A. Position. Four triggers, a PR can arrive as any of them.

A converted helper returns a Promise, so a render-position caller that uses the value is usually a tsc
error already. A1 and A3 are what tsc cannot see: a caller that ignores the return value, a helper that
returns `void` and does the work itself, and a value reaching render through `any`. A2 and A4 are
unaffected, since tsc has no opinion on where a body runs.

**A1. Forward, the diff adds a read to a function.** Flag when ALL are true:

- Some caller reaches it from a render position: a component or hook body at statement level, a `useMemo` callback, a `useOnyx` selector, a `useState` or `useReducer` lazy initializer, an IIFE or an array-method callback evaluated in the body, or a local function the body invokes, as in `MoneyRequestHeader.tsx`
- Comment on the read, naming the calling file and line
- A caller that is itself a plain function is not a verdict: repeat the search on its name, until every path ends in a handler, an effect or an action creator

Callers of a read: Grep `src/` over `**/*.{ts,tsx}` for the function's name, ignoring imports and re-exports. Not exported: its own file only.

**A2. Self, the function holding the read is itself a render body.** No caller search: flag the read. A function is a render body when either holds:

- Any return produces JSX, or an object or array holding JSX, wherever that return sits: inside an `if`, a `switch` case, a `try`, a ternary or an `&&`. Lint only matches a top-level `return <JSX>`, so a branch return is exactly the case it misses
- It is passed as a render callback: `renderItem`, `renderSectionHeader`, `ListHeaderComponent`, `ListEmptyComponent`, `ListFooterComponent`, or any `render*` or `*Component` prop

**A3. Reverse, the diff adds a call, not a read.** Flag when ALL are true:

- The diff adds a call inside a component or a hook, and the call's value is discarded or the callee returns `void`, since tsc reports the rest
- The callee's file contains a read: Grep that file for `OnyxUtils.get`
- The added call sits at a render position, not in a handler or an effect
- Comment on the added call

**A4. Prop, the read leaves in a function handed to a child.** Flag when ALL are true:

- The diff adds a read to a function passed as a prop, or adds a JSX attribute passing a function whose file contains `OnyxUtils.get`
- The receiving component invokes that prop anywhere render reaches: its body at statement level, its JSX, a `useMemo`, or a local function the body calls
- Resolve the receiver before deciding: take the component name off the JSX attribute, open its file, Grep the prop's name followed by `(`. A prop only forwarded to another component is not a verdict, repeat on that one
- Comment on the JSX attribute, naming the receiving file and the line that calls it
- If the receiver cannot be resolved, because the prop arrives in a spread or the component comes from a variable, say that in the comment and ask the author to confirm nothing calls it during render

#### B. Tick. Two triggers.

**B1. Forward, the diff adds an un-awaited write.** Every un-awaited write is a finding for a later read of the same key in the same tick, whichever method it is, and an `await` on the read does not change that. Do not exempt a write by name: which ones land immediately differs between react-native-onyx versions, any `set` inside `update()` is deferred, and a read of a key *derived* from a write lags regardless.

For every call the body makes after a deferred write in the same tick, Grep the callee's file for `OnyxUtils.get`. Flag when the callee reads:

- The written key, or a member of the written collection
- A key derived from it. Derived keys are the `DERIVED` block in `src/ONYXKEYS.ts`; the sources of one are the `dependencies` array in its config under `src/libs/actions/OnyxDerived/configs/`. Grep that directory for the written key. A derived read lags even a write that lands immediately, because the derivation's own write does not
- Comment on the write, naming the callee and the key

A callee that is itself a plain function is not a verdict: repeat on the functions it calls.

**B2. Reverse, the diff adds a read into a function callers already write around.** Grep `src/` for the function's name, then flag any caller that writes Onyx before the call in the same tick, by the B1 key test.

#### C. Trigger. Two triggers, both read from the diff rather than the final file.

**C1. The diff moves a read into an effect body.** Flag when ALL are true:

- The diff removes a `useOnyx` for a key, and adds a read of that key inside a `useEffect`, `useLayoutEffect` or `useFocusEffect` body in the same file
- Comment on the effect, not the read: the defect is that it no longer re-runs when the key changes

**C2. The diff strips the value out of a dependency array or out of JSX.** Flag when ALL are true:

- The diff removes a `useOnyx` binding, and the same diff removes that variable's name from a dependency array (`useEffect`, `useCallback`, `useMemo`, `useAnimatedStyle`, `useDerivedValue`) or from JSX
- Search the removed lines for the variable name before accepting the conversion. A binding that appeared in either place was doing more than supplying a value

#### D. Output. One trigger.

**D1. The diff parks the value somewhere render reads.** Flag when ALL are true:

- The read's value is passed to a `useState` setter, assigned to a `useRef`, or written to a module-level variable
- A render position in the same file reads that target
- Comment on the read: the rendered value is frozen at event time and the key changing will not update it

#### DO NOT flag if

Position:

- The read sits in a `useCallback` body, an effect body, an event handler, a promise continuation or a timer that render does not invoke. A `useCallback` and a handler passed as a prop cut both ways, since a component can invoke either during render: read the body holding the call, not the wrapper
- The reading function is not exported, nothing in its own file calls it from a render position, and it is neither a render body by A2 nor passed as a render callback
- The read is `useOnyx`, `Onyx.connect` or `Onyx.connectWithoutView`
- The prop holding the reading function is named `on*` or `handle*` and every receiver either passes it to an event prop or calls it from a handler, an effect or a promise continuation
- The value only reaches a handler argument or a request field and is never rendered

Trigger:

- The removed `useOnyx` value appears nowhere in the diff but the argument list of the converted call
- The effect keeps a dependency that changes whenever the read key changes, such as the collection member id
- The removed binding had a selector whose output the diff still subscribes to

Output:

- The value is meant to be a snapshot of the moment of the event, and nothing downstream depends on it updating
- The target is written and read in the same event, and no render position reads it

Tick:

- The write is awaited, or the read runs in its `.then`
- The read sits inside something the author deliberately deferred: a `.then`, a timer, `runAfterTransitions`, `runAfterInteractions`, or a callback passed to an async API. Reading there is the point, the value should be whatever is current once that body finally runs. Still exempt when the wrapper happens to run inline on a given call, because the placement is deliberate either way
- Do not answer B by moving a read out of one of those bodies. Hoisting is the fix for straight-line code; here it pins the value to the moment before the wait, so anything arriving during the wait is lost. If such a read still looks wrong, the write is what is misplaced, not the read
- The write is awaited. Do not exempt a write by method name: which writes land immediately differs between the pinned `react-native-onyx` and the release this feature needs
- The write and the call are in mutually exclusive branches, or the write's branch returns before the call
- The keys are provably different and the read key is not derived from the written one

**Search Patterns** (hints for reviewers):
- `OnyxUtils.get(`
- `Onyx.merge(`, `Onyx.update(`, `Onyx.set(`, `Onyx.mergeCollection(`
- `ONYXKEYS.DERIVED`
- removed `useOnyx(` lines in the diff, then that variable's name in the rest of the diff
- `useEffect(`, `useLayoutEffect(`, `useFocusEffect(`, `useRef(`, `useState(`
- before flagging a read that follows a write, the body enclosing it: `runAfterTransitions`, `runAfterInteractions`, `.then(`, `setTimeout(`, `callback:`. A read inside one is exempt, and a read the diff moved *out* of one is its own finding
