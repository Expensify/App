---
ruleId: PERF-20
title: Defer heavy work to happen after visual transitions
---

## [PERF-20] Defer heavy work to happen after visual transitions

### Reasoning

Work that runs during a navigation, modal, or keyboard transition competes with the animation for the JS thread. `TransitionTracker` knows when these transitions start and end: screen push/pop/replace, modal open/close, and keyboard dismiss through `KeyboardUtils.dismiss`. The App has shared primitives built on it:

- `usePreMountDestination` to mount the screen an RHP flow ends on while the RHP is still open
- `<NavigationDeferredMount>` to mount a subtree after tracked transitions settle
- `API.writeWhenReady` to apply an optimistic write once a barrier settles (by default, tracked transitions)
- for one-off imperative work:
    - the `afterTransition` callback option on `Navigation` methods and `KeyboardUtils.dismiss`
    - `Navigation.runAfterTransition` and `Navigation.runAfterUpcomingTransition`
    - `TransitionTracker.runAfterTransitions`

`TransitionTracker.runAfterTransitions({callback})` runs the callback synchronously when no transition is active. When it is called before the transition starts (for example, right after a navigation call), pass `waitForUpcomingTransition`. These primitives wait for tracked transitions to settle, with a fallback timeout if none starts. Two of them can also release earlier:

- `KeyboardUtils.dismiss` calls `afterTransition` right away when the keyboard is not visible, and always on desktop web
- `API.writeWhenReady` runs the write right away when the app goes inactive or to the background

See [DEFER_AFTER_PAINT.md](../../../../contributingGuides/DEFER_AFTER_PAINT.md) for which primitive fits which case, and for when `API.writeWhenReady` is not a safe replacement for `API.write`.

### When to use

Use one of these primitives when work triggered by an interaction is not needed for the first frame of the destination and would otherwise run while a navigation, modal, or keyboard transition is animating: a follow-up API write, focus or scroll, a follow-up navigation, or a heavy subtree on a freshly navigated screen.

### When NOT to use

- The delay is a UI duration that doesn't depend on a transition, such as a tooltip hover delay or how long a toast stays on screen
- The code needs a first frame or layout pass for a reason other than a transition (measuring, hydration)
- The destination needs the work to render its first frame
- None of the primitives fits. Flag it to a human, the pattern needs to be extended thoughtfully instead of worked around with inline timing

### Incorrect

The names below (`SOME_COMMAND`, `pendingWrite.ts`, `setPendingWrite`, etc...) are placeholders, not real App symbols.

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
const armed = API.armTransitionBarrier();
Navigation.dismissModal();
API.writeWhenReady(WRITE_COMMANDS.SOME_COMMAND, params, onyxData, armed.barrier);
```

```tsx
// Pattern 2: the flow that navigates owns the deferral, the destination screen has no flush
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

**Only flag what the diff shows.** Every condition of a pattern must be visible in the added or changed lines or in the surrounding code shown in the diff. Do not infer behavior from a function's name alone. If a condition can't be confirmed from the diff, do not flag. Missing a case this way is intended because a false positive costs more than a miss.

**Evidence of intent (patterns 1, 2 and 3).** Only flag when the code shows the delay exists to wait for a navigation, modal, or keyboard transition, for example a comment saying so or `CONST.ANIMATED_TRANSITION` as the delay. A navigation call before the timer is not enough on its own.

Flag these patterns in added or changed lines:

1. **Timer or frame after a navigation call.** In the same function body, `setTimeout` or `requestAnimationFrame` is called on a line after one of these calls. The timer must run on the same invocation of the function as the navigation call. Navigation calls include:
    - `Navigation.navigate`, `Navigation.goBack`, `Navigation.dismissModal`, `Navigation.dismissModalWithReport`, etc...
    - `KeyboardUtils.dismiss`

    Nested `requestAnimationFrame` calls count. Suggest the `afterTransition` option of that navigation call.

    Tell the author the fix must keep the old behavior:
    - the navigation call still runs in the same cases as before, and the delayed work keeps the same guards. A guard that sat between the navigation call and the timer must not start skipping the navigation
    - if the timer was cleared somewhere (for example on unmount), keep that. `afterTransition` has no cancel handle, so check a cancelled flag inside the callback. For `navigate`, `goBack` and `dismissModal` without `waitForTransition`, the work can instead be scheduled with `Navigation.runAfterUpcomingTransition` right after the call, and for `KeyboardUtils.dismiss` with `Navigation.runAfterTransition`. Then call `cancel()` on the returned handle in the cleanup
    - some of the `Navigation` methods above can return early on some paths without calling `afterTransition`, while the old timer always ran. For example: `goBack` at the root of the stack, or when it falls back to resetting to the app root; `revealRouteBeforeDismissingModal` when navigation is not ready; `dismissToPreviousRHP` when there is nothing to dismiss. If the work must still run on those paths, it needs its own path
    - the timing can change. `KeyboardUtils.dismiss` runs `afterTransition` synchronously when the keyboard is already hidden, and always on desktop web, so the work runs before the next line instead of later. When no transition starts, `afterTransition` waits up to `CONST.MAX_TRANSITION_START_WAIT_MS` (1000 ms), which can be later than the old timer

    Do not flag pattern 1 when the delay is a UI duration that doesn't depend on a transition, such as a tooltip hover delay or how long a toast stays on screen. A tooltip or toast delayed to wait for a navigation, modal or keyboard transition is not exempt. If the purpose is unclear, do not flag.

2. **Pending work flushed on focus.** The evidence of intent is visible, and all of these are visible in the diff:
    - a `useFocusEffect` callback checks a flag or value set outside this component: a module-level variable, or a getter from another file. The diff must show the getter and setter reading and writing the same variable, not just their names
    - when the flag is set, the callback runs an API write, or a flush function whose body in the diff runs queued work
    - the flag is set in the same function as a `Navigation.*` or `KeyboardUtils.dismiss` call (as in pattern 1), before that call
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

**Caveats for suggesting `API.writeWhenReady`:** only suggest it when the delayed work is a single `API.write` call and none of the cases in [Do not use `writeWhenReady` when](../../../../contributingGuides/DEFER_AFTER_PAINT.md#deferring-writes) apply. If the diff can't confirm that, suggest `afterTransition` instead.

**DO NOT flag if:**

- The delayed work being reviewed is itself scheduled with the `afterTransition` option, `API.writeWhenReady`, `Navigation.runAfterTransition`, `Navigation.runAfterUpcomingTransition`, or `TransitionTracker.runAfterTransitions`. A separate timer in the same function is still checked on its own. This covers patterns 1 and 2 only: pattern 3 still applies to a ready flag set inside `runAfterTransitions`. The body of an `afterTransition` callback is still checked, so a new navigation call followed by a timer inside it is pattern 1.
- The code is inside one of these files, which implement the primitives: `src/libs/Navigation/TransitionTracker.ts`, `src/libs/Navigation/Navigation.ts`, `src/libs/API/writeWhenReady.ts`, `src/components/NavigationDeferredMount.tsx`, `src/hooks/usePreMountDestination/`, `src/libs/Navigation/helpers/preMountBuffer.ts`
- The file is under `tests/` or its name ends in `.test.ts`, `.test.tsx`, `Test.ts` or `Test.tsx`

**Search patterns** (starting points only, not the full definition of a match; generic arguments like `useState<boolean>(false)` and whitespace do not change a match):

- `setTimeout(`
- `requestAnimationFrame(`
- `useFocusEffect(`
- `useState(false)`
