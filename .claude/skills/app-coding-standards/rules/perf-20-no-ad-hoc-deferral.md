---
ruleId: PERF-20
title: Use the shared primitives instead of inline timing to defer work after transitions
---

## [PERF-20] Use the shared primitives instead of inline timing to defer work after transitions

### Reasoning

Work that runs during a navigation, modal or keyboard transition competes with the animation for the JS thread. `TransitionTracker` knows when these transitions start and end: screen push/pop/replace, modal open/close, and keyboard dismiss through `KeyboardUtils.dismiss`. The App has shared primitives built on it:

- `usePreMountDestination` to mount the screen an RHP flow ends on while the RHP is still open
- `<NavigationDeferredMount>` to mount a subtree after tracked transitions settle
- `API.writeWhenReady` to apply an optimistic write after tracked transitions settle
- the `afterTransition` callback option on `Navigation` methods and `KeyboardUtils.dismiss`, `Navigation.runAfterTransition` / `Navigation.runAfterUpcomingTransition`, or `TransitionTracker.runAfterTransitions`, for one-off imperative work

`TransitionTracker.runAfterTransitions({callback})` runs the callback synchronously when no transition is active. When it is called before the transition starts (for example, right after a navigation call), pass `waitForUpcomingTransition` so it waits for that transition, with a timeout if none starts. These primitives normally wait for tracked transitions to settle, with a fallback timeout if none starts. Two of them can also release earlier:

- `KeyboardUtils.dismiss` calls `afterTransition` right away when the keyboard is not visible
- `API.writeWhenReady` runs the write right away when the app goes to the background

Inline timing (a guessed `setTimeout`, `requestAnimationFrame` calls, state flags flushed on focus) guesses when the transition ends instead of knowing it, and every new flow adds another variant. See [DEFER_AFTER_PAINT.md](../../../../contributingGuides/DEFER_AFTER_PAINT.md) for which primitive fits which case, and for when `API.writeWhenReady` is not a safe replacement for `API.write`.

### Incorrect

The names below (`SOME_COMMAND`, `pendingWrite.ts`, `setPendingWrite`, `hasPendingWrite`, `flushPendingWrite`, `clearPendingWrite`, `SomeScreenHeader`, `SecondaryActions`, `doFollowUpWork`, `ActionsSkeleton`) are placeholders, not real App symbols.

```tsx
// Pattern 1: timer or frame callback right after a navigation call
Navigation.dismissModal();
// Wait for the modal close animation before writing
setTimeout(() => {
    API.write(WRITE_COMMANDS.SOME_COMMAND, params, onyxData);
}, 500);
```

```tsx
// Pattern 2: a screen runs another flow's pending work when it gains focus

// pendingWrite.ts
let pendingWrite: (() => void) | undefined;
function setPendingWrite(write: () => void) {
    pendingWrite = write;
}
function hasPendingWrite() {
    return !!pendingWrite;
}
function flushPendingWrite() {
    pendingWrite?.();
}
function clearPendingWrite() {
    pendingWrite = undefined;
}

// Submit flow: queues the write, then navigates to ReportScreen
setPendingWrite(() => API.write(WRITE_COMMANDS.SOME_COMMAND, params, onyxData));
Navigation.dismissModalWithReport({reportID});

// ReportScreen.tsx: runs the queued write on focus, so it doesn't compete with the dismiss animation
useFocusEffect(
    useCallback(() => {
        if (!hasPendingWrite()) {
            return;
        }
        flushPendingWrite();
        clearPendingWrite();
    }, []),
);
```

```tsx
// Pattern 3: a hand-rolled "ready" flag that gates rendering
function SomeScreenHeader() {
    // Render the actions only after the navigation animation, they are expensive
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setIsReady(true));
        return () => cancelAnimationFrame(id);
    }, []);

    return isReady ? <SecondaryActions /> : null;
}
```

### Correct

```tsx
// Pattern 1: the follow-up work runs once the dismiss transition settles
Navigation.dismissModal({afterTransition: () => doFollowUpWork()});

// Or, when the delayed work is a single API.write that can be deferred (see the caveats below)
Navigation.dismissModal();
API.writeWhenReady(WRITE_COMMANDS.SOME_COMMAND, params, onyxData);
```

```tsx
// Pattern 2: the flow that navigates owns the deferral, the destination screen has no flush.
// dismissModalWithReport takes its options as the third argument.
Navigation.dismissModalWithReport({reportID}, undefined, {
    afterTransition: () => API.write(WRITE_COMMANDS.SOME_COMMAND, params, onyxData),
});
```

```tsx
// Pattern 3
<NavigationDeferredMount placeholder={<ActionsSkeleton />}>
    <SecondaryActions />
</NavigationDeferredMount>
```

---

### Review Metadata

**Only flag what the diff shows.** Every condition of a pattern must be visible in the added or changed lines or in the surrounding code shown in the diff. Do not infer behavior from a function's name alone. If a condition can't be confirmed from the diff, do not flag. Missing a case this way is intended: a false positive costs more than a miss.

**Evidence of intent (patterns 1, 2 and 3).** The diff must show that the delay exists to wait for a transition: a comment that names the navigation, modal or keyboard transition being waited for (for example "wait for the modal to close" or "after the navigation animation"), or a delay constant for the screen transition duration (`CONST.ANIMATED_TRANSITION`). A constant for another animation (a tooltip, a toast, a side panel) does not count. An identifier that only contains a word like "modal" or "navigation" (`showNavigationError`, `modalReminderTimeout`) does not count. The navigation call before the timer does not count either. Without this evidence, do not flag.

Flag these patterns in added or changed lines:

1. **Timer or frame after a navigation call.** In the same function body, `setTimeout` or `requestAnimationFrame` is called on a line after one of these calls, and the evidence of intent is visible. The timer must run on the same pass through the function as the navigation call: a guard clause between them (`if (!shouldWrite) { return; }`) or a timer inside an `if` block after the navigation call is fine, but a timer in the other branch of an `if`/`else` from the navigation call, or an `await` between the navigation call and the timer, is not pattern 1. The navigation calls are:
    - `Navigation.navigate`, `Navigation.goBack`, `Navigation.dismissModal`, `Navigation.dismissModalWithReport`, `Navigation.dismissToPreviousRHP`, `Navigation.dismissToSuperWideRHP`, `Navigation.navigateBackToLastSuperWideRHPScreen`, `Navigation.revealRouteBeforeDismissingModal`
    - `KeyboardUtils.dismiss`

    Nested `requestAnimationFrame` calls count. Suggest the `afterTransition` option of that navigation call. It goes in a different argument per method:
    - first argument: `dismissModal({afterTransition})`, `dismissToPreviousRHP({afterTransition})`, `dismissToSuperWideRHP({afterTransition})`, `navigateBackToLastSuperWideRHPScreen({afterTransition})`, `KeyboardUtils.dismiss({afterTransition})`
    - second argument: `navigate(route, {afterTransition})`, `goBack(backToRoute, {afterTransition})`, `revealRouteBeforeDismissingModal(route, {afterTransition})`
    - third argument: `dismissModalWithReport(reportParams, undefined, {afterTransition})`

    Tell the author the fix must keep the old behavior:
    - the navigation call still runs in the same cases as before, and the delayed work keeps the same guards. A guard that sat between the navigation call and the timer must not start skipping the navigation
    - if the timer was cleared somewhere (for example on unmount), keep that with a cancelled flag checked inside the callback, because `afterTransition` has no cancel handle
    - some of the `Navigation` methods above can return early on some paths without calling `afterTransition`, while the old timer always ran. For example: `goBack` at the root of the stack, or when it falls back to resetting to the app root; `revealRouteBeforeDismissingModal` when navigation is not ready; `dismissToPreviousRHP` when there is nothing to dismiss. If the work must still run on those paths, it needs its own path
    - the timing can change. `KeyboardUtils.dismiss` runs `afterTransition` synchronously when the keyboard is already hidden, so the work runs before the next line instead of later. When no transition starts, `afterTransition` waits up to `CONST.MAX_TRANSITION_START_WAIT_MS` (1000 ms), which can be later than the old timer

    Do not flag pattern 1 when the delay is a UI duration that doesn't depend on a transition, such as a tooltip hover delay or how long a toast stays on screen. A tooltip or toast delayed to wait for a navigation, modal or keyboard transition is not exempt. If the purpose is unclear, do not flag.

2. **Pending work flushed on focus.** The evidence of intent is visible, and all of these are visible in the diff:
    - a `useFocusEffect` callback checks a flag or value set outside this component: a module-level variable, or a getter from another file. The diff must show the getter and setter reading and writing the same variable, not just their names
    - when the flag is set, the callback runs an API write, or a flush function whose body in the diff runs queued work
    - the flag is set in the same function as a navigation call, before that call
    - the diff shows that the navigation goes to the screen with the focus callback: the same route or screen constant appears at the navigation call and in that screen, or a comment at the navigation call names that screen. If the diff doesn't show this, do not flag

    Suggest moving the deferred work into the `afterTransition` option of the flow's navigation call.

    Do not flag pattern 2 when the `useFocusEffect` callback only fetches or refreshes data, starts or stops a subscription, or sets focus, or when a comment says the work needs the destination screen itself (its data, its layout, or real focus). If the code that sets the flag is not in the diff, do not flag.

3. **Hand-rolled ready flag gating a render.** The whole component is visible in the diff, the evidence of intent is visible, and:
    - a `useState` boolean starts as `false`
    - it is set to `true` once, from an effect that runs on mount (empty dependency array), inside a `setTimeout`, `requestAnimationFrame`, or `TransitionTracker.runAfterTransitions` callback
    - its setter is not called anywhere else and not passed as a value to another component or function (calling it inside the scheduled callback, or inside `startTransition` there, is fine)
    - the scheduled callback does nothing except set the flag (wrapping the setter in `startTransition` still counts as only setting the flag)
    - the flag is only used to decide whether children render (not in effects, event handlers or props)

    Suggest `<NavigationDeferredMount>`, which mounts its children once after tracked transitions settle and yields to input with `startTransition`. It waits for an upcoming transition by default. Add a note that `waitForUpcomingTransition={false}` exists for components that can mount without a navigation transition (for example, remounted by a parent with a new `key`). Do not decide which value the component needs, since its mounting paths are usually not in the diff.

    Do not flag pattern 3 when the delay is a UI duration that doesn't depend on a transition (a tooltip hover delay, a toast that shows after N ms). A tooltip or toast delayed to wait for a navigation, modal or keyboard transition is not exempt. Also do not flag when a comment says the code needs a first frame or layout pass for a reason other than a transition (measuring, hydration).

4. **`InteractionManager`.** A newly added import of `InteractionManager` from `react-native`, or a newly added call to any of its methods. Comments, strings, and existing uses on a line that was only touched for another reason do not count. It is deprecated in React Native, and on native `runAfterInteractions` no longer waits for interactions: the callback runs on the next `setImmediate`. Web still uses the `react-native-web` implementation, so the same call behaves differently per platform. See [INTERACTION_MANAGER.md](../../../../contributingGuides/INTERACTION_MANAGER.md).

**Caveats for suggesting `API.writeWhenReady`:** only suggest it when the delayed work is a single `API.write` call with no fourth `conflictResolver` argument, no condition inside the delayed callback, and no cancellation of the old timer (a `writeWhenReady` call can't be cancelled), and the diff shows no other API write in the same function. A deferred write is lost if the app is killed before it runs, so don't suggest it for writes the user can't simply redo (payments, approvals, deletions). If you can't tell from the diff, suggest `afterTransition` instead. Not seeing another write in the diff does not prove there is none, and `writeWhenReady` calls do not keep their order relative to each other. If you can't tell whether ordering matters, suggest `afterTransition` instead.

**DO NOT flag if:**

- The delayed work being reviewed is itself scheduled with the `afterTransition` option, `API.writeWhenReady`, `Navigation.runAfterTransition`, `Navigation.runAfterUpcomingTransition`, or `TransitionTracker.runAfterTransitions`. A separate timer in the same function is still checked on its own. This covers patterns 1 and 2 only: pattern 3 still applies to a ready flag set inside `runAfterTransitions`. The body of an `afterTransition` callback is still checked, so a new navigation call followed by a timer inside it is pattern 1.
- The code is inside one of these files, which implement the primitives: `src/libs/Navigation/TransitionTracker.ts`, `src/libs/Navigation/Navigation.ts`, `src/libs/API/writeWhenReady.ts`, `src/components/NavigationDeferredMount.tsx`, `src/hooks/usePreMountDestination/`
- The file is under `tests/` or its name ends in `.test.ts`, `.test.tsx`, `Test.ts` or `Test.tsx`

**Search patterns** (starting points only, not the full definition of a match; generic arguments like `useState<boolean>(false)` and whitespace do not change a match):

- `setTimeout(`
- `requestAnimationFrame(`
- `useFocusEffect(`
- `useState(false)`
- `InteractionManager`
