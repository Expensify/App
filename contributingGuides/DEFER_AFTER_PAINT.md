# Defer after paint

When an interaction navigates (submit an expense, open a report, switch a tab), the user waits for one thing: the destination on screen. Everything the destination does not need for that first frame should run after the navigation or modal transition ends, not during it. Work that lands mid-transition competes with the animation for the JS thread and shows up as dropped frames, a gap before the destination appears, or a flash of the previous page.

The App has a small set of primitives for this, all built on the same "transition finished" signal from `TransitionTracker`. Pick one from the table below instead of building a new mechanism. If none fits, extend the closest one rather than adding a parallel one.

## Pick a primitive

| Shape of the problem | Use | Details |
|---|---|---|
| Dismissing an RHP should show a fullscreen screen other than the one currently behind it (e.g. submit from Home lands on Spend), and that screen is known when the RHP mounts | `usePreMountDestination` | [NAVIGATION.md](NAVIGATION.md#pre-mounting-a-destination-behind-an-rhp), [PERF-18](../.claude/skills/app-coding-standards/rules/perf-18-use-pre-mount-destination.md) |
| A heavy subtree on a freshly navigated screen is not needed for first paint (dropdowns, secondary actions, heavy `useOnyx` consumers) | `<NavigationDeferredMount>` | [PERFORMANCE.md](PERFORMANCE.md#rendering-of-unnecessary-or-duplicated-child-components), [`NavigationDeferredMount.tsx`](../src/components/NavigationDeferredMount.tsx) |
| An API write whose optimistic data would re-render screens while a transition is still running | `API.writeWhenReady` with a transition barrier | [Deferring writes](#deferring-writes) below |
| One-off imperative work after a navigation, modal or keyboard transition (focus, scroll, a follow-up navigation) | `afterTransition` on `Navigation` methods and `KeyboardUtils.dismiss`, `waitForTransition` on `Navigation`, or `TransitionTracker.runAfterTransitions` | [INTERACTION_MANAGER.md](INTERACTION_MANAGER.md#when-to-use-runaftertransitions-directly) |

The first two decide **what mounts when**. The last two decide **when work runs**. A single flow often combines them: the submit-expense flow pre-mounts the destination, reveals it, and only then applies the optimistic write through a barrier (see `SubmitExpenseOrchestrator.tsx`).

## Deferring writes

`API.writeWhenReady` works like `API.write`, but the optimistic update and the request both wait until a barrier settles, or until a safety timeout passes. After that, it runs the normal `write()` pipeline.

```ts
// Default barrier: waits for an in-flight navigation to end, or for the next transition of any kind to start and end.
API.writeWhenReady(WRITE_COMMANDS.SOME_COMMAND, params, onyxData);

// Only the start of a screen transition (or the ~1 s start timeout) releases the wait, so a keyboard or modal animation can't release it early.
API.writeWhenReady(WRITE_COMMANDS.SOME_COMMAND, params, onyxData, API.createTransitionBarrier('navigation'));
```

If the write is built right after the navigation starts, the default barrier is enough. If it is built at an unknown time relative to the navigation (after an `await`, a GPS lookup, or deep inside an action), a barrier attached that late can miss the transition. It then waits for the next one, which can be an unrelated keyboard or modal animation, or gives up after the start timeout (about 1 s). Arm the barrier with `API.armTransitionBarrier()` when the navigation is triggered, and pass it once the write exists. One armed barrier can gate several writes from the same interaction. Call `cancel()` if the write never happens.

```ts
const armed = API.armTransitionBarrier();
Navigation.dismissModal();
const location = await getCurrentLocation(); // placeholder: may finish before or after the dismiss transition ends
API.writeWhenReady(WRITE_COMMANDS.SOME_COMMAND, {...params, location}, onyxData, armed.barrier);
```

A barrier is any `(signal: AbortSignal) => PromiseLike<unknown>`, so a flow can wait on something other than a transition, for example Search's content layout in the submit flow. `resolveWriteBarrier` and `markBarrierAsImmediate` in `src/libs/actions/IOU` are internal to the IOU submit flow, not a general API.

**Do not use `writeWhenReady` when:**

- **The write is conditional.** A barrier decides _when_ the write happens, never _whether_. A rejected barrier still releases the write. Decide whether to write before calling it.
- **The write needs a `conflictResolver`.** A deferred request is not in the sequential queue until it executes, so conflict resolution can't see it.
- **Order matters across calls.** Two `writeWhenReady` calls can run in either order, because each waits on its own barrier. A plain `API.write` called after a `writeWhenReady` reaches the queue first, because `API.write` doesn't wait.
- **The barrier waits on a READ, without `{shouldClaimReadGate: false}`.** READs wait for pending deferred writes by default, so the READ waits for the write and the write waits for the READ until the safety timeout. Never let a barrier wait on a READ without passing that option (in the options object, the fifth argument of `writeWhenReady`).
- **Losing the write would be hard to recover from.** Pending writes are flushed when the app goes inactive or to the background, but a hard kill or crash loses them. Only defer writes the user can simply redo.

## Rejected alternatives

These were tried or proposed. Do not reintroduce them:

- **Inline deferral in screen components** (`useState` flags plus a `useFocusEffect` flush, `setTimeout` with a guessed delay, `requestAnimationFrame` chains). This spreads flow-specific timing into screens that should not know about it. `ReportScreen` had a `useFocusEffect` flush for one submit case, which was removed when the submit flow moved to write barriers. Use one of the primitives above. Flagged by [PERF-20](../.claude/skills/app-coding-standards/rules/perf-20-no-ad-hoc-deferral.md).
- **`deferredLayoutWrite`**, a channel that held writes until the destination screen flushed them on focus. Every destination screen had to flush it, and it was replaced by `API.writeWhenReady` barriers.
- **`InteractionManager.runAfterInteractions`**. Deprecated, see [INTERACTION_MANAGER.md](INTERACTION_MANAGER.md).
- **Compute-on-open for dropdowns and popovers** (subscribe to data only when the menu opens). It moves the cost to the moment the user taps, which hurts INP and makes the menu feel slow. Defer the mount with `NavigationDeferredMount` instead, so the work runs after the transition but before the tap.
- **A separate `scheduleAfterTransition(fn)` helper.** `TransitionTracker.runAfterTransitions` and the `afterTransition` option on `Navigation` already cover imperative call sites.

## Telemetry

Deferring work changes what "done" means, so a span has to pick which moment it measures:

- **Perceived ready**: the destination is on screen, even if parts of it are placeholders. This is what the user waits for and what navigation spans should end on. `ManualSubmitToDestinationVisible` ends when the destination is on screen, for example when the report gains focus or the deferred Search skeleton lays out ([OBSERVABILITY_METRICS.md](OBSERVABILITY_METRICS.md#submit-expense-to-destination-visible)).
- **Fully mounted**: the deferred content is in. If this matters, measure it with a separate span instead of moving the end of the perceived-ready one. `Navigate to Reports Tab` has separate First Paint and Content Load spans for this reason.
- **INP**: deferred work still runs on the JS thread. If it lands while the user is interacting, it shows up as slow input instead of a slow navigation. Keep deferred renders in `startTransition`, which `NavigationDeferredMount` already does, so React can yield to input.

Things to watch for:

- **A pre-mounted destination has already laid out before the user submits.** A layout-only end trigger has nothing to fire on at reveal, so pair it with focus. `useSubmitToDestinationVisible` accepts `[FOCUS, LAYOUT]` for this.
- **A deferred write lands after the destination is visible.** If a span should include the optimistic data appearing, end it from the component that renders that data, not on focus.
- **Record which path ran.** The submit flow sets the `fast_path_handler` span attribute with `setFastPath`, so a regression can be traced to one path instead of looking like noise across all of them.
