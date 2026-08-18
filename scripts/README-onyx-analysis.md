# Onyx subscription analysis tooling

Three scripts behind the figures in the `Onyx.get()` proposal. They answer three different
questions and are independent of each other.

| Script | Question it answers |
| --- | --- |
| `analyzeOnyxSubscriptions.ts` | Which `useOnyx` bindings are never read during render, and which `Onyx.connect`/`connectWithoutView` callbacks are nothing but module-level caches |
| `instrumentOnyxCounters.mjs` | What Onyx actually notified during a recorded interaction, and when |
| `renderCensus.mjs` | How many renders in a session are components re-rendering for Onyx data they never display |

Nothing here is wired into CI. They are analysis tools, run on demand.

## analyzeOnyxSubscriptions.ts

```bash
bun scripts/analyzeOnyxSubscriptions.ts                       # summary + candidate tiers
bun scripts/analyzeOnyxSubscriptions.ts --connect             # Onyx.connect vs connectWithoutView
bun scripts/analyzeOnyxSubscriptions.ts --provenance <sha>    # migrated legacy vs net-new
bun scripts/analyzeOnyxSubscriptions.ts --json                # per-binding data, feeds renderCensus
bun scripts/analyzeOnyxSubscriptions.ts --file <path>         # one file, per-binding verdict
bun scripts/analyzeOnyxSubscriptions.ts --src /other/App/src  # analyse a different checkout
```

Purely syntactic — each file is parsed alone, with no type-checker. References resolve by name
within the declaring function rather than through the symbol table, so a shadowed name is
over-counted as a reference. That biases a binding toward `render`, which is the safe direction:
**the non-render set is a lower bound.**

**Run `--provenance` from the repo root, without `--src`.** It compares a `git ls-tree` of the
baseline against the current working tree, and git returns repo-relative paths. An absolute
`--src` silently reports 100% net-new because nothing matches.

A binding counts as *non-render* when no reference to it is reachable during render: every
reference sits behind a function boundary that is not a `useMemo` callback, and none appears in
JSX. IIFEs and synchronous array callbacks (`map`, `filter`, `reduce`, …) are treated as
transparent, because they run where they are written — an earlier version got this wrong and
mis-classified 99 bindings as non-render.

## instrumentOnyxCounters.mjs

Installs notification counters and a timeline into the installed copy of `react-native-onyx`.

```bash
node scripts/instrumentOnyxCounters.mjs .              # install
node scripts/instrumentOnyxCounters.mjs --status .     # check
node scripts/instrumentOnyxCounters.mjs --uninstall .  # remove, byte-for-byte
```

Then restart the dev server — the bundler caches `node_modules`, so a running server serves the
uninstrumented build. On load the console prints `[onyxStats] installed`. In the app:

```js
__onyxStats.reset()      // immediately after clicking Record in the profiler
__onyxStats.timeline()   // every notification in fire order, ms since reset
__onyxStats.gaps()       // pauses >= 100ms, where a separate React commit becomes likely
__onyxStats.json()       // blob for offline comparison
```

**Edits `node_modules` in place.** Uninstall before regenerating any Onyx patch, or the counters
get baked into it. Hooks attach only at the top of `keyChanged` and `keysChanged`, whose
signatures are identical in patched and unpatched builds, so the same instrumentation applies to
both sides of an A/B and cannot introduce a difference of its own.

**Reset immediately after starting the profiler.** React's timestamps start at profiling start and
`__onyxStats` starts at `reset()`; if they are seconds apart, matching a notification to the commit
it caused becomes guesswork.

## renderCensus.mjs

```bash
bun scripts/analyzeOnyxSubscriptions.ts --json > /tmp/analysis.json
node scripts/renderCensus.mjs --classifier /tmp/analysis.json <profile.json>
```

Takes a React DevTools profile export and counts renders that are provably wasted: a hooks-only
render of a file where *every* `useOnyx` binding is non-render. Requires **"Record why each
component rendered"** enabled in the profiler, otherwise there is nothing to attribute.

Deliberately a lower bound. Mixed files are excluded rather than guessed at, because
`changeDescriptions` reports hook indices across all hooks and custom-hook flattening makes
index-to-binding mapping unreliable. Hook files are excluded too, since a hook's subscriptions
surface under whichever component called it.

Two things it has to do that are easy to miss: `snapshots` holds only the tree as it stood when
recording began, so components mounted later are read out of the `operations` log instead
(skipping this drops name resolution to ~26%), and React Compiler wraps display names as
`Forget(X)`, which are unwrapped before matching.
