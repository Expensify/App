# Onyx Data Management
This is how the application manages all the data stored in Onyx.

#### Related Philosophies
- [Data Flow Philosophy](/contributingGuides/philosophies/DATA-FLOW.md)
- [Data Binding Philosophy](/contributingGuides/philosophies/DATA-BINDING.md)

#### Terminology
- **Actions** - The files stored in `/src/libs/actions`
- **Derived Values** - Special Onyx keys containing values computed from other Onyx values
- **Collections** - Multiple related data objects stored as individual keys with IDs

## Rules
### - Actions MUST be the only means to write or read data from the server
### - Actions SHOULD use `Onyx.merge()` rather than `Onyx.set()`
This improves performance and lessens the chance that one action will overwrite the changes made by another action.

### - UI Components MUST NOT call Onyx methods directly and should call an action instead
### - Data SHOULD be optimistically stored on disk whenever possible without waiting for a server response
Example of creating a new optimistic comment:
1. User adds a comment
2. Comment is shown immediately in the UI with optimistic data
3. Comment is created in the server
4. Server responds
5. UI updates with data from the server

### - Collections SHOULD be stored as individual keys when components bind directly to them
Store collections as individual keys+ID (e.g., `report_1234`, `report_4567`) when a component will bind directly to one of those keys. For example: reports are stored as individual keys because `OptionRow.js` binds to the individual report keys for each link. However, report actions are stored as an array of objects because nothing binds directly to a single report action.

### - Onyx keys MUST be defined using constants in `ONYXKEYS`
Each Onyx key represents either a collection of items or a specific entry in storage. For example, since all reports are stored as individual keys like `report_1234`, if code needs to know about all the reports (e.g., display a list of them in the nav menu), then it MUST subscribe to the key `ONYXKEYS.COLLECTION.REPORT`.

### - Storage eviction MUST be configured for non-critical data
Different platforms come with varying storage capacities and Onyx has a way to gracefully fail when those storage limits are encountered.

**To flag a key as safe for removal:**
- Add the key to the `evictableKeys` option in `Onyx.init(options)`
- A least recently accessed key will only be deleted when an Onyx operation retries after failing.

## Reading Onyx data: `useOnyx` vs `Onyx.connectWithoutView`
There are only two ways to read Onyx data, and `Onyx.connect` is deprecated:
1. **`useOnyx`** (from `@hooks/useOnyx`) — the default for anything a React component renders.
2. **`Onyx.connectWithoutView`** — an imperative subscription for non-render logic, used only when `useOnyx` genuinely does not fit.
3. **`Onyx.get()`**: an asynchronous, one-shot read of the cache that never subscribes, for non-render code that needs a value at the moment it runs.

### - Prefer a pure function over reading Onyx at all
A pure function does not read Onyx itself — it receives the data it needs as parameters, and its caller does the reading (with `useOnyx` or `Onyx.connectWithoutView`) and passes it in. Before adding either subscription, check whether the code can be a pure function instead: it needs no connection, is trivial to test, and cannot cause extra rerenders. Prefer this even when it means passing more arguments. This takes precedence over everything below.

### - Components MUST read Onyx with `useOnyx`, never `Onyx.connectWithoutView`
Any value used during render belongs in `useOnyx` so the UI updates when the value changes.

### - `Onyx.connectWithoutView` is ONLY for data that is never used during render
It is appropriate for module-level state in actions/libraries that is read by non-React logic (e.g. network layer, pusher subscriptions, test files, etc.), where `useOnyx` is not possible. 

### - Existing `Onyx.connectWithoutView` usage is NOT a template to copy
Do not add a new `Onyx.connectWithoutView` just because nearby code uses it. Justify each new use on its own against the rule above; when in doubt, use `useOnyx`.

### - Every new `Onyx.connectWithoutView` MUST have a comment explaining why it is needed
Add an inline comment at each new `Onyx.connectWithoutView` call stating why the data cannot come from a pure function or `useOnyx`, so reviewers and future readers can see the choice was deliberate.

### - Using `Onyx.connectWithoutView` in a component for performance REQUIRES @frontend-performance approval
In rare cases a component that subscribes to multiple large collections through `useOnyx` suffers a significant performance regression. Reaching for `Onyx.connectWithoutView` to avoid that is an explicit exception, not a self-serve option: it MUST be approved by the `@frontend-performance` team on Slack, and the PR description MUST link to that discussion.

### - `Onyx.get()` is ONLY for code that runs on an event, never during render
It returns what is in the cache right now and never subscribes, so a value it returns is frozen at the moment of the read. Use it in action creators, libraries, network handlers, and callbacks such as `useCallback`, `useEffect` and event handlers. A collection key returns every member, exactly as `useOnyx` does. The same rule covers the value it produces: a value read this way MUST NOT reach rendered output, because nothing will re-render when the key changes.

It also resolves only after `Onyx.init` has hydrated the cache, so it cannot be used by anything that runs on the boot path before then. `src/libs/actions/OnyxDerived/index.ts` is the standing example: its restore-from-disk read runs in the same synchronous stretch as `Onyx.init`, so it reads the library's cache directly rather than through the wrapper.

```typescript
// GOOD ✅
async function submitExpense(transactionID: string) {
  const transaction = await Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
  // ...act on it here, at event time
}

// BAD ❌ a component cannot await, so reaching the read from render means use() or .then()
function ReportName({reportID}: Props) {
  const report = use(Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)); // never updates again
  return <Text>{report?.reportName}</Text>;
}
```

### - A value read with `Onyx.get()` MUST NOT be parked where render reads it
The ban on reaching rendered output covers the indirect route as well. Putting the value in `useState`, in a `useRef`, or in a module-level variable that a component reads leaves the screen showing a snapshot of the moment of the read, and the key changing will never update it. If it renders, it comes from `useOnyx`.

```typescript
// BAD ❌ the title freezes at the moment of the tap
function ReportTitle({reportID}: Props) {
  const [title, setTitle] = useState<string>();
  const onPress = async () => setTitle((await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`))?.reportName);
  return <Text onPress={onPress}>{title}</Text>;
}
```

### - A function that reads with `Onyx.get()` MUST NOT be passed where render can call it
Passing the function as a prop moves the decision into the receiving component: the read is correct where it is written, and the call that breaks it is in another file. A prop named for an event (`onPress`, `onSelectRow`) that the child only attaches to an event is fine. A prop the child invokes in its own body, in its JSX, or in a `useMemo` is a render read. Check the receiver before passing a reader down, and check it again when a new receiver appears.

```typescript
// BAD ❌ src/pages/ReportScreen.tsx passes a reader down
<ReportRow getTotal={async () => (await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`))?.total} />

// src/components/ReportRow.tsx calls it during render
function ReportRow({getTotal}: Props) {
  return <Text>{use(getTotal())}</Text>; // never updates again
}
```

### - Every caller of a function that reads with `Onyx.get()` MUST also be off the render path
A read written correctly in a library function becomes a render-time read the moment a component or hook calls that function, and neither file shows the problem on its own. Adding the call is enough to break it, so a diff containing no Onyx code at all can be the diff that introduces the defect. Either take the value as a parameter, or keep every caller off the render path and check that again whenever a caller is added.

A widely called function usually cannot host the read at all. One render call site anywhere in `src/` settles it, however many callers would benefit, so sweep every call site before moving a read down into a shared function.

```typescript
// src/libs/ReportUtils.ts, correct in isolation
async function getOwnerAccountID(reportID: string) {
  return (await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`))?.ownerAccountID;
}

// BAD ❌ src/hooks/useOwnerName.ts, the entire diff: that read now runs during render
function useOwnerName(reportID: string) {
  return getOwnerAccountID(reportID);
}
```

### - All `Onyx.get()` reads MUST come before the first write in that tick, or after an `await`
Most writes apply to the cache after the call returns, so a read that follows one resolves to the pre-write value. Treat every write the same way: which ones land before returning is version-dependent, and any `set` inside an `Onyx.update()` batch is deferred regardless.

Awaiting the read is not the fix. `Onyx.get()` samples the cache when it is called and the Promise defers delivery rather than the read, so a write queued before it cannot land in time however many `await`s follow. Await the **write's own promise**, or do the read first.

```typescript
// BAD ❌
Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
const account = await Onyx.get(ONYXKEYS.ACCOUNT); // isLoading is still the old value
```

### - A key and a value derived from it MUST NOT be read in a tick that wrote either
A `set` lands at once but the derivation's own write does not, so the source and the derived value end up a revision apart. Check this by hand whenever a conversion touches a `DERIVED` key, since the write is often in a caller and the reads in a callee.

```typescript
// BAD ❌
Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`, transaction);
const t = await Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`);  // new revision
const derived = await Onyx.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);   // still the old one
```

### - `Onyx.get()` MUST NOT run at module scope
A module body runs at import time and cannot `await`, so the value can only reach a module variable through `.then()`, where it is a one-shot snapshot that never updates when the key changes. Move the read into the function that needs it, so it runs at event time and reads the current value. When a module genuinely has to track a key, subscribe with `Onyx.connectWithoutView()` rather than caching one read.

Hydration is not the reason. `Onyx.get()` resolves only after `Onyx.init()` has hydrated the cache, so a boot-path read is no longer a hazard on that count.

```typescript
// BAD ❌ a snapshot taken at import time, stale from the next write onwards
let preferredLocale;
Onyx.get(ONYXKEYS.NVP_PREFERRED_LOCALE).then((locale) => { preferredLocale = locale; });

// GOOD ✅ read where it is used
async function applyPreferredLocale() {
  setLocale((await Onyx.get(ONYXKEYS.NVP_PREFERRED_LOCALE)) ?? CONST.LOCALES.DEFAULT);
}
```

### - Each synchronous stretch MUST do its own reads
One read block per synchronous stretch, not per function. Code after an `await`, a `runAfterTransitions` or any other deferral runs in a later tick and is meant to see the writes the earlier stretch made, so hoisting a read above the deferral hands it a value that is one tick stale. The ordering rule above is satisfied here, so nothing flags it; cover it with a test that asserts the post-write value.

### - A subscription with a `selector` MUST have that selector reapplied at the read site
`useOnyx(key, {selector})` hands the component a projection of the stored value. `Onyx.get()` returns the stored value itself. Copying the key across and dropping the selector changes the shape silently: it compiles, and the difference only surfaces where the value is used. Call the same selector on the result, or keep the subscription.

```typescript
// BAD ❌ a boolean becomes the whole NVP object
const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
const isSelfTourViewed = await Onyx.get(ONYXKEYS.NVP_ONBOARDING);

// GOOD ✅
const isSelfTourViewed = hasSeenTourSelector(await Onyx.get(ONYXKEYS.NVP_ONBOARDING));
```

### - The result of `Onyx.get()` MUST NOT be mutated
A single-key read resolves to the cached object itself, not a copy, so assigning to a property of the result writes the cache with no subscriber told. A collection resolves frozen and throws instead, which makes the single-key case the silent one. This bites hardest when a function is converted off a parameter it used to be free to mutate.

```typescript
// BAD ❌ writes straight into the cache
const report = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
report.reportName ??= CONST.REPORT.DEFAULT_NAME;

// GOOD ✅
const report = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
const named = {...report, reportName: report?.reportName ?? CONST.REPORT.DEFAULT_NAME};
```

### - The Search snapshot keys MUST stay on `useOnyx`
`@hooks/useOnyx` is not the library hook. Inside a `SearchScopeProvider` subtree it rewrites the key: for the keys in `CONST.SEARCH.SNAPSHOT_ONYX_KEYS` it subscribes to `snapshot_<hash>` and extracts the requested key out of that blob. `Onyx.get()` always reads the global key, so a conversion on one of them would silently swap snapshot data for live data.

Nothing here is left to judgment. `rulesdir/no-unsafe-onyx-read` fails the build on these keys. A key it cannot resolve statically is an error too, so routing one in through a variable or a helper does not get past it. There is no provider tree to walk: the keys are simply off limits, whichever subtree the read sits in.

```typescript
// BAD ❌ lint error: report_ is redirected to a Search snapshot
const report = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

// BAD ❌ lint error: the key cannot be resolved, so it cannot be cleared
const report = await Onyx.get(buildReportKey(reportID));
```

The rule reads `CONST.SEARCH.SNAPSHOT_ONYX_KEYS` and `src/ONYXKEYS.ts` and derives the banned access paths itself, so the two cannot drift apart. If a key genuinely cannot be written statically, disable the rule on the line and say in the comment why that key can never be a Search snapshot key. If the snapshot redesign ever makes these keys pointer-based, the ban can be lifted in one place.

### - A subscription that exists to trigger work MUST NOT be replaced with `Onyx.get()`
Ask what each subscription is for. A **source** supplies a value the code reads. A **trigger** schedules work when the key changes, and the value it carries is incidental. Converting a trigger makes the dependency stable and the effect stops re-running. No position check catches it, because nothing renders the value and nothing reads it during render. What does catch the two plainest shapes is the diff itself: a `useOnyx` deleted while a read of the same key appears inside an effect body, and a `useOnyx` deleted along with the variable's name in a dependency array. Anything longer than one hop stays manual. The chain hides easily: a value feeding a `useCallback` that feeds another `useCallback` that reaches an effect's dependency array is still a trigger, and a wrapper such as `useDebounce(useCallback(fn, deps))` swallows a link.

```typescript
// BAD ❌ deleting this subscription freezes the effect
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${id}`);
const build = useCallback(() => compute(report), [report]);
useEffect(() => {
  build();
}, [build]); // the subscription is what re-runs this
```

### - Converting a value the user acted on REQUIRES a deliberate decision
Conversion changes when a value is sampled, from the caller's last render to the moment the handler runs. That only breaks something when the value was **on screen** in the view the handler belongs to: a dialog confirming an amount MUST act on the amount it displayed. An invisible input to a decision, such as a route, an eligibility check or a request field, is not this case, and event time is usually the more correct reading for it, so "a handler reads Onyx" is not a problem on its own. State which of the two a value is. QA cannot settle it, because the window is one render commit wide.

## Onyx Derived Values

Derived values are special Onyx keys which contain values derived from other Onyx values. These are available as a performance optimization, so that if the result of a common computation of Onyx values is needed in many places across the app, the computation can be done only as needed in a centralized location, and then shared across the app. Once created, Onyx derived values are stored and consumed just like any other Onyx value.

### - Derived values SHOULD be used for complex computations across multiple components
When multiple components need the same computed value from one or more Onyx keys, and:
- The computation is expensive (e.g., filtering large arrays, complex object transformations)
- The result needs to be cached and shared to avoid redundant calculations
- The computation appears in frequently rendered components
- Profiling shows the same calculation being done repeatedly

### - Derived values SHOULD be used for data aggregation and transformation
When you need to:
- Combine data from multiple Onyx keys into a single, normalized structure
- The transformation logic is complex and reusable
- The derived data structure is used in multiple places
- The value depends on multiple pieces of state that can change independently

### - Derived values SHOULD NOT be used for simple or component-specific logic
Avoid derived values when:
- The computation is trivial (e.g., simple string manipulation, basic math)
- The value is only used in one component
- The computation is specific to a single component's UI state
- The logic involves component-local state
- The computed value is only needed temporarily
- The computation depends on non-Onyx values

### - New derived values MUST follow the proper creation process
1. Add the new Onyx key to `ONYXKEYS.ts` in the `ONYXKEYS.DERIVED` object
2. Declare the type for the derived value in `ONYXKEYS.ts` in the `OnyxDerivedValuesMapping` type
3. Add the derived value config to `ONYX_DERIVED_VALUES` in `src/libs/OnyxDerived.ts`

A derived value config MUST include:
1. The Onyx key for the derived value
2. An array of Onyx key dependencies (which can be any keys, including other derived values)
3. A `compute` function that takes an array of Onyx values for the dependencies and returns a derived value matching the declared type

### - Derived value computations MUST be pure and predictable
```typescript
// GOOD ✅
compute: ([reports, personalDetails]) => {
  // Pure function, only depends on input
  return reports.map(report => ({
    ...report,
    authorName: personalDetails[report.authorID]?.displayName
  }));
}

// BAD ❌
compute: ([reports]) => {
  // Don't use external state or cause side effects
  const currentUser = getCurrentUser(); // External dependency!
  sendAnalytics('computation-done'); // Side effect!
  return reports;
}
```

### - Derived value computations SHOULD handle edge cases properly
```typescript
// GOOD ✅
compute: ([reports, personalDetails]: [Report[], PersonalDetails]): DerivedType => {
  if (!reports?.length || !personalDetails) {
    return { items: [], count: 0 };
  }
  // Rest of computation...
}

// BAD ❌
compute: ([reports, personalDetails]) => {
  // Missing type safety and edge cases
  return reports.map(report => personalDetails[report.id]);
}
```

### - Derived values SHOULD be well-documented
- Explain the purpose and dependencies
- Document any special cases or performance considerations
- Include type annotations for better developer experience

### - Recompute rate is monitored in production
Every derived value flush passes through `detectOnyxDerivedLoop` (`src/libs/telemetry/detectOnyxDerivedLoop.ts`). If one derived key recomputes more than `RECOMPUTE_THRESHOLD` times inside `WINDOW_MS`, it reports `[OnyxDerived] recompute loop detected for <key>` once per key per session to Sentry (fingerprinted `['onyx-derived-loop', <key>]`) and to the server log, with a per-dependency count showing which dependency is driving the churn. Recomputes during app startup are ignored, since dependencies legitimately hydrate in bursts.

If your derived value trips it, look at the dependency counts to find which dependency recomputed the most. There are two common causes: the derived value depends on a key that updates much more often than it needs, or it depends on another derived value that in turn depends back on it.

## Onyx State Export

Users can export their Onyx state from **Settings → Troubleshoot → Export Onyx state** (used mainly to attach state to bug reports). Because Onyx holds sensitive data (credentials, tokens, banking data, personal details), the export is passed through `maskOnyxState` (`src/libs/ExportOnyxState/common.ts`) which removes or masks fragile data before it ever leaves the device.

### - There are two ways the export masks data
The buckets below make more sense once you know how the two masking treatments differ.

**`maskFragileData` masks only what it recognizes.** It walks through a value and:
- Replaces fields whose *name* it knows (`firstName`, `lastName`, `phoneNumber`, `addressStreet`, `accountNumber`, `routingNumber`, `cardNumber`, `validateCode`, `source`, `name`, and others in `keysToMask`) with a random string of the same length.
- Swaps email addresses for fake ones, whether they appear as a value, as an object key, or inside a longer string.
- Randomizes amount fields like `amount` and `total`, and replaces report action `text` and `html` with `***`.
- Leaves everything else exactly as it was.

That last point matters. If a secret is stored under a field name it doesn't know about, it gets exported in cleartext. `MAPBOX_ACCESS_TOKEN` is the example: its secret lives in a field called `token`, which isn't in `keysToMask`, so it has to be removed instead.

**An export rule masks everything you don't ask to keep.** A rule lists an `allowList` of fields to keep and a `maskList` of fields to replace with a random string of the same length. Fields in neither list still get handled: objects are walked, numbers are randomized, dates become today's date, strings are masked, and anything else becomes `***`. Forgetting about a field means it gets masked rather than exported.

In short, write a rule when you can't be sure what every field holds, and use `maskFragileData` when you can.

### - Every Onyx key MUST be deliberately categorized for export
A key holding credentials and a key holding a boolean flag both need a decision made about them, and there's no default that's safe for both. So every top-level and `COLLECTION.*` key in `ONYXKEYS` goes into exactly one of four buckets in `src/libs/ExportOnyxState/common.ts`.

**1. `onyxKeysToRemove` — dropped from the export.**
This is the most sensitive data that belongs to a user, so use this bucket for anything that might cause a security concern if it was leaked: credentials, access tokens and third-party secrets like the push notification ID, Stripe customer ID, Plaid and merge-HR link tokens, Onfido token and applicant ID, and the Mapbox access token. It's also the right choice when a value is a secret that neither masking treatment would catch. All `DERIVED` keys live here too, since they're recomputed from other keys and add nothing to a bug report.

**2. `ONYX_KEY_EXPORT_RULES` — keep some fields, mask the rest.**
Use this when a key holds a mix of PII and fields that are genuinely useful for debugging, like `SESSION` (where `accountID` is kept and the auth token is masked), `ACCOUNT`, `COLLECTION.REPORT`, `COLLECTION.TRANSACTION`, `USER_WALLET` and `CARD_LIST`. It's also the safer choice for a large or growing object, because a field added later gets masked on its own instead of quietly ending up in the export.

**3. `safeOnyxKeys` — exported as-is.**
Only use this when you're sure the value holds nothing personal: booleans, loading states, feature flags, enums, numeric IDs, timestamps and config values. Nothing is masked here, so one sensitive field anywhere in the value ends up in the export. If the value is a free-form string, or an object that's likely to grow, pick a different bucket.

**4. `onyxKeysToMaskFragileData` — handled by `maskFragileData`.**
Use this for everyday user data whose sensitive fields are ones `maskFragileData` already knows by name, such as personal details, drafts, report actions and policy data. Don't use it for a key holding a secret under a field name it won't recognize, as that belongs in `onyxKeysToRemove` or needs its own rule. When you're not sure every sensitive field is covered, write a rule.

### - When adding a new Onyx key you MUST place it in one of the four buckets
The coverage test in `tests/unit/ExportOnyxStateTest.ts` fails when a key exists in `ONYXKEYS` but isn't in any bucket, so a new key can't quietly pick up a default. Whoever adds it has to decide whether it should be masked.

Keep in mind that nothing reads `onyxKeysToMaskFragileData` at runtime, and adding a key to it doesn't mask anything by itself. It's written out by hand so the coverage test can tell the difference between a key that's meant to fall through to `maskFragileData` and one nobody has categorized yet.

### - Deciding a key is safe is a judgment call
A key in `safeOnyxKeys` is exported with no masking, so it MUST NOT hold credentials, tokens, banking data or personal details. No test can check this for you, because nothing in the test suite knows what fields a key actually holds, which makes it a decision someone has to make by reading the type. The `knownSensitiveKeys` denylist test covers the keys we already know are sensitive, and fails if one of them is ever moved into `safeOnyxKeys`.
