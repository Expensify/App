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
