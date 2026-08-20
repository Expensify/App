---
ruleId: ONYX-1
title: Keep synchronous Onyx reads off the render path and out of a written tick
---

## [ONYX-1] Keep synchronous Onyx reads off the render path and out of a written tick

### Reasoning

`Onyx.get()` reads the cache synchronously and never subscribes. `no-unsafe-onyx-read` catches the shapes of that going wrong which are visible in one file and one function body. The others are not, and this rule is the others.

**A. Position.** A read is a render read when render reaches it, wherever it is written. Lint decides that syntactically: a function is a render body only when it is named like a component or a hook, or has a top-level `return <JSX>` (the `returnsJSX` check in `eslint-plugin-local-rules/no-unsafe-onyx-read.js`). So it is silent on a read in a library function a hook calls, silent on a helper that returns JSX from inside an `if` or a `switch`, and silent on a function handed to a child as a prop, because the body that invokes it is in another file. Silence is not a verdict. Classify by position.

**B. Tick.** `Onyx.merge` and `Onyx.update` apply a microtask later, so a read after one returns the pre-write value. Not every write defers, though: `set` and its collection variants land in the cache at once, so a read after those is already current. A derived key lags every write to its sources either way. Lint pairs writes with reads inside a single enclosing body, via the `callsByBody` map in that same rule file. A write in the caller with the read in a callee is the same defect and it is invisible there.

**C. Trigger.** A `useOnyx` binding whose value is only forwarded still re-renders the component when its key changes, and sometimes that re-render is the point: an effect keyed on the value, or a dependency array that carries it. Replacing such a binding with a read inside the same body deletes the trigger. The finished file looks correct, so this shape is only visible in the diff.

**D. Hydration.** `Onyx.init` hydrates the cache asynchronously and runs outside the React lifecycle, from `src/setup/index.ts`, so a read that beats it returns `undefined` for every key still only on disk, indistinguishable from an absent value. Lint catches module scope. A mount-only effect, an exported `init*`, and anything else the boot path reaches are the quiet ones.

**E. Output.** A read is also wrong when its value reaches the screen on a later hop: parked in state, in a ref, or in a module variable that a component renders. The rendered value is then a snapshot that never updates. A1 and A3 catch the caller-is-render case; this is the stash-then-render case.

**F. Scope.** `@hooks/useOnyx` is not the library hook. Inside a `SearchScopeProvider` subtree it rewrites the key: for the seven keys in `CONST.SEARCH.SNAPSHOT_ONYX_KEYS` it subscribes to `snapshot_<hash>` and extracts the requested key out of that blob. `Onyx.get` always reads the global key.

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

**C. The subscription was the trigger, and the diff deleted it.**

```diff
 function useReportSeen(reportID: string) {
-    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
     useEffect(() => {
-        markReportSeen(report);
+        markReportSeen(Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)); // never re-runs when the report changes
-    }, [report]);
+    }, [reportID]);
 }
```

**D. The boot path reaches the read, and it is not at module scope.**

```ts
// src/libs/actions/App.ts, called from src/setup/index.ts on a cold start
function initializeApp() {
    const locale = Onyx.get(ONYXKEYS.NVP_PREFERRED_LOCALE); // undefined until hydration finishes, and lint is silent
    setLocale(locale ?? CONST.LOCALES.DEFAULT);
}
```

**E. The value is stashed at event time and rendered afterwards.**

```tsx
function ReportTitle({reportID}: {reportID: string}) {
    const [title, setTitle] = useState<string>();
    // The title renders below, so it has to stay reactive. This freezes it at the moment of the tap.
    const onPress = () => setTitle(Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)?.reportName);
    return <Text onPress={onPress}>{title}</Text>;
}
```

**F. The component renders inside a Search scope, so the subscription was reading the snapshot.**

```diff
 // src/components/Search/SearchList/ListItem/ActionCell/PayActionCell.tsx
 // Rendered from ReportListItemHeader, inside <SearchScopeProvider> in src/components/Search/index.tsx:1218.
-    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS); // read snapshot_<hash>
     const confirmPayment = () => {
+        // reads the global collection, which has no entry for a report this client never opened
+        const allReportActions = Onyx.get(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
         payInvoice({chatReportActions: allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`]});
     };
```

A test that renders the component directly passes against both versions, because the provider is only in the production tree.

### Correct

```tsx
// A1: the hook subscribes and the helper takes the value.
function useOwnerName(reportID: string) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    return report?.ownerAccountID;
}

// A2: the render body takes the report it draws.
function renderReportIcon(report: OnyxEntry<Report>) { ... }

// B: every read happens before the first write. Straight-line code in one tick is where the hoist belongs.
function submitReport(reportID: string) {
    const total = ReportUtils.getReportTotal(reportID);
    const attributes = ReportUtils.getReportAttributes(reportID);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED});
}

// B, the other half: a read in a deferred continuation stays there. Hoisting it above the write freezes it,
// and the actions arriving while the callback waits are lost.
function replaceReport(reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[actionID]: null});
    TransitionTracker.runAfterTransitions({
        callback: () => {
            const action = Onyx.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`)?.[actionID];
            if (action && !action.isOptimisticAction) { ... }
        },
    });
}

// C: the effect re-runs on the key, so the subscription stays.
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
useEffect(() => markReportSeen(report), [report]);

// D: the boot path sequences the read after hydration instead of racing it.
Onyx.init({keys: ONYXKEYS}).then(() => setLocale(Onyx.get(ONYXKEYS.NVP_PREFERRED_LOCALE)));

// E: anything rendered stays on useOnyx.
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
return <Text>{report?.reportName}</Text>;

// F: a snapshot key inside a Search scope keeps its subscription, whatever the handler does with it.
const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

// F, the other half: outside the provider, or behind <SearchScopeProvider isOnSearch={false}>, the
// subscription was already reading the global collection, so the read is equivalent.
const confirmPayment = () => payInvoice(Onyx.get(ONYXKEYS.COLLECTION.REPORT_ACTIONS));
```

---

### Review Metadata

Search with the Grep tool, not `Bash`: this workflow allows `Bash` only for `gh pr diff`, `gh pr view` and `check-compiler.sh`. A denied command is not an empty result.

#### A. Position. Four triggers, a PR can arrive as any of them.

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

**A4. Prop, the read leaves in a function handed to a child.** Flag when ALL are true:

- The diff adds a read to a function passed as a prop, or adds a JSX attribute passing a function whose file contains `Onyx.get`
- The receiving component invokes that prop anywhere render reaches: its body at statement level, its JSX, a `useMemo`, or a local function the body calls
- Resolve the receiver before deciding: take the component name off the JSX attribute, open its file, Grep the prop's name followed by `(`. A prop only forwarded to another component is not a verdict, repeat on that one
- Comment on the JSX attribute, naming the receiving file and the line that calls it
- If the receiver cannot be resolved, because the prop arrives in a spread or the component comes from a variable, say that in the comment and ask the author to confirm nothing calls it during render

#### B. Tick. Two triggers.

**B1. Forward, the diff adds an un-awaited write.** Which write it is decides what a same-tick read can see:

- `merge`, `update` and `clear` are deferred, so a later read in the same tick returns the pre-write value
- `set`, `multiSet`, `setCollection` and `mergeCollection` land in the cache immediately, so a same-tick read of the written key is already current and is not a finding. After one of these, flag only a read of a key *derived* from the written one, which lags either way

The split does not follow the names, `mergeCollection` behaves like `set` and not like `merge`, so do not extend either list by guessing.

For every call the body makes after a deferred write in the same tick, Grep the callee's file for `Onyx.get`. Flag when the callee reads:

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

#### D. Hydration. Two triggers.

**D1. The diff adds a read the boot path can reach.** Flag when the read lands in `index.js`, `src/setup/`, `src/App.tsx`, `src/Expensify.tsx`, `src/libs/actions/App.ts`, or in an exported function named `init*`, and ask the author to name what guarantees hydration finished first. Walk callers as in A1: a plain function is not a verdict.

**D2. The diff adds a read that runs before its key is hydrated.** Flag when either holds:

- The read sits in a `useEffect(..., [])` in a component that mounts before the splash screen hides
- The read sits in an `Onyx.connect` or `connectWithoutView` callback and reads a key other than the one subscribed. Arrival of one key says nothing about another

#### E. Output. One trigger.

**E1. The diff parks the value somewhere render reads.** Flag when ALL are true:

- The read's value is passed to a `useState` setter, assigned to a `useRef`, or written to a module-level variable
- A render position in the same file reads that target
- Comment on the read: the rendered value is frozen at event time and the key changing will not update it

#### F. Scope. One trigger, and the seven keys decide whether it applies at all.

The keys are `CONST.SEARCH.SNAPSHOT_ONYX_KEYS` in `src/CONST/index.ts`. A read of any other key cannot be a scope finding.

**F1. The diff converts a subscription to one of those keys, in a component or a hook.** Flag when ALL are true:

- The read is one of the seven keys, or a member of one of those collections
- Some render path to the reading component crosses a `SearchScopeProvider` with `isOnSearch` left at its default. Grep `src/` for `SearchScopeProvider` to get the current mounts, then walk upwards from the reading file as A1 walks callers: Grep for the component's name to find its parents, and repeat until a path reaches one of those mounts or runs out. `useIsOnSearch` anywhere in the file is a positive signal on its own, since the file already knows it can render there
- Comment on the read, naming the provider mount and the file that carries the path to it. State that the subscription was reading `snapshot_<hash>` and the read is not

**F2. The read feeds a write path, and the entity may exist only in a snapshot.** Flag when ALL are true:

- The value is passed into an action, or into anything that builds `optimisticData`
- The entity it identifies can come from search results: a report, transaction, or report action reached by `reportID` or `transactionID` off a Search row or a Search-derived list
- Comment on the call, asking what guarantees the client loaded that entity. `undefined` here is silent: the action skips the item rather than failing

For both, say in the comment that a test rendering the component directly cannot settle it, because the provider is only in the production tree. Ask for the seeded-snapshot case instead: write a divergent value under `snapshot_${hash}` for the same entity and assert which source the code takes.

#### DO NOT flag if

Scope:

- The key is not one of the seven. A snapshot holds nothing else, so no redirect exists to lose
- The reading component sits behind `<SearchScopeProvider isOnSearch={false}>`, which is what `PayActionCell` wraps its own children in. Check which side of that boundary the read is on: a provider in the JSX return governs the children, not the hooks above it in the same body
- No render path reaches a provider mount, and the file does not mention `useIsOnSearch`
- The read is in a library or action file that no search-rendered component calls. Walk the callers before accepting this, as in A1

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

Hydration:

- The boot path only registers the reading function, and something later calls it
- The author names a hydration gate the call sits behind: an `Onyx.init` continuation, an awaited write, or a splash-screen state check

Output:

- The value is meant to be a snapshot of the moment of the event, and nothing downstream depends on it updating
- The target is written and read in the same event, and no render position reads it

Tick:

- The write is awaited, or the read runs in its `.then`
- The read sits inside something the author deliberately deferred: a `.then`, a timer, `runAfterTransitions`, `runAfterInteractions`, or a callback passed to an async API. Reading there is the point, the value should be whatever is current once that body finally runs. Still exempt when the wrapper happens to run inline on a given call, because the placement is deliberate either way
- Do not answer B by moving a read out of one of those bodies. Hoisting is the fix for straight-line code; here it pins the value to the moment before the wait, so anything arriving during the wait is lost. If such a read still looks wrong, the write is what is misplaced, not the read
- The write is `set`, `multiSet`, `setCollection` or `mergeCollection` and the read is of the key just written, since those land in the cache immediately. A read of a key *derived* from that write is still a finding
- The write and the call are in mutually exclusive branches, or the write's branch returns before the call
- The keys are provably different and the read key is not derived from the written one

**Search Patterns** (hints for reviewers):
- `Onyx.get(`
- `Onyx.merge(`, `Onyx.update(`, `Onyx.set(`, `Onyx.mergeCollection(`
- `ONYXKEYS.DERIVED`
- removed `useOnyx(` lines in the diff, then that variable's name in the rest of the diff
- `useEffect(`, `useLayoutEffect(`, `useFocusEffect(`, `useRef(`, `useState(`
- `Onyx.init`, `init` as a function-name prefix
- `SNAPSHOT_ONYX_KEYS` in `src/CONST/index.ts`, for the current key list
- `SearchScopeProvider`, for the current provider mounts, then `isOnSearch={false}` for the opt-outs
- `useIsOnSearch`, which marks a file that already knows it renders inside a Search scope
- before flagging a read that follows a write, the body enclosing it: `runAfterTransitions`, `runAfterInteractions`, `.then(`, `setTimeout(`, `callback:`. A read inside one is exempt, and a read the diff moved *out* of one is its own finding
