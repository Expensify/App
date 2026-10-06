# React `<Activity>` screens

A covered screen (one below the top of a stack navigator) can opt into being wrapped in React `<Activity>` by setting the `nonTopScreenBehavior: 'activity'` navigation option. `ScreenActivityWrapper` then deprioritizes its rendering while it is covered. The other behaviors are `'freeze'` (react-freeze, the previous default) and `'none'`. Migration is a per-screen decision tracked in the [rollout issue](https://github.com/Expensify/App/issues/98254).

## The lifecycle model (read this before opting a screen in)

In this wrapper, `AlwaysPaintedView` keeps the screen painted in both Activity modes. Its lifecycle still changes:

- **On hide**: React runs the cleanup of every effect in the subtree and detaches element refs, but state, ref values, and the fiber tree survive.
- **While hidden**: the screen keeps re-rendering at background priority, but effects do not run, so torn-down subscriptions stay down and events fired in this window are lost.
- **On reveal**: every effect runs again from scratch with the preserved state, and refs reattach.

The mental model: **hide + reveal = full effect unmount + remount with surviving state**. Every effect on an Activity screen must tolerate being cleaned up and re-run any number of times with unchanged dependencies. This is the same cycle StrictMode's dev-only double effect mount exercises, which is why `ScreenActivityWrapper` wraps opted-in screens in `StrictMode` in dev (see [STRICT_MODE.md](STRICT_MODE.md#strictmode-on-screens-that-opt-into-react-activity)). A screen that misbehaves under StrictMode will misbehave under Activity.

## What the wrapper already handles

`ScreenActivityWrapper` (in `src/libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/`) takes care of:

- A screen that mounts while already covered renders its first frame as visible.
- The reveal waits for the navigation transition to end, so it does not block the animation.
- During a window resize, the screen stays in visible mode to recalculate its layout.
- While covered, the content stays painted but is inert to touch and accessibility.

## Effects that must survive a cover

`useScreenActivityEffect` is a passive-effect escape hatch for work that must remain set up while an Activity screen is covered. It keeps the existing setup through a hide/reveal cycle, but still runs its cleanup when the dependencies change and when the component is removed, which includes the screen leaving the navigation stack. It pairs an insertion effect, which React runs for a mount, a dependency change and a removal only, with the passive effect that does the work: the insertion effect records whether the component is mounted and whether a setup is pending, and the passive effect, which may set state and read refs, acts on that. Behind a cover no passive effect runs, so the hook decides right after the commit whether an insertion cleanup was a removal, which mounted nothing again, or a dependency change, which the reveal settles, and releases a component removed while hidden itself; the `react-native` patch `044` makes that cleanup run inside a hidden subtree on native, as `react-dom` already does, and `tests/unit/InsertionEffectCleanupFabricPatchTest.ts` fails when a Fabric bundle lacks it. The hook answers to no screen: an `<Activity>` the screen renders itself, a `<Suspense>` fallback and the cover of the screen hide its subtree the same way, and the setup survives each of them.

It does not make the hidden subtree live: other effects and `useOnyx` subscriptions remain disconnected, and element refs remain detached. A retained listener must therefore tolerate running while the rest of its component is inactive. It is also not a replacement for `useLayoutEffect`.

A retained setup keeps the values of the render that ran it, because a dependency change behind the cover reaches it only on the reveal. A listener that must act on current props or state should read them through `useEffectEvent`, which React updates in a hidden subtree as well, and keep in the dependency list only what decides what the setup subscribes to, such as a report ID. A ref written in `useEffect` or `useLayoutEffect` is no substitute, because neither effect runs while the screen is hidden. The dependency list is required: without one, every render behind the cover would mark the setup stale and the reveal would run it again anyway.

Compared with `useEffect` on a screen that stays live, it has these limits:

- Dependency changes while hidden are deferred and coalesced until the reveal, so the hook cannot observe every intermediate value, and a change that was undone before the reveal still runs the effect once there, because React compares the dependencies render to render. A change that lands in the commit that covers the screen is a change behind the cover as well, because React commits the hide first and the update of the hidden tree after it, so the setup that survives the cover is the one for the old value.
- A component that mounts while its screen is hidden runs its setup only on the reveal, as `useEffect` does, and one removed before the reveal never runs it.
- A component removed while hidden has no passive cleanup for React to run. Its release is queued until the next `useScreenActivityEffect` body runs, on any screen, or a microtask runs after the commit, whichever comes first. This releases an old instance before the hook sets up its replacement, including a replacement in the reveal commit, but a plain `useEffect` setup that React ran earlier in that commit has already run. The cleanup may set state, which an insertion cleanup may not. Queued releases run in the order React reported the removals, which for a deleted tree is from the parent down. Their order relative to ordinary `useEffect` cleanups depends on when React flushes passive effects; a microtask does not guarantee that those effects have already run.
- A reveal that re-runs several call sites runs each body in turn, releasing and setting up one call site before it moves to the next, where a live commit runs every release before any setup. A single-owner resource shared by two call sites of one screen is therefore held twice for a moment on such a reveal; give it one call site.
- A cleanup that throws from a release the hook runs itself, right after a commit or right before the setup of a reveal, is reported with `console.error` and never reaches an error boundary; the setup that follows still runs, and nothing else of the screen is touched. A cleanup or a setup that throws from the passive effect of a visible screen throws through React exactly as with `useEffect`.
- `StrictMode` does not double-invoke the hook: React double-invokes layout and passive effects only, never the insertion effect the hook records its work with, so the setup runs once under the wrapper's own gate and under `USE_REACT_STRICT_MODE_IN_DEV` alike, and the reveal of an `<Activity>` under a `StrictMode` leaves the setup alone. The gate therefore checks the plain effects of a screen only; a cleanup written with the hook gets no rehearsal from it.

## Regressions caused by unsafe effects

Effects that assume "mount happens once" or "cleanup means the user left" cause these classes of bugs:

- **Once-per-mount work re-fires on every reveal**: repeated API fetches, scroll resets, focus or keyboard stealing, analytics events.
- **"When X changes, do Y" effects re-fire on reveal with X unchanged**, discarding user state (selection, drafts).
- **Destructive cleanups fire on hide**: wiping module-level state, cancelling a debounced save without flushing it, or aborting in-flight requests while a surviving "already started" guard blocks the restart.
- **Missed events while hidden**: one-shot events (emitters, DOM events, store transitions that round-trip while hidden) are lost.
- **Timers restart from zero on reveal**; a cleanup that nulls timer state can make a poll loop spin or never resume.
- **Navigation guards** (`beforeRemove`) registered in effects are detached while hidden.
- **Reanimated entering/exiting animations replay on reveal** (web).

The fix is almost always to make the effect idempotent and symmetric, or to key the work on data identity (route params, report ID) instead of mount count.

## Opting a screen in

1. Set `nonTopScreenBehavior: 'activity'` in the screen's options (or a navigator's `screenOptions`). Persistent screens (for example the sidebar on web) are never wrapped.
2. Run the screen in dev and exercise cover/uncover flows (open and close an RHP over it, navigate away and back). The StrictMode gate will surface unsafe effects as double-invocations. Note that StrictMode catches only part of the issues: its double-invocation happens right after mount, so it will not catch cleanups that wipe state the user introduces only later (selection, drafts, in-progress input).
3. Audit the screen's effects against the regression list above, including hooks and components it renders.
