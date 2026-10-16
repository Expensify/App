---
ruleId: ONYX-1
title: Keep Onyx reads off the render path and out of a written tick
---

## [ONYX-1] Keep Onyx reads off the render path and out of a written tick

### Reasoning

`await Onyx.get()` reads a key once and never subscribes. `Onyx.multiGet()` does the same for each key in an array, so everything below about `Onyx.get` applies to it too. `no-unsafe-onyx-read` catches most misuse, so this rule covers only what lint can't see.

Do not re-check these:

| Enforced | By |
|---|---|
| `Onyx.get` or `Onyx.multiGet` outside `src/components`, `src/pages`, `src/hooks` and `tests` | `no-unsafe-onyx-read` |
| A read written in a component or hook body (including `memo` and `forwardRef` wrappers and any function with a top-level `return <JSX>`), in a JSX expression, in a `useMemo` callback, a `selector`, a lazy initializer or a `useSyncExternalStore` snapshot, in a same-file function passed by name to a `useMemo`, `useState`, `useReducer` or `useSyncExternalStore` slot, to `memo` or `forwardRef`, or to a `selector`, or at module scope. Not a same-file helper that render calls, see A | `no-unsafe-onyx-read` |
| A read inside an effect, or in a same-file function an effect calls | `no-unsafe-onyx-read` |
| A Search snapshot key, or a key lint can't resolve, including any `multiGet` element | `no-onyx-get-snapshot-key` |
| A runtime import of `react-native-onyx/dist/OnyxUtils` | `@typescript-eslint/no-restricted-imports` |
| An inline `eslint-disable` that covers `no-unsafe-onyx-read`, named or blanket, or one over a runtime OnyxUtils import | `scripts/checkOnyxLintBypass.ts` |
| An `eslint-disable` of `no-onyx-get-snapshot-key` with no reason after `--`, or in block form | `scripts/checkOnyxLintDisableReason.ts` |
| A missing `await` whose value is then used | `tsc` |

A disable of `no-onyx-get-snapshot-key` is allowed with a reason, and the script only checks that one exists. Judge its content under E1. The key `${ONYXKEYS.COLLECTION.REPORT}${id}`, inline or through a const, passes `no-onyx-get-snapshot-key` without a disable when `id` is a same-file `const` bound to `ONYXKEYS.CONCIERGE_REPORT_ID` by `await Onyx.get(...)`, `const [id] = useOnyx(...)` with no `selector`, or the matching slot of `Onyx.multiGet(...)`. That read needs no E1 review, and A through D still apply to it.

What's left crosses a file boundary, depends on write ordering, only shows in the diff, or happens after the read.

Mutating a read result writes the cache, since the value is the cached object. `useOnyx` hands out the same object, so this stays a documented convention and isn't flagged here.

**A. Position.** Render reaches a read wherever it's written. Lint counts a function as a render body when it's named like a component or hook, has a top-level `return <JSX>`, is wrapped in `memo` or `forwardRef`, or is passed to a `useMemo`, `useState`, `useReducer` or `useSyncExternalStore` slot or a `selector` option, inline or by name. It misses a helper that a component or hook calls from render. This holds even in the same file. It also misses a helper that returns JSX from inside an `if` or `switch`, and a function passed to a child that calls it during render. When one of these helpers is `async`, `tsc` catches it only where the Promise lands in a slot typed `ReactElement`, such as `renderItem`; a JSX child or a `render*` prop typed `ReactNode` accepts a Promise, so check for a type error before relying on it.

**B. Tick.** Awaiting a read doesn't wait for an earlier write. `Onyx.get` captures the cached value when it's called, and `merge` and `update` apply to the cache later, so a read queued behind them sees the old value. `set` lands at once today, but don't rely on it: await the write, or read first. A derived key (`ONYXKEYS.DERIVED.*`) is recomputed on a microtask after its source changes, so a read in the same synchronous stretch returns the old derived value, even after a `set` that already updated the source. Read a derived key only before writing its sources.

**C. Effect in another file.** Lint bans a read inside an effect, but only within one file. A handler that reads can still end up in an effect when it's passed to a child or hook that calls it from `useEffect`, `useLayoutEffect` or `useFocusEffect`. A receiver that only registers the handler for an event (an `on*` prop, `addEventListener`, `useKeyboardShortcut`) is fine, even if the handler sits in that effect's dependency array.

**D. Output.** A read value that reaches the screen later, through state, a ref or a module variable a component renders, stays frozen at the moment of the read. Flag it when the screen presents it as the current value.

### Incorrect

**A1. A hook calls a reading helper from render.**

```ts
// src/hooks/useCurrentUserEmail.ts
async function getCurrentUserEmail() {
    return (await Onyx.get(ONYXKEYS.SESSION))?.email; // fine on its own
}

function useCurrentUserEmail() {
    return getCurrentUserEmail(); // render gets a Promise, and tsc accepts it
}
```

**A2. A render body lint doesn't recognize.**

```tsx
// Every return is JSX, but inside a switch, so lint sees no render body.
async function renderTagBadge(policyID: string) {
    const tags = await Onyx.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    switch (Object.keys(tags ?? {}).length) {
        case 0:
            return null;
        default:
            return <Badge />;
    }
}

<FlatList renderItem={({item}) => renderTagBadge(item.policyID)} />;
```

**B. A read right after a write.**

```tsx
const onSave = async () => {
    Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
    const account = await Onyx.get(ONYXKEYS.ACCOUNT); // isLoading is still the old value
};
```

**C. A child calls the handler from an effect.**

```tsx
// src/pages/ContactsPage.tsx
function ContactsPage() {
    const importContacts = async () => saveContacts(await Onyx.get(ONYXKEYS.COUNTRY_CODE));
    return <ContactsList onReady={importContacts} />;
}

// src/components/ContactsList.tsx
function ContactsList({onReady}: Props) {
    useEffect(() => {
        onReady(); // the read now runs inside this effect, and lint only checks one file
    }, [onReady]);
}
```

**D. A value shown as current, captured at a tap.**

```tsx
function CurrentTheme() {
    const [theme, setTheme] = useState<string>();
    const onPress = async () => setTheme(await Onyx.get(ONYXKEYS.PREFERRED_THEME));

    // Change the theme in Settings and this still shows the old one.
    return <Text onPress={onPress}>Current theme: {theme}</Text>;
}
```

### Correct

```tsx
// A: the hook subscribes.
function useCurrentUserEmail() {
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    return email;
}

// B: await the write, or read before it.
const onSave = async () => {
    await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
    const account = await Onyx.get(ONYXKEYS.ACCOUNT);
};

// B, derived: read the derived key before writing its source.
const onCloseCard = async (cardID: string) => {
    const cards = await Onyx.get(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
    Onyx.merge(ONYXKEYS.CARD_LIST, {[cardID]: {state: CONST.EXPENSIFY_CARD.STATE.CLOSED}});
};

// C: keep the subscription in the parent and pass the value down.
const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE);
return <ContactsList onReady={() => saveContacts(countryCode)} />;

// D: anything shown as current stays on useOnyx.
const [theme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
return <Text>Current theme: {theme}</Text>;
```

---

### Review Metadata

#### A. Position

- A1. The diff adds a read to a function that some caller reaches from render: a component or hook body, a `useMemo` callback, a `useOnyx` selector, a lazy initializer, an IIFE or array callback in the body, or a local function the body calls. Grep `src/` for the function's name, ignoring imports. A plain-function caller isn't a verdict, so repeat on its name. When the render-side call is in the diff, comment on that call and name the read; otherwise comment on the read and name the calling file and line. A3 covers a new call whose value is discarded; A1 covers every other render-reached read.
- A2. The function holding the read returns JSX from any branch, or is passed as `renderItem`, `ListHeaderComponent`, or any `render*` or `*Component` prop. Flag the read.
- A3. The diff adds a call at a render position in a component or hook, the call's value is discarded or the callee returns `void`, and the callee's file contains `Onyx.get` or `Onyx.multiGet`. Comment on the call.
- A4. The diff passes a function that reads, or whose file contains `Onyx.get` or `Onyx.multiGet`, as a prop, and the receiver calls that prop from render. Open the receiver's file and Grep the prop's name followed by `(`; follow forwarded props. If the receiver can't be resolved (a spread, or a component held in a variable), ask the author to confirm nothing calls it during render.

#### B. Tick

- B1. A write that isn't awaited is followed in the same tick by a read of the written key, a member of the written collection, or a `DERIVED` key built from either (see `dependencies` in `src/libs/actions/OnyxDerived/configs/`). The read can be direct or in a called function whose file contains it. Repeat on any plain function it calls. Comment on the write, naming the callee and the key.
- B2. The diff adds a read to a function whose callers write that key before calling it in the same tick.

#### C. Effect in another file

- C1. The diff passes a function that reads, or whose file contains `Onyx.get` or `Onyx.multiGet`, to another component or hook, or turns a function already passed that way into one that reads. Open the receiver, Grep the prop's name followed by `(`, and flag when a call sits inside a `useEffect`, `useLayoutEffect` or `useFocusEffect` callback, directly or through a local function. Follow forwarded props. The prop's name never matters here: an `onReady` the receiver calls from an effect is a finding. Comment on the prop, naming the receiver's effect.

#### D. Output

- D1. The read's value goes to a `useState` setter, a `useRef`, or a module variable, a render position in the same file reads it, and the screen presents it as the current value. Comment on the read.

#### E. Reason

- E1. The diff adds or edits an `eslint-disable` of `no-onyx-get-snapshot-key`. The text after `--` has to say why that key never went through the `useOnyx` snapshot redirection: it replaces a module-level `Onyx.connect()` used only by handlers, or the value is never read inside a Search scope. Flag a reason that restates the rule, says live data is wanted without saying why the snapshot was never involved, or names a different key than the one read. Comment on the directive.

**DO NOT flag if:**

- The read sits in an event handler or `useCallback` body that render doesn't invoke, and the reading function isn't exported, isn't a render body by A2, and isn't passed as a render callback
- The prop holding the reader is named `on*` or `handle*`, and every receiver attaches it to an event or calls it from a handler. A receiver that calls it from an effect is C1 regardless of the name
- The value only reaches a handler argument or a request field and is never rendered
- The receiver only registers the handler for an event (an `on*` prop, `addEventListener`, `useKeyboardShortcut`), even if the handler is in an effect's dependency array
- The removed `useOnyx` value appears nowhere in the diff except the converted call's arguments
- The value is meant as a snapshot of the event, and nothing downstream expects it to update
- The write is awaited, or the read runs in its `.then`, and the read key isn't derived from the written one
- (B only) The read sits in a deliberate deferral: a `.then`, a timer, `runAfterTransitions`, `runAfterInteractions`, or a callback passed to an async API. Don't suggest hoisting it above the deferral, since that pins the value to the moment before the wait. A `.then` chained on the read itself is not a deferral, and a deferral never excuses an A, C or D finding
- The write and the read are in exclusive branches, or the write's branch returns first
- The keys differ and the read key isn't derived from the written one

**Search Patterns** (hints for reviewers):

- `Onyx.get(`, `Onyx.multiGet(`
- `Onyx.merge(`, `Onyx.update(`, `Onyx.set(`, `Onyx.mergeCollection(`
- `ONYXKEYS.DERIVED`
- removed `useOnyx(` lines in the diff, then that variable's name in the rest of the diff
- `useEffect(`, `useLayoutEffect(`, `useFocusEffect(`, `useRef(`, `useState(`
- `runAfterTransitions`, `runAfterInteractions`, `.then(`, `setTimeout(` around a read that follows a write
